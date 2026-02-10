"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { INote } from "@/types/commonTypes";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { noteSchema, NoteSchema } from "@/lib/validations/note";
import { useMutation, useQueryClient, RefetchOptions, QueryObserverResult } from "@tanstack/react-query";

interface INoteEditorProps {
  note?: INote;
  onFinishedEditing?: () => void;
  refetchNotes?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<INote[], Error>>;
}

export const NoteEditor = ({
  note,
  onFinishedEditing,
}: INoteEditorProps) => {
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
  });

  const isEditMode = !!note;

  useEffect(() => {
    if (isEditMode) {
      reset({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
    } else {
      reset({
        title: "",
        content: "",
        tags: [],
      });
    }
  }, [isEditMode, note, reset]);

  const currentContent = watch("content");

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: NoteSchema) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      if (!res.ok) {
        throw new Error("Failed to create note");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Note created!",
        description: "Your note has been successfully created.",
      });
      reset();
    },
    onError: (error) => {
      console.error("Create note error:", error);
      toast({
        title: "Error",
        description: `Failed to create note. ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: NoteSchema) => {
      const res = await fetch(`/api/notes/${note?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });

      if (!res.ok) {
        throw new Error("Failed to update note");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Note updated!",
        description: "Your note has been successfully updated.",
      });
      onFinishedEditing?.();
    },
    onError: (error) => {
      console.error("Update note error:", error);
      toast({
        title: "Error",
        description: `Failed to update note. ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const callAIService = async (
    url: string,
    field: "title" | "content",
    toastTitle: string,
  ): Promise<void> => {
    let loadingToastInstance: ReturnType<typeof toast> | undefined; // Capture the toast instance
    try {
      setLoadingAI(true);

      loadingToastInstance = toast({
        title: "AI Processing",
        description: `Generating ${toastTitle.toLowerCase()}...`,
        duration: 999999, // Keep open until updated/dismissed
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentContent }),
      });

      if (!res.ok) {
        throw new Error(`Failed to perform AI action: ${res.statusText}`);
      }

      const data = await res.json();
      setValue(field, data.aiResponse, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (loadingToastInstance) {
        // Update the specific toast instance
        loadingToastInstance.update({
          title: toastTitle,
          description: Array.isArray(data.aiResponse)
            ? `Tags: ${data.aiResponse.join(", ")}`
            : data.aiResponse,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("AI service error:", error);
      if (loadingToastInstance) {
        // Update the specific toast instance
        loadingToastInstance.update({
          title: "AI Error",
          description: "Failed to process AI request.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Fallback if toast was never initiated (shouldn't happen with current logic)
        toast({
          title: "AI Error",
          description: "Failed to process AI request.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const onSummarize = () =>
    callAIService("/api/ai/summary", "content", "Summarized Content");
  const onImprove = () =>
    callAIService("/api/ai/improve", "content", "Improved Content");
  const onGenerateTags = () =>
    callAIService("/api/ai/tags", "title", "Generated Tags");

  const onSubmit = async (data: NoteSchema): Promise<void> => {
    if (isEditMode) {
      updateNoteMutation.mutate(data);
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const isLoading = createNoteMutation.isLoading || updateNoteMutation.isLoading;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 p-4 border rounded-md"
    >
      <div>
        <Input
          placeholder="Title"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Write your note..."
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="flex space-x-2 flex-wrap gap-2">
        <Button
          type="button"
          onClick={onSummarize}
          disabled={loadingAI || !currentContent}
          variant="outline"
          size="sm"
        >
          {loadingAI ? "Summarizing..." : "Summarize"}
        </Button>
        <Button
          type="button"
          onClick={onImprove}
          disabled={loadingAI || !currentContent}
          variant="outline"
          size="sm"
        >
          {loadingAI ? "Improving..." : "Improve"}
        </Button>
        <Button
          type="button"
          onClick={onGenerateTags}
          disabled={loadingAI || !currentContent}
          variant="outline"
          size="sm"
        >
          {loadingAI ? "Generating..." : "Gen. Tags"}
        </Button>
      </div>

      <div className="flex  space-x-2">
        <Button type="submit" disabled={isLoading || loadingAI}>
          {isLoading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Note"
              : "Create Note"}
        </Button>
        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={onFinishedEditing}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

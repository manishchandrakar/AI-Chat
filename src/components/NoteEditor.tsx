"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { INote } from "@/types/commonTypes";
import { useToast } from "@/hooks/use-toast";

interface INoteForm {
  title: string;
  content: string;
}

interface INoteEditorProps {
  note?: INote;
  refetchNotes?: () => void;
  onFinishedEditing?: () => void;
}

export const NoteEditor = ({
  note,
  refetchNotes,
  onFinishedEditing,
}: INoteEditorProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<INoteForm>();

  const isEditMode = !!note;

  useEffect(() => {
    if (isEditMode) {
      reset({
        title: note.title,
        content: note.content,
      });
    } else {
      reset({
        title: "",
        content: "",
      });
    }
  }, [isEditMode, note, reset]);

  const currentContent = watch("content");

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

  const onSubmit = async (data: INoteForm): Promise<void> => {
    try {
      setLoading(true);
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/api/notes/${note._id}` : "/api/notes";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} note`);
      }

      toast({
        title: `Note ${isEditMode ? "updated" : "created"}!`,
        description: `Your note has been successfully ${
          isEditMode ? "updated" : "created"
        }.`,
      });

      if (isEditMode) {
        onFinishedEditing?.();
      } else {
        reset();
        refetchNotes?.();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} note.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 p-4 border rounded-md"
    >
      <div>
        <Input
          placeholder="Title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Write your note..."
          {...register("content", { required: "Content is required" })}
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
        <Button type="submit" disabled={loading || loadingAI}>
          {loading
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
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

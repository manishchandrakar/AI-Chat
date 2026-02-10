"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface INoteForm {
  title: string
  content: string
}

interface INoteEditorProps {
  onCreated: () => void
}

export const NoteEditor = ({ onCreated }: INoteEditorProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingAI, setLoadingAI] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<INoteForm>({
    defaultValues: {
      title: "",
      content: "",
    },
  })

  const currentContent = watch("content")

  const callAIService = async (
    url: string,
    field: "title" | "content"
  ): Promise<void> => {
    try {
      setLoadingAI(true)
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: currentContent }),
      })

      if (!res.ok) {
        throw new Error(`Failed to perform AI action: ${res.statusText}`)
      }

      const data = await res.json()
      setValue(field, data.aiResponse)
    } catch (error) {
      console.error("AI service error:", error)
    } finally {
      setLoadingAI(false)
    }
  }

  const onSummarize = () => callAIService("/api/ai/summary", "content")
  const onImprove = () => callAIService("/api/ai/improve", "content")
  const onGenerateTags = () => callAIService("/api/ai/tags", "title")

  const onSubmit = async (data: INoteForm): Promise<void> => {
    try {
      setLoading(true)

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error("Failed to create note")
      }

      reset()
      onCreated()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Input
          placeholder="Title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Write your note..."
          {...register("content", { required: "Content is required" })}
        />
        {errors.content && (
          <p className="text-sm text-red-500">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          onClick={onSummarize}
          disabled={loadingAI || !currentContent}
          variant="outline"
        >
          {loadingAI ? "Summarizing..." : "Summarize with AI"}
        </Button>
        <Button
          type="button"
          onClick={onImprove}
          disabled={loadingAI || !currentContent}
          variant="outline"
        >
          {loadingAI ? "Improving..." : "Improve with AI"}
        </Button>
        <Button
          type="button"
          onClick={onGenerateTags}
          disabled={loadingAI || !currentContent}
          variant="outline"
        >
          {loadingAI ? "Generating..." : "Generate Tags with AI"}
        </Button>
      </div>

      <Button type="submit" disabled={loading || loadingAI}>
        {loading ? "Creating..." : "Create Note"}
      </Button>
    </form>
  )
}
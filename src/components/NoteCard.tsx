"use client"

import { useState } from "react"
import { INote } from "@/types/commonTypes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Props {
  note: INote
  refetchNotes: () => void
  onEdit: () => void
}

export const NoteCard = ({ note, refetchNotes, onEdit }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete note")
      }

      toast({
        title: "Note deleted!",
        description: "Your note has been successfully deleted.",
      })
      refetchNotes()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const callAI = async (endpoint: string) => {
    try {
      setLoading(true)

      const res = await fetch(`/api/ai/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note.content }),
      })

      const data = await res.json()

      let updatedFields: { content?: string; tags?: string[] } = {}
      let toastTitle = ""
      let toastDescription = ""

      if (endpoint === "summary" || endpoint === "improve") {
        updatedFields = { content: data.aiResponse }
        toastTitle = `${endpoint === "summary" ? "Summarized" : "Improved"} Note`
        toastDescription = data.aiResponse // Show AI response in toast
      } else if (endpoint === "tags") {
        updatedFields = { tags: data.aiResponse }
        toastTitle = "Generated Tags"
        toastDescription = `Tags: ${data.aiResponse.join(", ")}` // Show AI response in toast
      }

      const updateRes = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      })

      if (!updateRes.ok) {
        throw new Error("Failed to update note with AI response")
      }

      toast({
        title: toastTitle,
        description: toastDescription,
      })
      refetchNotes()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to process AI request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">{note.title}</h3>

        <p className="text-sm text-muted-foreground">
          {note.content}
        </p>

        <div className="flex gap-2 flex-wrap">
          {note.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Edit
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => callAI("summary")}
          >
            ✨ Summary
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => callAI("improve")}
          >
            ✏️ Improve
          </Button>

          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => callAI("tags")}
          >
            🏷 Tags
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            🗑 Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
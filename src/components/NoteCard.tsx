"use client"

import { useState } from "react"
import { INote } from "@/types/commonTypes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Props {
  note: INote
  refresh?: () => void
}

export const NoteCard = ({ note }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)

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

      if (endpoint === "summary") {
        alert(data.summary)
      }

      if (endpoint === "improve") {
        alert(data.improved)
      }

      if (endpoint === "tags") {
        alert(data.tags)
      }
    } catch (error) {
      console.error(error)
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
        </div>
      </CardContent>
    </Card>
  )
}
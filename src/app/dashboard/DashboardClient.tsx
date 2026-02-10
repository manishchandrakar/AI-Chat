"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ThemeToggle } from "@/components/ThemeToggle"
import { INote } from "@/types/commonTypes"
import { SearchBar } from "@/components/SearchBar"
import { NoteCard } from "@/components/NoteCard"
import { NoteEditor } from "@/components/NoteEditor"

// // Standalone fetch function for useQuery
const getNotes = async (): Promise<INote[]> => {
  const res = await fetch("/api/notes")

  if (res.status === 401) {
    // This will be caught by useQuery's error handling, but we can also
    // handle the redirect explicitly here if needed.
    // For now, let useQuery manage the error state.
    throw new Error("Unauthorized")
  }

  if (!res.ok) {
    throw new Error("Failed to fetch notes")
  }

  return res.json()
}

const DashboardClient = () => {
  const router = useRouter()

  const [search, setSearch] = useState<string>("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const {
    data: notes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  })

  const filteredNotes = useMemo(() => {
    const lowerSearch = search.toLowerCase()

    return notes?.filter((note) =>
      note.title?.toLowerCase().includes(lowerSearch) ||
      note.content?.toLowerCase().includes(lowerSearch)
    ) || []
  }, [notes, search])

  // Handle unauthorized error for redirection
  if (isError && error?.message === "Unauthorized") {
    router.push("/login")
    return null // or a loading/error message specific to auth
  }

  const handleEditFinished = () => {
    setEditingNoteId(null)
    refetch()
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <SearchBar value={search} onChange={setSearch} />
        <ThemeToggle />
      </div>

      {!editingNoteId && <NoteEditor refetchNotes={refetch} />}

      {isLoading && (
        <div className="text-center text-gray-500">Loading notes...</div>
      )}

      {isError && error?.message !== "Unauthorized" && (
        <div className="text-center text-red-500">
          Error loading notes: {error?.message}
        </div>
      )}

      {!isLoading && !isError && filteredNotes.length === 0 && (
        <div className="text-center text-gray-500">No notes found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) =>
          editingNoteId === note._id ? (
            <NoteEditor
              key={note._id}
              note={note}
              onFinishedEditing={handleEditFinished}
            />
          ) : (
            <NoteCard
              key={note._id}
              note={note}
              refetchNotes={refetch}
              onEdit={() => setEditingNoteId(note._id)}
            />
          )
        )}
      </div>
    </div>
  )
}

export default DashboardClient
"use client"

// import { useMemo, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useQuery } from "@tanstack/react-query"
// import { ThemeToggle } from "@/components/ThemeToggle"
// import { INote } from "@/types/commonTypes"
// import { SearchBar } from "@/components/SearchBar"
// import { NoteCard } from "@/components/NoteCard"
// import { NoteEditor } from "@/components/NoteEditor"

// // Standalone fetch function for useQuery
// const getNotes = async (): Promise<INote[]> => {
//   const res = await fetch("/api/notes")

//   if (res.status === 401) {
//     // This will be caught by useQuery's error handling, but we can also
//     // handle the redirect explicitly here if needed.
//     // For now, let useQuery manage the error state.
//     throw new Error("Unauthorized")
//   }

//   if (!res.ok) {
//     throw new Error("Failed to fetch notes")
//   }

//   return res.json()
// }

const DashboardClient = () => {
  // const router = useRouter()

  // const [search, setSearch] = useState<string>("")

  // const {
  //   data: notes,
  //   isLoading,
  //   isError,
  //   error,
  //   refetch,
  // } = useQuery<INote[], Error>({
  //   queryKey: ["notes"],
  //   queryFn: getNotes,
  // })

  // const filteredNotes = useMemo(() => {
  //   const lowerSearch = search.toLowerCase()

  //   return notes?.filter((note) =>
  //     note.title?.toLowerCase().includes(lowerSearch) ||
  //     note.content?.toLowerCase().includes(lowerSearch)
  //   ) || []
  // }, [notes, search])

  // // Handle unauthorized error for redirection
  // if (isError && error?.message === "Unauthorized") {
  //   router.push("/login")
  //   return null // or a loading/error message specific to auth
  // }

  // console.log("Filtered Notes:", notes, search, filteredNotes)

  return (
    <div>
      <p>DashboardClient Placeholder</p>
    </div>
  )
}

export default DashboardClient
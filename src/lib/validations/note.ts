import { z } from "zod"

export const noteSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  tags: z.array(z.string()).optional(),
})

export type NoteSchema = z.infer<typeof noteSchema>

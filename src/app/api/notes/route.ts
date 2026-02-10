import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Note } from "@/lib/models/Note"
import { noteSchema } from "@/lib/validations/note"
import { ZodError } from "zod"

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const notes = await Note.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 })

    return NextResponse.json(notes)
  } catch (error: unknown) {
    console.error(error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate the request body using Zod
    const { title, content, tags } = noteSchema.parse(body)

    await connectDB()

    const newNote = await Note.create({
      userId: session.user.id,
      title,
      content,
      tags: tags ?? [],
    })

    return NextResponse.json(newNote, { status: 201 })
  } catch (error: unknown) {
    console.error(error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Note } from "@/lib/models/Note"

export async function GET() {
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body: {
      title: string
      content: string
      tags?: string[]
    } = await req.json()

    await connectDB()

    const newNote = await Note.create({
      userId: session.user.id,
      title: body.title,
      content: body.content,
      tags: body.tags ?? [],
    })

    return NextResponse.json(newNote, { status: 201 })
  } catch (error: unknown) {
    console.error(error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
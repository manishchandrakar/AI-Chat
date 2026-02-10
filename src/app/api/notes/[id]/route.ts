import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Note } from "@/lib/models/Note"
import { Types } from "mongoose"

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 })
    }

    await connectDB()

    const note = await Note.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!note) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }
console.log("POST Session ID:", session.user.id)

    return NextResponse.json(note)
  } catch (error: unknown) {
    console.error(error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 })
    }

    const body: {
      title?: string
      content?: string
      tags?: string[]
    } = await req.json()

    await connectDB()

    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
        
      },
      body,
      { new: true }
    )

    if (!updatedNote) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }
    
console.log("POST Session ID:", session.user.id)
    return NextResponse.json(updatedNote)
  } catch (error: unknown) {
    console.error(error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}


export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 })
    }

    await connectDB()

    const deletedNote = await Note.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!deletedNote) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error: unknown) {
    console.error(error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
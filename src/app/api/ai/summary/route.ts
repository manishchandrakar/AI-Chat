import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { geminiModel } from "@/lib/ai/gemini" // Ensure this path is correct

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { content } = await req.json()

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      )
    }

    // Gemini implementation
    const result = await geminiModel.generateContent([
      { text: "Summarize the following note clearly and concisely:" },
      { text: content }
    ])

    const response = await result.response
    const summary = response.text()

    return NextResponse.json({ aiResponse: summary })
  } catch (error) {
    console.error("GEMINI ERROR:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { geminiModel } from "@/lib/ai/gemini"

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

    const result = await geminiModel.generateContent(
      `Improve the grammar and clarity of the following note without changing its meaning:

${content}`
    )

    const improved = result.response.text()

    return NextResponse.json({ improved })

  } catch (error: unknown) {
    console.error("GEMINI ERROR:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
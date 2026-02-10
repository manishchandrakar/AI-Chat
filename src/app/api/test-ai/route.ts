import { geminiModel } from "@/lib/ai/gemini"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await geminiModel.generateContent(
      "Say hello and confirm Gemini AI is working."
    )

    const reply = result.response.text()

    return NextResponse.json({
      success: true,
      reply,
    })

  } catch (error: unknown) {
    console.error("FULL GEMINI ERROR:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    )
  }
}
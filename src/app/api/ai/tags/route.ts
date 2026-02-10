import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { geminiModel } from "@/lib/ai/gemini" // Ensure your corrected lib is imported

export const POST = async (req: Request) => {
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

    // Gemini logic: Combine system instruction and content into the prompt
    const result = await geminiModel.generateContent(
      `Generate 3-5 relevant short tags for the following note. Return ONLY a comma separated list:

      ${content}`
    )

    if (!result || !result.response) {
      throw new Error("Invalid Gemini API response: 'result' or 'result.response' is missing.");
    }

    // Extracting the text from the Gemini response object
    const tags = result.response.text()
    if (typeof tags !== 'string') {
      throw new Error("Gemini API 'text()' method did not return a string.");
    }

    return NextResponse.json({ aiResponse: tags })
  } catch (error: unknown) {
    console.error("GEMINI TAG ERROR:", error.message)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
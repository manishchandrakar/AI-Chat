import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Changed from "gemini-1.5-flash-latest" to "gemini-2.5-flash"
export const geminiModel = genAI.getGenerativeModel({
   model: "gemini-2.5-flash",
})
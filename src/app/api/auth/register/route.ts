import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"

interface RegisterBody {
  name: string
  email: string
  password: string
}

export async function POST(req: Request) {
  try {
    const body: RegisterBody = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser: typeof User | null = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword: string = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
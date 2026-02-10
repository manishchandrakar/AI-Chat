import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials) return null

        const { email, password } = credentials

        if (!email || !password) return null

        await connectDB()

        const existingUser = await User.findOne({ email })

        if (!existingUser) return null

        const isValid = await bcrypt.compare(
          password,
          existingUser.password
        )

        if (!isValid) return null

        return {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string 
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
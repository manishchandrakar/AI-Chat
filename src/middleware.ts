import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect authenticated users from login/register to dashboard
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If token exists, user is logged in
        return !!token
      },
    },
    // Specify the login page for unauthenticated users trying to access protected routes
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/notes/:path*",
    "/api/ai/:path*",
    "/login", // Add login and register to matcher to protect them for authenticated users
    "/register",
  ],
}
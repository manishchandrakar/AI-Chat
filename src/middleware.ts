import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const middleware = async (req: NextRequestWithAuth) => {
  const token = req.nextauth.token
  const { pathname } = req.nextUrl

  //INFO: Redirect authenticated users from login/register to dashboard
  if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export default withAuth(
  middleware,
  {
    callbacks: {
      authorized: ({ token }) => {
        //INFO: If token exists, user is logged in
        return !!token
      },
    },
    //INFO: Specify the login page for unauthenticated users trying to access protected routes
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
    "/login", //INFO: Add login to matcher to protect it for authenticated users
  ],
}
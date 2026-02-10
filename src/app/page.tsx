import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardRedirectButton } from "@/app/components/DashboardRedirectButton"
import { redirect } from "next/navigation"

const HomePage     = async () =>   {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Welcome, {session?.user?.name}
        </h1>

        <p>Email: {session?.user?.email}</p>
        <p>User ID: {session?.user?.id}</p>
        
        <DashboardRedirectButton />
      </div>
    </main>
  )
}

export default HomePage



import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import DashboardClient from "@/app/dashboard/DashboardClient"
import { authOptions } from "@/lib/auth"

const DashboardPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <DashboardClient />
}
export default DashboardPage
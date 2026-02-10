"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const DashboardRedirectButton = () => {
  const router = useRouter()
  return (
    <Button variant="outline" onClick={() => router.push("/dashboard")}>
      Go to Dashboard
    </Button>
  )
}

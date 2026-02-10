"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface IRegisterForm {
  name: string
  email: string
  password: string
}

const RegisterPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const { register, handleSubmit } = useForm<IRegisterForm>()

  const onSubmit = async (data: IRegisterForm) => {
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    console.log(res,'res')

    setLoading(false)

    if (res.ok) {
      router.push("/login")
    } else {
      alert("User already exists")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold text-center">
            Register
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input placeholder="Name" {...register("name")} />
            <Input type="email" placeholder="Email" {...register("email")} />
            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
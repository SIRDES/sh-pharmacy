"use client"
import { redirect } from 'next/navigation'
import { useSession } from "next-auth/react"
import LoadingAlert from '@/components/LoadingAlert'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/dashboard")
      // if (session?.user?.role === "admin") {
      //   redirect("/dashboard")
      // } else {
      //   redirect("/teacher/attendance")
      // }
    } else if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status, session])

  return <LoadingAlert open={true} />
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClassementRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/classements") }, [router])
  return null
}

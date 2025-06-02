"use client"

import { useEffect, useState } from "react"
import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const auth = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push("/")
        return
      }

      const groupsRaw = auth.user?.profile["cognito:groups"]
      const userGroups = Array.isArray(groupsRaw) ? groupsRaw : typeof groupsRaw === "string" ? [groupsRaw] : []

      if (!userGroups.includes("admin")) {
        router.push("/unauthorized")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.profile, router])

  const signOutRedirect = () => {
    const clientId = "6n0odlf9mqqo07mcldq0l1has6"
    const logoutUri = window.location.origin
    const cognitoDomain = "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com"

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
  }

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const username =
    (auth.user?.profile["cognito:username"] as string) ||
    (auth.user?.profile["preferred_username"] as string) ||
    (auth.user?.profile.email as string) ||
    "Admin"

  return <AdminDashboard user={{ email: username }} onLogout={signOutRedirect} />
}

"use client"

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import TeamDashboard from "@/components/team-dashboard"

export default function TeamPage() {
  const auth = useAuth()
  const router = useRouter()

  // We don't need to check authorization here since your original
  // TeamDashboard component already handles authentication

  const signOutRedirect = () => {
    const clientId = "6n0odlf9mqqo07mcldq0l1has6"
    const logoutUri = window.location.origin
    const cognitoDomain = "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com"

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
  }

  return <TeamDashboard />
}

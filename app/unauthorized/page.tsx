"use client"

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"

export default function UnauthorizedPage() {
  const auth = useAuth()
  const router = useRouter()

  const username =
    (auth.user?.profile["cognito:username"] as string) ||
    (auth.user?.profile["preferred_username"] as string) ||
    (auth.user?.profile.email as string) ||
    "User"

  const signOutRedirect = () => {
    const clientId = "6n0odlf9mqqo07mcldq0l1has6"
    const logoutUri = window.location.origin
    const cognitoDomain = "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com"

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            Sorry {username}, you don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your administrator for assistance.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="ghost" className="w-full text-destructive" onClick={signOutRedirect}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
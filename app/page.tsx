"use client"

import { useAuth } from "react-oidc-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, LogOut, Settings, Users, CheckCircle, Clock, BarChart3, Shield, Zap } from "lucide-react"

export default function Home() {
  const auth = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (auth.isAuthenticated) {
      const groupsRaw = auth.user?.profile["cognito:groups"]
      const userGroups = Array.isArray(groupsRaw) ? groupsRaw : typeof groupsRaw === "string" ? [groupsRaw] : []

      if (userGroups.includes("admin")) {
        setRedirecting(true)
        router.push("/admin")
      } else if (userGroups.includes("field_team")) {
        setRedirecting(true)
        router.push("/team")
      }
    }
  }, [auth.isAuthenticated, auth.user?.profile, router])

  const signOutRedirect = () => {
    const clientId = "6n0odlf9mqqo07mcldq0l1has6"
    const logoutUri = window.location.origin
    const cognitoDomain = "https://us-west-2tazwhkr2d.auth.us-west-2.amazoncognito.com"

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
  }

  if (auth.isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{auth.error.message}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const username =
    (auth.user?.profile["cognito:username"] as string) ||
    (auth.user?.profile["preferred_username"] as string) ||
    (auth.user?.profile.email as string) ||
    "User"

  const groupsRaw = auth.user?.profile["cognito:groups"]
  const userGroups = Array.isArray(groupsRaw) ? groupsRaw : typeof groupsRaw === "string" ? [groupsRaw] : []

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Settings className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "field_team":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Users className="w-3 h-3 mr-1" />
            Field Team
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return auth.isAuthenticated ? (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back, {username}! 👋</CardTitle>
          <CardDescription>You are signed in with the following roles:</CardDescription>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {userGroups.length > 0 ? (
              userGroups.map((group) => <div key={group}>{getRoleBadge(group)}</div>)
            ) : (
              <Badge variant="outline">Guest</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {userGroups.includes("admin") && (
              <Button className="w-full" onClick={() => router.push("/admin")}>
                <Settings className="w-4 h-4 mr-2" />
                Go to Admin Panel
              </Button>
            )}
            {userGroups.includes("field_team") && (
              <Button
                className="w-full"
                variant={userGroups.includes("admin") ? "outline" : "default"}
                onClick={() => router.push("/team")}
              >
                <Users className="w-4 h-4 mr-2" />
                Go to Team Dashboard
              </Button>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={() => auth.removeUser()} className="text-muted-foreground">
              Sign out (Local)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOutRedirect}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign out (Cognito)
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>
            <Button onClick={() => auth.signinRedirect()} variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Serverless Architecture • Real-time Updates
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Team Workflow
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              TaskFlow empowers admins to assign tasks seamlessly while enabling team members to track progress, meet
              deadlines, and collaborate in real-time. Built for modern teams who demand efficiency.
            </p>

            <div className="flex justify-center">
              <Button size="lg" onClick={() => auth.signinRedirect()} className="text-lg px-8 py-3">
                Get Started
                <CheckCircle className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage tasks effectively
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From task assignment to progress tracking, TaskFlow provides all the tools your team needs to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Admin Control Panel</CardTitle>
                <CardDescription>
                  Comprehensive dashboard for admins to create, assign, and monitor tasks across all team members.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Field teams can update task status, add descriptions, and track their progress in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Visual dashboards and analytics to monitor task completion rates and team performance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Deadline Management</CardTitle>
                <CardDescription>
                  Automatic overdue detection and notifications to ensure no task falls through the cracks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Enterprise-grade security with AWS Cognito integration and role-based access control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Serverless Architecture</CardTitle>
                <CardDescription>
                  Built on AWS serverless infrastructure for maximum scalability and minimal maintenance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose TaskFlow?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Our platform is designed with your team's productivity in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Reliable</div>
              <div className="text-blue-100">Built on AWS for enterprise-grade stability</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Efficient</div>
              <div className="text-blue-100">Streamlined workflows save time and resources</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Secure</div>
              <div className="text-blue-100">Role-based access control and data protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to transform your team's productivity?
          </h2>
          <p className="text-xl text-gray-600 mb-8">Start managing tasks more efficiently today.</p>
          <Button size="lg" onClick={() => auth.signinRedirect()} className="text-lg px-8 py-3">
            Get Started Now
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TaskFlow</span>
              </div>
              <p className="text-gray-400">Streamline your team workflow with our powerful task management platform.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TaskFlow. All rights reserved. Built with serverless architecture.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

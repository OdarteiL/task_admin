"use client"

import { useState, useEffect } from "react"
import { isPast, parseISO } from "date-fns"
import { TasksTable } from "@/components/tasks-table"
import { UsersTable } from "@/components/users-table"
import { TaskForm } from "@/components/task-form"
import { UserForm } from "@/components/user-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export interface Task {
  id: string
  title: string
  description?: string
  assignedTo: string
  status: string
  dueDate?: string
}

export interface User {
  email: string
  role: string
}

interface AdminDashboardProps {
  user: { email: string } | null
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    setError(null)
    try {
      const res = await fetch("https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks")
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err)
      setError("Failed to load tasks. Please try again later.")
      setTasks([])
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    setError(null)
    try {
      const res = await fetch("https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users")
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to fetch users:", err)
      setError("Failed to load users. Please try again later.")
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      fetchTasks()
      fetchUsers()
    }
  }, [user])

  // Calculate dashboard metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const overdueTasks = tasks.filter(
    (task) => task.status !== "Completed" && task.dueDate && isPast(parseISO(task.dueDate)),
  ).length
  const adminUsers = users.filter((user) => user.role === "admin").length

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text={`Welcome back, ${user?.email}`} onLogout={onLogout} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Out of {users.length} total users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="tasks">Tasks Management</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TaskForm onSuccess={fetchTasks} users={users} />
            <Card>
              <CardHeader>
                <CardTitle>Tasks Overview</CardTitle>
                <CardDescription>Manage and track all tasks in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTasks ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <TasksTable tasks={tasks} onTaskChange={fetchTasks} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <UserForm onSuccess={fetchUsers} />
            <Card>
              <CardHeader>
                <CardTitle>Users Overview</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <UsersTable users={users} onUserChange={fetchUsers} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

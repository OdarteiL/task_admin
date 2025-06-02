"use client"

import type { User } from "./admin-dashboard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface UsersTableProps {
  users: User[]
  onUserChange: () => void
}

export function UsersTable({ users, onUserChange }: UsersTableProps) {
  const { toast } = useToast()

  const handleDeleteUser = async (email: string) => {
    try {
      const res = await fetch(
        `https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        },
      )

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "Failed to delete user")
      }

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })

      onUserChange()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Admin
          </Badge>
        )
      case "field_team":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Field Team
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (users.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No users found.</p>
  }

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div key={user.email} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{user.email}</h3>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {user.email}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteUser(user.email)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

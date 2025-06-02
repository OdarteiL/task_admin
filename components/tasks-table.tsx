"use client"

import type React from "react"

import { useState } from "react"
import { format, isPast, parseISO } from "date-fns"
import type { Task } from "./admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Pencil, Trash2, Loader2 } from "lucide-react"

interface TasksTableProps {
  tasks: Task[]
  onTaskChange: () => void
}

export function TasksTable({ tasks, onTaskChange }: TasksTableProps) {
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleEditClick = (task: Task) => {
    setEditTask({ ...task })
    setIsEditDialogOpen(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editTask) return
    setEditTask({ ...editTask, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!editTask) return
    setEditTask({ ...editTask, [name]: value })
  }

  const handleEditSubmit = async () => {
    if (!editTask) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${editTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTask),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update task")
      }

      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      })

      setIsEditDialogOpen(false)
      onTaskChange()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update task",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete task")
      }

      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      })

      onTaskChange()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete task",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Not Started
          </Badge>
        )
    }
  }

  const isTaskOverdue = (task: Task) => {
    return task.status !== "Completed" && task.dueDate && isPast(parseISO(task.dueDate))
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No tasks found.</p>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg border p-4 ${isTaskOverdue(task) ? "border-l-4 border-l-destructive" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {task.id} | Assigned to: {task.assignedTo}
                    </p>
                    {task.dueDate && (
                      <p
                        className={`text-sm mt-1 ${isTaskOverdue(task) ? "text-destructive font-medium" : "text-muted-foreground"}`}
                      >
                        Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">{getStatusBadge(task.status)}</div>
                </div>
                {task.description && <p className="mt-2 text-sm">{task.description}</p>}
                <div className="mt-4 flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(task)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTask(task.id)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to the task details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" name="title" value={editTask?.title || ""} onChange={handleEditChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editTask?.description || ""}
                onChange={handleEditChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editTask?.status || ""} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                name="dueDate"
                type="date"
                value={editTask?.dueDate || ""}
                onChange={handleEditChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

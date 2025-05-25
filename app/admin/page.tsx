"use client";

import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: string;
  dueDate?: string;
}

export default function AdminPage() {
  const auth = useAuth();

  const [form, setForm] = useState({
    taskId: "",
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [message, setMessage] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");

  const fetchTasks = async () => {
    if (!auth.user?.profile.email) return;

    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks`
      );
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.message);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [auth.user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      const res = await fetch(
        "https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        setMessage("✅ Task created!");
        setForm({
          taskId: "",
          title: "",
          description: "",
          assignedTo: "",
          dueDate: "",
        });
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to connect to API");
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({ ...task });
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;

    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${editingTaskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      if (res.ok) {
        setMessage("✅ Task updated!");
        setEditingTaskId(null);
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Update error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Update failed");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setMessage("🗑️ Task deleted.");
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Delete error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("❌ Delete failed");
    }
  };

  const filteredTasks = deadlineFilter
    ? tasks.filter((task) => task.dueDate === deadlineFilter)
    : tasks;

  const isOverdue = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr <= today;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {auth.user?.profile.email}</p>

      {/* Create Task Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded-xl space-y-4"
      >
        <h2 className="text-xl font-semibold">Create a New Task</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            name="taskId"
            placeholder="Task ID"
            value={form.taskId}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 rounded"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 rounded"
            name="assignedTo"
            placeholder="Assign To (email)"
            value={form.assignedTo}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 rounded"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            required
          />
          <textarea
            className="border p-2 rounded col-span-2"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Task
        </button>
        <p className="text-sm text-gray-600">{message}</p>
      </form>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="deadlineFilter" className="font-medium">
          Filter by Due Date:
        </label>
        <input
          id="deadlineFilter"
          type="date"
          className="border p-2 rounded"
          value={deadlineFilter}
          onChange={(e) => setDeadlineFilter(e.target.value)}
        />
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => setDeadlineFilter("")}
        >
          Clear Filter
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks
          .sort((a, b) =>
            a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : 0
          )
          .map((task) => {
            const overdue = isOverdue(task.dueDate);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg shadow space-y-2 ${
                  overdue ? "bg-red-100 border border-red-300" : "bg-gray-50"
                }`}
              >
                {editingTaskId === task.id ? (
                  <>
                    <input
                      className="border p-2 rounded w-full"
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <textarea
                      className="border p-2 rounded w-full"
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                    <input
                      className="border p-2 rounded w-full"
                      value={editForm.status || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                    />
                    <input
                      className="border p-2 rounded w-full"
                      value={editForm.dueDate || ""}
                      type="date"
                      onChange={(e) =>
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={saveEdit}
                      >
                        💾 Save
                      </button>
                      <button
                        className="bg-gray-400 px-3 py-1 rounded"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        Assigned to: {task.assignedTo}
                      </p>
                      <p className="text-sm">Status: {task.status}</p>
                      <p
                        className={`text-sm font-medium ${
                          overdue ? "text-red-600" : ""
                        }`}
                      >
                        Due: {task.dueDate || "N/A"}
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                        onClick={() => startEdit(task)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => deleteTask(task.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

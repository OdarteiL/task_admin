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
    assignedTo: "",
    dueDate: "",
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [message, setMessage] = useState("");

  const fetchTasks = async () => {
    if (!auth.user?.profile.email) {
      // User not loaded yet, skip fetch
      return;
    }

    try {
      const assignedTo = auth.user.profile.email;
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks?assignedTo=${encodeURIComponent(
          assignedTo
        )}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
      }

      const data = await res.json();
      console.log("Fetched data:", data);

      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        console.error("Unexpected data format from API", data);
      }
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.message || err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [auth.user]); // fetch whenever auth user changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Submitting...");

    // Add the assignedTo from logged-in user automatically
    const payload = {
      ...form,
      assignedTo: auth.user?.profile.email || "",
    };

    try {
      const res = await fetch(
        "https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setMessage("✅ Task created!");
        setForm({ taskId: "", title: "", assignedTo: "", dueDate: "" });
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <p className="mb-6 text-gray-600">Welcome, {auth.user?.profile.email}</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-md mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded-md"
            name="taskId"
            placeholder="Task ID"
            value={form.taskId}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 rounded-md"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          {/* assignedTo input hidden because assignedTo is always current user */}
          {/* <input
            className="border p-2 rounded-md"
            name="assignedTo"
            placeholder="Assigned To"
            value={form.assignedTo}
            onChange={handleChange}
            required
          /> */}
          <input
            className="border p-2 rounded-md"
            name="dueDate"
            placeholder="Due Date (YYYY-MM-DD)"
            value={form.dueDate}
            onChange={handleChange}
            required
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          type="submit"
        >
          Create Task
        </button>
        <p className="text-sm text-gray-700">{message}</p>
      </form>

      <h3 className="text-xl font-semibold mb-4">All Tasks</h3>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-50 p-4 rounded-lg shadow flex flex-col gap-2"
          >
            {editingTaskId === task.id ? (
              <>
                <input
                  className="border p-2 rounded-md"
                  value={editForm.title || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <input
                  className="border p-2 rounded-md"
                  value={editForm.assignedTo || ""}
                  disabled
                  readOnly
                />
                <input
                  className="border p-2 rounded-md"
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={saveEdit}
                  >
                    💾 Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                    onClick={() => setEditingTaskId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{task.title}</h4>
                    <p className="text-sm text-gray-600">
                      Assigned to: {task.assignedTo}
                    </p>
                    <p className="text-sm">Status: {task.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => startEdit(task)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => deleteTask(task.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

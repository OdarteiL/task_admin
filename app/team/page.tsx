"use client";

import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: string;
  dueDate?: string;
}

export default function TeamDashboard() {
  const auth = useAuth();
  const userEmail = auth.user?.profile.email || "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");

  const fetchTasks = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks?assignedTo=${userEmail}`
      );
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      fetchTasks();
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Failed to update task.");
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateTask(id, { status });
  };

  const handleDescriptionChange = (id: string, description: string) => {
    updateTask(id, { description });
  };

  const isOverdue = (dateStr?: string) => {
    return dateStr && dayjs().isAfter(dayjs(dateStr), "day");
  };

  const filteredTasks = filterDate
    ? tasks.filter((task) => task.dueDate === filterDate)
    : tasks;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Team Member Dashboard</h2>
      <p className="mb-4 text-gray-600">Welcome, {userEmail}</p>

      <label className="block mb-4">
        <span className="text-gray-700">📅 Filter by Due Date:</span>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border p-2 rounded w-full mt-1"
        />
      </label>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned.</p>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 mb-4 rounded shadow ${
              isOverdue(task.dueDate)
                ? "bg-red-100 border border-red-400"
                : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <span
                className={`px-2 py-1 text-sm rounded ${
                  task.status === "Completed"
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-1">
              Due:{" "}
              {task.dueDate
                ? dayjs(task.dueDate).format("MMM D, YYYY")
                : "No due date"}
            </p>

            <textarea
              className="w-full border rounded p-2 mt-2"
              rows={3}
              value={task.description || ""}
              onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
              placeholder="Update description"
            />

            <select
              className="mt-2 border p-2 rounded w-full"
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        ))
      )}

      <p className="text-sm text-gray-700 mt-4">{message}</p>
    </div>
  );
}

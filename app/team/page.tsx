"use client";

import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";

interface Task {
  taskId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: string;
}

export default function TeamPage() {
  const auth = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // Track updated statuses before submit: { taskId: newStatus }
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<
    Record<string, string>
  >({});
  // Track loading states per task when submitting
  const [submittingTasks, setSubmittingTasks] = useState<Record<string, boolean>>({});

  const username =
    auth.user?.profile?.preferred_username ||
    auth.user?.profile?.username ||
    auth.user?.profile?.email ||
    "";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks?assignedTo=${username}`
        );
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated && username) {
      fetchTasks();
    }
  }, [auth.isAuthenticated, username]);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setPendingStatusUpdates((prev) => ({ ...prev, [taskId]: newStatus }));
  };

  const handleSubmit = async (taskId: string) => {
    const newStatus = pendingStatusUpdates[taskId];
    if (!newStatus) {
      alert("Please select a status before submitting.");
      return;
    }

    setSubmittingTasks((prev) => ({ ...prev, [taskId]: true }));

    try {
      const accessToken = auth.user?.access_token;
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Update local tasks list to reflect new status after submit
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Remove from pending updates
      setPendingStatusUpdates((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
    } catch (error) {
      console.error(error);
      alert("Error submitting status update");
    } finally {
      setSubmittingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  if (auth.isLoading || !auth.isAuthenticated) {
    return <p className="p-6 text-gray-600">Loading tasks...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Welcome, {String(username)}</h2>

      {loading ? (
        <p>Loading assigned tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => {
            const pendingStatus = pendingStatusUpdates[task.taskId];
            return (
              <li
                key={task.taskId}
                className="border p-4 rounded-lg shadow-sm bg-white"
              >
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-sm">Due: {task.dueDate}</p>

                <label className="text-sm font-semibold mr-2">Status:</label>
                <select
                  value={pendingStatus ?? task.status}
                  onChange={(e) =>
                    handleStatusChange(task.taskId, e.target.value)
                  }
                  className="border rounded p-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  onClick={() => handleSubmit(task.taskId)}
                  disabled={submittingTasks[task.taskId]}
                  className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingTasks[task.taskId] ? "Submitting..." : "Submit Task"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

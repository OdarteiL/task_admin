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
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    if (!auth.user?.profile.email) return;
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [auth.user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Submitting...");
    setIsLoading(true);

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
        setMessage("✅ Task created successfully!");
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
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({ ...task });
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    setIsLoading(true);

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
        setMessage("✅ Task updated successfully!");
        setEditingTaskId(null);
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Update error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setMessage("🗑️ Task deleted successfully.");
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Delete error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("❌ Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = deadlineFilter
    ? tasks.filter((task) => task.dueDate === deadlineFilter)
    : tasks;

  const isOverdue = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr < today;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Field Team Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">
                Welcome, {auth.user?.profile.email}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="animate-pulse h-3 w-3 bg-green-400 rounded-full"></span>
                <span className="text-sm">Active Session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Create Task Form */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 shadow-md rounded-xl space-y-4 sticky top-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Create New Task
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task ID
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    name="taskId"
                    placeholder="Enter task ID"
                    value={form.taskId}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    name="title"
                    placeholder="Enter task title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    name="assignedTo"
                    placeholder="Enter email address"
                    value={form.assignedTo}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    name="description"
                    placeholder="Enter task description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Create Task"}
              </button>
              
              {message && (
                <div className={`text-sm p-2 rounded ${message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Task List */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="deadlineFilter" className="font-medium text-gray-700 whitespace-nowrap">
                  Filter by Due Date:
                </label>
                <input
                  id="deadlineFilter"
                  type="date"
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value)}
                />
              </div>
              
              {deadlineFilter && (
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  onClick={() => setDeadlineFilter("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filter
                </button>
              )}
              
              <div className="ml-auto text-sm text-gray-500">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
              </div>
            </div>

            {/* Task List */}
            {isLoading && tasks.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
                <p className="mt-1 text-gray-500">
                  {deadlineFilter ? "Try changing your filter or" : "Get started by"} creating a new task.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks
                  .sort((a, b) =>
                    a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : 0
                  )
                  .map((task) => {
                    const overdue = isOverdue(task.dueDate);
                    const statusClass = getStatusBadgeClass(task.status);

                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-lg shadow-md transition-all hover:shadow-lg ${
                          overdue && !editingTaskId ? "border-l-4 border-red-500" : ""
                        }`}
                      >
                        {editingTaskId === task.id ? (
                          <div className="p-5 space-y-4">
                            <h3 className="font-medium text-gray-700">Edit Task</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Title
                                </label>
                                <input
                                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editForm.title || ""}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, title: e.target.value })
                                  }
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={editForm.description || ""}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                  </label>
                                  <select
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editForm.status || ""}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, status: e.target.value })
                                    }
                                  >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                  </label>
                                  <input
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editForm.dueDate || ""}
                                    type="date"
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, dueDate: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition flex-1"
                                onClick={saveEdit}
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
                                onClick={() => setEditingTaskId(null)}
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full border ${statusClass}`}>
                                    {task.status || "No Status"}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-3 text-sm">
                                  <p className="text-gray-600">
                                    <span className="font-medium">ID:</span> {task.id}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-medium">Assigned to:</span> {task.assignedTo}
                                  </p>
                                  <p className={`${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                                    <span className="font-medium">Due:</span> {task.dueDate || "N/A"}
                                    {overdue && " (Overdue)"}
                                  </p>
                                </div>
                                
                                {task.description && (
                                  <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {task.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md transition flex items-center text-sm"
                                  onClick={() => startEdit(task)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-md transition flex items-center text-sm"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
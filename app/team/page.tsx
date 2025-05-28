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
  const [editedTasks, setEditedTasks] = useState<Record<string, Partial<Task>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    if (!userEmail) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks?assignedTo=${userEmail}`
      );
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setMessage("Updating task...");
      setIsLoading(true);
      
      const res = await fetch(
        `https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      
      // Clear the edited state for this task after successful update
      setEditedTasks(prev => {
        const newState = {...prev};
        delete newState[taskId];
        return newState;
      });
      
      setMessage("✅ Task updated successfully!");
      fetchTasks();
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Failed to update task.");
      setIsLoading(false);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    setEditedTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setEditedTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], description }
    }));
  };
  
  const handleSubmitChanges = (id: string) => {
    if (editedTasks[id]) {
      updateTask(id, editedTasks[id]);
    }
  };

  const isOverdue = (dateStr?: string) => {
    return dateStr && dayjs().isAfter(dayjs(dateStr), "day");
  };

  const filteredTasks = filterDate
    ? tasks.filter((task) => task.dueDate === filterDate)
    : tasks;
    
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": 
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress": 
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Not Started":
      default: 
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };
  
  const handleLogout = () => {
    auth.signoutRedirect();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Field Team Dashboard</h1>
              <p className="text-blue-100 mt-1">
                Welcome, {userEmail}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Due Date
              </label>
              <div className="flex gap-2">
                <input
                  id="dateFilter"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate("")}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center px-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 self-end">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </div>
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
              {filterDate ? "Try changing your filter or check back later." : "You don't have any assigned tasks yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks
              .sort((a, b) => {
                // Sort by due date (overdue first, then by date)
                const aOverdue = isOverdue(a.dueDate);
                const bOverdue = isOverdue(b.dueDate);
                
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                
                if (a.dueDate && b.dueDate) {
                  return a.dueDate.localeCompare(b.dueDate);
                }
                return 0;
              })
              .map((task) => {
                const overdue = isOverdue(task.dueDate);
                const statusClass = getStatusColor(task.status);
                const isEdited = !!editedTasks[task.id];

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-lg shadow-md transition-all hover:shadow-lg ${
                      overdue ? "border-l-4 border-red-500" : ""
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full border ${statusClass}`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {task.dueDate
                                ? `Due: ${dayjs(task.dueDate).format("MMM D, YYYY")}${overdue ? " (Overdue)" : ""}`
                                : "No due date"}
                            </p>
                            <p className="text-xs text-gray-500">ID: {task.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            rows={3}
                            value={(editedTasks[task.id]?.description !== undefined ? 
                              editedTasks[task.id].description : task.description) || ""}
                            onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
                            placeholder="Add or update description"
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-3 items-end">
                          <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              value={(editedTasks[task.id]?.status !== undefined ? 
                                editedTasks[task.id].status : task.status)}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleSubmitChanges(task.id)}
                            disabled={!isEdited || isLoading}
                            className={`px-4 py-2 rounded-md transition flex items-center ${
                              isEdited 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {isLoading ? (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {message && (
          <div className={`mt-6 p-3 rounded-md ${message.includes("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
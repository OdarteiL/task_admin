"use client";

import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: string;
  dueDate?: string;
}

interface User {
  email: string;
  role: string;
}

export default function AdminPage() {
  const auth = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({
    taskId: "",
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({ email: "", role: "field_team" });
  const [userMessage, setUserMessage] = useState("");

  const handleLogout = () => auth.signoutRedirect();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Fetch tasks error:", err.message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

//   const fetchUsers = async () => {
//   try {
//     const res = await fetch("https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users");

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const raw = await res.json();

//     // If the body is a stringified array, parse it
//     const data = typeof raw === "string" ? JSON.parse(raw) :
//                  typeof raw.body === "string" ? JSON.parse(raw.body) :
//                  raw.body;

//     setUsers(Array.isArray(data) ? data : []);
//   } catch (err: any) {
//     console.error("Fetch users error:", err.message);
//     setUsers([]);
//   }
// };


  const fetchUsers = async () => {
    try {
      const res = await fetch("https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Fetch users error:", err.message);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (auth.user?.profile.email) {
      fetchTasks();
      fetchUsers();
    }
  }, [auth.user]);

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Submitting...");

    try {
      const res = await fetch("https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Task created successfully!");
        setForm({ taskId: "", title: "", description: "", assignedTo: "", dueDate: "" });
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      setMessage("❌ Failed to connect to API");
    } finally {
      setIsLoading(false);
    }
  };

  const submitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMessage("Submitting...");

    try {
      const res = await fetch("https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        setUserMessage("✅ User created.");
        setUserForm({ email: "", role: "field_team" });
        fetchUsers();
      } else {
        const err = await res.json();
        setUserMessage(`❌ Error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      setUserMessage("❌ Failed to create user.");
    }
  };


  const deleteUser = async (email: string) => {
  console.log("Deleting email:", email); // DEBUG

  if (!confirm(`Delete user ${email}?`)) return;

  try {
    const url = `https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users/${email}`;
    console.log("DELETE URL:", url); // DEBUG

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (res.ok) {
      setUserMessage("🗑️ User deleted.");
      fetchUsers();
    } else {
      const body = await res.text();
      console.error("DELETE failed:", res.status, body);
      setUserMessage(`❌ Error: ${body}`);
    }
  } catch (err: any) {
    console.error("Fetch delete failed:", err.message);
    setUserMessage("❌ Failed to delete user.");
  }
};



  // const deleteUser = async (email: string) => {
  //   if (!confirm(`Delete user ${email}?`)) return;

  //   try {
  //     const res = await fetch(`https://q14p2u9d42.execute-api.us-east-1.amazonaws.com/users/${encodeURIComponent(email)}`, {
  //       method: "DELETE",
  //     });

  //     if (res.ok) {
  //       setUserMessage("🗑️ User deleted.");
  //       fetchUsers();
  //     } else {
  //       const err = await res.json();
  //       setUserMessage(`❌ Error: ${err.message || res.statusText}`);
  //     }
  //   } catch (err) {
  //     setUserMessage("❌ Failed to delete user.");
  //   }
  // };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      const res = await fetch(`https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("🗑️ Task deleted.");
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      setMessage("❌ Delete failed");
    }
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    setIsLoading(true);

    try {
      const res = await fetch(`https://okswggf9u7.execute-api.us-east-1.amazonaws.com/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setMessage("✅ Task updated.");
        setEditingTaskId(null);
        fetchTasks();
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.message || res.statusText}`);
      }
    } catch (err) {
      setMessage("❌ Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = dayjs().format("YYYY-MM-DD");
    return dateStr < today;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6 rounded-lg shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-indigo-100">{auth.user?.profile.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors flex items-center"
        >
          Logout
        </button>
      </header>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Task Form */}
        <section className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-indigo-50 p-4 border-b border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-800">Create Task</h2>
          </div>
          <form onSubmit={submitTask} className="p-6 space-y-4">
            <input className="input" name="taskId" value={form.taskId} onChange={handleTaskChange} placeholder="Task ID" required />
            <input className="input" name="title" value={form.title} onChange={handleTaskChange} placeholder="Title" required />
            <input className="input" name="assignedTo" value={form.assignedTo} onChange={handleTaskChange} placeholder="Assigned To" required />
            <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleTaskChange} required />
            <textarea className="input" name="description" value={form.description} onChange={handleTaskChange} placeholder="Description" rows={3} />
            <button type="submit" className="btn bg-indigo-600 text-white" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </button>
            {message && <p>{message}</p>}
          </form>
        </section>

        {/* Create User Form */}
        <section className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-indigo-50 p-4 border-b border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-800">Create User</h2>
          </div>
          <form onSubmit={submitUser} className="p-6 space-y-4">
            <input className="input" name="email" value={userForm.email} onChange={handleUserChange} placeholder="Email" required />
            <select className="input" name="role" value={userForm.role} onChange={handleUserChange}>
              <option value="admin">Admin</option>
              <option value="field_team">Field Team</option>
            </select>
            <button type="submit" className="btn bg-indigo-600 text-white">Create User</button>
            {userMessage && <p>{userMessage}</p>}
          </form>
        </section>
      </div>

      {/* Task List */}
      <section className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-indigo-50 p-4 border-b border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800">Task List</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No tasks found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tasks.map(task => (
              <li key={task.id} className={`p-4 ${isOverdue(task.dueDate) ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{task.title}</h3>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{task.status}</span>
                </div>
                <p className="text-sm text-gray-600">Assigned to: {task.assignedTo} | Due: {task.dueDate}</p>
                <p className="mt-1">{task.description}</p>
                <div className="flex space-x-2 mt-3">
                  <button onClick={() => { setEditingTaskId(task.id); setEditForm(task); }} className="btn-sm bg-blue-100 text-blue-700">Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="btn-sm bg-red-100 text-red-700">Delete</button>
                </div>
                {editingTaskId === task.id && (
                  <div className="mt-4 space-y-2">
                    <input className="input" value={editForm.title || ""} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    <input className="input" type="date" value={editForm.dueDate || ""} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} />
                    <select className="input" value={editForm.status || ""} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <textarea className="input" rows={2} value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    <div className="flex space-x-2">
                      <button onClick={saveEdit} className="btn bg-green-600 text-white">Save</button>
                      <button onClick={() => setEditingTaskId(null)} className="btn bg-gray-300">Cancel</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* User List */}
      <section className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-indigo-50 p-4 border-b border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800">User List</h2>
        </div>
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map(user => (
              <li key={user.email} className="p-4 flex justify-between items-center">
                <span>{user.email} <span className="text-sm text-gray-500">({user.role})</span></span>
                <button onClick={() => deleteUser(user.email)} className="text-red-600 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

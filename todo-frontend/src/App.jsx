import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [filter, setFilter] = useState("all"); // State for task filter
  const API_URL = "https://backend-1-fvoi.onrender.com/api/tasks/";

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") return alert("Please enter a task");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });

      const task = await res.json();
      setTasks([...tasks, task]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const toggleTask = async (task) => {
    try {
      const res = await fetch(`${API_URL}${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}${id}/`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const editTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].editing = true;
    updatedTasks[index].tempText = updatedTasks[index].title; // Store original text
    setTasks(updatedTasks);
  };

  const handleEditChange = (index, newText) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].tempText = newText;
    setTasks(updatedTasks);
  };

  const confirmEdit = async (index) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[index];
    const updatedTask = { ...task, title: task.tempText, editing: false };

    try {
      const res = await fetch(`${API_URL}${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updatedTask.title }),
      });

      const taskData = await res.json();
      updatedTasks[index] = taskData;
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const cancelEdit = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].editing = false;
    updatedTasks[index].tempText = updatedTasks[index].title; // Restore original text
    setTasks(updatedTasks);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    fetchTasks();
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true; // "all" case
  });

  return (
    <div
      className="App"
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        backgroundColor: darkMode ? "#333" : "#fff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <h1>To-Do List</h1>
      <button onClick={toggleDarkMode}>
        {darkMode ? "🌙 Dark Mode" : "🔆 Light Mode"}
      </button>

      <input
        type="text"
        placeholder="Add new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        style={{ padding: "10px", width: "70%", marginRight: "10px" }}
      />
      <button onClick={addTask}>Add</button>

      {/* Filter Buttons */}
      <div style={{ margin: "20px 0" }}>
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {filteredTasks.map((task, index) => (
            <li key={task.id} style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                style={{ marginRight: "10px" }}
              />
              {task.editing ? (
                <>
                  <input
                    type="text"
                    value={task.tempText}
                    onChange={(e) => handleEditChange(index, e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <button onClick={() => confirmEdit(index)}>✅ Confirm</button>
                  <button onClick={() => cancelEdit(index)}>❌ Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </span>
                  <button onClick={() => editTask(index)} style={{ marginLeft: "10px" }}>
                    ✏️ Edit
                  </button>
                </>
              )}
              <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "10px" }}>
                ❌ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

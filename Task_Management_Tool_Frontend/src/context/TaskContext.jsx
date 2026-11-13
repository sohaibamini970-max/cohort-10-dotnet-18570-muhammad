import { createContext, useContext, useEffect, useState } from "react";

const TaskContext = createContext();

const SEED = [
  {
    id: 1,
    title: "Design new landing page",
    description: "Wireframe and high-fidelity mockups for the marketing site.",
    status: "In Progress",
    priority: "High",
    assignee: "Sarah K.",
    due: "2026-11-12",
    workBreakdown: [
      { id: "w1", title: "Analyze requirements", done: true },
      { id: "w2", title: "Sketch wireframes", done: true },
      { id: "w3", title: "Build high-fidelity mockups", done: false },
      { id: "w4", title: "Team review", done: false },
    ],
    challenges: [
      { id: "c1", problem: "Brand guidelines not finalized", impact: "High", status: "In Progress" },
    ],
    submission: null,
  },
  // ... other seed tasks (add `submission: null` to each)
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tm_tasks");
    return stored ? JSON.parse(stored) : SEED;
  });

  useEffect(() => {
    localStorage.setItem("tm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const createTask = (data) => {
    const newTask = {
      workBreakdown: [],
      challenges: [],
      submission: null,
      ...data,
      id: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id, data) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
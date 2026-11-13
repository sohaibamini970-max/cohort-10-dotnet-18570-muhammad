import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const stats = [
  {
    label: "Total Tasks",
    value: 128,
    icon: ListTodo,
    bg: "bg-indigo-500",
    text: "text-white",
    change: "+12%",
    trend: "up",
  },
  {
    label: "In Progress",
    value: 24,
    icon: Clock,
    bg: "bg-amber-500",
    text: "text-white",
    change: "+3%",
    trend: "up",
  },
  {
    label: "Completed",
    value: 89,
    icon: CheckCircle2,
    bg: "bg-emerald-500",
    text: "text-white",
    change: "+8%",
    trend: "up",
  },
  {
    label: "Overdue",
    value: 15,
    icon: AlertCircle,
    bg: "bg-rose-500",
    text: "text-white",
    change: "-2%",
    trend: "down",
  },
];

const recentTasks = [
  { id: 1, title: "Design new landing page", status: "In Progress", assignee: "Sarah K.", due: "Today", priority: "High" },
  { id: 2, title: "Fix login bug on mobile", status: "Completed", assignee: "John D.", due: "Today", priority: "Medium" },
  { id: 3, title: "Write API documentation", status: "Pending", assignee: "Mike R.", due: "Tomorrow", priority: "Low" },
  { id: 4, title: "Review Q4 roadmap", status: "In Progress", assignee: "Emma L.", due: "Dec 12", priority: "High" },
  { id: 5, title: "Update dashboard charts", status: "Pending", assignee: "Alex P.", due: "Dec 15", priority: "Medium" },
];

const statusColor = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Pending: "bg-slate-100 text-slate-700",
};

const priorityColor = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-700",
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Dashboard 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 transition active:scale-95 self-start sm:self-auto">
          + New Task
        </button>
      </div>

      {/* Stats — Solid colored cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-2xl p-5 text-white transition-all duration-200 hover:brightness-105`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <s.icon size={24} className="text-white" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-white/25 ${
                  s.trend === "down" ? "text-red-100" : "text-emerald-50"
                }`}
              >
                <TrendingUp
                  size={12}
                  className={s.trend === "down" ? "rotate-180" : ""}
                />
                {s.change}
              </span>
            </div>
            <p className="text-white/90 text-sm font-semibold uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-3xl font-extrabold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Tasks + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h3 className="font-bold text-lg text-indigo-600">Recent Tasks</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-indigo-600" >
                <tr className="text-left text-white border-b border-slate-200">
                  <th className="px-5 py-3 font-bold">Task</th>
                  <th className="px-5 py-3 font-bold">Assignee</th>
                  <th className="px-5 py-3 font-bold">Due</th>
                  <th className="px-5 py-3 font-bold">Priority</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      {t.title}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600 whitespace-nowrap">
                      {t.assignee}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600 whitespace-nowrap">
                      {t.due}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityColor[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-lg mb-4 text-indigo-600">This Week</h3>
          <div className="space-y-5">
            {[
              { label: "Productivity", value: 78, color: "bg-primary-600" },
              { label: "Task completion", value: 64, color: "bg-emerald-500" },
              { label: "On-time delivery", value: 92, color: "bg-amber-500" },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 font-semibold">{p.label}</span>
                  <span className="font-bold">{p.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all`}
                    style={{ width: `${p.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <h4 className="font-bold mb-3 text-sm">Team Activity</h4>
            <div className="space-y-3">
              {[
                { name: "Sarah", action: "completed a task", time: "5m ago" },
                { name: "Mike", action: "commented on bug #42", time: "20m ago" },
                { name: "Emma", action: "created a new task", time: "1h ago" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {a.name[0]}
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      <span className="font-bold">{a.name}</span>{" "}
                      {a.action}
                    </p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
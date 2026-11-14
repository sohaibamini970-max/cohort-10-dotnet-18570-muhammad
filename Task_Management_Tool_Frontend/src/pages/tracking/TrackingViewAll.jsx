import { useMemo, useState } from "react";
import { ListTodo, Search, Filter, Send, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TimelineView, TableView, getDeadlineState } from "../../components/TrackingViews";

export default function TrackingViewAll() {
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deadlineFilter, setDeadlineFilter] = useState("All");
  const [view, setView] = useState("timeline");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || t.assignee.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesDeadline = deadlineFilter === "All" || getDeadlineState(t) === deadlineFilter;
      return matchesQuery && matchesStatus && matchesDeadline;
    }).sort((a, b) => new Date(b.submission?.submittedAt || 0) - new Date(a.submission?.submittedAt || 0));
  }, [tasks, query, statusFilter, deadlineFilter]);

  const metrics = useMemo(() => ({
    submitted: tasks.filter((t) => t.submission).length,
    pending: tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    overdue: tasks.filter((t) => !t.submission && getDeadlineState(t) === "overdue").length,
  }), [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Task Tracking: View All</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete timeline of all submissions, deadlines, and statuses.</p>
      </div>

      {/* Vibrant Summary Cards matching Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          label="Submitted"
          value={metrics.submitted}
          icon={Send}
          bg="bg-emerald-500"
          change="+12%"
          trend="up"
        />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          icon={Clock}
          bg="bg-amber-500"
          change="+3%"
          trend="up"
        />
        <MetricCard
          label="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          bg="bg-indigo-500"
          change="+8%"
          trend="up"
        />
        <MetricCard
          label="Overdue"
          value={metrics.overdue}
          icon={AlertTriangle}
          bg="bg-rose-500"
          change="-2%"
          trend="down"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 transition"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Deadlines</option>
            <option value="on-time">On Time</option>
            <option value="late">Late</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <button
              onClick={() => setView("timeline")}
              className={`px-4 py-2.5 text-sm font-bold transition ${view === "timeline" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2.5 text-sm font-bold transition ${view === "table" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState /> : view === "timeline" ? <TimelineView tasks={filtered} /> : <TableView tasks={filtered} />}
    </div>
  );
}

// 👇 Redesigned Card Component
function MetricCard({ label, value, icon: Icon, bg, change, trend }) {
  return (
    <div className={`${bg} rounded-2xl p-5 text-white transition-all duration-200 hover:brightness-105 hover:-translate-y-0.5 shadow-md relative overflow-hidden`}>
      {/* Background subtle circle for depth */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white opacity-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon size={24} className="text-white" />
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-white/25 ${trend === "down" ? "text-red-100" : "text-emerald-50"}`}>
            <TrendingUp size={12} className={trend === "down" ? "rotate-180" : ""} />
            {change}
          </span>
        </div>
        <p className="text-white/90 text-sm font-semibold uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
      <ListTodo size={32} className="mx-auto text-slate-300 mb-3" />
      <p className="font-semibold text-slate-700">No tasks match your filters</p>
    </div>
  );
}
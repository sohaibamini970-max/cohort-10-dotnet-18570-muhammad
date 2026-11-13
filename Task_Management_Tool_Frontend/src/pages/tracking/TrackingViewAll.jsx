import { useMemo, useState } from "react";
import { ListTodo, Search, Filter, Send, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Submitted" value={metrics.submitted} icon={Send} gradient="from-emerald-500 to-teal-500" tint="bg-emerald-50 dark:bg-emerald-950/40" accent="text-emerald-600 dark:text-emerald-400" />
        <MetricCard label="Pending" value={metrics.pending} icon={Clock} gradient="from-amber-500 to-orange-500" tint="bg-amber-50 dark:bg-amber-950/40" accent="text-amber-600 dark:text-amber-400" />
        <MetricCard label="Completed" value={metrics.completed} icon={CheckCircle2} gradient="from-indigo-500 to-purple-500" tint="bg-indigo-50 dark:bg-indigo-950/40" accent="text-indigo-600 dark:text-indigo-400" />
        <MetricCard label="Overdue" value={metrics.overdue} icon={AlertTriangle} gradient="from-red-500 to-rose-500" tint="bg-red-50 dark:bg-red-950/40" accent="text-red-600 dark:text-red-400" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium dark:text-slate-100">
            <option value="All">All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <select value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium dark:text-slate-100">
            <option value="All">All Deadlines</option>
            <option value="on-time">On Time</option>
            <option value="late">Late</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button onClick={() => setView("timeline")} className={`px-3 py-2.5 text-sm font-bold transition ${view === "timeline" ? "bg-primary-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>Timeline</button>
            <button onClick={() => setView("table")} className={`px-3 py-2.5 text-sm font-bold transition ${view === "table" ? "bg-primary-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>Table</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState /> : view === "timeline" ? <TimelineView tasks={filtered} /> : <TableView tasks={filtered} />}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, gradient, tint, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl transition-all ${tint}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 dark:opacity-10 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3`}><Icon size={22} className="text-white" /></div>
        <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</p>
        <p className={`text-sm font-bold mt-0.5 ${accent}`}>{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
      <ListTodo size={32} className="mx-auto text-slate-400 mb-3" />
      <p className="font-semibold text-slate-700 dark:text-slate-200">No tasks match your filters</p>
    </div>
  );
}
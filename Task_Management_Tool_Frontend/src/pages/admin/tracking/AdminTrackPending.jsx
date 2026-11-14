import { useState, useMemo } from "react";
import { Search, Clock } from "lucide-react";
import { useTasks } from "../../../context/TaskContext";
import { TimelineView, TableView, getDeadlineState } from "../../../components/AdminTrackingViews";

export default function AdminTrackPending() {
  const { tasks } = useTasks();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("timeline");

  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => !t.submission && getDeadlineState(t) !== "overdue")
      .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.assignee.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0));
  }, [tasks, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Pending Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tasks currently in progress or awaiting submission.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pending tasks..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          <button onClick={() => setView("timeline")} className={`px-4 py-2.5 text-sm font-bold transition ${view === "timeline" ? "bg-primary-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>Timeline</button>
          <button onClick={() => setView("table")} className={`px-4 py-2.5 text-sm font-bold transition ${view === "table" ? "bg-primary-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>Table</button>
        </div>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Clock size={32} className="mx-auto text-amber-500 mb-3" />
          <p className="font-semibold text-slate-700">No pending tasks</p>
        </div>
      ) : view === "timeline" ? <TimelineView tasks={pendingTasks} /> : <TableView tasks={pendingTasks} />}
    </div>
  );
}
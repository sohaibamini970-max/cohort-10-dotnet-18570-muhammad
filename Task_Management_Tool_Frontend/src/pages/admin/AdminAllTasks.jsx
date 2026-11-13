import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  User,
  CalendarDays,
  ListChecks,
  AlertTriangle,
  Send,
  CheckCircle2,
  X,
  ExternalLink,
  Link2,
  FileText,
  Download,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import TaskDetailModal from "../../components/TaskDetailModal";
import SubmitModal from "../../components/SubmitModal";

/* ---------- Helpers & Colors ---------- */
const statusColor = {
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const priorityColor = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusBar = {
  Completed: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500",
  "In Progress": "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
  Pending: "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500",
};

const statusGlow = {
  Completed: "bg-emerald-400",
  "In Progress": "bg-amber-400",
  Pending: "bg-slate-400",
};

const statusDot = {
  Completed: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Pending: "bg-slate-500",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function AdminAllTasks() {
  const { tasks, updateTask } = useTasks();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [detailTask, setDetailTask] = useState(null);
  const [viewWork, setViewWork] = useState(null);
  const [viewChallenges, setViewChallenges] = useState(null);
  const [viewSubmission, setViewSubmission] = useState(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.assignee.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tasks, query, statusFilter]);

  // Live refs so modals update if data changes
  const liveDetail = detailTask ? tasks.find((t) => t.id === detailTask.id) : null;
  const liveWork = viewWork ? tasks.find((t) => t.id === viewWork.id) : null;
  const liveChallenges = viewChallenges ? tasks.find((t) => t.id === viewChallenges.id) : null;
  const liveSubmission = viewSubmission ? tasks.find((t) => t.id === viewSubmission.id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">All Tasks & Progress</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review team tasks, work breakdowns, challenges, and submissions.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or assignee..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Status</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No tasks found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((t) => {
            const steps = t.workBreakdown || [];
            const done = steps.filter((s) => s.done).length;
            const stepPct = steps.length ? Math.round((done / steps.length) * 100) : 0;
            const challengeCount = (t.challenges || []).length;

            return (
              <div
                key={t.id}
                onClick={() => setDetailTask(t)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* Status accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${statusBar[t.status]}`} />

                {/* Soft status tint */}
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 dark:opacity-10 pointer-events-none ${statusGlow[t.status]}`} />

                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${statusColor[t.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[t.status]}`} />
                        {t.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${priorityColor[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                      {t.title}
                    </h3>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {t.description ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1 relative z-10">
                    {t.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-4 flex-1 relative z-10">
                    No description provided
                  </p>
                )}

                {/* PROGRESS */}
                {steps.length > 0 && (
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <ListChecks size={12} className="text-primary-500" />
                        Work Progress
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {done}/{steps.length}
                        <span className="text-slate-400 font-medium ml-1">· {stepPct}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${stepPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* META ROW */}
                <div className="flex items-center gap-2 mb-4 relative z-10 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {t.assignee?.[0]?.toUpperCase() || "?"}
                    </span>
                    {t.assignee}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <CalendarDays size={12} className="text-slate-500 dark:text-slate-400" />
                    {fmtDate(t.due)}
                  </span>
                  {challengeCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle size={11} />
                      {challengeCount}
                    </span>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-3 gap-2 mt-auto relative z-10 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewWork(t);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-100 dark:border-primary-800/50 transition active:scale-95"
                  >
                    <ListChecks size={14} /> Work
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewChallenges(t);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-100 dark:border-amber-800/50 transition active:scale-95"
                  >
                    <AlertTriangle size={14} /> Challenges
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewSubmission(t);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                      t.status === "Completed" || t.submission
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                        : "text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/30"
                    }`}
                  >
                    {t.status === "Completed" || t.submission ? (
                      <>
                        <CheckCircle2 size={14} /> Submitted
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      
      {/* 1. Detail Hub Modal */}
      {liveDetail && (
        <TaskDetailModal
          task={liveDetail}
          onClose={() => setDetailTask(null)}
          onOpenWork={(task) => {
            setDetailTask(null);
            setViewWork(task);
          }}
          onOpenChallenges={(task) => {
            setDetailTask(null);
            setViewChallenges(task);
          }}
          onOpenSubmit={(task) => {
            setDetailTask(null);
            setViewSubmission(task);
          }}
        />
      )}

      {/* 2. Work Modal (Admin View) */}
      {liveWork && (
        <SimpleModal
          title="Task Work Breakdown"
          icon={ListChecks}
          color="text-primary-600"
          taskTitle={liveWork.title}
          onClose={() => setViewWork(null)}
        >
          {liveWork.workBreakdown?.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 text-center">No work breakdown added yet.</p>
          ) : (
            <div className="space-y-2">
              {liveWork.workBreakdown.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  {s.done ? (
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${s.done ? "text-slate-500 line-through" : "text-slate-700 dark:text-slate-200"}`}>
                    {s.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SimpleModal>
      )}

      {/* 3. Challenges Modal (Admin View) */}
      {liveChallenges && (
        <SimpleModal
          title="Reported Challenges"
          icon={AlertTriangle}
          color="text-amber-600"
          taskTitle={liveChallenges.title}
          onClose={() => setViewChallenges(null)}
        >
          {liveChallenges.challenges?.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No challenges reported</p>
              <p className="text-xs text-slate-500">This task is running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveChallenges.challenges.map((c, i) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      {c.problem}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-8">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      {c.impact} Impact
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SimpleModal>
      )}

      {/* 4. Submission Modal (Admin View) */}
      {liveSubmission && (
        <SimpleModal
          title={liveSubmission.submission ? "Task Submission" : "Submit Task"}
          icon={Send}
          color="text-emerald-600"
          taskTitle={liveSubmission.title}
          onClose={() => setViewSubmission(null)}
        >
          {!liveSubmission.submission ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">This task has not been submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <CheckCircle2 size={16} /> Submitted on {fmtDate(liveSubmission.submission.submittedAt)}
              </div>

              {/* Links */}
              {liveSubmission.submission.links?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Links ({liveSubmission.submission.links.length})</p>
                  <div className="space-y-2">
                    {liveSubmission.submission.links.map((l, i) => (
                      <a key={i} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:underline">
                        <Link2 size={16} className="flex-shrink-0" />
                        <span className="truncate">{l}</span>
                        <ExternalLink size={14} className="ml-auto flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {liveSubmission.submission.files?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Files ({liveSubmission.submission.files.length})</p>
                  <div className="space-y-2">
                    {liveSubmission.submission.files.map((f, i) => (
                      <a key={i} href={f.dataUrl} download={f.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <FileText size={16} className="text-indigo-500 flex-shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <Download size={14} className="ml-auto flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {liveSubmission.submission.notes && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    {liveSubmission.submission.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </SimpleModal>
      )}

    </div>
  );
}

/* ---------- Reusable Simple Modal Wrapper ---------- */
function SimpleModal({ title, icon: Icon, color, taskTitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={18} className={color} />
              <span className={`text-xs font-bold uppercase tracking-wide ${color}`}>
                {title}
              </span>
            </div>
            <h3 className="text-lg font-bold dark:text-white truncate">{taskTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
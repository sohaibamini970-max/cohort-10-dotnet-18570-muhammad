import {
  X,
  ListChecks,
  AlertTriangle,
  Send,
  CalendarDays,
  User,
  CheckCircle2,
  CircleDot,
  FileText,
  Link2,
} from "lucide-react";

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

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function TaskDetailModal({
  task,
  onClose,
  onOpenWork,
  onOpenChallenges,
  onOpenSubmit,
}) {
  if (!task) return null;

  const steps = task.workBreakdown || [];
  const completed = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;
  const challengeCount = (task.challenges || []).length;
  const submission = task.submission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
              Task Details
            </span>
            <h2 className="text-lg font-bold dark:text-white leading-snug mt-1">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status + Priority */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[task.status]}`}>
              {task.status}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[task.priority]}`}>
              {task.priority} Priority
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Description
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Assignee
              </p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <User size={14} className="text-slate-400" />
                {task.assignee}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Due Date
              </p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <CalendarDays size={14} className="text-slate-400" />
                {fmtDate(task.due)}
              </p>
            </div>
          </div>

          {/* Work Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Work Progress
              </p>
              <p className="text-sm font-bold dark:text-white">
                {completed}/{steps.length} · {pct}%
              </p>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Submission summary */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Submission
            </p>
            {submission ? (
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Submitted
                </span>
                {submission.links?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Link2 size={12} /> {submission.links.length}
                  </span>
                )}
                {submission.files?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {submission.files.length}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
                <CircleDot size={12} /> Not submitted yet
              </p>
            )}
          </div>

          {/* Redirect options */}
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Open
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onOpenWork(task)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                    <ListChecks size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-primary-700 dark:text-primary-300">
                      Task Work
                    </span>
                    <span className="block text-xs text-primary-600/80 dark:text-primary-400/80">
                      {steps.length} step{steps.length === 1 ? "" : "s"} · {completed} done
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  Open →
                </span>
              </button>

              <button
                onClick={() => onOpenChallenges(task)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <AlertTriangle size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-amber-700 dark:text-amber-300">
                      Challenges
                    </span>
                    <span className="block text-xs text-amber-600/80 dark:text-amber-400/80">
                      {challengeCount} challenge{challengeCount === 1 ? "" : "s"} recorded
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Open →
                </span>
              </button>

              <button
                onClick={() => onOpenSubmit(task)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Send size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {submission ? "View Submission" : "Submit Task"}
                    </span>
                    <span className="block text-xs text-emerald-600/80 dark:text-emerald-400/80">
                      {submission
                        ? "See submitted work"
                        : "Attach links or files"}
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Open →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
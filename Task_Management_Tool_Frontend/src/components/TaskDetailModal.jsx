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
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Pending: "bg-slate-100 text-slate-700",
};

const priorityColor = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-700",
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container - Forced Light Mode */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wide">
              Task Details
            </span>
            <h2 className="text-lg font-bold text-slate-800 leading-snug mt-1">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 flex-shrink-0 transition"
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
              <p className="text-xs font-bold uppercase text-slate-400 mb-1.5">
                Description
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                Assignee
              </p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <User size={14} className="text-slate-400" />
                {task.assignee}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                Due Date
              </p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <CalendarDays size={14} className="text-slate-400" />
                {fmtDate(task.due)}
              </p>
            </div>
          </div>

          {/* Work Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase text-slate-400">
                Work Progress
              </p>
              <p className="text-sm font-bold text-slate-800">
                {completed}/{steps.length} · {pct}%
              </p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Submission summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
              Submission Status
            </p>
            {submission ? (
              <div className="flex items-center gap-3 text-xs text-slate-700">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
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
              <p className="text-xs text-slate-500 italic flex items-center gap-1">
                <CircleDot size={12} /> Not submitted yet
              </p>
            )}
          </div>

          {/* Redirect options */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase text-slate-400 mb-3">
              Quick Actions
            </p>
            <div className="space-y-3">

              {/* Task Work Option */}
              <button
                onClick={() => onOpenWork(task)}
                className="w-full group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <ListChecks size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                      Task Work
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {steps.length} step{steps.length === 1 ? "" : "s"} · {completed} done
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-primary-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  Open →
                </span>
              </button>

              {/* Challenges Option */}
              <button
                onClick={() => onOpenChallenges(task)}
                className="w-full group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <AlertTriangle size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                      Challenges
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {challengeCount} challenge{challengeCount === 1 ? "" : "s"} recorded
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  Open →
                </span>
              </button>

              {/* Submit Option */}
              <button
                onClick={() => onOpenSubmit(task)}
                className="w-full group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Send size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {submission ? "View Submission" : "Submit Task"}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {submission
                        ? "Review submitted links & files"
                        : "Attach links or files to submit"}
                    </span>
                  </span>
                </span>
                <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
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
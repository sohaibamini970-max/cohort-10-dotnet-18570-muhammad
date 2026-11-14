import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  User,
  TrendingUp,
  TrendingDown,
  FileText,
  Link2,
  Timer,
  XCircle,
  ExternalLink,
} from "lucide-react";

export const statusColor = {
  Completed: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Pending: "bg-slate-100 text-slate-700",
};

export const priorityColor = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-700",
};

export const deadlineColor = {
  "on-time": "bg-emerald-100 text-emerald-700",
  late: "bg-orange-100 text-orange-700",
  upcoming: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  "no-deadline": "bg-slate-100 text-slate-700",
};

export const deadlineLabel = {
  "on-time": "On Time",
  late: "Late",
  upcoming: "Upcoming",
  overdue: "Overdue",
  "no-deadline": "No Deadline",
};

export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const getDeadlineState = (task) => {
  const today = startOfDay(new Date());
  if (task.submission?.submittedAt && task.due) {
    const submitted = startOfDay(task.submission.submittedAt);
    const due = startOfDay(task.due);
    if (submitted <= due) return "on-time";
    return "late";
  }
  if (task.due) {
    const due = startOfDay(task.due);
    if (due < today) return "overdue";
    return "upcoming";
  }
  return "no-deadline";
};

export const daysDiff = (later, earlier) => {
  if (!later || !earlier) return null;
  const a = startOfDay(later);
  const b = startOfDay(earlier);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
};

/* ==================== TIMELINE VIEW ==================== */
export function TimelineView({ tasks }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="relative">
        {/* Gradient Vertical Line */}
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-200 via-amber-200 to-red-200" />

        <div className="space-y-4">
          {tasks.map((t) => {
            const state = getDeadlineState(t);
            const sub = t.submission;
            const isSubmitted = !!sub;
            const diff = sub?.submittedAt ? daysDiff(sub.submittedAt, t.due) : null;

            const dotBg = isSubmitted
              ? state === "late"
                ? "bg-gradient-to-br from-orange-400 to-orange-500"
                : "bg-gradient-to-br from-emerald-400 to-emerald-500"
              : state === "overdue"
                ? "bg-gradient-to-br from-red-400 to-red-500"
                : "bg-gradient-to-br from-slate-300 to-slate-400";

            const cardBorder = isSubmitted
              ? state === "late"
                ? "border-l-4 border-l-orange-400"
                : "border-l-4 border-l-emerald-400"
              : state === "overdue"
                ? "border-l-4 border-l-red-400"
                : "border-l-4 border-l-slate-300";

            const cardBg = isSubmitted
              ? state === "late"
                ? "bg-orange-50/50"
                : "bg-emerald-50/50"
              : state === "overdue"
                ? "bg-red-50/50"
                : "bg-slate-50";

            return (
              <div key={t.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${dotBg}`}>
                    {isSubmitted ? (
                      <Send size={18} className="text-white" />
                    ) : state === "overdue" ? (
                      <AlertTriangle size={18} className="text-white" />
                    ) : (
                      <Clock size={18} className="text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className={`rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow ${cardBg} ${cardBorder}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-sm text-slate-800 leading-snug">{t.title}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${deadlineColor[state]}`}>{deadlineLabel[state]}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 mb-3">
                      <span className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />{t.assignee}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-slate-400" />Deadline: {fmtDate(t.due)}
                      </span>
                      {isSubmitted && (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <Send size={12} />Submitted: {fmtDateTime(sub.submittedAt)}
                        </span>
                      )}
                    </div>

                    {isSubmitted && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {diff !== null && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${diff > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {diff > 0 ? (
                              <><TrendingDown size={11} /> {diff} day{diff === 1 ? "" : "s"} late</>
                            ) : diff === 0 ? (
                              <><CheckCircle2 size={11} /> On due date</>
                            ) : (
                              <><TrendingUp size={11} /> {Math.abs(diff)} day{Math.abs(diff) === 1 ? "" : "s"} early</>
                            )}
                          </span>
                        )}
                        {sub.links?.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-700">
                            <Link2 size={11} /> {sub.links.length} link{sub.links.length === 1 ? "" : "s"}
                          </span>
                        )}
                        {sub.files?.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-purple-100 text-purple-700">
                            <FileText size={11} /> {sub.files.length} file{sub.files.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    )}
                    {sub?.links?.[0] && (
                      <a href={sub.links[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline truncate max-w-full">
                        <ExternalLink size={11} /> {sub.links[0]}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== TABLE VIEW ==================== */
export function TableView({ tasks }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
              <th className="px-4 py-3.5 font-bold">Task</th>
              <th className="px-4 py-3.5 font-bold">Assignee</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-4 py-3.5 font-bold">Deadline</th>
              <th className="px-4 py-3.5 font-bold">Submitted</th>
              <th className="px-4 py-3.5 font-bold">Timing</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const state = getDeadlineState(t);
              const sub = t.submission;
              const diff = sub?.submittedAt ? daysDiff(sub.submittedAt, t.due) : null;

              const rowTint = sub
                ? state === "late"
                  ? "bg-orange-50/30 hover:bg-orange-50/60"
                  : "bg-emerald-50/30 hover:bg-emerald-50/60"
                : state === "overdue"
                  ? "bg-red-50/30 hover:bg-red-50/60"
                  : "hover:bg-slate-50";

              return (
                <tr key={t.id} className={`border-b border-slate-100 last:border-0 transition-colors ${rowTint}`}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{t.title}</p>
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1.5 ${priorityColor[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">{t.assignee}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-700 font-medium">{fmtDate(t.due)}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${deadlineColor[state]}`}>{deadlineLabel[state]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {sub?.submittedAt ? (
                      <span className="text-slate-700 font-medium">{fmtDateTime(sub.submittedAt)}</span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Not submitted</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {diff !== null ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg ${diff > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {diff > 0 ? (
                          <><TrendingDown size={12} /> {diff}d late</>
                        ) : diff === 0 ? (
                          <><CheckCircle2 size={12} /> On time</>
                        ) : (
                          <><TrendingUp size={12} /> {Math.abs(diff)}d early</>
                        )}
                      </span>
                    ) : state === "overdue" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700">
                        <XCircle size={12} /> Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600">
                        <Timer size={12} /> Awaiting
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
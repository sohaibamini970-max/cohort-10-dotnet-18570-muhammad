import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CalendarDays,
  User,
  Filter,
  Send,
  X,
  CheckCircle2,
  ListChecks,
  AlertTriangle,
  CircleDot,
} from "lucide-react";
import { useTasks } from "../context/TaskContext";
import TaskModal from "../components/TaskModal";
import ConfirmDelete from "../components/ConfirmDelete";
import SubmitModal from "../components/SubmitModal";
import TaskDetailModal from "../components/TaskDetailModal";

const statusColor = {
  Completed: "bg-emerald-100 text-emerald-700 ",
  "In Progress": "bg-amber-100 text-amber-700 ",
  Pending: "bg-slate-100 text-slate-700 text-slate-600",
};

const priorityColor = {
  High: "bg-red-100 text-red-700 ",
  Medium: "bg-amber-100 text-amber-700 ",
  Low: "bg-slate-100 text-slate-700 text-slate-600",
};

const impactColor = {
  High: "bg-red-100 text-red-700 ",
  Medium: "bg-amber-100 text-amber-700 ",
  Low: "bg-slate-100 text-slate-700 text-slate-600",
};

const challengeStatusColor = {
  Resolved: "bg-emerald-100 text-emerald-700 ",
  "In Progress": "bg-amber-100 text-amber-700 ",
  Open: "bg-red-100 text-red-700 ",
};

/* Top accent bar colors */
const statusBar = {
  Completed: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500",
  "In Progress": "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
  Pending: "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500",
};

/* Corner glow tint */
const statusGlow = {
  Completed: "bg-emerald-400",
  "In Progress": "bg-amber-400",
  Pending: "bg-slate-400",
};

/* Colored dot inside the status pill */
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

const uid = () => Math.random().toString(36).slice(2, 9);

/* ============================================================
 TASK WORK MODAL — Hybrid View (Admin assigned + User added)
 ============================================================ */
function TaskWorkModal({ task, onClose, onUpdate }) {
  const [newStep, setNewStep] = useState("");

  if (!task) return null;

  const steps = task.workBreakdown || [];
  const completed = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  // Toggle done status
  const toggleStep = (id) => {
    const next = steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    onUpdate(task.id, { workBreakdown: next });
  };

  // Add new step
  const addStep = () => {
    const title = newStep.trim();
    if (!title) return;
    const next = [...steps, { id: uid(), title, done: false }];
    onUpdate(task.id, { workBreakdown: next });
    setNewStep("");
  };

  // Remove step
  const removeStep = (id) => {
    const next = steps.filter((s) => s.id !== id);
    onUpdate(task.id, { workBreakdown: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks size={18} className="text-primary-600" />
              <span className="text-xs font-bold uppercase text-primary-600 tracking-wide">
                Task Work Breakdown
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">{task.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[task.status]}`}>
              {task.status}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[task.priority]}`}>
              {task.priority} Priority
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase text-slate-500">Work Progress</p>
              <p className="text-sm font-bold text-slate-900">{completed}/{steps.length} · {pct}%</p>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-500 mb-2">
              Breakdown Checklist ({steps.length})
            </p>

            {steps.length === 0 ? (
              <p className="text-sm text-slate-400 text-slate-500 italic py-4 text-center bg-slate-50 rounded-xl">
                No work breakdown yet. Add your first step below.
              </p>
            ) : (
              <div className="space-y-2">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 transition"
                  >
                    <button
                      onClick={() => toggleStep(s.id)}
                      className="flex-shrink-0"
                      aria-label={s.done ? "Mark incomplete" : "Mark complete"}
                    >
                      {s.done ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <CircleDot size={20} className="text-slate-400" />
                      )}
                    </button>

                    <p className={`flex-1 text-sm font-medium ${s.done ? "text-slate-500 text-slate-500 line-through" : "text-slate-700 text-slate-700"}`}>
                      {s.title}
                    </p>

                    <button
                      onClick={() => removeStep(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                      aria-label="Remove step"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add step input */}
            <div className="flex gap-2 mt-4">
              <input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStep()}
                placeholder="Add a new step..."
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <button
                onClick={addStep}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition active:scale-95"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 CHALLENGES MODAL — Fully editable
 ============================================================ */
const EMPTY_CHALLENGE = { problem: "", impact: "Medium", status: "Open" };

function ChallengesModal({ task, onClose, onUpdate }) {
  const [draft, setDraft] = useState(EMPTY_CHALLENGE);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_CHALLENGE);

  if (!task) return null;

  const challenges = task.challenges || [];
  const save = (next) => onUpdate(task.id, { challenges: next });

  const addChallenge = () => {
    if (!draft.problem.trim()) return;
    save([...challenges, { id: uid(), ...draft, problem: draft.problem.trim() }]);
    setDraft(EMPTY_CHALLENGE);
  };

  const removeChallenge = (id) => save(challenges.filter((c) => c.id !== id));

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditDraft({ problem: c.problem, impact: c.impact, status: c.status });
  };

  const commitEdit = () => {
    if (!editDraft.problem.trim()) return setEditingId(null);
    save(
      challenges.map((c) =>
        c.id === editingId ? { ...c, ...editDraft, problem: editDraft.problem.trim() } : c
      )
    );
    setEditingId(null);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-amber-600" />
              <span className="text-xs font-bold uppercase text-amber-600 tracking-wide">
                Challenges
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Problems and challenges faced while working on this task.
          </p>

          {challenges.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1" />
              <p className="text-sm font-semibold text-slate-700">
                No challenges recorded
              </p>
              <p className="text-xs text-slate-500">
                Add one below if issues come up.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((c, i) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {editingId === c.id ? (
                    <div className="space-y-2">
                      <input
                        value={editDraft.problem}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, problem: e.target.value }))
                        }
                        placeholder="Problem..."
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editDraft.impact}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, impact: e.target.value }))
                          }
                          className={inputClass}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                        <select
                          value={editDraft.status}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, status: e.target.value }))
                          }
                          className={inputClass}
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={commitEdit}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-sm font-semibold text-slate-800 leading-snug">
                            {c.problem}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"
                            aria-label="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => removeChallenge(c.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            aria-label="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 ml-8">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impactColor[c.impact]}`}>
                          {c.impact} impact
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${challengeStatusColor[c.status]}`}>
                          {c.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500">
              Add Challenge
            </p>
            <input
              value={draft.problem}
              onChange={(e) => setDraft((d) => ({ ...d, problem: e.target.value }))}
              placeholder="Describe the problem or challenge..."
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={draft.impact}
                onChange={(e) => setDraft((d) => ({ ...d, impact: e.target.value }))}
                className={inputClass}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                className={inputClass}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <button
              onClick={addChallenge}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition active:scale-95"
            >
              <Plus size={16} /> Add Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 MAIN TASKS PAGE
 ============================================================ */
export default function Tasks() {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [taskWork, setTaskWork] = useState(null);
  const [challenges, setChallenges] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.assignee.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || t.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [tasks, query, statusFilter, priorityFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editing) updateTask(editing.id, data);
    else createTask(data);
  };

  const confirmDelete = () => {
    if (deleting) deleteTask(deleting.id);
    setDeleting(null);
  };

  const openSubmit = (task) => {
    setSubmitting(task);
  };

  const handleConfirmSubmit = (payload) => {
    if (!submitting) return;
    updateTask(submitting.id, {
      status: "Completed",
      submission: payload,
    });
    setSubmitting(null);
  };

  // Live refs
  const liveTaskWork = taskWork ? tasks.find((t) => t.id === taskWork.id) : null;
  const liveChallengeTask = challenges
    ? tasks.find((t) => t.id === challenges.id)
    : null;
  const liveSubmittingTask = submitting
    ? tasks.find((t) => t.id === submitting.id)
    : null;
  const liveDetailTask = detailTask
    ? tasks.find((t) => t.id === detailTask.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-1">
            Manage, edit, and track all your team's tasks.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or assignee..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            >
              <option value="All">All Status</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          >
            <option value="All">All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Task cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No tasks found</p>
          <p className="text-sm text-slate-500 mt-1">
            Try changing filters or create a new task.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((t) => {
              const steps = t.workBreakdown || [];
              const done = steps.filter((s) => s.done).length;
              const stepPct = steps.length
                ? Math.round((done / steps.length) * 100)
                : 0;
              const challengeCount = (t.challenges || []).length;

              return (
                <div
                  key={t.id}
                  onClick={() => setDetailTask(t)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailTask(t);
                    }
                  }}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {/* Status accent bar (top) */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${statusBar[t.status]}`}
                  />

                  {/* Soft status tint (top-right corner glow) */}
                  <div
                    className={`absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 pointer-events-none ${statusGlow[t.status]}`}
                  />

                  {/* ==================== TOP ROW ==================== */}
                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${statusColor[t.status]}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[t.status]}`} />
                          {t.status}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${priorityColor[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-800 leading-snug line-clamp-2">
                        {t.title}
                      </h3>
                    </div>

                    {/* Edit/Delete */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(t);
                        }}
                        className="p-1.5 rounded-lg bg-white/70 text-slate-500 hover:bg-primary-50 hover:text-primary-600 shadow-sm transition"
                        aria-label="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(t);
                        }}
                        className="p-1.5 rounded-lg bg-white/70 text-slate-500 hover:bg-red-50 hover:text-red-600 shadow-sm transition"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ==================== DESCRIPTION ==================== */}
                  {t.description ? (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1 relative z-10">
                      {t.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 text-slate-500 italic mb-4 flex-1 relative z-10">
                      No description provided
                    </p>
                  )}

                  {/* ==================== PROGRESS ==================== */}
                  {steps.length > 0 && (
                    <div className="mb-4 relative z-10">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                          <ListChecks size={12} className="text-primary-500" />
                          Work Progress
                        </span>
                        <span className="font-bold text-slate-700">
                          {done}/{steps.length}
                          <span className="text-slate-400 font-medium ml-1">
                            · {stepPct}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${stepPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ==================== META ROW ==================== */}
                  <div className="flex items-center gap-2 mb-4 relative z-10 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {t.assignee?.[0]?.toUpperCase() || "?"}
                      </span>
                      {t.assignee}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                      <CalendarDays size={12} className="text-slate-500" />
                      {fmtDate(t.due)}
                    </span>

                    {challengeCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-xs font-bold text-amber-700 border border-amber-200">
                        <AlertTriangle size={11} />
                        {challengeCount}
                      </span>
                    )}
                  </div>

                  {/* ==================== ACTIONS ==================== */}
                  <div className="grid grid-cols-3 gap-2 mt-auto relative z-10 pt-3 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskWork(t);
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 transition active:scale-95"
                    >
                      <ListChecks size={14} /> Work
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChallenges(t);
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold text-whitee bg-amber-500 hover:bg-amber-600 transition active:scale-95"
                    >
                      <AlertTriangle size={14} /> Challenges
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSubmit(t);
                      }}
                      className={`flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 ${t.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 "
                          : "text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/30"
                        }`}
                    >
                      {t.status === "Completed" ? (
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

          <p className="text-xs text-slate-400 text-slate-500">
            Showing {filtered.length} of {tasks.length} tasks
          </p>
        </>
      )}

      {/* ==================== MODALS ==================== */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
      <ConfirmDelete
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        taskTitle={deleting?.title || ""}
      />

      {liveTaskWork && (
        <TaskWorkModal
          task={liveTaskWork}
          onClose={() => setTaskWork(null)}
          onUpdate={updateTask}
        />
      )}

      {liveChallengeTask && (
        <ChallengesModal
          task={liveChallengeTask}
          onClose={() => setChallenges(null)}
          onUpdate={updateTask}
        />
      )}

      {liveSubmittingTask && (
        <SubmitModal
          open={!!liveSubmittingTask}
          task={liveSubmittingTask}
          onClose={() => setSubmitting(null)}
          onSubmit={handleConfirmSubmit}
        />
      )}

      {/* Detail hub — click card opens this */}
      {liveDetailTask && (
        <TaskDetailModal
          task={liveDetailTask}
          onClose={() => setDetailTask(null)}
          onOpenWork={(task) => {
            setDetailTask(null);
            setTaskWork(task);
          }}
          onOpenChallenges={(task) => {
            setDetailTask(null);
            setChallenges(task);
          }}
          onOpenSubmit={(task) => {
            setDetailTask(null);
            openSubmit(task);
          }}
        />
      )}
    </div>
  );
}
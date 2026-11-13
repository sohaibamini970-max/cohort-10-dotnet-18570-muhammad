import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";

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

export default function AdminDashboard() {
  const { tasks } = useTasks();
  const { user } = useAuth();

  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;

    // Get unique assignees and their task counts
    const teamStats = {};
    tasks.forEach((t) => {
      if (!teamStats[t.assignee]) {
        teamStats[t.assignee] = { total: 0, completed: 0 };
      }
      teamStats[t.assignee].total += 1;
      if (t.status === "Completed") teamStats[t.assignee].completed += 1;
    });

    return { total, inProgress, completed, pending, teamStats };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"}. Here is the overview of all team activities.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={metrics.total}
          icon={ClipboardList}
          gradient="from-indigo-500 to-purple-600"
          subtitle="Across all teams"
        />
        <StatCard
          label="In Progress"
          value={metrics.inProgress}
          icon={Activity}
          gradient="from-amber-400 to-orange-500"
          subtitle="Currently being worked on"
        />
        <StatCard
          label="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          gradient="from-emerald-400 to-teal-500"
          subtitle="Successfully delivered"
        />
        <StatCard
          label="Pending"
          value={metrics.pending}
          icon={Clock}
          gradient="from-slate-400 to-slate-600"
          subtitle="Not started yet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              Recent Tasks
            </h2>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 font-bold text-slate-500">
                    {t.assignee[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate dark:text-white">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Assigned to {t.assignee}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${priorityColor[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor[t.status]}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-lg dark:text-white flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary-500" />
            Team Progress
          </h2>
          <div className="space-y-4">
            {Object.entries(metrics.teamStats)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 5)
              .map(([name, data]) => {
                const pct = Math.round((data.completed / data.total) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {name}
                      </span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {data.completed}/{data.total}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl transition-all duration-200">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${gradient}`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-white`}>
            <Icon size={22} />
          </div>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
import { useMemo } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";

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

      {/* Top Stats - Colorful Cards */}
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
          gradient="from-slate-500 to-slate-700"
          subtitle="Not started yet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-slate-600">
                    {t.assignee[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-slate-800">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500">
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
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
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
                      <span className="font-semibold text-slate-700">
                        {name}
                      </span>
                      <span className="font-bold text-slate-600">
                        {data.completed}/{data.total}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-gradient-to-br ${gradient}`}>
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white opacity-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Icon size={22} />
          </div>
          <TrendingUp size={16} className="text-white/80" />
        </div>
        <p className="text-4xl font-extrabold text-white">{value}</p>
        <p className="text-sm font-bold text-white mt-1">{label}</p>
        <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
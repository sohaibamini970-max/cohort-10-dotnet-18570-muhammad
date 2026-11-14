
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  X,
  LogOut,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  ListFilter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ================= USER LINKS ================= */

const userMainLinksTop = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "My Tasks", icon: ListTodo },
];
const userTrackingLinks = [
  { to: "/tracking", label: "View All", icon: ListFilter, filter: "all" },
  { to: "/tracking/completed", label: "Completed", icon: CheckCircle2, filter: "completed" },
  { to: "/tracking/pending", label: "Pending", icon: Clock, filter: "pending" },
  { to: "/tracking/overdue", label: "Overdue", icon: AlertTriangle, filter: "overdue" },
];

const userMainLinksBottom = [
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

/* ================= ADMIN LINKS ================= */

const adminMainLinks = [
  { to: "/admin/dashboard", label: "Admin Home", icon: LayoutDashboard },
  { to: "/admin/create-task", label: "Manage Tasks", icon: PlusCircle },
  { to: "/admin/all-tasks", label: "Task Details", icon: ListTodo },
  { to: "/admin/tracking", label: "Tracking", icon: TrendingUp },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const isTrackingActive = location.pathname.startsWith("/tracking");
  const [trackingOpen, setTrackingOpen] = useState(isTrackingActive);

  useEffect(() => {
    if (isTrackingActive) setTrackingOpen(true);
  }, [isTrackingActive]);

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/");
  };

  const handleTrackingClick = () => {
    if (!isTrackingActive) {
      navigate("/tracking");
      setTrackingOpen(true);
    } else {
      setTrackingOpen((v) => !v);
    }
    onClose?.();
  };

  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get("filter") || "all";

  /* ================= STYLES ================= */

  const navItemClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${isActive
      ? "bg-violet-50 text-primary-700 shadow-sm ring-1 ring-violet-100"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const trackingParentClass = isTrackingActive
    ? "bg-violet-50 text-primary-700 shadow-sm ring-1 ring-violet-100"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-50 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo Section */}
        <div className="h-20 min-h-20 flex items-center gap-3 px-6 border-b border-slate-100">

          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary-600/20">
            <ShieldCheck size={21} strokeWidth={2.2} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              TaskFlow
            </h2>
            <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-slate-400">
              Workspace
            </p>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-7 overflow-y-auto">

          {/* Admin Menu */}
          {isAdmin ? (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px] px-4 mb-4">
                Administration
              </p>

              <div className="space-y-1.5">
                {adminMainLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <l.icon size={19} strokeWidth={2} />
                    <span>{l.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px] px-4 mb-4">
                Main Menu
              </p>

              <div className="space-y-1.5">

                {/* Dashboard and Tasks */}
                {userMainLinksTop.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <l.icon size={19} strokeWidth={2} />
                    <span>{l.label}</span>
                  </NavLink>
                ))}

                {/* Tracking */}
                <div>
                  <button
                    onClick={handleTrackingClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${trackingParentClass}`}
                  >
                    <TrendingUp size={19} strokeWidth={2} />

                    <span className="flex-1 text-left">
                      Tracking
                    </span>

                    {trackingOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${trackingOpen ? "max-h-96 mt-2" : "max-h-0"
                      }`}
                  >
                    <div className="ml-5 pl-4 border-l border-slate-200 space-y-1">
                      {userTrackingLinks.map((l) => {
                        const isActive =
                          isTrackingActive &&
                          (l.filter === "all"
                            ? currentFilter === "all"
                            : currentFilter === l.filter);

                        return (
                          <NavLink
                            key={l.to}
                            to={l.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${isActive
                                ? "bg-violet-50 text-primary-700 font-bold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                              }`}
                            onClick={onClose}
                          >
                            <l.icon size={15} />
                            {l.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {userMainLinksBottom.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <l.icon size={19} strokeWidth={2} />
                    <span>{l.label}</span>
                  </NavLink>
                ))}

              </div>
            </>
          )}
        </nav>

        {/* Bottom User / Logout Section */}
        <div className="p-4 border-t border-slate-100">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50/70 hover:bg-red-100 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut size={19} strokeWidth={2} />
            Logout
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
            TaskFlow Workspace
          </p>
        </div>
      </aside>
    </>
  );
}

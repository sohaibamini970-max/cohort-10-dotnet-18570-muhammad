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
  ChevronRight, ChevronDown, ListFilter, CheckCircle2, Clock, AlertTriangle, Timer
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ================= USER LINKS ================= */

// 1. Define the links in the exact order we want them
const userMainLinksTop = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "My Tasks", icon: ListTodo },
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

const adminTrackingLinks = [
  { to: "/admin/tracking", label: "View All", icon: ListFilter, end: true },
  { to: "/admin/tracking/completed", label: "Completed", icon: CheckCircle2 },
  { to: "/admin/tracking/pending", label: "Pending", icon: Clock },
  { to: "/admin/tracking/overdue", label: "Overdue", icon: AlertTriangle },
  { to: "/admin/tracking/deadline-passed", label: "Late Submissions", icon: Timer },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  // Tracking dropdown state (only for users)
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

  /* ---------- Styles ---------- */
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
        : "text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-slate-800"
    }`;

  const trackingParentClass = isTrackingActive
    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
    : "text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-slate-800";

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-violet-50 dark:bg-slate-900 border-r border-violet-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-2 px-6 border-b border-violet-200 dark:border-slate-800">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-600/30">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-lg dark:text-white">TaskFlow</span>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:bg-violet-200 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          {/* ========================================== */}
          {/* ============  ADMIN MENU  ================= */}
          {/* ========================================== */}
          {isAdmin ? (
            <>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase px-4 mb-2">
                Admin Panel
              </p>
              {adminMainLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={navItemClass} onClick={onClose}>
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}
            </>
          ) : (
            /* ========================================== */
            /* ============  USER MENU  ================== */
            /* ========================================== */
            <>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase px-4 mb-2">
                Menu
              </p>
              
              {/* 1. Dashboard & My Tasks */}
              {userMainLinksTop.map((l) => (
                <NavLink key={l.to} to={l.to} className={navItemClass} onClick={onClose}>
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}

              {/* 2. Tracking Dropdown (Now second in the list) */}
              <div>
                <button
                  onClick={handleTrackingClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${trackingParentClass}`}
                >
                  <TrendingUp size={18} />
                  <span className="flex-1 text-left">Tracking</span>
                  {trackingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${trackingOpen ? "max-h-96 mt-1" : "max-h-0"}`}>
                  <div className="space-y-0.5">
                    {userTrackingLinks.map((l) => {
                      const isActive =
                        isTrackingActive &&
                        (l.filter === "all" ? currentFilter === "all" : currentFilter === l.filter);

                      return (
                        <NavLink
                          key={l.to}
                          to={l.to}
                          className={`flex items-center gap-2.5 px-4 py-2 ml-3 rounded-lg text-sm transition ${
                            isActive
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-bold"
                              : "text-slate-500 dark:text-slate-400 hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                          }`}
                          onClick={onClose}
                        >
                          <l.icon size={14} />
                          {l.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Messages (Now at the bottom) */}
              {userMainLinksBottom.map((l) => (
                <NavLink key={l.to} to={l.to} className={navItemClass} onClick={onClose}>
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}
            </>
          )}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-violet-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 transition active:scale-[0.98]"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
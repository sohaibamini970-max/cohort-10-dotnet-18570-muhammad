import { useState, useEffect } from "react";
import { Menu, Bell, LogOut, User, Calendar, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const formatDate = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    formatDate();
    const timer = setInterval(formatDate, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-30 bg-purple-600">
      <div className="h-20 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* ================= LEFT SIDE ================= */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 flex-shrink-0 transition"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:block w-1 h-12 rounded-full bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-white truncate drop-shadow-sm">
                {greeting()}, {user?.name?.split(" ")[0] || "User"} 👋
              </p>
              <p className="text-sm text-white/90 truncate hidden sm:block drop-shadow-sm">
                Welcome back to your workspace
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Date */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-white/25 backdrop-blur rounded-lg border border-white/40">
            <Calendar size={16} className="text-white" />
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {dateStr}
            </span>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-lg text-white hover:bg-white/25 transition"
            aria-label="Notifications"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white/50" />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-9 bg-white/40" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 p-1.5 pr-2 sm:pr-3 rounded-full hover:bg-white/25 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-base shadow-md ring-2 ring-white/50">
                {user?.name?.[0] || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-base font-semibold leading-tight text-white drop-shadow-sm">
                  {user?.name}
                </p>
                <p className="text-sm text-white/90 capitalize drop-shadow-sm">
                  {user?.role}
                </p>
              </div>
            </button>

            {open && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-purple-100 py-2 z-20">
                  <div className="px-4 py-3 border-b border-purple-100">
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-purple-500 capitalize">
                      {user?.role} Account
                    </p>
                  </div>

                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 transition">
                    <User size={16} /> Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 transition">
                    <Settings size={16} /> Settings
                  </button>
                  <div className="border-t border-purple-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
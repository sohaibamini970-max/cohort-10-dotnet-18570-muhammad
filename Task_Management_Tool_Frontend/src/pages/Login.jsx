import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const res = login(email, password);
    if (res.success) navigate("/dashboard");
    else setError(res.message);
  };

  const quickFill = (role) => {
    if (role === "admin") {
      setEmail("admin@task.com");
      setPassword("admin123");
    } else {
      setEmail("user@task.com");
      setPassword("user123");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-bold">TaskFlow</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Manage your team's tasks <br />
            with clarity.
          </h1>
          <p className="text-white/80 text-lg">
            Streamline workflows, track progress, and get things done — all in one
            place.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © 2025 TaskFlow. All rights reserved.
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={22} />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-primary-600/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative text-center">
              <span className="relative z-10 bg-slate-50 px-3 text-xs text-slate-400 uppercase tracking-wider">
                Quick demo login
              </span>
              <div className="absolute inset-0 top-1/2 border-t border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => quickFill("admin")}
                className="py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition"
              >
                👑 Admin
              </button>
              <button
                onClick={() => quickFill("user")}
                className="py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition"
              >
                👤 User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
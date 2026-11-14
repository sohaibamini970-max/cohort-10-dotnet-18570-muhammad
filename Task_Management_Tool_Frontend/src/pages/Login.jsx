import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

// 👇 Import your image here
import loginImage from "../assets/loginimage.png";

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
    <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-[#F8F9FA]">

      {/* ================= LEFT - BRANDING IMAGE ================= */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image */}
        <img
          src={loginImage}
          alt="Workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        {/* Main Headline */}
        <div className="relative z-10 max-w-[400px] text-white mb-20">
          <h1 className="text-[42px] font-extrabold leading-[1.1] mb-5">
            Manage your team's <br />
            tasks <br />
            with clarity.
          </h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Streamline workflows, track progress, and get things done — all in one place.
          </p>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-sm text-white/70 font-medium">
          © 2025 TaskFlow. All rights reserved.
        </p>
      </div>

      {/* ================= RIGHT - LOGIN FORM ================= */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={22} />
            </div>
            <span className="text-xl font-bold text-slate-800">TaskFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[32px] font-bold text-slate-900 mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-[15px]">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.25)] active:scale-[0.98] mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-8">
            <div className="relative text-center mb-5">
              <span className="relative z-10 bg-[#F8F9FA] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Quick demo login
              </span>
              <div className="absolute inset-0 top-1/2 border-t border-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickFill("admin")}
                className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                👑 Admin
              </button>
              <button
                onClick={() => quickFill("user")}
                className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
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
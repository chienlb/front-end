"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { HiOutlineHand } from "react-icons/hi";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

function resolveUserRole(rawUser: any): string {
  const roleRaw =
    rawUser?.role?.name ??
    rawUser?.role?.code ??
    rawUser?.role ??
    rawUser?.userRole ??
    "";
  return String(roleRaw).trim().toUpperCase();
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Validate cơ bản client-side
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      // 2. Gọi API Login
      const deviceId =
        localStorage.getItem("deviceId") ||
        crypto.randomUUID();

      localStorage.setItem("deviceId", deviceId);

      const result = await authService.login({ email, password, deviceId });
      const payload = result?.data ?? result;
      const accessToken = payload?.accessToken ?? payload?.data?.accessToken;
      const refreshToken = payload?.refreshToken ?? payload?.data?.refreshToken;
      const user = payload?.user ?? payload?.data?.user ?? null;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        const role = resolveUserRole(user);

        switch (role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/teacher");
            break;
          case "PARENT":
            router.push("/parent");
            break;
          case "STUDENT":
          default:
            router.push("/");
            break;
        }
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Hiển thị thông báo lỗi thân thiện
      setError(
        err.response?.data?.message ||
        err.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-white to-cyan-100 font-sans">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/50">
        {/* --- CỘT TRÁI: BANNER & WELCOME --- */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 relative flex-col items-center justify-center p-12 text-white overflow-hidden">
          {/* Decor Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 w-full max-w-md text-center">
            <img
              src="https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7962.jpg"
              alt="Login Illustration"
              className="w-full h-auto mb-8 rounded-2xl shadow-lg border-4 border-white/20 object-cover"
            />
            <h2 className="text-3xl font-extrabold mb-3 drop-shadow-sm">
              Chào mừng trở lại!
            </h2>
            <p className="text-blue-50 text-base font-medium leading-relaxed">
              Truy cập thế giới tri thức và tiếp tục hành trình của bạn cùng
              Happy Cat.
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI: LOGIN FORM --- */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          {/* Logo Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-10 group w-fit"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
                SmartKids
              </span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                Education System
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">Đăng nhập</h1>
          <p className="text-slate-500 mb-8 text-sm">
            Vui lòng nhập thông tin tài khoản của bạn để tiếp tục.
          </p>

          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm flex items-center gap-3 rounded-r-xl animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email / Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">
                 Email
               </label>
               <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                   <Mail size={20} />
                 </div>
                 <input
                   type="text"
                   className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                   placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập ngay <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t"></div>
              <span className="px-3 text-xs text-slate-400 font-semibold">
                Hoặc đăng nhập với
              </span>
              <div className="flex-1 border-t"></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => authService.googleLogin()}
                className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold transition"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Google
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => authService.facebookLogin()}
                className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl font-semibold transition"
              >
                <img
                  src="/icons8-facebook-96.svg"
                  alt="Facebook"
                  className="w-6 h-6"
                />
                Facebook
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-slate-500 text-sm font-medium">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline transition-colors"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

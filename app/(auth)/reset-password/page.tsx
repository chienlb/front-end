"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  GraduationCap,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL (VD: ?token=xyz...)

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validate Token khi vừa vào trang (Optional)
  useEffect(() => {
    if (!token) {
      setError("Đường dẫn không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate Input
    if (password.length < 6)
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (password !== confirmPassword)
      return setError("Mật khẩu xác nhận không khớp.");
    if (!token)
      return setError(
        "Thiếu mã xác thực (Token). Vui lòng kiểm tra lại email.",
      );

    try {
      setLoading(true);

      // Gọi API Reset Password
      // await authService.resetPassword({ token, newPassword: password });

      // Giả lập API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      // Tự động chuyển trang sau 3s (Optional)
      // setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 font-sans">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/50">
        {/* --- CỘT TRÁI --- */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-600 relative flex-col items-center justify-center p-12 text-white overflow-hidden">
          {/* Decor Circles */}
          <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full max-w-md text-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/20 mx-auto">
              <KeyRound size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">
              Thiết lập mật khẩu mới
            </h2>
            <p className="text-purple-100 text-base font-medium">
              Hãy chọn một mật khẩu mạnh để bảo vệ tài khoản SmartKids của bạn.
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI --- */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-10 group w-fit"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
                SmartKids
              </span>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                Education System
              </span>
            </div>
          </Link>

          {!success ? (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Đổi mật khẩu
              </h1>
              <p className="text-slate-500 mb-8">
                Vui lòng nhập mật khẩu mới của bạn.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm flex items-center gap-3 rounded-r-xl animate-shake">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                {/* Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all font-medium text-slate-700"
                      placeholder="Ít nhất 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all font-medium text-slate-700"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Lưu mật khẩu mới <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            // SUCCESS STATE
            <div className="text-center mt-4 animate-in zoom-in-95 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-green-50">
                <CheckCircle2 size={40} strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                Thành công!
              </h1>
              <p className="text-slate-500 mb-8 max-w-xs">
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây
                giờ.
              </p>

              <Link
                href="/login"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

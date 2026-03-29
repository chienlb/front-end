"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!email) return setError("Vui lòng nhập địa chỉ email.");
    try {
      setLoading(true);
      const result = await authService.forgotPassword(email.trim());
      const message = result?.message || "Yêu cầu đặt lại mật khẩu đã được gửi.";
      setSuccessMessage(message);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/50">
        {/* --- CỘT TRÁI --- */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-600 relative flex-col items-center justify-center p-12 text-white overflow-hidden">
          {/* Decor Circles */}
          <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full max-w-md text-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/20 mx-auto">
              <ShieldCheck size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Bảo mật tài khoản</h2>
            <p className="text-purple-100 text-base font-medium">
              Chúng tôi sẽ giúp bạn lấy lại mật khẩu một cách an toàn nhất.
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

          {!isSubmitted ? (
            <div className="mt-2 animate-in fade-in">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Khôi phục mật khẩu
              </h1>
              <p className="text-slate-500 mb-8">
                Nhập email liên kết để nhận hướng dẫn.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm flex items-center gap-3 rounded-r-xl">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all font-medium text-slate-700"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors"
                >
                  <ArrowLeft size={18} /> Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center mt-4 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Đã gửi email!
              </h1>
              <p className="text-slate-500 mb-8">
                Vui lòng kiểm tra hộp thư đến tại: <br />
                <strong className="text-purple-600 text-lg">{email}</strong>
              </p>
              {successMessage && (
                <p className="text-sm text-slate-500 mb-4">{successMessage}</p>
              )}

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all"
                >
                  Quay lại đăng nhập
                </Link>
                <button
                  onClick={handleResend}
                  className="w-full bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold py-3.5 rounded-xl transition-all"
                >
                  Thử lại email khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

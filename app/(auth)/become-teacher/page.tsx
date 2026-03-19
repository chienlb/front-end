"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Upload,
  User,
  BookOpen,
  Video,
  ArrowRight,
  ArrowLeft,
  Send,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Giả lập hook Auth
const useMockAuth = () => {
  // Thay đổi thành true/false để test giao diện
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );
  return { user };
};

export default function BecomeTeacherPage() {
  const { user } = useMockAuth(); // Kiểm tra xem người dùng đã đăng nhập chưa
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    subject: "",
    experience: "",
    linkedin: "",
    demoVideo: "",
  });

  // Tự động điền nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    if (!user) {
      console.log("Đang tạo tài khoản mới cho user...");
      console.log("Email:", formData.email, "Pass:", formData.password);
    }
    console.log("Gửi đơn đăng ký lên Admin...");
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Đăng ký thành công!
          </h2>
          <p className="text-slate-500 mb-6">
            {!user
              ? `Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email ${formData.email} để kích hoạt và xem kết quả xét duyệt.`
              : `Hồ sơ đã được gửi. Chúng tôi sẽ phản hồi qua email ${formData.email} trong 3-5 ngày làm việc.`}
          </p>
          <Link
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-black text-xl text-indigo-600">
            EdTech.
          </Link>
          <div className="text-sm text-slate-500">
            {user ? (
              <span>
                Xin chào, <b className="text-slate-800">{user.name}</b>
              </span>
            ) : (
              <span>
                Bạn đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Đăng nhập
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Đăng ký trở thành Giảng viên
          </h1>
          <p className="text-slate-500">
            Hoàn thành hồ sơ để tham gia đội ngũ giảng dạy chất lượng cao.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Bước {step} / 3
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {step === 1
                  ? "Tài khoản & Cá nhân"
                  : step === 2
                    ? "Kinh nghiệm"
                    : "Demo"}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* --- ACCOUNT & PERSONAL --- */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-indigo-600" /> Thông tin cơ bản
                  </h3>

                  {/* Nếu chưa đăng nhập -> Hiện form tạo tài khoản */}
                  {!user && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                      <p className="text-sm text-blue-800 font-medium mb-3 flex items-center gap-2">
                        <Lock size={16} /> Tạo tài khoản giảng viên mới
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Email đăng nhập</label>
                          <input
                            className="input"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Mật khẩu</label>
                          <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Họ và tên hiển thị</label>
                      <input
                        className="input"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Số điện thoại</label>
                      <input
                        className="input"
                        placeholder="0912 xxx xxx"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Giới thiệu ngắn (Bio)</label>
                    <textarea
                      className="input min-h-[100px]"
                      placeholder="Giới thiệu bản thân, phong cách giảng dạy..."
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* --- EXPERIENCE --- */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="text-indigo-600" /> Hồ sơ chuyên môn
                  </h3>
                  <div>
                    <label className="label">Lĩnh vực giảng dạy chính</label>
                    <select
                      className="input bg-white"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    >
                      <option value="">Chọn lĩnh vực...</option>
                      <option value="IT">Lập trình & CNTT</option>
                      <option value="LANGUAGE">Ngoại ngữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Link LinkedIn / CV Online</label>
                    <input
                      className="input"
                      placeholder="https://..."
                      value={formData.linkedin}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* --- DEMO --- */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Video className="text-indigo-600" /> Video Dạy thử
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-800 text-sm flex gap-3">
                    <BookOpen size={20} className="shrink-0" />
                    <p>
                      Vui lòng gửi link video bạn giảng dạy một chủ đề ngắn
                      (5-10 phút) để chúng tôi đánh giá chất lượng.
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      Link Video (Youtube / Google Drive)
                    </label>
                    <input
                      className="input"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.demoVideo}
                      onChange={(e) =>
                        setFormData({ ...formData, demoVideo: e.target.value })
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition"
              >
                <ArrowLeft size={18} /> Quay lại
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
              >
                Tiếp tục <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition"
              >
                {user ? "Gửi hồ sơ" : "Tạo tài khoản & Gửi"} <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .label {
          @apply block text-xs font-bold text-slate-500 uppercase mb-2 ml-1;
        }
        .input {
          @apply w-full p-4 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Gift,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Loader2,
  Copy,
} from "lucide-react";
import Link from "next/link";

// --- FAQ DATA ---
const FAQS = [
  {
    question: "Mã kích hoạt nằm ở đâu?",
    answer:
      "Mã kích hoạt thường được gửi về Email của bạn sau khi thanh toán thành công, hoặc in trên thẻ cào nếu bạn mua bộ học liệu vật lý.",
  },
  {
    question: "Mã báo lỗi 'Không hợp lệ'?",
    answer:
      "Vui lòng kiểm tra kỹ các ký tự dễ nhầm lẫn (ví dụ: số 0 và chữ O, số 1 và chữ I). Đảm bảo mã chưa từng được sử dụng trước đó.",
  },
  {
    question: "Một mã dùng được mấy lần?",
    answer:
      "Mỗi mã kích hoạt chỉ có giá trị sử dụng 01 lần duy nhất cho 01 tài khoản.",
  },
  {
    question: "Kích hoạt xong có học được ngay không?",
    answer:
      "Có! Ngay sau khi kích hoạt thành công, khóa học sẽ tự động được thêm vào mục 'Lớp học của tôi'.",
  },
];

export default function ActivationPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "IDLE" | "LOADING" | "SUCCESS" | "ERROR"
  >("IDLE");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleActivate = () => {
    if (!code.trim() || code.length < 5) {
      setStatus("ERROR");
      setMessage("Mã kích hoạt không đúng định dạng.");
      return;
    }

    setStatus("LOADING");

    // Giả lập gọi API
    setTimeout(() => {
      if (code.toUpperCase() === "SMARTKIDS2024") {
        setStatus("SUCCESS");
        setMessage("Chúc mừng! Khóa học Tiếng Anh Lớp 3 đã được mở khóa.");
      } else {
        setStatus("ERROR");
        setMessage("Mã kích hoạt không tồn tại hoặc đã hết hạn.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 pt-20">
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 text-yellow-900"
          >
            <Key size={32} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Kích Hoạt Khóa Học
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Nhập mã code bạn nhận được để mở khóa kho tàng kiến thức ngay lập
            tức.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COL: ACTIVATION FORM --- */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
            >
              {status === "SUCCESS" ? (
                // SUCCESS STATE
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Kích hoạt thành công!
                  </h3>
                  <p className="text-slate-500 mb-8">{message}</p>
                  <Link href="/my-classes">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                      Vào học ngay
                    </button>
                  </Link>
                </div>
              ) : (
                // FORM STATE
                <>
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Nhập mã kích hoạt (Code)
                  </label>
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setStatus("IDLE"); // Reset lỗi khi gõ lại
                      }}
                      placeholder="VD: SMARTKIDS-2024"
                      className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-xl font-mono font-bold tracking-widest text-slate-800 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal ${
                        status === "ERROR"
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500 focus:bg-white"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {status === "ERROR" && (
                        <AlertCircle className="text-red-500" />
                      )}
                    </div>
                  </div>

                  {status === "ERROR" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 flex items-center gap-2"
                    >
                      <AlertCircle size={16} /> {message}
                    </motion.div>
                  )}

                  <button
                    onClick={handleActivate}
                    disabled={status === "LOADING" || !code}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "LOADING" ? (
                      <>
                        <Loader2 className="animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        Kích Hoạt Ngay <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs">
                      Bằng việc kích hoạt, bạn đồng ý với{" "}
                      <Link
                        href="/terms"
                        className="text-blue-500 hover:underline"
                      >
                        Điều khoản sử dụng
                      </Link>{" "}
                      của chúng tôi.
                    </p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Support Box Mobile Only */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                  <HelpCircle size={20} />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-700">Gặp khó khăn?</p>
                  <p className="text-slate-500 text-xs">
                    Liên hệ hotline 1900 1234
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COL: GUIDE & FAQ --- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Steps Guide */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-green-500" /> Hướng dẫn nhanh
              </h3>

              <div className="space-y-6 relative">
                {/* Line connector */}
                <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-100"></div>

                {[
                  {
                    title: "Đăng nhập tài khoản",
                    desc: "Sử dụng tài khoản học viên của bạn.",
                  },
                  {
                    title: "Nhập mã kích hoạt",
                    desc: "Nhập chính xác mã in trên thẻ hoặc email.",
                  },
                  {
                    title: "Bắt đầu học",
                    desc: "Khóa học sẽ xuất hiện trong Lớp của tôi.",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {step.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HelpCircle className="text-orange-500" /> Câu hỏi thường gặp
              </h3>

              <div className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 transition text-left"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-white">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy Demo Code (Helper for testing) */}
            <div
              className="bg-slate-800 text-slate-300 p-4 rounded-xl text-xs font-mono cursor-pointer hover:bg-slate-700 transition flex justify-between items-center"
              onClick={() => {
                navigator.clipboard.writeText("SMARTKIDS2024");
                alert("Đã copy mã demo!");
              }}
            >
              <span>
                Mã demo: <strong className="text-white">SMARTKIDS2024</strong>
              </span>
              <Copy size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

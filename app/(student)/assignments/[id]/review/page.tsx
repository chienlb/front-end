"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  HelpCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const REVIEW_DATA = {
  id: "A1",
  title: "Bài tập thì hiện tại đơn",
  score: 8.5,
  maxScore: 10,
  totalQuestions: 10,
  correctCount: 8,
  wrongCount: 2,
  timeSpent: "12 phút 45 giây",
  submittedAt: "20:45 - 20/10/2023",
  feedback:
    "Làm tốt lắm! Em cần ôn lại cách chia động từ với chủ ngữ số ít nhé.",
  questions: [
    {
      id: 1,
      q: "She _____ to school every day.",
      options: ["go", "goes", "going", "went"],
      userAns: "goes",
      correctAns: "goes",
      isCorrect: true,
      explanation:
        "Chủ ngữ 'She' là ngôi thứ 3 số ít nên động từ 'go' thêm 'es' -> 'goes'.",
    },
    {
      id: 2,
      q: "They _____ play football on Sundays.",
      options: ["don't", "doesn't", "isn't", "aren't"],
      userAns: "doesn't",
      correctAns: "don't",
      isCorrect: false,
      explanation:
        "Chủ ngữ 'They' là số nhiều nên dùng trợ động từ phủ định là 'don't'.",
    },
    {
      id: 3,
      q: "The sun _____ in the east.",
      options: ["rise", "rises", "rising", "rose"],
      userAns: "rises",
      correctAns: "rises",
      isCorrect: true,
      explanation:
        "Sự thật hiển nhiên chia thì Hiện tại đơn. 'The sun' là số ít -> 'rises'.",
    },
  ],
};

export default function ReviewAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "WRONG">("ALL");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // Filter questions
  const displayedQuestions =
    filter === "ALL"
      ? REVIEW_DATA.questions
      : REVIEW_DATA.questions.filter((q) => !q.isCorrect);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans pb-20">
      {/* 1. HEADER (Sticky) */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition"
          >
            <ArrowLeft size={20} />{" "}
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </button>
          <div className="text-center">
            <h1 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">
              {REVIEW_DATA.title}
            </h1>
            <p className="text-xs text-slate-400">
              Đã nộp: {REVIEW_DATA.submittedAt}
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            onClick={() => alert("Tính năng làm lại đang phát triển!")}
          >
            <RotateCcw size={14} /> Làm lại
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* 2. SCORE CARD (Overview) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Decorative BG */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={`${REVIEW_DATA.score >= 5 ? "text-green-500" : "text-red-500"} transition-all duration-1000 ease-out`}
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * REVIEW_DATA.score) / 10}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-black text-slate-800">
                  {REVIEW_DATA.score}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Điểm số
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1 w-full">
              {REVIEW_DATA.feedback && (
                <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm">
                  <MessageCircleIcon className="shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <span className="font-bold block mb-1">
                      Nhận xét của giáo viên:
                    </span>
                    <p className="leading-relaxed">"{REVIEW_DATA.feedback}"</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox
                  label="Câu đúng"
                  value={REVIEW_DATA.correctCount}
                  icon={CheckCircle}
                  color="text-green-600 bg-green-50"
                />
                <StatBox
                  label="Câu sai"
                  value={REVIEW_DATA.wrongCount}
                  icon={XCircle}
                  color="text-red-600 bg-red-50"
                />
                <StatBox
                  label="Thời gian"
                  value={REVIEW_DATA.timeSpent}
                  icon={Clock}
                  color="text-blue-600 bg-blue-50"
                  isText
                />
                <StatBox
                  label="Xếp loại"
                  value="Giỏi"
                  icon={Trophy}
                  color="text-yellow-600 bg-yellow-50"
                  isText
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. QUESTION LIST CONTROLS */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileQuestionIcon className="text-indigo-500" size={24} /> Chi tiết
            bài làm
          </h2>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Tất cả ({REVIEW_DATA.questions.length})
            </button>
            <button
              onClick={() => setFilter("WRONG")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === "WRONG" ? "bg-red-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Chỉ câu sai ({REVIEW_DATA.wrongCount})
            </button>
          </div>
        </div>

        {/* 4. QUESTIONS LIST */}
        <div className="space-y-4">
          {displayedQuestions.map((q, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={q.id}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all
                ${q.isCorrect ? "border-slate-100" : "border-red-100 shadow-red-50"}`}
            >
              {/* Question Header */}
              <div className="p-5 border-b border-slate-50 flex gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 
                  ${q.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-800 mb-4">
                    {q.q}
                  </h3>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      // Determine style for each option
                      let style = "bg-white border-slate-200 text-slate-500"; // Default
                      let icon = null;

                      if (opt === q.correctAns) {
                        style =
                          "bg-green-50 border-green-500 text-green-700 font-bold ring-1 ring-green-500";
                        icon = <CheckCircle size={16} />;
                      } else if (opt === q.userAns && !q.isCorrect) {
                        style =
                          "bg-red-50 border-red-500 text-red-700 font-bold opacity-70";
                        icon = <XCircle size={16} />;
                      } else if (opt === q.userAns && q.isCorrect) {
                        style =
                          "bg-green-50 border-green-500 text-green-700 font-bold";
                        icon = <CheckCircle size={16} />;
                      }

                      return (
                        <div
                          key={idx}
                          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-sm ${style}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-bold opacity-60">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                          </span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Explanation (Toggle) */}
              <div className="bg-slate-50 px-5 py-3">
                <button
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  <HelpCircle size={14} />
                  {expandedQ === q.id
                    ? "Ẩn giải thích"
                    : "Xem giải thích chi tiết"}
                  {expandedQ === q.id ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedQ === q.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                        <span className="font-bold text-blue-600">
                          Giải thích:
                        </span>{" "}
                        {q.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
function StatBox({ label, value, icon: Icon, color, isText = false }: any) {
  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${color}`}
      >
        <Icon size={16} />
      </div>
      <p
        className={`font-black text-slate-800 ${isText ? "text-sm" : "text-xl"}`}
      >
        {value}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
  );
}

function MessageCircleIcon({ size = 24, ...props }: any) {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}

function FileQuestionIcon({ size = 24, ...props }: any) {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13a3 3 0 1 0 5.122-1.92" />
      <path d="M12 17v.01" />
    </svg>
  );
}

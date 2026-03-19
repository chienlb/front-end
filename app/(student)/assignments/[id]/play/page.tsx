"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Flag,
  Menu,
} from "lucide-react";

// Mock Data
const QUESTIONS = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  q: `Câu hỏi số ${i + 1}: Đây là nội dung câu hỏi giả lập để test giao diện. Con mèo trong tiếng Anh là gì?`,
  options: ["Cat", "Dog", "Fish", "Bird"],
  ans: "Cat",
}));

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]); // Đánh dấu xem lại
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSelect = (opt: string) => {
    setAnswers({ ...answers, [currentQ]: opt });
  };

  const toggleMark = () => {
    if (markedQuestions.includes(currentQ)) {
      setMarkedQuestions((prev) => prev.filter((q) => q !== currentQ));
    } else {
      setMarkedQuestions((prev) => [...prev, currentQ]);
    }
  };

  const handleSubmit = () => {
    if (!confirm("Bạn chắc chắn muốn nộp bài sớm?")) return;
    setIsSubmitted(true);
    setTimeout(() => {
      alert("Nộp bài thành công!");
      router.back();
    }, 1500);
  };

  // --- RENDER SUBMITTED SCREEN ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold">Đã nộp bài!</h2>
        <p className="text-slate-400 mt-2">Đang tính điểm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      {/* 1. MAIN CONTENT AREA (SCROLLABLE) */}
      <main className="flex-1 flex flex-col h-full relative z-0">
        {/* Header Mobile Only */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <X size={24} className="text-slate-400" />
            </button>
            <span className="font-bold text-slate-700">
              Câu {currentQ + 1}/{QUESTIONS.length}
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-100 rounded-lg text-slate-600"
          >
            <LayoutGrid size={20} />
          </button>
        </div>

        {/* Question Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full pb-20 md:pb-0">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Câu hỏi {currentQ + 1}
                </span>
                <button
                  onClick={toggleMark}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${markedQuestions.includes(currentQ) ? "text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Flag
                    size={14}
                    fill={
                      markedQuestions.includes(currentQ)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {markedQuestions.includes(currentQ)
                    ? "Đã đánh dấu"
                    : "Đánh dấu"}
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                {QUESTIONS[currentQ].q}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {QUESTIONS[currentQ].options.map((opt, idx) => {
                const isSelected = answers[currentQ] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    className={`group relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 z-10 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors
                      ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-white"}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span
                      className={`text-base md:text-lg font-medium ${isSelected ? "text-blue-900" : "text-slate-700"}`}
                    >
                      {opt}
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        className="absolute right-4 text-blue-600 animate-in zoom-in"
                        size={20}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons (Bottom) */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-white transition flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Trước
              </button>

              {currentQ === QUESTIONS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center gap-2"
                >
                  Nộp bài <CheckCircle2 size={18} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQ((prev) =>
                      Math.min(QUESTIONS.length - 1, prev + 1),
                    )
                  }
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2"
                >
                  Sau <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 2. RIGHT SIDEBAR (QUESTION NAVIGATOR) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-92 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 transform md:translate-x-0 md:static
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full shadow-none"}`}
      >
        {/* Header Sidebar */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">
            Thời gian còn lại
          </span>
          <div
            className={`font-mono text-xl font-black ${timeLeft < 60 ? "text-red-600 animate-pulse" : "text-blue-600"}`}
          >
            {formatTime(timeLeft)}
          </div>
          {/* Close Sidebar Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Legend (Chú thích) */}
        <div className="px-6 py-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div> Đang làm
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></div>{" "}
            Chưa làm
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center">
              ✓
            </div>{" "}
            Đã chọn
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-400"></div>{" "}
            Xem lại
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-5 gap-2">
            {QUESTIONS.map((q, idx) => {
              const isCurrent = currentQ === idx;
              const isAnswered = answers[idx] !== undefined;
              const isMarked = markedQuestions.includes(idx);

              // Determine Style
              let btnClass =
                "bg-white border-slate-200 text-slate-500 hover:border-slate-300"; // Default
              if (isAnswered)
                btnClass = "bg-blue-50 border-blue-200 text-blue-700 font-bold";
              if (isMarked)
                btnClass = "bg-yellow-50 border-yellow-400 text-yellow-700";
              if (isCurrent)
                btnClass =
                  "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200 shadow-md z-10 transform scale-110";

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQ(idx);
                    setIsSidebarOpen(false);
                  }}
                  className={`aspect-square rounded-lg border flex items-center justify-center text-xs transition-all relative ${btnClass}`}
                >
                  {q.id}
                  {isMarked && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full border border-white"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            Nộp bài thi <CheckCircle2 size={18} />
          </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}
    </div>
  );
}

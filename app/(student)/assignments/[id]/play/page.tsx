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

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  const unansweredCount = QUESTIONS.length - answeredCount;
  const currentQuestion = QUESTIONS[currentQ];
  const isLastQuestion = currentQ === QUESTIONS.length - 1;

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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2563eb,_#0f172a_55%)] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl px-8 py-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/20 ring-8 ring-emerald-300/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/40">
              <CheckCircle2 size={34} />
            </div>
          </div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-emerald-200">
            Hoan tat
          </p>
          <h2 className="text-3xl font-black">Da nop bai thanh cong</h2>
          <p className="mt-3 text-sm text-slate-200">
            He thong dang tinh diem va luu tien do cua ban.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_35%,#eef2ff_100%)] font-sans md:flex md:flex-row">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      {/* 1. MAIN CONTENT AREA (SCROLLABLE) */}
      <main className="relative z-10 flex h-full flex-1 flex-col">
        {/* Header Mobile Only */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/70 bg-white/75 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <X size={20} />
            </button>
            <span className="font-bold text-slate-700">
              Câu {currentQ + 1}/{QUESTIONS.length}
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-300"
          >
            <LayoutGrid size={20} />
          </button>
        </div>

        {/* Question Scroll Area */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-6xl pb-28 md:pb-8">
            <div className="mb-6 hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)] backdrop-blur-xl md:block">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-600">
                    Phong thi thu
                  </p>
                  <h1 className="text-2xl font-black text-slate-900">
                    Bai kiem tra Unit {currentQ + 1}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Theo doi tien do va hoan thanh tung cau hoi that on dinh.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg shadow-slate-300">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
                    Thoi gian
                  </p>
                  <div className="flex items-center gap-2 text-2xl font-black">
                    <Clock size={20} className="text-blue-300" />
                    <span className={timeLeft < 60 ? "text-red-300" : "text-white"}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-500">
                    Tien do
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">
                    Da chon
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {answeredCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500">
                    Danh dau
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {markedQuestions.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                    Con lai
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {unansweredCount}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="mb-6 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-xl md:p-10">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-black text-white shadow-lg shadow-blue-200">
                    {currentQ + 1}
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">
                      Cau hoi hien tai
                    </span>
                    <h2 className="mt-3 text-xl font-black leading-relaxed text-slate-900 md:text-3xl">
                      {currentQuestion.q}
                    </h2>
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Chon dap an dung nhat. Ban co the danh dau de xem lai sau.
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleMark}
                  className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                    markedQuestions.includes(currentQ)
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
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
                    ? "Da danh dau"
                    : "Danh dau"}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQ] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    className={`group relative overflow-hidden rounded-[1.75rem] border p-5 text-left transition-all duration-300 md:p-6
                      ${
                        isSelected
                          ? "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.5)]"
                          : "border-white/80 bg-white/80 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.28)] hover:-translate-y-1 hover:border-slate-200 hover:bg-white"
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-base font-black transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-slate-100 text-slate-500 group-hover:bg-white"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-base font-bold md:text-lg ${
                            isSelected ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {opt}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {isSelected
                            ? "Ban da chon dap an nay"
                            : "Cham de chon dap an"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-blue-200">
                          <CheckCircle2 size={14} />
                          Da chon
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons (Bottom) */}
            <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold text-slate-500">
                <span>
                  Da hoan thanh <span className="font-black text-slate-900">{answeredCount}</span> / {QUESTIONS.length} cau
                </span>
                <span>
                  Cau hien tai <span className="font-black text-blue-600">{currentQ + 1}</span>
                </span>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between">
              <button
                onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft size={18} /> Truoc
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                >
                  Nop bai <CheckCircle2 size={18} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQ((prev) =>
                      Math.min(QUESTIONS.length - 1, prev + 1),
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Tiep theo <ChevronRight size={18} />
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2. RIGHT SIDEBAR (QUESTION NAVIGATOR) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[23rem] flex-col border-l border-white/80 bg-white/90 backdrop-blur-xl transition-transform duration-300 transform md:translate-x-0 md:static
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full shadow-none"}`}
      >
        {/* Header Sidebar */}
        <div className="border-b border-white/70 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-200">
                Bang dieu huong
              </p>
              <h3 className="mt-2 text-xl font-black">Phong thi thong minh</h3>
            </div>
            <div
              className={`rounded-2xl px-4 py-3 font-mono text-xl font-black shadow-lg ${
                timeLeft < 60
                  ? "bg-red-500/20 text-red-200"
                  : "bg-white/10 text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">
                Da lam
              </p>
              <p className="mt-2 text-xl font-black">{answeredCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">
                Danh dau
              </p>
              <p className="mt-2 text-xl font-black">{markedQuestions.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">
                Con lai
              </p>
              <p className="mt-2 text-xl font-black">{unansweredCount}</p>
            </div>
          </div>

          {/* Close Sidebar Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-slate-300 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Legend (Chú thích) */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div> Dang xem
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-slate-300 bg-slate-200"></div>
            Chua lam
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-blue-600">
              •
            </div>{" "}
            Da chon
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-yellow-400 bg-yellow-100"></div>{" "}
            Xem lai
          </div>
        </div>

        {/* Question Grid */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-slate-800">Danh sach cau hoi</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {QUESTIONS.length} cau
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {QUESTIONS.map((q, idx) => {
              const isCurrent = currentQ === idx;
              const isAnswered = answers[idx] !== undefined;
              const isMarked = markedQuestions.includes(idx);

              // Determine Style
              let btnClass =
                "bg-white border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm"; // Default
              if (isAnswered)
                btnClass =
                  "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm";
              if (isMarked)
                btnClass =
                  "bg-yellow-50 border-yellow-400 text-yellow-700 shadow-sm";
              if (isCurrent)
                btnClass =
                  "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-lg z-10 scale-110";

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQ(idx);
                    setIsSidebarOpen(false);
                  }}
                  className={`relative aspect-square rounded-2xl border text-xs font-black transition-all ${btnClass}`}
                >
                  <span className="flex h-full w-full items-center justify-center">
                    {q.id}
                  </span>
                  {isMarked && (
                    <div className="absolute -right-1 -top-1">
                      <div className="h-2.5 w-2.5 rounded-full border border-white bg-yellow-500"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="border-t border-slate-100 bg-slate-50/80 p-4">
          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
          >
            Nop bai thi <CheckCircle2 size={18} />
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

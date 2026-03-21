"use client";

import { useState, useEffect, use } from "react";
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
import { competitionService } from "@/services/competition.service";
import { userService } from "@/services/user.service";
import { ranksService } from "@/services/ranks.service";
import { showAlert, showConfirm } from "@/utils/dialog";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {

  const resolvedParams = use(params);
  const competitionId = resolvedParams.id;

  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]); // Đánh dấu xem lại
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [loading, setLoading] = useState(true);
  const [userResult, setUserResult] = useState<{
    score: number;
    correctCount?: number | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rankChecking, setRankChecking] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await competitionService.getCompetitionById(competitionId);
        const data = response.data || response;
        setQuestions(data.listQuestion || []);

        const end = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));

        if (diff > 0) {
          setTimeLeft(diff);
        } else {
          setTimeLeft(600);
        }

      } catch (error) {
        console.error("Lỗi tải bài thi:", error);
        setTimeLeft(600);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [competitionId]);

  // Nếu user đã có rank trong kỳ thi => khóa thi lại.
  useEffect(() => {
    let alive = true;

    const checkAlreadySubmitted = async () => {
      try {
        setRankChecking(true);

        const profileRes: any = await userService.getProfile();
        const userId =
          profileRes?._id ?? profileRes?.data?._id ?? profileRes?.id ?? null;
        if (!userId) return;

        const rankRes: any = await ranksService.getUserRankInCompetition(
          String(competitionId),
          String(userId),
        );

        if (!alive) return;

        const score =
          typeof rankRes?.score === "number"
            ? rankRes.score
            : typeof rankRes?.points === "number"
              ? rankRes.points
              : 0;

        setUserResult({ score, correctCount: null });
        setIsSubmitted(true);
      } catch (e: any) {
        const status = e?.response?.status ?? e?.status;
        if (status !== 404) {
          console.error("Lỗi kiểm tra rank:", e);
        }
      } finally {
        if (!alive) return;
        setRankChecking(false);
      }
    };

    checkAlreadySubmitted();

    return () => {
      alive = false;
    };
  }, [competitionId]);


  useEffect(() => {
    if (!loading && !rankChecking && timeLeft > 0 && !isSubmitted && !submitting) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    else if (!loading && !rankChecking && timeLeft === 0 && !isSubmitted && !submitting) {
      void handleAutoSubmit();
    }
  }, [timeLeft, isSubmitted, loading, submitting, rankChecking]);

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

  const processSubmit = async () => {
    if (submitting || isSubmitted) return;

    setSubmitting(true);
    setSubmitError(null);

    let score = 0;
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score += q.score || 0;
        correctCount++;
      }
    });

    // Luôn hiển thị kết quả ngay để UX mượt
    setUserResult({ score, correctCount });

    try {
      await competitionService.submitCompetition({
        competitionId,
        score,
      });
    } catch (e: any) {
      console.error("Lỗi submit competition:", e);
      setSubmitError(e?.response?.data?.message ?? "Nộp bài nhưng không cập nhật được xếp hạng.");
    } finally {
      setIsSubmitted(true);
      setSubmitting(false);
    }
  };

  const handleUserSubmit = async () => {
    if (await showConfirm("Bạn chắc chắn muốn nộp bài sớm?")) {
      void processSubmit();
    }
  };

  const handleAutoSubmit = async () => {
    await showAlert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài.");
    await processSubmit();
  };

  const totalScore = questions.reduce((acc, cur) => acc + (cur.score || 0), 0);

  if (isSubmitted && userResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 size={40} />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h2>
          <p className="text-slate-500 mb-8">Cảm ơn bạn đã tham gia cuộc thi này.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Điểm số</p>
              <p className="text-3xl font-black text-blue-800">{userResult.score}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Số câu đúng</p>
              <p className="text-3xl font-black text-slate-800">
                {typeof userResult.correctCount === "number"
                  ? `${userResult.correctCount}/${questions.length}`
                  : "—"}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
          >
            Quay lại trang chủ
          </button>

          {submitError && (
            <p className="mt-4 text-sm font-semibold text-rose-600">
              {submitError}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading || rankChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-red-500 font-medium">Không tìm thấy dữ liệu câu hỏi.</p>
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
              Câu {currentQ + 1}/{questions.length}
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
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2"> {/* Thêm bọc flex ở đây */}
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Câu hỏi {currentQ + 1}
                  </span>
                  {/* Hiển thị điểm từ API */}
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                    {questions[currentQ]?.score} điểm
                  </span>
                </div>

                <button
                  onClick={toggleMark}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${markedQuestions.includes(currentQ) ? "text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Flag
                    size={14}
                    fill={markedQuestions.includes(currentQ) ? "currentColor" : "none"}
                  />
                  {markedQuestions.includes(currentQ) ? "Đã đánh dấu" : "Đánh dấu"}
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                {questions[currentQ].question}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {questions[currentQ]?.options?.map((opt: string, idx: number) => {
                const isSelected = answers[currentQ] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    className={`group relative p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4
                      ${isSelected
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

              {currentQ === questions.length - 1 ? (
                <button
                  onClick={() => void handleUserSubmit()}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center gap-2"
                >
                  Nộp bài <CheckCircle2 size={18} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQ((prev) =>
                      Math.min(questions.length - 1, prev + 1),
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

        <div className="px-6 py-3 bg-blue-50/50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600 uppercase">Tổng điểm đề:</span>
          <span className="text-sm font-black text-blue-700">{totalScore} điểm</span>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
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
                  key={idx}
                  onClick={() => {
                    setCurrentQ(idx);
                    setIsSidebarOpen(false);
                  }}
                  className={`aspect-square rounded-lg border flex items-center justify-center text-xs transition-all relative ${btnClass}`}
                >
                  {idx + 1}

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
            onClick={() => void handleUserSubmit()}
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

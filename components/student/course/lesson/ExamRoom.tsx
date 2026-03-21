"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { showAlert, showConfirm } from "@/utils/dialog";

export default function ExamRoom({
  examData,
  onComplete,
}: {
  examData: any;
  onComplete?: (score: number) => void;
}) {
  // State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(examData.durationMinutes * 60); // Giây
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Handle chọn đáp án
  const handleSelect = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Handle Nộp bài & Chấm điểm
  const handleSubmit = () => {
    let totalScore = 0;
    const maxScore = examData.questions.reduce(
      (sum: number, q: any) => sum + (q.point || 10),
      0,
    );

    examData.questions.forEach((q: any) => {
      if (answers[q.id] === q.correctAnswer) {
        totalScore += q.point || 10;
      }
    });

    const finalScore = Math.round((totalScore / maxScore) * 100); // Quy ra thang 100
    setScore(finalScore);
    setIsSubmitted(true);
    if (onComplete) onComplete(finalScore);
  };

  // Format giây -> MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* 1. HEADER: INFO & TIMER */}
      <div className="sticky top-0 z-40 pt-4 pb-2 bg-[#F8FAFC]/95 backdrop-blur-md">
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-4 flex justify-between items-center">
          <div>
            <h1 className="font-black text-slate-800 text-lg line-clamp-1">
              {examData.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Tổng: {examData.questions.length} câu • {examData.durationMinutes}{" "}
              phút
            </p>
          </div>

          {!isSubmitted ? (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-xl border-2 shadow-sm ${timeLeft < 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-blue-50 text-blue-600 border-blue-200"}`}
            >
              <Clock size={20} /> {formatTime(timeLeft)}
            </div>
          ) : (
            <div
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-md ${score >= (examData.passingScore || 50) ? "bg-green-500" : "bg-red-500"}`}
            >
              {score} / 100 Điểm
            </div>
          )}
        </div>
      </div>

      {/* 2. QUESTION LIST */}
      <div className="space-y-6 mt-4">
        {examData.questions.map((q: any, idx: number) => {
          // Logic xác định đúng sai
          const userAnswer = answers[q.id];
          const isCorrect = q.correctAnswer === userAnswer;
          const hasAnswered = userAnswer !== undefined;

          // Border của Card câu hỏi
          let cardBorder = "border-slate-200";
          if (isSubmitted) {
            if (isCorrect)
              cardBorder =
                "border-green-500 ring-1 ring-green-500 bg-green-50/10";
            else if (hasAnswered)
              cardBorder = "border-red-500 ring-1 ring-red-500 bg-red-50/10";
            else cardBorder = "border-orange-300 bg-orange-50/10"; // Chưa làm
          }

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`bg-white p-6 rounded-2xl border-2 shadow-sm transition-all scroll-mt-28 ${cardBorder}`}
            >
              <div className="flex gap-3 mb-4">
                <span
                  className={`font-bold px-3 py-1 rounded-lg text-sm h-fit shadow-sm ${isSubmitted && !isCorrect ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                >
                  Câu {idx + 1}
                </span>
                <h3 className="font-bold text-slate-800 text-lg leading-relaxed">
                  {q.text}
                </h3>
              </div>

              {/* Danh sách đáp án */}
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt: string, oIdx: number) => {
                  const isSelected = userAnswer === oIdx;
                  const isThisCorrect = q.correctAnswer === oIdx; // Đây là đáp án đúng

                  // --- LOGIC MÀU SẮC ĐÁP ÁN ---
                  let optionStyle =
                    "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50";
                  let icon = null;

                  if (isSubmitted) {
                    // Chế độ xem kết quả
                    if (isThisCorrect) {
                      // 1. Luôn Highlight đáp án đúng màu xanh (Kể cả chọn sai hay chưa chọn)
                      optionStyle =
                        "bg-green-100 border-green-600 text-green-800 font-bold shadow-sm";
                      icon = (
                        <CheckCircle
                          size={20}
                          className="text-green-600 flex-shrink-0"
                        />
                      );
                    } else if (isSelected) {
                      // 2. Nếu chọn sai -> Highlight màu đỏ
                      optionStyle =
                        "bg-red-50 border-red-500 text-red-700 font-medium opacity-80";
                      icon = (
                        <XCircle
                          size={20}
                          className="text-red-500 flex-shrink-0"
                        />
                      );
                    } else {
                      // 3. Các đáp án khác -> Mờ đi
                      optionStyle =
                        "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                    }
                  } else {
                    // Chế độ làm bài
                    if (isSelected) {
                      optionStyle =
                        "bg-blue-50 border-blue-600 text-blue-700 font-bold ring-1 ring-blue-600 shadow-sm";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, oIdx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${optionStyle}`}
                    >
                      <span className="flex-1">{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Giải thích (Hiện sau khi nộp và làm sai/chưa làm) */}
              {isSubmitted && !isCorrect && (
                <div className="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3 text-sm text-yellow-800 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0 text-yellow-600" />
                  <div>
                    <span className="font-bold block mb-1 text-yellow-700">
                      Giải thích:
                    </span>
                    Đáp án đúng là <strong>{q.options[q.correctAnswer]}</strong>
                    .{/* Nếu có field explanation thì hiển thị thêm ở đây */}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. FOOTER ACTION (Fixed Bottom) */}
      {!isSubmitted && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase">
                Tiến độ
              </span>
              <span className="text-sm font-bold text-slate-700">
                Đã làm {Object.keys(answers).length} /{" "}
                {examData.questions.length} câu
              </span>
            </div>

            <button
              onClick={async () => {
                if (Object.keys(answers).length < examData.questions.length) {
                  if (!(await showConfirm("Bạn chưa làm hết bài. Vẫn muốn nộp?")))
                    return;
                } else {
                  if (!(await showConfirm("Xác nhận nộp bài?"))) return;
                }
                handleSubmit();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transition transform active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={18} /> Nộp Bài
            </button>
          </div>
        </div>
      )}

      {/* 4. RESULT MODAL (Sau khi nộp) */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
              {score >= (examData.passingScore || 50) ? "🏆" : "💪"}
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {score >= (examData.passingScore || 50)
                ? "Làm tốt lắm!"
                : "Cần cố gắng hơn!"}
            </h2>

            <div className="my-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500 text-sm uppercase font-bold tracking-wider mb-1">
                Tổng điểm
              </p>
              <span
                className={`font-black text-4xl ${score >= 80 ? "text-green-600" : score >= 50 ? "text-blue-600" : "text-red-500"}`}
              >
                {score}
              </span>
              <span className="text-slate-400 text-sm font-bold"> / 100</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  // Quay lại trang bài học
                  await showAlert("Đóng modal");
                }}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Xem lại bài làm
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Làm lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

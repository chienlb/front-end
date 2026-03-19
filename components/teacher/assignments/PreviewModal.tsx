"use client";

import { Question, AssignmentInfo } from "./types";
import { TYPE_CONFIG } from "./constants";
import { Eye, Clock, X, Mic, CheckCircle2 } from "lucide-react";

interface PreviewModalProps {
  info: AssignmentInfo;
  questions: Question[];
  onClose: () => void;
}

export default function PreviewModal({
  info,
  questions,
  onClose,
}: PreviewModalProps) {
  // Hàm giả lập hành động nộp bài
  const handleSimulateSubmit = () => {
    alert(
      "Đây là chế độ xem trước. Trong thực tế, học sinh sẽ thấy popup xác nhận nộp bài.",
    );
  };

  const renderPreviewQuestion = (q: Question, idx: number) => {
    const Config = TYPE_CONFIG[q.type];

    return (
      <div
        key={q.id}
        className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden"
      >
        {/* Decorative Side Bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${Config.bg.replace("bg-", "bg-opacity-50 ")}`}
        ></div>

        <div className="flex gap-4 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600 text-sm shrink-0 mt-1">
            {idx + 1}
          </span>
          <div className="flex-1">
            <div className="font-medium text-slate-800 text-lg leading-snug">
              {q.text || (
                <span className="text-slate-400 italic">
                  Nội dung câu hỏi đang trống...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${Config.bg} ${Config.text} ${Config.color}`}
              >
                {Config.label}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                • {q.points} điểm
              </span>
            </div>
          </div>
        </div>

        <div className="pl-12">
          {/* --- TRẮC NGHIỆM --- */}
          {q.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-3">
              {q.options?.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all hover:border-blue-300"
                >
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="radio"
                      name={`preview-${q.id}`}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-blue-600 checked:bg-blue-600 transition-all"
                    />
                    <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                  </div>
                  <span className="text-slate-700 group-hover:text-slate-900">
                    {opt.text || "Tùy chọn trống"}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* --- TỰ LUẬN --- */}
          {q.type === "ESSAY" && (
            <textarea
              className="w-full border border-slate-300 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition resize-none bg-slate-50 focus:bg-white"
              rows={5}
              placeholder="Nhập câu trả lời của bạn tại đây..."
            />
          )}

          {/* --- GHÉP NỐI --- */}
          {q.type === "MATCHING" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 relative">
              {/* Line connector simulation (Visual only) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2"></div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase text-center mb-1">
                  Cột A
                </p>
                {q.pairs?.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-100 rounded-xl text-slate-700 text-sm font-medium border border-transparent"
                  >
                    {p.left}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase text-center mb-1">
                  Cột B (Đã xáo trộn)
                </p>
                {/* Giả lập đảo lộn thứ tự */}
                {[...(q.pairs || [])].reverse().map((p, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded-xl text-slate-700 text-sm border-2 border-dashed border-slate-300 cursor-move hover:border-purple-400 hover:text-purple-700 transition shadow-sm"
                  >
                    {p.right}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- PHÁT ÂM --- */}
          {q.type === "SPEAKING" && (
            <div className="flex flex-col items-center justify-center p-8 bg-pink-50/50 rounded-2xl border border-pink-100">
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-pink-400 uppercase mb-2">
                  Đọc to đoạn văn sau
                </p>
                <p className="text-xl font-medium text-slate-800 leading-relaxed max-w-lg">
                  "{q.audioText || "..."}"
                </p>
              </div>

              <button className="group relative w-16 h-16 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-pink-500 opacity-20 group-hover:animate-ping"></span>
                <span className="relative w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-200 text-white transition-transform group-hover:scale-105 group-active:scale-95">
                  <Mic size={28} />
                </span>
              </button>
              <p className="text-xs text-pink-600 mt-3 font-bold uppercase tracking-wider">
                Nhấn để ghi âm
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100/95 backdrop-blur-sm flex flex-col animate-in slide-in-from-bottom-10">
      {/* Sticky Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
            <Eye size={16} /> Chế độ xem trước
          </div>
          <h3 className="font-bold text-slate-800 text-lg truncate max-w-md">
            {info.title || "Bài tập chưa có tiêu đề"}
          </h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg">
              <Clock size={16} className="text-slate-400" /> {info.duration}{" "}
              phút
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg">
              <CheckCircle2 size={16} className="text-slate-400" />{" "}
              {questions.length} câu hỏi
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition duration-200"
            title="Đóng xem trước"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto pb-20">
          {/* Assignment Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 mb-10 text-center shadow-sm">
            <h1 className="text-3xl font-black text-slate-800 mb-3">
              {info.title || "Tiêu đề bài tập"}
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              {info.description || "Chưa có hướng dẫn làm bài chi tiết."}
            </p>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, idx) => renderPreviewQuestion(q, idx))}
          </div>

          {/* Submit Button Simulator */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSimulateSubmit}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              Nộp Bài Kiểm Tra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

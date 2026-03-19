"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2, Layout } from "lucide-react";
import { QuestionFormState } from "../types";
import QuizListeningFields from "./QuizListeningFields";
import MatchingFields from "./MatchingFields";
import SpellingFields from "./SpellingFields";
import SpeakingFields from "./SpeakingFields";
import CommonFields from "./CommonFields";

export default function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);

  const defaultForm: QuestionFormState = {
    type: "quiz",
    topic: "General",
    level: 1,
    content: "",
    mediaUrl: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    pairs: [],
    rewardGold: 5,
    rewardXP: 10,
  };

  const [form, setForm] = useState<QuestionFormState>(defaultForm);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData || defaultForm);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!form.content) return alert("Vui lòng nhập nội dung!");
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  if (!isOpen) return null;

  const renderSpecificFields = () => {
    switch (form.type) {
      case "quiz":
      case "listening":
        return <QuizListeningFields form={form} setForm={setForm} />;
      case "matching":
      case "flashcard":
        return <MatchingFields form={form} setForm={setForm} />;
      case "spelling":
        return <SpellingFields form={form} setForm={setForm} />;
      case "speaking":
        return <SpeakingFields form={form} setForm={setForm} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 w-full max-w-[95vw] xl:max-w-7xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-white/20">
        {/* HEADER */}
        <div className="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {initialData ? "Chỉnh sửa nội dung" : "Thiết kế bài tập mới"}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Quản lý nội dung học tập cho bé
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="flex flex-col gap-8">
            {/* 1. Form Chung */}
            <CommonFields form={form} setForm={setForm} />

            {/* 2. Form Riêng (Game Logic) */}
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-300"></div>
                <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                  Cấu hình chi tiết Game
                </span>
                <div className="h-px flex-1 bg-slate-300"></div>
              </div>

              {/* Render phần riêng */}
              {renderSpecificFields()}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs font-bold text-slate-400">
            * Vui lòng kiểm tra kỹ trước khi lưu
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Lưu bài tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

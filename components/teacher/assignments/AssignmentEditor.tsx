"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Eye,
  Clock,
  Settings,
  Hash,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { Question, AssignmentInfo } from "./types";
import QuestionItem from "./QuestionItem";
import PreviewModal from "./PreviewModal";

interface AssignmentEditorProps {
  initialData?: {
    info: AssignmentInfo;
    questions: Question[];
  };
  mode: "create" | "edit";
}

export default function AssignmentEditor({
  initialData,
  mode,
}: AssignmentEditorProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE ---
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo>({
    title: "",
    description: "",
    duration: 45,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      type: "MULTIPLE_CHOICE",
      text: "",
      points: 1,
      options: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
      ],
    },
  ]);

  useEffect(() => {
    if (initialData) {
      setAssignmentInfo(initialData.info);
      setQuestions(initialData.questions);
    }
  }, [initialData]);

  // --- COMPUTED VALUES ---
  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }, [questions]);

  // --- HANDLERS ---
  const addQuestion = () => {
    const newId = Date.now();
    setQuestions([
      ...questions,
      {
        id: newId,
        type: "MULTIPLE_CHOICE",
        text: "",
        points: 1,
        options: [
          { id: newId + 1, text: "", isCorrect: false },
          { id: newId + 2, text: "", isCorrect: false },
        ],
      },
    ]);
    // Scroll xuống cuối trang (Optional UX improvement)
    setTimeout(
      () =>
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        }),
      100,
    );
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const deleteQuestion = (id: number) => {
    if (questions.length <= 1) {
      alert("Bài tập phải có ít nhất 1 câu hỏi.");
      return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const handleSave = async () => {
    if (!assignmentInfo.title.trim())
      return alert("Vui lòng nhập tiêu đề bài tập!");

    setIsSaving(true);

    // Giả lập API call
    console.log("Saving assignment:", { info: assignmentInfo, questions });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay

    setIsSaving(false);
    alert(
      mode === "create"
        ? "Đã tạo bài tập mới thành công!"
        : "Đã cập nhật bài tập!",
    );
    router.push("/teacher/assignments");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. STICKY HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
            title="Quay lại"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex flex-col">
            <input
              className="text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300 bg-transparent w-[400px] border-b border-transparent focus:border-slate-300 transition pb-1"
              placeholder="Nhập tiêu đề bài tập..."
              value={assignmentInfo.title}
              onChange={(e) =>
                setAssignmentInfo({ ...assignmentInfo, title: e.target.value })
              }
              autoFocus
            />
            <span className="text-xs text-slate-400 font-medium mt-1">
              {mode === "create" ? "Đang tạo mới" : "Đang chỉnh sửa"} •{" "}
              {questions.length} câu hỏi
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2"
          >
            <Eye size={18} /> Xem trước
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>Đang lưu...</>
            ) : (
              <>
                <Save size={18} /> {mode === "create" ? "Xuất bản" : "Cập nhật"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN BODY */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-8 pb-32">
        {/* --- SETTINGS CARD --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
            <Settings size={20} className="text-slate-400" />
            Cấu hình chung
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Mô tả / Hướng dẫn làm bài
              </label>
              <textarea
                className="w-full text-sm outline-none text-slate-600 resize-none border border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition h-24"
                placeholder="VD: Các em làm bài nghiêm túc, không sử dụng tài liệu..."
                value={assignmentInfo.description}
                onChange={(e) =>
                  setAssignmentInfo({
                    ...assignmentInfo,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Clock size={14} /> Thời gian (phút)
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition"
                value={assignmentInfo.duration}
                onChange={(e) =>
                  setAssignmentInfo({
                    ...assignmentInfo,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Total Points (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Calculator size={14} /> Tổng điểm
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed select-none">
                {totalPoints} điểm
              </div>
            </div>

            {/* Tags (Mock UI) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Hash size={14} /> Thẻ phân loại
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                placeholder="VD: Unit 1, Grammar..."
              />
            </div>
          </div>
        </div>

        {/* --- QUESTIONS LIST --- */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <QuestionItem
              key={q.id}
              question={q}
              index={idx}
              onUpdate={(updates) => updateQuestion(q.id, updates)}
              onDelete={() => deleteQuestion(q.id)}
            />
          ))}
        </div>

        {/* --- ADD BUTTON --- */}
        <button
          onClick={addQuestion}
          className="w-full mt-8 py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-3 group"
        >
          <div className="bg-slate-200 group-hover:bg-blue-200 rounded-full p-1.5 text-white transition">
            <Plus
              size={24}
              className="text-slate-500 group-hover:text-blue-600"
            />
          </div>
          <span className="text-lg">Thêm câu hỏi mới</span>
        </button>

        {/* Empty State Warning */}
        {questions.length === 0 && (
          <div className="mt-4 p-4 bg-orange-50 text-orange-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={18} /> Bài tập cần ít nhất 1 câu hỏi.
          </div>
        )}
      </div>

      {/* 3. PREVIEW MODAL */}
      {showPreview && (
        <PreviewModal
          info={assignmentInfo}
          questions={questions}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

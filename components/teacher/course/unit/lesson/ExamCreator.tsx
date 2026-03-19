"use client";

import { useState } from "react";
import { Plus, Trash2, Save, CheckCircle, GripVertical } from "lucide-react";

export default function ExamCreator({
  onSave,
  initialData,
}: {
  onSave: (data: any) => void;
  initialData?: any;
}) {
  const [exam, setExam] = useState(
    initialData || {
      title: "",
      description: "",
      durationMinutes: 15,
      passingScore: 50,
      questions: [
        {
          id: "q1",
          text: "Câu hỏi mẫu: 1 + 1 bằng mấy?",
          options: ["1", "2", "3", "4"],
          correctAnswer: 1, // Index 1 là đáp án "2"
          point: 10,
        },
      ],
    },
  );

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setExam((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q${Date.now()}`,
          text: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          point: 10,
        },
      ],
    }));
  };

  // Cập nhật nội dung câu hỏi
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions: any = [...exam.questions];
    newQuestions[index][field] = value;
    setExam({ ...exam, questions: newQuestions });
  };

  // Cập nhật nội dung đáp án
  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions: any = [...exam.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setExam({ ...exam, questions: newQuestions });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          📝 Soạn Thảo Đề Thi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Tên bài thi
            </label>
            <input
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              placeholder="Ví dụ: Kiểm tra giữa kỳ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={exam.durationMinutes}
                onChange={(e) =>
                  setExam({ ...exam, durationMinutes: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Điểm đạt (%)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={exam.passingScore}
                onChange={(e) =>
                  setExam({ ...exam, passingScore: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-xs">
                Câu {qIdx + 1}
              </span>
              <button
                onClick={() => {
                  const newQ = exam.questions.filter((_, i) => i !== qIdx);
                  setExam({ ...exam, questions: newQ });
                }}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mb-4">
              <input
                className="w-full p-3 border border-slate-300 rounded-lg font-medium focus:border-blue-500 outline-none"
                placeholder="Nhập nội dung câu hỏi..."
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    q.correctAnswer === oIdx
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctAnswer === oIdx}
                    onChange={() => updateQuestion(qIdx, "correctAnswer", oIdx)}
                    className="w-4 h-4 text-green-600 cursor-pointer"
                  />
                  <input
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder={`Đáp án ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  />
                  {q.correctAnswer === oIdx && (
                    <CheckCircle size={16} className="text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={addQuestion}
          className="flex-1 py-3 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Thêm câu hỏi
        </button>
        <button
          onClick={() => onSave(exam)}
          className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Save size={20} /> Lưu đề thi
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Loader2,
  FileQuestion,
  MoreVertical,
} from "lucide-react";
import api from "@/utils/api";
import QuestionFormModal from "@/components/teacher/practice/forms/QuestionFormModal";
import { practiceService } from "@/services/practice.service";

export default function QuestionManager() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch dữ liệu
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res: any = await api.get("/practice/questions");
      setQuestions(res);
    } catch (e) {
      console.error("Lỗi tải câu hỏi:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter client-side
  const filteredQuestions = questions.filter(
    (q) =>
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 2. Xóa câu hỏi
  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      try {
        await api.delete(`/practice/questions/${id}`);
        fetchQuestions();
      } catch (e) {
        alert("Xóa thất bại!");
      }
    }
  };

  // 3. Handlers
  const handleCreate = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingQuestion) {
        await practiceService.update(formData._id, formData);
      } else {
        await practiceService.create(formData);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (e) {
      alert("Có lỗi xảy ra khi lưu!");
      console.error(e);
    }
  };

  // Helper: Màu sắc cho Badge loại câu hỏi
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "listening":
        return "bg-red-50 text-red-700 border-red-200";
      case "matching":
        return "bg-green-50 text-green-700 border-green-200";
      case "flashcard":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "spelling":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "speaking":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 font-sans rounded-[2rem]">
      <div className="w-full max-w-[1920px] mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              Câu hỏi luyện tập
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-1">
              Quản lý và biên soạn nội dung bài tập, kiểm tra.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
          >
            <Plus size={20} /> Tạo Câu Hỏi Mới
          </button>
        </div>

        {/* TOOLBAR (Search & Actions) */}
        <div className="bg-white p-4 rounded-2xl shadow-md shadow-slate-200/70 border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, loại câu hỏi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Filter size={16} /> <span>{questions.length} câu hỏi</span>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/70 border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-5 pl-6">Loại Game</th>
                    <th className="p-5 min-w-[300px]">Nội dung / Đề bài</th>
                    <th className="p-5">Đáp án / Chi tiết</th>
                    <th className="p-5 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.map((q: any) => (
                    <tr
                      key={q._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Cột 1: Loại */}
                      <td className="p-5 pl-6 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide border ${getTypeBadgeStyle(q.type)}`}
                        >
                          {q.type}
                        </span>
                      </td>

                      {/* Cột 2: Nội dung */}
                      <td className="p-5 align-top">
                        <p
                          className="font-bold text-slate-800 text-base line-clamp-2 max-w-2xl"
                          title={q.content}
                        >
                          {q.content}
                        </p>
                        {q.mediaUrl && (
                          <div className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1 bg-blue-50 w-fit px-2 py-1 rounded">
                            📎 Có đính kèm Media
                          </div>
                        )}
                      </td>

                      {/* Cột 3: Chi tiết */}
                      <td className="p-5 align-top text-slate-600">
                        {q.type === "quiz" && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                              Đáp án đúng:
                            </span>
                            <span className="font-mono text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded w-fit">
                              {q.correctAnswer}
                            </span>
                          </div>
                        )}
                        {(q.type === "matching" || q.type === "flashcard") && (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {q.pairs?.length || 0}
                            </span>
                            <span>cặp từ vựng</span>
                          </div>
                        )}
                        {(q.type === "spelling" || q.type === "speaking") && (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                              Mẫu câu:
                            </span>
                            <span className="italic">"{q.correctAnswer}"</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Hành động */}
                      <td className="p-5 pr-6 align-top text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(q)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredQuestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileQuestion size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-bold text-slate-600">
                Chưa có câu hỏi nào
              </p>
              <p className="text-sm">
                Hãy bắt đầu bằng việc tạo câu hỏi mới nhé.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <QuestionFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialData={editingQuestion}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

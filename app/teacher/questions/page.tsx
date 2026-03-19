"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  Trash2,
  Edit,
  Mic,
  Type,
  List,
  Puzzle,
  BookOpen,
  Gamepad2,
  LayoutGrid,
  AlignJustify,
} from "lucide-react";
import QuestionEditorModal from "@/components/teacher/questions/QuestionEditorModal";
import { questionService } from "@/services/question.service";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // State chế độ xem (GRID hoặc TABLE)
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data: any = await questionService.getAll();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreate = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (q: any) => {
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa hoạt động này?")) {
      try {
        await questionService.delete(id);
        fetchQuestions();
      } catch (error) {
        alert("Lỗi khi xóa. Vui lòng thử lại.");
      }
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchType = filterType === "ALL" || q.type === filterType;
    return matchSearch && matchType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "VOCAB":
        return <BookOpen size={18} className="text-teal-600" />;
      case "MULTIPLE_CHOICE":
        return <List size={18} className="text-blue-600" />;
      case "FILL_IN_BLANK":
        return <Type size={18} className="text-purple-600" />;
      case "PRONUNCIATION":
        return <Mic size={18} className="text-orange-600" />;
      case "MATCHING":
        return <Puzzle size={18} className="text-pink-600" />;
      default:
        return <Gamepad2 size={18} className="text-slate-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      VOCAB: "Từ vựng",
      MULTIPLE_CHOICE: "Trắc nghiệm",
      FILL_IN_BLANK: "Điền từ",
      PRONUNCIATION: "Phát âm AI",
      MATCHING: "Nối từ",
    };
    return labels[type] || type;
  };

  const getDifficultyStyle = (level: string) => {
    if (level === "EASY") return "bg-green-100 text-green-700 border-green-200";
    if (level === "MEDIUM")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6 bg-slate-50/50">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Ngân hàng câu hỏi
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Quản lý kho câu hỏi, bài tập và trò chơi.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <Plus size={20} /> Tạo Mới
        </button>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full md:w-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl text-sm font-medium outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["ALL", "VOCAB", "MULTIPLE_CHOICE", "PRONUNCIATION"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filterType === type
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {type === "ALL" ? "Tất cả" : getTypeLabel(type)}
                </button>
              ),
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg transition-all ${viewMode === "GRID" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Chế độ Lưới"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-2 rounded-lg transition-all ${viewMode === "TABLE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Chế độ Bảng"
            >
              <AlignJustify size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
            <Gamepad2 size={48} className="opacity-20 mb-4" />
            <p className="font-bold text-lg text-slate-600">
              Chưa có hoạt động nào
            </p>
            <p className="text-sm">Hãy bắt đầu tạo câu hỏi mới ngay!</p>
          </div>
        ) : (
          <>
            {/* --- GRID VIEW --- */}
            {viewMode === "GRID" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredQuestions.map((q, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      key={q._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            {getIcon(q.type)}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              {getTypeLabel(q.type)}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getDifficultyStyle(q.difficulty)}`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(q)}
                            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 min-h-[40px]">
                        {q.content}
                      </h3>

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4 border-t border-slate-50">
                        {q.tags?.length > 0 ? (
                          q.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium border border-slate-200"
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">
                            Không có tag
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* --- TABLE VIEW --- */}
            {viewMode === "TABLE" && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4 pl-6">Loại & Độ khó</th>
                      <th className="p-4 w-1/2">Nội dung câu hỏi</th>
                      <th className="p-4">Tags</th>
                      <th className="p-4 text-right pr-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredQuestions.map((q, index) => (
                        <motion.tr
                          key={q._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="p-4 pl-6 align-top">
                            <div className="flex flex-col gap-1.5">
                              <span className="flex items-center gap-2 font-bold text-slate-700">
                                {getIcon(q.type)} {getTypeLabel(q.type)}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-bold w-fit ${getDifficultyStyle(q.difficulty)}`}
                              >
                                {q.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-medium text-slate-800 line-clamp-2">
                              {q.content}
                            </p>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-wrap gap-1">
                              {q.tags?.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 pr-6 align-top text-right">
                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(q)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(q._id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <QuestionEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingQuestion}
          onSuccess={() => {
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}

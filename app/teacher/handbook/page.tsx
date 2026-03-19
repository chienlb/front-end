"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  BookOpen,
  GraduationCap,
  Star,
  Eye,
  Search,
  Filter,
  Loader2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import MediaUploader from "@/components/teacher/practice/forms/MediaUploader";
import ExampleList from "@/components/teacher/handbook/ExampleList";
import CardItem from "@/components/student/handbook/CardItem";

export default function HandbookManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // State Form
  const initialForm = {
    type: "VOCAB",
    rarity: "COMMON",
    word: "",
    meaning: "",
    imageUrl: "",
    audioUrl: "",
    ruleName: "",
    explanation: "",
    examples: [],
    videoUrl: "",
  };
  const [form, setForm] = useState<any>(initialForm);

  // 1. Fetch dữ liệu
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res: any = await api.get("/handbook/items");
      setItems(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter Logic
  const filteredItems = items.filter((item) => {
    const matchSearch =
      (item.word &&
        item.word.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ruleName &&
        item.ruleName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === "ALL" || item.type === filterType;
    return matchSearch && matchType;
  });

  // Handlers
  const handleCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setForm({ ...initialForm, ...item });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (form.type === "VOCAB" && !form.word)
      return alert("Vui lòng nhập từ vựng!");
    if (form.type === "GRAMMAR" && !form.ruleName)
      return alert("Vui lòng nhập tên ngữ pháp!");

    try {
      if (editingId) {
        await api.patch(`/handbook/items/${editingId}`, form);
      } else {
        await api.post("/handbook/items", form);
      }
      setShowModal(false);
      fetchItems();
    } catch (e) {
      alert("Đã có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa thẻ bài này không?")) {
      await api.delete(`/handbook/items/${id}`);
      fetchItems();
    }
  };

  // Helper Styles
  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case "COMMON":
        return "from-slate-100 to-slate-200 border-slate-300 text-slate-600";
      case "RARE":
        return "from-blue-50 to-blue-100 border-blue-300 text-blue-600";
      case "EPIC":
        return "from-purple-50 to-purple-100 border-purple-300 text-purple-600";
      case "LEGENDARY":
        return "from-yellow-50 to-amber-100 border-amber-300 text-amber-700";
      default:
        return "from-gray-50 to-gray-100";
    }
  };

  const getPreviewData = () => ({
    _id: "preview",
    ...form,
    name: form.type === "VOCAB" ? form.word : form.ruleName,
    example: form.examples?.join("\n"),
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="w-full px-2">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <span className="text-4xl">🎴</span> Kho Thẻ Bài Tri Thức
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Quản lý bộ sưu tập thẻ từ vựng & ngữ pháp cho học viên.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            <Plus size={20} /> Tạo Thẻ Mới
          </button>
        </div>

        {/* TOOLBAR (Search & Filter) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-30">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm thẻ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto bg-slate-100 p-1 rounded-xl">
            {["ALL", "VOCAB", "GRAMMAR"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === t
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "ALL"
                  ? "Tất cả"
                  : t === "VOCAB"
                    ? "Từ vựng"
                    : "Ngữ pháp"}
              </button>
            ))}
          </div>
        </div>

        {/* GRID CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item._id}
                  onClick={() => handleEdit(item)}
                  className={`
                    group relative bg-white rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 
                    hover:-translate-y-2 hover:shadow-xl flex flex-col overflow-hidden
                    ${
                      item.type === "VOCAB"
                        ? "hover:border-blue-400"
                        : "hover:border-amber-400"
                    }
                  `}
                >
                  {/* Card Header (Rarity & Type) */}
                  <div
                    className={`h-24 bg-gradient-to-br flex justify-center items-center relative ${getRarityGradient(
                      item.rarity,
                    )}`}
                  >
                    <div className="absolute top-3 left-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-full">
                      {item.type === "GRAMMAR" ? (
                        <GraduationCap size={14} className="text-slate-700" />
                      ) : (
                        <BookOpen size={14} className="text-slate-700" />
                      )}
                    </div>

                    {/* Badge Rarity */}
                    <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md shadow-sm">
                      {item.rarity}
                    </span>

                    {/* Thumbnail */}
                    {item.type === "VOCAB" ? (
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        className="h-20 w-20 object-contain drop-shadow-md transform group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="text-4xl filter drop-shadow-sm group-hover:rotate-12 transition">
                        📜
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 text-center flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">
                      {item.type === "VOCAB" ? item.word : item.ruleName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.meaning || "Thẻ bài kiến thức"}
                    </p>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-medium">Không tìm thấy thẻ bài nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* --- MODAL EDITOR --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-[90vw] xl:max-w-7xl h-[90vh] flex overflow-hidden shadow-2xl relative">
            {/* Close Button Mobile */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full md:hidden"
            >
              <X size={20} />
            </button>

            {/* LEFT: EDITOR FORM */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    {editingId ? <Edit size={24} /> : <Plus size={24} />}
                  </div>
                  {editingId ? "Cập nhật Thẻ" : "Tạo Thẻ Mới"}
                </h2>
              </div>

              <div className="space-y-8">
                {/* 1. General Settings */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Loại thẻ
                    </label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                      {[
                        { id: "VOCAB", label: "Từ vựng" },
                        { id: "GRAMMAR", label: "Ngữ pháp" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setForm({ ...form, type: t.id })}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            form.type === t.id
                              ? "bg-white shadow text-blue-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Độ hiếm (Rarity)
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-200 transition"
                      value={form.rarity}
                      onChange={(e) =>
                        setForm({ ...form, rarity: e.target.value })
                      }
                    >
                      <option value="COMMON">🟢 Common (Thường)</option>
                      <option value="RARE">🔵 Rare (Hiếm)</option>
                      <option value="EPIC">🟣 Epic (Cực hiếm)</option>
                      <option value="LEGENDARY">
                        🟡 Legendary (Huyền thoại)
                      </option>
                    </select>
                  </div>
                </div>

                {/* 2. Content Form */}
                {form.type === "VOCAB" ? (
                  <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="space-y-4">
                      <input
                        className="w-full text-4xl font-black placeholder:text-slate-200 outline-none border-b-2 border-slate-100 focus:border-blue-500 py-2 transition text-slate-800"
                        placeholder="Word (e.g. Apple)"
                        value={form.word}
                        onChange={(e) =>
                          setForm({ ...form, word: e.target.value })
                        }
                      />
                      <input
                        className="w-full text-lg font-medium placeholder:text-slate-300 outline-none text-slate-600"
                        placeholder="Meaning (e.g. Quả táo)"
                        value={form.meaning}
                        onChange={(e) =>
                          setForm({ ...form, meaning: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">
                          Hình ảnh minh họa
                        </label>
                        <MediaUploader
                          type="image"
                          value={form.imageUrl}
                          onChange={(url) =>
                            setForm({ ...form, imageUrl: url })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">
                          Phát âm (Audio)
                        </label>
                        <MediaUploader
                          type="audio"
                          value={form.audioUrl}
                          onChange={(url) =>
                            setForm({ ...form, audioUrl: url })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <input
                        className="w-full text-2xl font-black placeholder:text-slate-200 outline-none border-b-2 border-slate-100 focus:border-amber-500 py-2 transition text-slate-800"
                        placeholder="Tên cấu trúc (VD: Thì hiện tại đơn)"
                        value={form.ruleName}
                        onChange={(e) =>
                          setForm({ ...form, ruleName: e.target.value })
                        }
                      />
                      <textarea
                        className="w-full p-4 rounded-xl bg-slate-50 border-none text-slate-600 text-sm h-32 resize-none focus:ring-2 focus:ring-amber-200 outline-none"
                        placeholder="Giải thích ngữ pháp chi tiết..."
                        value={form.explanation}
                        onChange={(e) =>
                          setForm({ ...form, explanation: e.target.value })
                        }
                      />
                    </div>

                    <ExampleList
                      examples={form.examples || []}
                      onChange={(newExamples: string[]) =>
                        setForm({ ...form, examples: newExamples })
                      }
                    />
                  </div>
                )}

                {/* 3. Special Video */}
                {(form.rarity === "EPIC" || form.rarity === "LEGENDARY") && (
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mt-6">
                    <div className="flex items-center gap-2 mb-4 text-purple-800 font-bold text-sm uppercase tracking-wide">
                      <Star size={16} fill="currentColor" /> Video hiệu ứng đặc
                      biệt
                    </div>
                    <MediaUploader
                      type="video"
                      value={form.videoUrl}
                      onChange={(url) => setForm({ ...form, videoUrl: url })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: PREVIEW AREA */}
            <div className="hidden lg:flex w-1/2 bg-slate-100 flex-col border-l border-slate-200">
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
                <div className="absolute top-6 left-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                  <Eye size={14} /> Live Preview
                </div>

                {/* The Card */}
                <div className="w-[340px] transform hover:scale-105 transition-transform duration-500 ease-out">
                  <CardItem item={getPreviewData()} isOwned={true} />
                </div>

                <p className="mt-8 text-slate-400 text-sm font-medium">
                  Đây là giao diện thẻ bài học sinh sẽ nhìn thấy.
                </p>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-white border-t border-slate-200 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all transform active:scale-95 flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingId ? "Lưu Thay Đổi" : "Tạo Thẻ Mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

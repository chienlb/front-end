"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Video, Film, Captions } from "lucide-react";
import CategoryModal from "@/components/teacher/entertainment/CategoryModal";
import VideoPickerModal from "@/components/teacher/entertainment/VideoPickerModal";
import SubtitleModal from "@/components/teacher/entertainment/SubtitleModal";
import { entertainmentService } from "@/services/entertainment.service";

export default function MovieManager() {
  const [view, setView] = useState<"LIST_CATEGORIES" | "CATEGORY_DETAIL">(
    "LIST_CATEGORIES",
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);

  // State quản lý video sửa phụ đề
  const [editingSubtitleVideo, setEditingSubtitleVideo] = useState<any>(null);

  // 1. Load danh sách chủ đề
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await entertainmentService.getCategories();
      setCategories(res);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  // 2. Xử lý xóa chủ đề
  const handleDeleteCategory = async (id: string) => {
    if (
      confirm(
        "Xóa chủ đề này sẽ không xóa video gốc trong kho Media. Bạn chắc chắn chứ?",
      )
    ) {
      await entertainmentService.deleteCategory(id);
      fetchCategories();
    }
  };

  // 3. Xử lý thêm video vào chủ đề
  const handleAddVideoSuccess = async (mediaId: string) => {
    try {
      await entertainmentService.addVideoToCategory(
        selectedCategory._id,
        mediaId,
      );
      const updated = await entertainmentService.getCategoryDetail(
        selectedCategory._id,
      );
      setSelectedCategory(updated);
    } catch (error) {
      alert("Lỗi khi thêm video vào chủ đề");
    }
  };

  // --- GIAO DIỆN DANH SÁCH CHỦ ĐỀ ---
  if (view === "LIST_CATEGORIES") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Quản lý Phim & Giải trí 🎬
            </h1>
            <p className="text-gray-500">
              Tạo các Album phim, Hoạt hình, Ca nhạc cho bé.
            </p>
          </div>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Tạo Chủ đề mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={
                    cat.thumbnail ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  className="w-full h-full object-cover"
                  alt={cat.title}
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-blue-600 uppercase">
                  {cat.type}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                  {cat.description || "Chưa có mô tả"}
                </p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-xs font-bold text-gray-400">
                    {cat.videos?.length || 0} tập phim
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setView("CATEGORY_DETAIL");
                      }}
                      className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-bold"
                    >
                      Quản lý
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CategoryModal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          onSuccess={fetchCategories}
        />
      </div>
    );
  }

  // --- GIAO DIỆN CHI TIẾT ---
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView("LIST_CATEGORIES")}
          className="p-2 hover:bg-white rounded-full transition"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {selectedCategory.title}
            <span className="text-sm font-normal text-gray-500 border px-2 py-0.5 rounded ml-2 uppercase text-[10px]">
              {selectedCategory.type}
            </span>
          </h1>
          <p className="text-gray-500 text-sm">Quản lý danh sách tập phim</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setIsVideoPickerOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={18} /> Thêm Tập phim
          </button>
        </div>
      </div>

      {/* List Video */}
      <div className="space-y-3">
        {selectedCategory.videos?.map((video: any, idx: number) => (
          <div
            key={video._id || idx}
            className="flex items-center bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 mr-4 shrink-0">
              {idx + 1}
            </div>
            <img
              src={video.thumbnail || "https://via.placeholder.com/150"}
              className="w-24 h-14 object-cover rounded-lg mr-4 bg-gray-100 shrink-0"
              alt={video.title}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-700 truncate">
                {video.title}
              </h4>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Video size={12} />{" "}
                {video.duration
                  ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                  : "Unknown duration"}
              </span>
            </div>

            {/* 3. NÚT ACTION (Subtitle + Delete) */}
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => setEditingSubtitleVideo(video)} // Mở modal subtitle
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition flex items-center gap-2 text-sm font-medium"
                title="Biên tập phụ đề"
              >
                <Captions size={18} />
                <span className="hidden md:inline">CC</span>
              </button>

              <button
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                title="Gỡ khỏi danh sách"
                onClick={async () => {
                  if (
                    confirm(
                      "Bạn muốn gỡ video này khỏi chủ đề? (Video gốc vẫn còn trong kho)",
                    )
                  ) {
                    await entertainmentService.removeVideoFromCategory(
                      selectedCategory._id,
                      video._id,
                    );
                    const updated =
                      await entertainmentService.getCategoryDetail(
                        selectedCategory._id,
                      );
                    setSelectedCategory(updated);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {(!selectedCategory.videos || selectedCategory.videos.length === 0) && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <Film className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500 font-medium">
              Chủ đề này chưa có tập phim nào.
            </p>
            <button
              onClick={() => setIsVideoPickerOpen(true)}
              className="text-blue-600 font-bold text-sm mt-2 hover:underline"
            >
              + Thêm tập đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Các Modal */}
      <VideoPickerModal
        isOpen={isVideoPickerOpen}
        onClose={() => setIsVideoPickerOpen(false)}
        onSelect={(mediaId: string) => handleAddVideoSuccess(mediaId)}
      />

      {/* 4. Modal Subtitle */}
      <SubtitleModal
        isOpen={!!editingSubtitleVideo}
        video={editingSubtitleVideo}
        onClose={() => setEditingSubtitleVideo(null)}
      />
    </div>
  );
}

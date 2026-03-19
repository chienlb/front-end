"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import { entertainmentService } from "@/services/entertainment.service";
import { mediaService } from "@/services/media.service";

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "cartoon", // cartoon | music
    level: "Easy",
    thumbnail: "",
  });

  // Load data khi sửa
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        type: initialData.type,
        level: initialData.level,
        thumbnail: initialData.thumbnail,
      });
    } else {
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "cartoon",
        level: "Easy",
        thumbnail: "",
      });
    }
  }, [initialData, isOpen]);

  // Xử lý upload ảnh bìa
  const handleUploadThumbnail = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res: any = await mediaService.uploadFile(file); // Upload lên server
      setFormData({ ...formData, thumbnail: res.url });
    } catch (error) {
      alert("Lỗi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  // Xử lý lưu
  const handleSubmit = async () => {
    if (!formData.title) return alert("Vui lòng nhập tên chủ đề!");
    if (!formData.thumbnail) return alert("Vui lòng chọn ảnh bìa!");

    setLoading(true);
    try {
      if (initialData?._id) {
        // Update logic
        // await entertainmentService.updateCategory(initialData._id, formData);
        alert("Tính năng cập nhật đang phát triển");
      } else {
        // Create logic
        await entertainmentService.createCategory(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">
            {initialData ? "Chỉnh sửa Chủ đề" : "Tạo Chủ đề Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* 1. Ảnh bìa */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
              Ảnh bìa (Thumbnail)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition overflow-hidden group"
            >
              {formData.thumbnail ? (
                <>
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold text-sm">
                    Thay đổi ảnh
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  {uploading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    <UploadCloud size={32} className="mx-auto mb-2" />
                  )}
                  <span className="text-xs">Click để upload ảnh</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUploadThumbnail}
              />
            </div>
          </div>

          {/* 2. Tên chủ đề */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Tên Chủ đề
            </label>
            <input
              className="w-full border p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none font-bold text-slate-700"
              placeholder="VD: Peppa Pig Season 1"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 3. Phân loại & Độ khó (2 cột) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Loại
              </label>
              <select
                className="w-full border p-2.5 rounded-lg text-sm outline-none bg-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="cartoon">🎬 Hoạt hình</option>
                <option value="music">🎵 Ca nhạc</option>
                <option value="story">📖 Kể chuyện</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Độ khó
              </label>
              <select
                className="w-full border p-2.5 rounded-lg text-sm outline-none bg-white"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Vừa (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
          </div>

          {/* 4. Mô tả */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              className="w-full border p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none resize-none h-20"
              placeholder="Giới thiệu sơ lược về nội dung..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {initialData ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

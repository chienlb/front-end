"use client";

import { useState } from "react";
import { SubFormProps } from "../types";
import { Image as ImageIcon, Headphones } from "lucide-react";
import MediaUploader from "./MediaUploader";

export default function SpellingFields({ form, setForm }: SubFormProps) {
  // State cục bộ để switch giữa upload ảnh hoặc audio
  const [mediaType, setMediaType] = useState<"image" | "audio">("image");

  return (
    <div className="space-y-4">
      {/* 1. KHU VỰC NHẬP TỪ KHÓA */}
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <label className="block text-xs font-bold text-orange-600 mb-2 uppercase">
          Từ vựng cần sắp xếp (Đáp án đúng)
        </label>
        <input
          className="w-full border-2 border-orange-200 p-4 rounded-xl font-mono text-2xl tracking-[0.2em] uppercase text-center text-orange-800 focus:border-orange-500 outline-none placeholder:tracking-normal placeholder:text-sm"
          value={form.correctAnswer}
          onChange={(e) =>
            setForm({ ...form, correctAnswer: e.target.value.toUpperCase() })
          }
          placeholder="VD: APPLE"
        />
        <div className="mt-3 flex gap-2 items-start">
          <span className="text-orange-500 text-lg">💡</span>
          <p className="text-xs text-orange-600 leading-5">
            Hệ thống sẽ tự động tách từ này ra (VD: A-P-P-L-E) và xáo trộn thành
            P-L-E-A-P để bé sắp xếp lại.
          </p>
        </div>
      </div>

      {/* 2. KHU VỰC UPLOAD MEDIA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">
          Minh họa bằng (Chọn 1 trong 2)
        </label>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMediaType("image")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
              mediaType === "image"
                ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
            }`}
          >
            <ImageIcon size={16} /> Hình ảnh
          </button>
          <button
            type="button"
            onClick={() => setMediaType("audio")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
              mediaType === "audio"
                ? "bg-purple-50 text-purple-600 border-purple-200 shadow-sm"
                : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
            }`}
          >
            <Headphones size={16} /> Âm thanh
          </button>
        </div>

        {/* Uploader Component */}
        <MediaUploader
          type={mediaType} // "image" hoặc "audio"
          value={form.mediaUrl} // Link hiện tại trong form
          onChange={(url) => setForm({ ...form, mediaUrl: url })} // Cập nhật link vào form
        />

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          * Bé sẽ nhìn hình (hoặc nghe tiếng) để đoán ra từ cần xếp.
        </p>
      </div>
    </div>
  );
}

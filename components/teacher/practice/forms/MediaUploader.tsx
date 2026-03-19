"use client";

import { useState } from "react";
import {
  Upload,
  X,
  Loader2,
  PlayCircle,
  Image as ImageIcon,
  FileAudio,
} from "lucide-react";
import axios from "axios";

interface Props {
  type: "image" | "audio" | "video";
  value: string;
  onChange: (url: string) => void;
}

export default function MediaUploader({ type, value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:4000/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // LẤY LINK THẬT TỪ SERVER (VD: http://localhost:4000/uploads/abc.mp3)
      const realUrl = res.data.url;

      console.log("File uploaded:", realUrl);
      onChange(realUrl);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Lỗi upload! Hãy kiểm tra Backend đã chạy chưa.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => onChange("");

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition relative text-center">
      {loading ? (
        <div className="py-4 text-blue-600 flex flex-col items-center">
          <Loader2 className="animate-spin mb-1" /> Đang tải lên Server...
        </div>
      ) : value ? (
        <div className="relative inline-block">
          {/* Hiển thị Preview */}
          {type === "image" ? (
            <img
              src={value}
              className="h-32 rounded border bg-white object-contain"
            />
          ) : type === "video" ? (
            <video src={value} className="h-32 rounded bg-black" controls />
          ) : (
            <audio src={value} controls className="mt-2" />
          )}

          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
          >
            <X size={14} />
          </button>

          {/* Hiển thị link */}
          <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate">
            {value}
          </p>
        </div>
      ) : (
        <label className="cursor-pointer block py-6">
          <input
            type="file"
            className="hidden"
            accept={type === "image" ? "image/*" : "audio/*,video/*"}
            onChange={handleUpload}
          />
          <div className="flex flex-col items-center text-gray-400">
            <Upload size={32} className="mb-2" />
            <span className="text-sm font-medium">Click để tải lên</span>
          </div>
        </label>
      )}
    </div>
  );
}

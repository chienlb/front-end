"use client";

import { X } from "lucide-react";
import TranscriptEditor from "./TranscriptEditor";

export default function SubtitleModal({ isOpen, onClose, video }: any) {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-lg text-slate-800">
              Biên tập Phụ đề
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Đang sửa: <span className="text-blue-600">{video.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body containing Editor */}
        <div className="flex-1 overflow-hidden bg-slate-100 p-4">
          <TranscriptEditor videoId={video._id} />
        </div>
      </div>
    </div>
  );
}

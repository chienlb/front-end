"use client";
import { useState } from "react";
import { Material } from "../ts/types";
import { Upload, X } from "lucide-react";

export default function UploadMaterialModal({
  isOpen,
  onClose,
  onSubmit,
}: any) {
  if (!isOpen) return null;
  // Giả lập upload
  const handleUpload = () => {
    const newDoc: Material = {
      id: `mat${Date.now()}`,
      name: "Tài liệu mới.pdf",
      type: "PDF",
      url: "#",
      size: "1.5MB",
    };
    onSubmit(newDoc);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">Thêm Tài Liệu</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-600">
              Kéo thả file hoặc click để upload
            </p>
          </div>
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-700 shadow-lg"
          >
            Lưu Tài Liệu
          </button>
        </div>
      </div>
    </div>
  );
}

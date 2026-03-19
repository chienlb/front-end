"use client";
import { useState } from "react";

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export default function CreateUnitModal({ isOpen, onClose, onSubmit }: any) {
  const [title, setTitle] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Tạo Unit Mới</h3>
        <input
          className="w-full border p-3 rounded-xl mb-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          placeholder="Nhập tên Unit (VD: Unit 1: Introduction)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(title)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}

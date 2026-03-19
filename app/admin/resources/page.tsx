"use client";

import { useState } from "react";
import {
  Search,
  UploadCloud,
  Trash2,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  MoreHorizontal,
  Filter,
  HardDrive,
  CheckSquare,
  Square,
} from "lucide-react";

// --- TYPES ---
type FileType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

interface ResourceFile {
  id: string;
  name: string;
  type: FileType;
  size: string; // MB
  uploadedBy: string; // Admin or Teacher Name
  uploadedAt: string;
  url: string;
  isSharedAsset?: boolean; // Tài nguyên chung (Admin upload)
}

// --- MOCK DATA ---
const FILES: ResourceFile[] = [
  {
    id: "1",
    name: "banner_khoa_hoc_ielts.png",
    type: "IMAGE",
    size: "2.4 MB",
    uploadedBy: "Admin",
    uploadedAt: "Hôm nay",
    url: "#",
    isSharedAsset: true,
  },
  {
    id: "2",
    name: "video_gioi_thieu.mp4",
    type: "VIDEO",
    size: "150 MB",
    uploadedBy: "Admin",
    uploadedAt: "Hôm qua",
    url: "#",
    isSharedAsset: true,
  },
  {
    id: "3",
    name: "bai_tap_unit_1.pdf",
    type: "DOCUMENT",
    size: "0.5 MB",
    uploadedBy: "Cô Lan Anh",
    uploadedAt: "2 ngày trước",
    url: "#",
  },
  {
    id: "4",
    name: "audio_listen_part1.mp3",
    type: "AUDIO",
    size: "5.2 MB",
    uploadedBy: "Thầy John",
    uploadedAt: "3 ngày trước",
    url: "#",
  },
  {
    id: "5",
    name: "raw_video_draft.mp4",
    type: "VIDEO",
    size: "520 MB",
    uploadedBy: "Thầy Hùng",
    uploadedAt: "1 tuần trước",
    url: "#",
  }, // File nặng cần xóa
];

export default function ResourceLibraryPage() {
  const [selectedType, setSelectedType] = useState<"ALL" | FileType>("ALL");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Stats giả lập
  const storageUsed = 82; // %

  const handleSelect = (id: string) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter((fid) => fid !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const getIcon = (type: FileType) => {
    switch (type) {
      case "IMAGE":
        return <FileImage size={24} className="text-purple-500" />;
      case "VIDEO":
        return <FileVideo size={24} className="text-red-500" />;
      case "AUDIO":
        return <FileAudio size={24} className="text-yellow-500" />;
      default:
        return <FileText size={24} className="text-blue-500" />;
    }
  };

  const filteredFiles = FILES.filter(
    (f) => selectedType === "ALL" || f.type === selectedType,
  );

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER & STORAGE ALERT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Kho Tài Nguyên</h1>
          <p className="text-slate-500 mt-1">
            Quản lý file hệ thống, tài sản chung và kiểm soát dung lượng.
          </p>
        </div>

        {/* Storage Bar Widget */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full md:w-80">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-600 flex items-center gap-1">
              <HardDrive size={12} /> Cloud Storage
            </span>
            <span
              className={storageUsed > 80 ? "text-red-600" : "text-slate-600"}
            >
              {storageUsed}% / 1TB
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${storageUsed > 80 ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${storageUsed}%` }}
            ></div>
          </div>
          {storageUsed > 80 && (
            <p className="text-[10px] text-red-500 mt-2 font-medium">
              ⚠️ Dung lượng sắp đầy. Hãy xóa các file không cần thiết.
            </p>
          )}
        </div>
      </div>

      {/* 2. ACTIONS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
          {[
            { id: "ALL", label: "Tất cả", icon: null },
            { id: "IMAGE", label: "Hình ảnh", icon: FileImage },
            { id: "VIDEO", label: "Video", icon: FileVideo },
            { id: "DOCUMENT", label: "Tài liệu", icon: FileText },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${selectedType === type.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
            >
              {type.icon && <type.icon size={14} />} {type.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full md:w-auto">
          {selectedFiles.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition animate-in fade-in slide-in-from-right-2">
              <Trash2 size={18} /> Xóa ({selectedFiles.length})
            </button>
          )}
          <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
            <UploadCloud size={18} /> Tải lên Asset chung
          </button>
        </div>
      </div>

      {/* 3. FILE GRID/LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`bg-white p-4 rounded-xl border transition group cursor-pointer relative hover:shadow-md ${selectedFiles.includes(file.id) ? "border-blue-500 bg-blue-50/20" : "border-slate-200 hover:border-slate-300"}`}
            onClick={() => handleSelect(file.id)}
          >
            {/* Checkbox */}
            <div className="absolute top-3 left-3 z-10 text-blue-600">
              {selectedFiles.includes(file.id) ? (
                <CheckSquare size={20} fill="white" />
              ) : (
                <Square
                  size={20}
                  className="text-slate-300 group-hover:text-slate-400"
                />
              )}
            </div>

            {/* Menu */}
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                alert("Menu options");
              }}
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-slate-50 rounded-lg mb-3 flex items-center justify-center border border-slate-100">
              {getIcon(file.type)}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className="font-bold text-slate-700 text-sm truncate"
                  title={file.name}
                >
                  {file.name}
                </h4>
                {file.isSharedAsset && (
                  <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Shared
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>{file.size}</span>
                <span>{file.uploadedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

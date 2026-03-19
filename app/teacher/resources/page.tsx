"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Play,
  ExternalLink,
  Trash2,
  Edit,
  LayoutGrid,
  List,
  File,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Download,
} from "lucide-react";
import MediaUploadModal from "@/components/admin/media/MediaUploadModal";
import { mediaService } from "@/services/media.service";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
type MediaType = "ALL" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState<MediaType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data: any = await mediaService.getAll({
        type: activeTab === "ALL" ? undefined : activeTab,
        search: searchTerm,
      });
      setMediaList(data || []);
    } catch (error) {
      console.error("Lỗi tải media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchMedia(), 300);
    return () => clearTimeout(timeout);
  }, [activeTab, searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa file này?")) {
      try {
        await mediaService.delete(id);
        fetchMedia();
      } catch (error) {
        alert("Lỗi khi xóa file");
      }
    }
  };

  // --- HELPER: GET ICON & COLOR BY FILE TYPE ---
  const getFileIcon = (type: string, ext?: string) => {
    const extension = ext?.toLowerCase() || "";

    // 1. Media Types
    if (type === "VIDEO")
      return {
        icon: <Video size={32} />,
        color: "text-purple-500",
        bg: "bg-purple-50",
      };
    if (type === "AUDIO")
      return {
        icon: <Mic size={32} />,
        color: "text-pink-500",
        bg: "bg-pink-50",
      };
    if (type === "IMAGE")
      return {
        icon: <ImageIcon size={32} />,
        color: "text-blue-500",
        bg: "bg-blue-50",
      };

    // 2. Document Types (Dựa vào đuôi file)
    if (["pdf"].includes(extension))
      return {
        icon: <FileText size={32} />,
        color: "text-red-500",
        bg: "bg-red-50",
      };
    if (["xls", "xlsx", "csv"].includes(extension))
      return {
        icon: <FileSpreadsheet size={32} />,
        color: "text-green-600",
        bg: "bg-green-50",
      };
    if (["doc", "docx"].includes(extension))
      return {
        icon: <FileText size={32} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (["zip", "rar", "7z"].includes(extension))
      return {
        icon: <FileArchive size={32} />,
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    if (["js", "ts", "html", "css", "json"].includes(extension))
      return {
        icon: <FileCode size={32} />,
        color: "text-slate-600",
        bg: "bg-slate-100",
      };

    // Default
    return {
      icon: <File size={32} />,
      color: "text-slate-400",
      bg: "bg-slate-50",
    };
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6 bg-slate-50/50">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Kho Tài Nguyên
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Quản lý hình ảnh, video, âm thanh và tài liệu học tập.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <Plus size={20} /> Upload File
        </button>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
        {/* Tabs Filter */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-full xl:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "IMAGE", label: "Hình ảnh" },
            { id: "VIDEO", label: "Video" },
            { id: "AUDIO", label: "Âm thanh" },
            { id: "DOCUMENT", label: "Tài liệu" }, // Tab mới
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MediaType)}
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl text-sm font-medium outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-md transition ${viewMode === "GRID" ? "bg-white shadow text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-2 rounded-md transition ${viewMode === "LIST" ? "bg-white shadow text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MEDIA CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <File size={40} className="opacity-50" />
            </div>
            <p className="font-bold">Chưa có file nào.</p>
          </div>
        ) : (
          <div
            className={`${viewMode === "GRID" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6" : "flex flex-col gap-3"}`}
          >
            <AnimatePresence>
              {mediaList.map((item, index) => {
                const fileExt = item.url?.split(".").pop(); // Lấy đuôi file từ URL
                const { icon, color, bg } = getFileIcon(item.type, fileExt);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    key={item._id}
                    className={`
                      group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative
                      ${viewMode === "LIST" ? "flex items-center p-3 gap-4" : "flex flex-col"}
                    `}
                  >
                    {/* --- THUMBNAIL AREA --- */}
                    <div
                      className={`relative overflow-hidden flex items-center justify-center ${viewMode === "GRID" ? "aspect-[4/3] w-full bg-slate-50" : "w-16 h-16 rounded-xl shrink-0 " + bg}`}
                    >
                      {/* Image Preview */}
                      {item.type === "IMAGE" || item.thumbnail ? (
                        <img
                          src={item.thumbnail || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            // Fallback nếu ảnh lỗi -> hiện icon
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden",
                            );
                          }}
                        />
                      ) : null}

                      {/* Icon Fallback (Cho Document, Audio, hoặc ảnh lỗi) */}
                      <div
                        className={`${item.type === "IMAGE" || item.thumbnail ? "hidden" : "flex"} flex-col items-center justify-center w-full h-full ${bg} ${color} transition-colors group-hover:bg-opacity-80`}
                      >
                        {icon}
                        {viewMode === "GRID" && (
                          <span className="text-[10px] font-bold mt-2 uppercase tracking-wider opacity-60">
                            {fileExt || item.type}
                          </span>
                        )}
                      </div>

                      {/* Overlay Play Button (Video/Audio) */}
                      {(item.type === "VIDEO" || item.type === "AUDIO") && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                            <Play
                              size={18}
                              fill="currentColor"
                              className="ml-0.5"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* --- INFO AREA --- */}
                    <div
                      className={`flex-1 min-w-0 ${viewMode === "GRID" ? "p-4" : "py-1 pr-4"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <h3
                            className="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors"
                            title={item.title}
                          >
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                              {fileExt || "FILE"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(item.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          className={`flex gap-1 ${viewMode === "GRID" ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""}`}
                        >
                          {item.type === "DOCUMENT" ? (
                            <a
                              href={item.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Tải xuống"
                            >
                              <Download size={16} />
                            </a>
                          ) : (
                            <button
                              onClick={() => window.open(item.url, "_blank")}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem"
                            >
                              <ExternalLink size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <MediaUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchMedia()}
          initialData={editingItem}
        />
      )}
    </div>
  );
}

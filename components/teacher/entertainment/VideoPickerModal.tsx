"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  CheckCircle,
  Video,
  Plus,
  UploadCloud,
  Youtube,
  Loader2,
  Trash2,
  Clock,
} from "lucide-react";
import { mediaService } from "@/services/media.service";
import MediaUploadModal from "../../admin/media/MediaUploadModal";

// --- HELPER: Format thời gian (Giây -> MM:SS) ---
const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function VideoPickerModal({ isOpen, onClose, onSelect }: any) {
  const [activeTab, setActiveTab] = useState<"LIBRARY" | "NEW">("LIBRARY");
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Load danh sách
  useEffect(() => {
    if (isOpen && activeTab === "LIBRARY") {
      fetchLibrary();
    }
  }, [isOpen, activeTab, search]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res: any = await mediaService.getAll({ type: "VIDEO", search });
      setMediaList(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ XÓA VIDEO TRONG KHO ---
  const handleDeleteMedia = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Chặn sự kiện click chọn vào card
    if (
      confirm("Bạn có chắc chắn muốn xóa vĩnh viễn video này khỏi kho Media?")
    ) {
      try {
        await mediaService.delete(id);
        // Nếu đang chọn video này thì bỏ chọn
        if (selectedId === id) setSelectedId(null);
        // Refresh lại danh sách
        fetchLibrary();
      } catch (error) {
        alert("Lỗi khi xóa video!");
      }
    }
  };

  const handleConfirmSelect = () => {
    if (selectedId) {
      onSelect(selectedId);
      onClose();
    }
  };

  const handleCreateSuccess = (newMedia: any) => {
    if (newMedia?._id) {
      onSelect(newMedia._id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* HEADER */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Video size={20} className="text-blue-600" /> Chọn Video cho Tập
            phim
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b shrink-0">
          <button
            onClick={() => setActiveTab("LIBRARY")}
            className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === "LIBRARY" ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
          >
            <Video size={16} /> Chọn từ Kho Media
          </button>
          <button
            onClick={() => setActiveTab("NEW")}
            className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === "NEW" ? "border-green-600 text-green-600 bg-green-50" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
          >
            <Plus size={16} /> Upload / Link Mới
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden relative bg-slate-50">
          {/* --- TAB 1: LIBRARY --- */}
          {activeTab === "LIBRARY" && (
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="p-4 bg-white border-b">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none"
                    placeholder="Tìm kiếm video cũ (Peppa, Shark...)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaList.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedId(item._id)}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm ${selectedId === item._id ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"}`}
                      >
                        {/* Thumbnail Area */}
                        <div className="aspect-video bg-gray-100 relative group-hover:opacity-90 transition-opacity">
                          <img
                            src={
                              item.thumbnail ||
                              "https://via.placeholder.com/300x200?text=No+Thumb"
                            }
                            className="w-full h-full object-cover"
                            alt={item.title}
                          />

                          {/* Icon Provider */}
                          <div className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded text-[10px] backdrop-blur-sm">
                            {item.provider === "YOUTUBE" ? (
                              <Youtube size={12} />
                            ) : (
                              <UploadCloud size={12} />
                            )}
                          </div>

                          {/* Checkmark Selection */}
                          {selectedId === item._id && (
                            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center z-10">
                              <CheckCircle
                                className="text-blue-600 bg-white rounded-full"
                                size={32}
                                fill="white"
                              />
                            </div>
                          )}

                          {/* NÚT XÓA */}
                          <button
                            onClick={(e) => handleDeleteMedia(e, item._id)}
                            className="absolute top-1 right-1 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-20"
                            title="Xóa khỏi kho"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Info Area */}
                        <div className="p-2.5">
                          <p
                            className="text-xs font-bold text-slate-700 line-clamp-1 mb-1"
                            title={item.title}
                          >
                            {item.title}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              {/* Dùng hàm format để không bị lỗi hiển thị */}
                              {formatDuration(item.duration)}
                            </p>
                            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">
                              {item.provider === "YOUTUBE" ? "YT" : "FILE"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {mediaList.length === 0 && !loading && (
                  <p className="text-center text-gray-400 mt-10 text-sm">
                    Không tìm thấy video nào.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-white border-t flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmSelect}
                  disabled={!selectedId}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Xác nhận chọn ({selectedId ? 1 : 0})
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 2: CREATE NEW --- */}
          {activeTab === "NEW" && (
            <div className="h-full overflow-y-auto p-4 flex justify-center bg-gray-50">
              <div className="w-full max-w-xl bg-white p-0 rounded-xl shadow-none border-none">
                <MediaUploadModal
                  isOpen={true}
                  onClose={() => {}}
                  onSuccess={handleCreateSuccess}
                  isEmbedded={true}
                  initialData={{ type: "VIDEO", provider: "YOUTUBE" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

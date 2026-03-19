import { useEffect, useState } from "react";
import { X, Upload, Link as LinkIcon, Loader2, Save } from "lucide-react";
import { mediaService } from "@/services/media.service";
import { courseService } from "@/services/course.service";

export default function VideoConfigModal({
  isOpen,
  onClose,
  onSave,
  initialUrl,
}: any) {
  const [activeTab, setActiveTab] = useState<"LINK" | "UPLOAD">("LINK");
  const [url, setUrl] = useState(initialUrl || "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen) setUrl(initialUrl || "");
  }, [isOpen, initialUrl]);

  const handleSave = async () => {
    if (activeTab === "UPLOAD" && file) {
      try {
        setUploading(true);
        // Gọi API upload file
        const res: any = await mediaService.uploadFile(file);

        const finalUrl = res.url || res;

        onSave(finalUrl); // Chỉ gửi chuỗi string URL đi
      } catch (e) {
        console.error(e);
        alert("Lỗi upload video");
      } finally {
        setUploading(false);
      }
    } else {
      // Tab Link
      onSave(url);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-slate-800">
            🎥 Cấu hình Video bài giảng
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("LINK")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "LINK"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LinkIcon size={16} /> Dán Link (Youtube)
          </button>
          <button
            onClick={() => setActiveTab("UPLOAD")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "UPLOAD"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Upload size={16} /> Tải lên (Local)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === "LINK" ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">
                Đường dẫn Video
              </label>
              <input
                className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-2">
                Hỗ trợ Youtube, Vimeo hoặc link MP4 trực tiếp.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                />
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  {file ? file.name : "Kéo thả hoặc chọn video từ máy"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  MP4, WebM (Max 50MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 text-sm font-bold hover:bg-gray-200 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            Lưu Video
          </button>
        </div>
      </div>
    </div>
  );
}

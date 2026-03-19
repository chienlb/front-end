"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Youtube,
  UploadCloud,
  Link as LinkIcon,
  Loader2,
  Save,
  Image as ImageIcon,
  Video,
  Mic,
  Trash2,
  Check,
} from "lucide-react";
import { mediaService } from "@/services/media.service";

export default function MediaUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEmbedded = false,
}: any) {
  const [tab, setTab] = useState<"YOUTUBE" | "UPLOAD">("YOUTUBE");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [mediaType, setMediaType] = useState("VIDEO");
  const [provider, setProvider] = useState("YOUTUBE");

  // Preview State
  const [youtubePreview, setYoutubePreview] = useState<any>(null);
  const [localPreview, setLocalPreview] = useState<any>(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setUrl(initialData.url || "");
      setTags(initialData.tags?.join(", ") || "");
      setMediaType(initialData.type || "VIDEO");
      setProvider(initialData.provider || "YOUTUBE");

      if (initialData.provider === "YOUTUBE") {
        setTab("YOUTUBE");
        // Logic trích xuất ID youtube để hiện thumbnail khi edit
        const videoIdMatch = initialData.url?.match(/v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : "";
        setYoutubePreview({ thumbnail: initialData.thumbnail, videoId });
      } else {
        setTab("UPLOAD");
        setLocalPreview({ type: initialData.type, url: initialData.url });
      }
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setTags("");
    setYoutubePreview(null);
    setLocalPreview(null);
    setTab("YOUTUBE");
    setProvider("YOUTUBE");
    setMediaType("VIDEO");
  };

  // --- 2. HANDLERS ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res: any = await mediaService.uploadFile(file);
      setUrl(res.url);
      setProvider("LOCAL");

      if (file.type.startsWith("image/")) {
        setMediaType("IMAGE");
        setLocalPreview({ type: "IMAGE", url: res.url });
      } else if (file.type.startsWith("video/")) {
        setMediaType("VIDEO");
        setLocalPreview({ type: "VIDEO", url: res.url });
      } else if (file.type.startsWith("audio/")) {
        setMediaType("AUDIO");
        setLocalPreview({ type: "AUDIO", url: res.url });
      }

      if (!title) setTitle(file.name);
    } catch (error) {
      alert("Lỗi upload file!");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchYoutube = () => {
    const videoIdMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      setMediaType("VIDEO");
      setProvider("YOUTUBE");
      setYoutubePreview({
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoId: videoId,
      });
      if (!title) setTitle(`Youtube Video ${videoId}`);
    } else {
      alert("Link YouTube không hợp lệ");
    }
  };

  const handleSave = async () => {
    if (!title || !url) return alert("Vui lòng nhập đủ thông tin!");

    setLoading(true);
    try {
      const payload = {
        title,
        url,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        type: mediaType,
        provider: provider,
        thumbnail:
          youtubePreview?.thumbnail || (mediaType === "IMAGE" ? url : ""),
      };

      let result;
      if (initialData?._id) {
        result = await mediaService.update(initialData._id, payload);
      } else {
        result = await mediaService.create(payload);
      }

      onSuccess(result); // Trả về object vừa tạo/sửa
      if (!isEmbedded) onClose(); // Chỉ đóng nếu là modal thường
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- GIAO DIỆN NỘI DUNG ---
  const content = (
    <div
      className={`bg-white flex flex-col overflow-hidden h-full ${isEmbedded ? "" : "rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh]"}`}
    >
      {!isEmbedded && (
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="font-bold text-lg text-slate-800">
            {initialData ? "Chỉnh sửa Tài nguyên" : "Thêm Tài nguyên Mới"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      )}

      {/* TAB HEADER */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => {
            setTab("YOUTUBE");
            setProvider("YOUTUBE");
          }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 
          ${tab === "YOUTUBE" ? "text-red-600 border-b-2 border-red-600 bg-red-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Youtube size={18} /> YouTube
        </button>
        <button
          onClick={() => {
            setTab("UPLOAD");
            setProvider("LOCAL");
          }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 
          ${tab === "UPLOAD" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <UploadCloud size={18} /> Upload File
        </button>
      </div>

      {/* BODY (SCROLLABLE) */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* TAB YOUTUBE */}
        {tab === "YOUTUBE" ? (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Dán link YouTube Video
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 outline-none"
                  />
                </div>
                <button
                  onClick={handleFetchYoutube}
                  className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
                >
                  Check
                </button>
              </div>
            </div>
            {youtubePreview && (
              <div className="bg-gray-50 p-3 rounded-xl flex gap-3 border border-gray-200">
                <img
                  src={youtubePreview.thumbnail}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <Check size={12} /> Video hợp lệ
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ID: {youtubePreview.videoId}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* TAB UPLOAD */
          <>
            {!localPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 transition relative"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 mb-3 shadow-sm">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-bold text-blue-700">
                      Click để tải file lên
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      Hỗ trợ: Video, Audio, Ảnh (Max 10MB)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5">
                <button
                  onClick={() => {
                    setLocalPreview(null);
                    setUrl("");
                    fileInputRef.current!.value = "";
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:text-red-500 z-10"
                >
                  <Trash2 size={16} />
                </button>
                {localPreview.type === "IMAGE" && (
                  <img
                    src={localPreview.url}
                    className="w-full h-48 object-contain bg-white"
                  />
                )}
                {localPreview.type === "VIDEO" && (
                  <video
                    src={localPreview.url}
                    controls
                    className="w-full h-48 bg-black"
                  />
                )}
                {localPreview.type === "AUDIO" && (
                  <div className="flex flex-col items-center justify-center h-32 bg-gray-100">
                    <Mic size={40} className="text-orange-500 mb-2" />
                    <audio
                      src={localPreview.url}
                      controls
                      className="w-11/12"
                    />
                  </div>
                )}
                <div className="p-2 bg-white text-center border-t">
                  <span className="text-xs font-bold text-green-600">
                    Đã tải lên server ✅
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* COMMON FIELDS */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Tên hiển thị
          </label>
          <input
            className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Video học màu sắc..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Tags (Phân loại)
          </label>
          <input
            className="w-full border p-2 rounded-lg text-sm focus:border-blue-500 outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="VD: grade1, animals"
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 text-sm"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Save size={16} /> Lưu vào Kho
            </>
          )}
        </button>
      </div>
    </div>
  );

  // --- RENDER LOGIC ---
  if (isEmbedded) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {content}
    </div>
  );
}

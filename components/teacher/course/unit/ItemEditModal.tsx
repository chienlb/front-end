"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Loader2,
  Video,
  Type,
  Upload,
  Gift,
  Coins,
  Gem,
  Zap,
  Book,
  Package,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  Radio,
  Gamepad2,
  Link as LinkIcon,
  CloudUpload,
  Clock,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { courseService } from "@/services/course.service";
import RewardSelector from "@/components/teacher/course/RewardSelector";
import ExamCreator from "@/components/teacher/course/unit/lesson/ExamCreator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: "unit" | "lesson";
  data: any;
  onSave: () => void;
}

export default function ItemEditModal({
  isOpen,
  onClose,
  type,
  data,
  onSave,
}: Props) {
  // --- TABS ---
  const [activeTab, setActiveTab] = useState<"INFO" | "CONTENT" | "REWARD">(
    "INFO",
  );
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- 1. INFO STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // CONFIG CHO LESSON
  const [lessonType, setLessonType] = useState("GAME");
  const [liveConfig, setLiveConfig] = useState({
    duration: 90, // Thời lượng phút
    autoRecord: true, // Tự động lưu video
    allowMic: true, // Cho phép học sinh bật mic
  });

  // --- 2. CONTENT STATE (Video, Image, Materials) ---
  const [videoUrl, setVideoUrl] = useState("");
  const [bgUrl, setBgUrl] = useState("");

  // Materials
  const [materials, setMaterials] = useState<
    { name: string; url: string; type: "LINK" | "FILE" }[]
  >([]);
  const materialInputRef = useRef<HTMLInputElement>(null);

  // --- 3. REWARD STATE ---
  const [rewards, setRewards] = useState({
    gold: 0,
    diamond: 0,
    xp: 0,
    handbookItems: "",
    items: "",
  });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<"HANDBOOK" | "ITEM">(
    "HANDBOOK",
  );

  // State Exam
  const [showExamCreator, setShowExamCreator] = useState(false);
  const [examData, setExamData] = useState<any>(null); // Lưu cấu trúc đề thi

  // --- LOAD DATA ---
  useEffect(() => {
    if (data && isOpen) {
      setTitle(data.title || "");
      setLessonType(data.type || "GAME");
      setDescription(data.description || "");

      // Load Live Config (Nếu có trong DB, nếu không dùng default)
      if (data.liveConfig) {
        setLiveConfig({
          duration: data.liveConfig.duration || 90,
          autoRecord: data.liveConfig.autoRecord ?? true,
          allowMic: data.liveConfig.allowMic ?? true,
        });
      }

      setVideoUrl(data.videoUrl || "");
      setBgUrl(data.backgroundImage || "");

      // Load Materials
      const loadedMaterials = (data.materials || []).map((url: string) => ({
        name: url.split("/").pop() || "Tài liệu",
        url: url,
        type: url.startsWith("http") ? "LINK" : "FILE",
      }));
      setMaterials(loadedMaterials);

      setRewards({
        gold: data.rewards?.gold || 0,
        diamond: data.rewards?.diamond || 0,
        xp: data.rewards?.xp || 0,
        handbookItems: data.rewards?.handbookItems?.join(",") || "",
        items: data.rewards?.items?.join(",") || "",
      });

      // Load Exam Data nếu có
      if (data.examConfig) {
        setExamData(data.examConfig);
      }
    }
  }, [data, isOpen]);

  // --- HELPER UPLOAD CHUNG ---
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res: any = await courseService.uploadFile(file);
      setIsUploading(false);
      return res.url || res; // Trả về URL ảnh/file
    } catch (e) {
      setIsUploading(false);
      alert("Upload thất bại!");
      return null;
    }
  };

  // --- HANDLERS MATERIALS ---
  const addMaterialLink = () => {
    const link = prompt("Nhập đường dẫn tài liệu (Google Drive, PDF...):");
    if (link && link.trim()) {
      setMaterials([
        ...materials,
        { name: "Link Tài liệu", url: link.trim(), type: "LINK" },
      ]);
    }
  };

  const handleMaterialFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleUploadFile(file);
    if (url) {
      setMaterials([...materials, { name: file.name, url: url, type: "FILE" }]);
    }
    // Reset input
    if (materialInputRef.current) materialInputRef.current.value = "";
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  // --- HANDLERS VIDEO & BG ---
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "VIDEO" | "BG",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleUploadFile(file);
    if (url) {
      if (type === "VIDEO") setVideoUrl(url);
      else setBgUrl(url);
    }
  };

  // --- HANDLERS REWARD ---
  const handleConfirmSelector = (ids: string[]) => {
    if (selectorType === "HANDBOOK")
      setRewards({ ...rewards, handbookItems: ids.join(",") });
    else setRewards({ ...rewards, items: ids.join(",") });
    setSelectorOpen(false);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const materialUrls = materials.map((m) => m.url);

      const cleanHandbookIds = rewards.handbookItems.split(",").filter(Boolean);
      const cleanItemIds = rewards.items.split(",").filter(Boolean);

      const payload = {
        title,
        description,
        type: lessonType,
        videoUrl,
        backgroundImage: bgUrl,
        materials: materialUrls,
        // Lưu cấu hình Live
        liveConfig: lessonType === "LIVE_SESSION" ? liveConfig : undefined,
        rewards: {
          gold: rewards.gold,
          diamond: rewards.diamond,
          xp: rewards.xp,
          handbookItems: cleanHandbookIds,
          items: cleanItemIds,
        },
        examConfig: lessonType === "EXAM" ? examData : undefined,
      };

      if (type === "unit") {
        await courseService.updateUnit(data._id, payload);
      } else {
        await courseService.updateLesson(data._id, payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* HEADER */}
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {type === "unit" ? "📂 Cấu hình Unit" : "📝 Chi tiết Bài học"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* TABS */}
          <div className="flex border-b bg-white px-4">
            {["INFO", "CONTENT", "REWARD"].map((tab: any) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {tab === "INFO"
                  ? "Thông tin chung"
                  : tab === "CONTENT"
                    ? "Nội dung & Media"
                    : "Quà tặng"}
              </button>
            ))}
          </div>

          {/* BODY */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar"
          >
            {/* --- TAB 1: INFO & SETTINGS --- */}
            {activeTab === "INFO" && (
              <div className="space-y-5 animate-in fade-in">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Tiêu đề
                  </label>
                  <div className="relative">
                    <Type
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={16}
                    />
                    <input
                      required
                      className="w-full border border-slate-300 pl-9 pr-3 py-2.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tên bài học..."
                    />
                  </div>
                </div>

                {/* Lesson Type Selection */}
                {type === "lesson" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Loại bài học
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        {
                          id: "GAME",
                          icon: Gamepad2,
                          label: "Game",
                          color: "purple",
                        },
                        {
                          id: "LIVE_SESSION",
                          icon: Radio,
                          label: "Live Class",
                          color: "red",
                        },
                        {
                          id: "VIDEO",
                          icon: Video,
                          label: "Video",
                          color: "blue",
                        },
                        {
                          id: "EXAM",
                          icon: FileText,
                          label: "Kiểm tra",
                          color: "orange",
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLessonType(t.id)}
                          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition ${lessonType === t.id ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700` : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"}`}
                        >
                          <t.icon size={20} />
                          <span className="text-xs font-bold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nút cấu hình Exam */}
                {lessonType === "EXAM" && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-orange-800 text-sm">
                          Cấu hình bài kiểm tra
                        </h4>
                        <p className="text-xs text-orange-600 mt-1">
                          {examData
                            ? `Đã tạo: ${examData.questions?.length || 0} câu hỏi • ${examData.durationMinutes} phút`
                            : "Chưa có nội dung đề thi"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExamCreator(true)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                      >
                        {examData ? "Chỉnh sửa đề" : "Tạo đề thi"}{" "}
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* LIVE CONFIGURATION */}
                {lessonType === "LIVE_SESSION" && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-4">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                      <Radio size={16} /> Cấu hình phòng Live
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">
                          Thời lượng (phút)
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-2.5 text-slate-400"
                            size={16}
                          />
                          <input
                            type="number"
                            className="w-full pl-9 border p-2 rounded-lg text-sm"
                            value={liveConfig.duration}
                            onChange={(e) =>
                              setLiveConfig({
                                ...liveConfig,
                                duration: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-red-600 cursor-pointer"
                          checked={liveConfig.autoRecord}
                          onChange={(e) =>
                            setLiveConfig({
                              ...liveConfig,
                              autoRecord: e.target.checked,
                            })
                          }
                        />
                        <label className="text-sm font-medium text-slate-700">
                          Tự động lưu Video (Record)
                        </label>
                      </div>
                    </div>
                    <div className="text-xs text-red-600 bg-white p-2 rounded border border-red-100 flex items-center gap-2">
                      <AlertCircle size={12} /> Video sẽ tự động lưu vào hệ
                      thống sau khi buổi học kết thúc.
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Mô tả / Lời dặn
                  </label>
                  <textarea
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="VD: Các em nhớ ôn tập từ vựng trước khi vào lớp..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* --- TAB 2: CONTENT & MEDIA --- */}
            {activeTab === "CONTENT" && (
              <div className="space-y-6 animate-in fade-in">
                {/* 1. TÀI LIỆU (MATERIALS) - Nâng cấp Import Local */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase flex justify-between">
                    <span>Tài liệu đính kèm ({materials.length})</span>
                  </label>

                  {/* List Materials */}
                  {materials.length > 0 && (
                    <div className="grid gap-2">
                      {materials.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={`p-2 rounded-lg ${m.type === "FILE" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                            >
                              {m.type === "FILE" ? (
                                <FileText size={18} />
                              ) : (
                                <LinkIcon size={18} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">
                                {m.name}
                              </p>
                              <a
                                href={m.url}
                                target="_blank"
                                className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]"
                              >
                                {m.url}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMaterial(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => materialInputRef.current?.click()}
                      className="flex-1 py-2 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <CloudUpload size={18} /> Upload File (PDF/Doc)
                    </button>
                    <input
                      type="file"
                      hidden
                      ref={materialInputRef}
                      onChange={handleMaterialFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                    />

                    <button
                      type="button"
                      onClick={addMaterialLink}
                      className="flex-1 py-2 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition"
                    >
                      <LinkIcon size={18} /> Thêm Link Google Drive
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* 2. VIDEO INTRO */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                    <Video size={14} /> Video Bài Giảng / Intro
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Dán link hoặc Upload..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 rounded-xl flex items-center justify-center text-slate-600">
                      <Upload size={18} />
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={(e) => handleMediaUpload(e, "VIDEO")}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. BACKGROUND IMAGE */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                    <ImageIcon size={14} /> Ảnh nền (Thumbnail)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center relative hover:bg-slate-50 cursor-pointer group transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleMediaUpload(e, "BG")}
                    />
                    {bgUrl ? (
                      <div className="relative h-40 w-full">
                        <img
                          src={bgUrl}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition rounded-lg font-bold">
                          Thay ảnh khác
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center">
                        <div className="bg-slate-100 p-3 rounded-full mb-2 group-hover:bg-blue-100 transition">
                          <ImageIcon
                            size={24}
                            className="text-slate-400 group-hover:text-blue-500"
                          />
                        </div>
                        <p className="text-sm font-bold text-slate-600">
                          Kéo thả hoặc Click để tải ảnh
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: REWARD --- */}
            {activeTab === "REWARD" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex gap-3">
                  <Gift size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Phần thưởng hoàn thành:</strong> Học sinh sẽ nhận
                    được số quà này sau khi hoàn thành bài học.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border p-3 rounded-xl">
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Vàng
                    </label>
                    <div className="flex items-center gap-2">
                      <Coins className="text-yellow-500" size={20} />
                      <input
                        type="number"
                        min="0"
                        className="w-full outline-none font-bold text-slate-700"
                        value={rewards.gold}
                        onChange={(e) =>
                          setRewards({
                            ...rewards,
                            gold: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-white border p-3 rounded-xl">
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Kim cương
                    </label>
                    <div className="flex items-center gap-2">
                      <Gem className="text-blue-400" size={20} />
                      <input
                        type="number"
                        min="0"
                        className="w-full outline-none font-bold text-slate-700"
                        value={rewards.diamond}
                        onChange={(e) =>
                          setRewards({
                            ...rewards,
                            diamond: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-white border p-3 rounded-xl">
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      XP
                    </label>
                    <div className="flex items-center gap-2">
                      <Zap className="text-purple-500" size={20} />
                      <input
                        type="number"
                        min="0"
                        className="w-full outline-none font-bold text-slate-700"
                        value={rewards.xp}
                        onChange={(e) =>
                          setRewards({ ...rewards, xp: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Vật phẩm kèm theo
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl text-sm text-slate-600 truncate border border-slate-200">
                      <Book size={16} className="inline mr-2 text-blue-500" />
                      {rewards.handbookItems
                        ? `${rewards.handbookItems.split(",").length} thẻ bài`
                        : "Chưa có thẻ bài"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectorType("HANDBOOK");
                        setSelectorOpen(true);
                      }}
                      className="bg-white border border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 px-4 rounded-xl text-sm font-bold transition"
                    >
                      Chọn
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl text-sm text-slate-600 truncate border border-slate-200">
                      <Package
                        size={16}
                        className="inline mr-2 text-purple-500"
                      />
                      {rewards.items
                        ? `${rewards.items.split(",").length} vật phẩm`
                        : "Chưa có vật phẩm"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectorType("ITEM");
                        setSelectorOpen(true);
                      }}
                      className="bg-white border border-slate-300 hover:border-purple-500 text-slate-600 hover:text-purple-600 px-4 rounded-xl text-sm font-bold transition"
                    >
                      Chọn
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* FOOTER */}
          <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isUploading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {loading || isUploading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* SELECTOR MODAL */}
      <RewardSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        type={selectorType}
        selectedIds={
          selectorType === "HANDBOOK"
            ? rewards.handbookItems
              ? rewards.handbookItems.split(",")
              : []
            : rewards.items
              ? rewards.items.split(",")
              : []
        }
        onConfirm={handleConfirmSelector}
      />

      {/* EXAM CREATOR MODAL OVERLAY */}
      {showExamCreator && (
        <div className="fixed inset-0 z-[60] bg-slate-100 flex flex-col">
          {/* Header Modal Fullscreen */}
          <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
            <h3 className="font-black text-xl text-slate-800">
              Soạn Thảo Đề Thi
            </h3>
            <button
              onClick={() => setShowExamCreator(false)}
              className="text-slate-500 hover:text-red-500 font-bold flex items-center gap-2"
            >
              <X size={20} /> Đóng
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <ExamCreator
              initialData={examData}
              onSave={(data) => {
                setExamData(data);
                setShowExamCreator(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

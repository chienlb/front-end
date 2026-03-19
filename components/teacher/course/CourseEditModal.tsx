"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Save,
  Loader2,
  Coins,
  Gem,
  Gift,
  Zap,
  Book,
  Package,
} from "lucide-react";
import { courseService } from "@/services/course.service";
import RewardSelector from "@/components/teacher/course/RewardSelector";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSave: () => void;
}

export default function CourseEditModal({
  isOpen,
  onClose,
  data,
  onSave,
}: Props) {
  const [activeTab, setActiveTab] = useState<"INFO" | "REWARD">("INFO");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });

  // State Rewards
  const [rewards, setRewards] = useState({
    gold: 0,
    diamond: 0,
    xp: 0,
    handbookItems: "", // Lưu dạng chuỗi
    items: "", // Lưu dạng chuỗi
  });

  // 2. STATE CHO SELECTOR
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<"HANDBOOK" | "ITEM">(
    "HANDBOOK",
  );

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        thumbnail: data.thumbnail || "",
      });
      setRewards({
        gold: data.rewards?.gold || 0,
        diamond: data.rewards?.diamond || 0,
        xp: data.rewards?.xp || 0,
        // Chuyển Mảng -> Chuỗi
        handbookItems: data.rewards?.handbookItems?.join(",") || "",
        items: data.rewards?.items?.join(",") || "",
      });
    }
  }, [data, isOpen]);

  // 3. HELPER FUNCTIONS
  const openSelector = (type: "HANDBOOK" | "ITEM") => {
    setSelectorType(type);
    setSelectorOpen(true);
  };

  const handleConfirmSelector = (ids: string[]) => {
    if (selectorType === "HANDBOOK") {
      setRewards({ ...rewards, handbookItems: ids.join(",") });
    } else {
      setRewards({ ...rewards, items: ids.join(",") });
    }
    setSelectorOpen(false);
  };

  if (!isOpen) return null;

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const res: any = await courseService.uploadFile(file);
      setFormData({ ...formData, thumbnail: res.url || res });
    } catch (err) {
      alert("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chuyển Chuỗi -> Mảng
      const cleanHandbookIds = rewards.handbookItems
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanItemIds = rewards.items
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        rewards: {
          gold: rewards.gold,
          diamond: rewards.diamond,
          xp: rewards.xp,
          handbookItems: cleanHandbookIds, // Gửi mảng
          items: cleanItemIds, // Gửi mảng
        },
      };
      await courseService.updateCourse(data._id, payload);
      onSave();
      onClose();
    } catch (err) {
      alert("Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MODAL CHÍNH */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-lg">✏️ Chỉnh sửa khóa học</h3>
            <button onClick={onClose}>
              <X size={20} className="text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {/* TABS */}
          <div className="flex border-b bg-white">
            <button
              onClick={() => setActiveTab("INFO")}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === "INFO" ? "border-blue-600 text-blue-600" : "text-gray-500"}`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab("REWARD")}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-1 ${activeTab === "REWARD" ? "border-orange-500 text-orange-600" : "text-gray-500"}`}
            >
              <Gift size={16} /> Quà hoàn thành
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto"
          >
            {/* TAB INFO */}
            {activeTab === "INFO" && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tên khóa học
                  </label>
                  <input
                    required
                    className="w-full border p-2 rounded-lg"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border p-2 rounded-lg"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Ảnh bìa
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.thumbnail && (
                      <img
                        src={formData.thumbnail}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-dashed border-gray-400">
                      {uploading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Upload size={18} />
                      )}{" "}
                      <span className="text-sm font-bold">Tải ảnh</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB REWARD */}
            {activeTab === "REWARD" && (
              <div className="animate-in fade-in space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                      Vàng
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border p-2 rounded-lg"
                      value={rewards.gold}
                      onChange={(e) =>
                        setRewards({ ...rewards, gold: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                      Kim cương
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border p-2 rounded-lg"
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
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded-lg"
                    value={rewards.xp}
                    onChange={(e) =>
                      setRewards({ ...rewards, xp: Number(e.target.value) })
                    }
                  />
                </div>

                <hr className="border-gray-100" />

                {/* UI CHỌN THẺ BÀI */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 flex items-center gap-1">
                    <Book size={14} /> ID Thẻ bài (Handbook IDs)
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      className="flex-1 border p-2 rounded-lg text-sm bg-slate-50 text-slate-500"
                      value={
                        rewards.handbookItems
                          ? `${rewards.handbookItems.split(",").length} thẻ đã chọn`
                          : "Chưa chọn thẻ nào"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => openSelector("HANDBOOK")}
                      className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-100"
                    >
                      + Chọn thẻ
                    </button>
                  </div>
                </div>

                {/* UI CHỌN VẬT PHẨM */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 flex items-center gap-1">
                    <Package size={14} /> ID Vật phẩm (Item IDs)
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      className="flex-1 border p-2 rounded-lg text-sm bg-slate-50 text-slate-500"
                      value={
                        rewards.items
                          ? `${rewards.items.split(",").length} vật phẩm đã chọn`
                          : "Chưa chọn vật phẩm nào"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => openSelector("ITEM")}
                      className="bg-purple-50 text-purple-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 border border-purple-100"
                    >
                      + Chọn đồ
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />} Lưu
                thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RENDER SELECTOR */}
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
    </>
  );
}

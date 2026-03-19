"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Award, Star } from "lucide-react";
import { gamificationService } from "@/services/gamification.service";
import MediaUploader from "../../teacher/practice/forms/MediaUploader";

export default function BadgeEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tier: "Bronze",
    imageUrl: "",
    criteria: { type: "TOTAL_XP", value: 100 },
    rewards: { gold: 0, diamond: 0 },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        tier: initialData.tier || "Bronze",
        imageUrl: initialData.imageUrl || "",
        criteria: initialData.criteria || { type: "TOTAL_XP", value: 100 },
        rewards: initialData.rewards || { gold: 0, diamond: 0 },
      });
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        tier: "Bronze",
        imageUrl: "",
        criteria: { type: "TOTAL_XP", value: 100 },
        rewards: { gold: 0, diamond: 0 },
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.imageUrl)
      return alert("Vui lòng nhập tên và ảnh huy hiệu!");
    setLoading(true);
    try {
      if (initialData?._id) {
        await gamificationService.updateBadge(initialData._id, formData);
      } else {
        await gamificationService.createBadge(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi lưu huy hiệu");
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Platinum":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Diamond":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {initialData ? "Chỉnh sửa Huy hiệu" : "Thiết kế Huy hiệu mới"}
              </h3>
              <p className="text-xs text-gray-500">
                Tạo phần thưởng để khích lệ học viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-50 hover:text-red-500 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="flex gap-6">
            {/* Cột trái: Ảnh */}
            <div className="w-1/3 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Hình ảnh Huy hiệu
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 hover:bg-gray-50 transition">
                <MediaUploader
                  type="image"
                  value={formData.imageUrl}
                  onChange={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                />
              </div>
              <div
                className={`p-3 rounded-lg border text-center ${getTierColor(
                  formData.tier,
                )}`}
              >
                <p className="text-xs font-bold uppercase tracking-wider">
                  Preview Rank
                </p>
                <p className="text-xl font-black">{formData.tier}</p>
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="w-2/3 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Tên Huy hiệu
                </label>
                <input
                  className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Chiến thần Diệt từ vựng"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  Mô tả hiển thị
                </label>
                <textarea
                  className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition h-20 resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="VD: Đạt được khi học thuộc 100 từ vựng mới..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Hạng (Tier)
                  </label>
                  <select
                    className="w-full border-2 border-gray-100 p-2.5 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData({ ...formData, tier: e.target.value })
                    }
                  >
                    <option value="Bronze">🥉 Bronze (Đồng)</option>
                    <option value="Silver">🥈 Silver (Bạc)</option>
                    <option value="Gold">🥇 Gold (Vàng)</option>
                    <option value="Platinum">💠 Platinum (Bạch kim)</option>
                    <option value="Diamond">💎 Diamond (Kim cương)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Cấu hình Điều kiện & Phần thưởng */}
          <div className="grid grid-cols-2 gap-6">
            {/* Điều kiện */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
              <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                🎯 Điều kiện đạt được
              </h4>

              <div>
                <label className="text-xs text-blue-600 font-bold">
                  Loại điều kiện
                </label>
                <select
                  className="w-full mt-1 border border-blue-200 rounded-lg p-2 text-sm font-medium"
                  value={formData.criteria.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      criteria: { ...formData.criteria, type: e.target.value },
                    })
                  }
                >
                  <option value="TOTAL_XP">⚡ Tổng XP tích lũy</option>
                  <option value="STREAK_DAYS">🔥 Chuỗi ngày (Streak)</option>
                  <option value="LESSONS_COMPLETED">
                    📚 Số bài học hoàn thành
                  </option>
                  <option value="GAMES_WON">🏆 Số trận thắng Game</option>
                  <option value="VOCAB_COLLECTED">
                    🔤 Số từ vựng đã thuộc
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs text-blue-600 font-bold">
                  Giá trị mục tiêu
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border border-blue-200 rounded-lg p-2 text-sm font-bold"
                  value={formData.criteria.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      criteria: {
                        ...formData.criteria,
                        value: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Phần thưởng */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-3">
              <h4 className="font-bold text-yellow-800 text-sm flex items-center gap-2">
                🎁 Phần thưởng đi kèm
              </h4>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-yellow-700 font-bold">
                    Vàng 💰
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 border border-yellow-200 rounded-lg p-2 text-sm font-bold text-yellow-600"
                    value={formData.rewards.gold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rewards: {
                          ...formData.rewards,
                          gold: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-cyan-700 font-bold">
                    Kim cương 💎
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1 border border-cyan-200 rounded-lg p-2 text-sm font-bold text-cyan-600"
                    value={formData.rewards.diamond}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rewards: {
                          ...formData.rewards,
                          diamond: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-[10px] text-yellow-600 italic mt-2">
                * Học viên sẽ nhận được quà này ngay khi mở khóa huy hiệu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl text-sm transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition transform active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Lưu Huy hiệu
          </button>
        </div>
      </div>
    </div>
  );
}

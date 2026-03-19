"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { gamificationService } from "@/services/gamification.service";

export default function LevelEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    level: 1,
    requiredXP: 100,
    rewards: { gold: 0, diamonds: 0 },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        level: initialData.level,
        requiredXP: initialData.requiredXP,
        rewards: initialData.rewards || { gold: 0, diamonds: 0 },
      });
    } else {
      setFormData({
        level: 1,
        requiredXP: 100,
        rewards: { gold: 50, diamonds: 0 },
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (initialData?._id) {
        await gamificationService.updateLevel(initialData._id, formData);
      } else {
        await gamificationService.createLevel(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi lưu cấp độ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">
            {initialData ? "Sửa Cấp độ" : "Thêm Cấp độ Mới"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Level
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                XP Yêu cầu
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.requiredXP}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredXP: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <label className="block text-xs font-bold text-purple-700 mb-2 uppercase">
              Phần thưởng khi đạt cấp
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Gold 💰</span>
                <input
                  type="number"
                  className="w-full border p-1 rounded text-sm"
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
              <div>
                <span className="text-xs text-gray-500">Diamonds 💎</span>
                <input
                  type="number"
                  className="w-full border p-1 rounded text-sm"
                  value={formData.rewards.diamonds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rewards: {
                        ...formData.rewards,
                        diamonds: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}{" "}
            Lưu lại
          </button>
        </div>
      </div>
    </div>
  );
}

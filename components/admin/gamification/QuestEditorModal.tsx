"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { gamificationService } from "@/services/gamification.service";

export default function QuestEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "LOGIN",
    target: 1,
    rewards: { gold: 0, xp: 0 },
    isActive: true,
  });

  // Load data khi edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        type: initialData.type,
        target: initialData.target,
        rewards: initialData.rewards || { gold: 0, xp: 0 },
        isActive: initialData.isActive,
      });
    } else {
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "LOGIN",
        target: 1,
        rewards: { gold: 50, xp: 10 },
        isActive: true,
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.title) return alert("Vui lòng nhập tên nhiệm vụ!");

    setLoading(true);
    try {
      if (initialData?._id) {
        await gamificationService.updateQuest(initialData._id, formData);
      } else {
        await gamificationService.createQuest(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi lưu nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">
            {initialData ? "Sửa Nhiệm vụ" : "Thêm Nhiệm vụ Mới"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Tên nhiệm vụ
            </label>
            <input
              className="w-full border p-2 rounded-lg text-sm"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="VD: Học sinh chăm chỉ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Loại nhiệm vụ
              </label>
              <select
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="LOGIN">Đăng nhập (LOGIN)</option>
                <option value="LEARNING_TIME">
                  Thời gian học (LEARNING_TIME)
                </option>
                <option value="LESSONS_COMPLETED">
                  Hoàn thành bài (LESSONS_COMPLETED)
                </option>
                <option value="GAME_WON">Thắng game (GAME_WON)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Mục tiêu (Target)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <label className="block text-xs font-bold text-yellow-700 mb-2 uppercase">
              Phần thưởng
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
                <span className="text-xs text-gray-500">XP ⭐</span>
                <input
                  type="number"
                  className="w-full border p-1 rounded text-sm"
                  value={formData.rewards.xp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rewards: {
                        ...formData.rewards,
                        xp: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <label htmlFor="active" className="text-sm font-medium">
              Kích hoạt nhiệm vụ này
            </label>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700"
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

"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { financeService } from "@/services/finance.service";

export default function PackageEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    duration: 30,
    badge: "",
    benefits: [""],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        originalPrice: initialData.originalPrice || 0,
        duration: initialData.duration,
        badge: initialData.badge || "",
        benefits: initialData.benefits?.length ? initialData.benefits : [""],
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        originalPrice: 0,
        duration: 30,
        badge: "",
        benefits: [""],
        isActive: true,
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0)
      return alert("Vui lòng nhập tên và giá hợp lệ!");

    setLoading(true);
    try {
      // Lọc bỏ các dòng lợi ích rỗng
      const payload = {
        ...formData,
        benefits: formData.benefits.filter((b) => b.trim() !== ""),
      };

      if (initialData?._id) {
        await financeService.updatePackage(initialData._id, payload);
      } else {
        await financeService.createPackage(payload);
      }

      onSuccess(); // Refresh list bên ngoài
      onClose();
    } catch (e) {
      alert("Lỗi khi lưu gói cước");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper quản lý mảng lợi ích
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefit = () =>
    setFormData({ ...formData, benefits: [...formData.benefits, ""] });

  const removeBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between bg-gray-50">
          <h3 className="font-bold text-lg text-slate-800">
            {initialData ? "Sửa Gói Cước" : "Thêm Gói Mới"}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Tên gói
            </label>
            <input
              className="w-full border p-2 rounded-lg text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Gói 1 Tháng"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Giá bán (VNĐ)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm font-bold text-blue-600"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Giá gốc (Gạch)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm text-gray-500 line-through"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Thời hạn (Ngày)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Nhãn (Badge)
              </label>
              <input
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.badge}
                onChange={(e) =>
                  setFormData({ ...formData, badge: e.target.value })
                }
                placeholder="VD: HOT 🔥"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Quyền lợi
            </label>
            <div className="space-y-2">
              {formData.benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 border p-2 rounded-lg text-sm"
                    value={b}
                    onChange={(e) => handleBenefitChange(i, e.target.value)}
                    placeholder={`Lợi ích ${i + 1}`}
                  />
                  <button
                    onClick={() => removeBenefit(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addBenefit}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Thêm dòng
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Đang mở bán
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

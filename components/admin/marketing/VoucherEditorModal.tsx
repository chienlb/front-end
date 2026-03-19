"use client";

import { useState } from "react";
import { X, Calendar, Percent, DollarSign } from "lucide-react";

export default function VoucherEditorModal({
  isOpen,
  onClose,
  initialData,
}: any) {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    type: initialData?.type || "PERCENT",
    value: initialData?.value || 0,
    maxReduce: initialData?.maxReduce || 0,
    quantity: initialData?.total || 100,
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    desc: initialData?.desc || "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-slate-800">
            {initialData ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Mã Code */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Mã Voucher (Viết liền không dấu)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full border-2 border-gray-300 border-dashed rounded-lg p-3 text-lg font-mono font-bold text-center uppercase tracking-widest focus:border-blue-500 outline-none"
                placeholder="VD: SALE2025"
              />
            </div>
          </div>

          {/* Loại giảm giá */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormData({ ...formData, type: "PERCENT" })}
              className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition
               ${
                 formData.type === "PERCENT"
                   ? "border-blue-500 bg-blue-50 text-blue-700"
                   : "border-gray-200 text-gray-500 hover:bg-gray-50"
               }`}
            >
              <Percent size={20} />
              <span className="text-xs font-bold">Theo Phần trăm (%)</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: "FIXED" })}
              className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition
               ${
                 formData.type === "FIXED"
                   ? "border-green-500 bg-green-50 text-green-700"
                   : "border-gray-200 text-gray-500 hover:bg-gray-50"
               }`}
            >
              <DollarSign size={20} />
              <span className="text-xs font-bold">Theo Số tiền (VND)</span>
            </button>
          </div>

          {/* Giá trị giảm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                {formData.type === "PERCENT"
                  ? "Số phần trăm giảm"
                  : "Số tiền giảm (VND)"}
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg font-bold"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: parseInt(e.target.value) })
                }
              />
            </div>
            {formData.type === "PERCENT" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Giảm tối đa (VND)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg"
                  value={formData.maxReduce}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxReduce: parseInt(e.target.value),
                    })
                  }
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            )}
          </div>

          {/* Số lượng & Mô tả */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Số lượng mã
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Mô tả ngắn
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg"
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                placeholder="Hiển thị cho user thấy..."
              />
            </div>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg"
          >
            Hủy
          </button>
          <button className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 shadow">
            Lưu Voucher
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, UploadCloud, Link as LinkIcon, Smartphone } from "lucide-react";

export default function BannerEditorModal({
  isOpen,
  onClose,
  initialData,
  type,
}: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    image: initialData?.image || "",
    link: initialData?.action || "",
    priority: initialData?.priority || 0,
    isActive: initialData?.isActive ?? true,
    startDate: "",
    endDate: "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex overflow-hidden max-h-[90vh]">
        {/* LEFT: FORM */}
        <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg text-slate-800">
              {initialData ? "Chỉnh sửa" : "Thêm mới"}{" "}
              {type === "POPUP" ? "Popup" : "Banner"}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Tên nội bộ (Admin quản lý)
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg text-sm"
                placeholder="VD: Chiến dịch hè 2026"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Hình ảnh ({type === "POPUP" ? "Dọc" : "Ngang"})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">
                {formData.image ? (
                  <img src={formData.image} className="h-32 object-contain" />
                ) : (
                  <>
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-xs">Upload ảnh</span>
                  </>
                )}
              </div>
              <input
                type="text"
                placeholder="Hoặc dán link ảnh..."
                className="w-full border p-2 rounded-lg text-xs mt-2"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            {/* Action / Deep Link */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Hành động khi bấm vào
              </label>
              <div className="flex gap-2">
                <select className="border p-2 rounded-lg text-sm bg-gray-50 font-bold w-1/3">
                  <option>Mở trong App (Deep Link)</option>
                  <option>Mở Web ngoài (Browser)</option>
                </select>
                <input
                  type="text"
                  className="flex-1 border p-2 rounded-lg text-sm"
                  placeholder="/shop, /course/1..."
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Thứ tự ưu tiên (Lớn hiện trước)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg text-sm"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Trạng thái
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium">Hiển thị ngay</span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">
                Lịch hiển thị (Tùy chọn)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="border p-1.5 rounded text-sm" />
                <input type="date" className="border p-1.5 rounded text-sm" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow">
              Lưu
            </button>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="w-[300px] bg-gray-100 flex items-center justify-center p-4 border-l border-gray-200">
          <div className="w-[260px] h-[520px] bg-white rounded-[30px] border-4 border-slate-800 shadow-xl overflow-hidden relative flex flex-col">
            {/* Phone Status Bar */}
            <div className="h-6 bg-slate-800 w-full"></div>

            {/* Phone Content */}
            <div className="flex-1 relative bg-gray-50">
              {/* Mock UI Home */}
              <div className="p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>

                {/* THE BANNER PREVIEW */}
                {type === "HOME_SLIDER" && (
                  <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden relative">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        Slider Area
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
              </div>

              {/* POPUP PREVIEW */}
              {type === "POPUP" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 z-20">
                  <div className="w-full aspect-[3/4] bg-white rounded-xl overflow-hidden relative shadow-2xl">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        Popup Image
                      </div>
                    )}
                    <button className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

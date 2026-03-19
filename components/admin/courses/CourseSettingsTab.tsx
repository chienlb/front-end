"use client";

import { useState } from "react";
import {
  DollarSign,
  Save,
  Image as ImageIcon,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CourseSettingsTab() {
  const [settings, setSettings] = useState({
    title: "Tiếng Anh Giao Tiếp Cơ Bản",
    category: "ngoai-ngu",
    level: "BEGINNER",
    price: 500000,
    salePrice: 299000,
    isFree: false,
    thumbnail: "",
    isPublished: true,
  });

  const handleSave = () => {
    alert("Đã lưu cấu hình khóa học!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 font-sans">
      {/* 1. Basic Info & Category */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <LayoutGrid size={20} className="text-indigo-600" /> Thông tin cơ bản
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tên khóa học
            </label>
            <input
              value={settings.title}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Danh mục
              </label>
              <select
                value={settings.category}
                onChange={(e) =>
                  setSettings({ ...settings, category: e.target.value })
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-600 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ngoai-ngu">Ngoại ngữ</option>
                <option value="toan-tu-duy">Toán tư duy</option>
                <option value="lap-trinh">Lập trình</option>
                <option value="ky-nang">Kỹ năng mềm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Trình độ
              </label>
              <select
                value={settings.level}
                onChange={(e) =>
                  setSettings({ ...settings, level: e.target.value })
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-600 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="BEGINNER">Cơ bản (Beginner)</option>
                <option value="INTERMEDIATE">Trung bình (Intermediate)</option>
                <option value="ADVANCED">Nâng cao (Advanced)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pricing Configuration */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-green-600" /> Thiết lập Giá &
          Học phí
        </h3>

        {/* Toggle Free */}
        <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-800 block">
              Khóa học miễn phí?
            </span>
            <span className="text-xs text-slate-500">
              Học viên có thể tham gia mà không cần thanh toán.
            </span>
          </div>
          <div
            onClick={() =>
              setSettings({ ...settings, isFree: !settings.isFree })
            }
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.isFree ? "bg-green-500" : "bg-slate-300"}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.isFree ? "left-7" : "left-1"}`}
            ></div>
          </div>
        </div>

        {!settings.isFree && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Giá gốc (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.price}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 pl-4 border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-green-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  VNĐ
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Giá khuyến mãi (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.salePrice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      salePrice: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 pl-4 border border-slate-200 rounded-xl font-bold text-green-600 outline-none focus:border-green-500 bg-green-50/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600">
                  VNĐ
                </span>
              </div>
              {settings.price > settings.salePrice && (
                <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Đang giảm{" "}
                  {(100 - (settings.salePrice / settings.price) * 100).toFixed(
                    0,
                  )}
                  %
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Thumbnail Image */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <ImageIcon size={20} className="text-pink-500" /> Ảnh bìa khóa học
        </h3>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer group">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <ImageIcon
              size={32}
              className="text-slate-300 group-hover:text-slate-500"
            />
          </div>
          <p className="text-sm font-bold text-slate-600">Bấm để tải ảnh lên</p>
          <p className="text-xs mt-1">PNG, JPG, WEBP (Tối đa 5MB)</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-10">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-slate-200 transition transform hover:-translate-y-1"
        >
          <Save size={20} /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

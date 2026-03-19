"use client";
import { useState } from "react";
import { Check, Edit3, Plus, Package, Zap, Crown } from "lucide-react";

export default function PackageConfigPage() {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "FREE",
      price: 0,
      duration: "Vĩnh viễn",
      color: "bg-slate-500",
      icon: Package,
      features: ["10 bài học/tháng", "Bài tập cơ bản", "Không hỗ trợ 1-1"],
    },
    {
      id: 2,
      name: "BASIC",
      price: 99000,
      duration: "30 ngày",
      color: "bg-blue-600",
      icon: Zap,
      features: [
        "50 bài học/tháng",
        "Full bài tập",
        "Email hỗ trợ",
        "Chứng chỉ hoàn thành",
      ],
    },
    {
      id: 3,
      name: "PREMIUM",
      price: 199000,
      duration: "30 ngày",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: Crown,
      features: [
        "Không giới hạn",
        "Lớp học Live",
        "Hỗ trợ ưu tiên 24/7",
        "Kho media độc quyền",
        "Tắt quảng cáo",
      ],
    },
  ]);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Cấu Hình Gói Cước
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý giá bán và quyền lợi các gói dịch vụ.
          </p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition">
          <Plus size={18} /> Thêm gói mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300"
          >
            <div className={`h-2 ${pkg.color} w-full`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${pkg.color} bg-opacity-10 text-slate-800`}
                >
                  <pkg.icon
                    className={
                      pkg.name === "PREMIUM"
                        ? "text-amber-500"
                        : pkg.name === "BASIC"
                          ? "text-blue-600"
                          : "text-slate-500"
                    }
                    size={24}
                  />
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition">
                  <Edit3 size={18} />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-800">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-slate-900">
                  {pkg.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-sm text-slate-500">/ {pkg.duration}</span>
              </div>

              <div className="mt-6 space-y-3">
                {pkg.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-600"
                  >
                    <Check
                      size={16}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Trạng thái</span>
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                    Đang bán
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

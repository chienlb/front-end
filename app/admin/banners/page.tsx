"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Calendar,
  Layers,
} from "lucide-react";
import BannerEditorModal from "@/components/admin/marketing/BannerEditorModal";

// Mock Data
const mockBanners = [
  {
    id: 1,
    title: "Chào hè rực rỡ",
    type: "HOME_SLIDER",
    image:
      "https://img.freepik.com/free-vector/summer-camp-kids-banner-template_1308-132205.jpg",
    priority: 10,
    isActive: true,
    action: "/shop",
    dates: "01/06 - 31/08",
  },
  {
    id: 2,
    title: "Giảm 50% Gói Trọn Đời",
    type: "POPUP",
    image:
      "https://img.freepik.com/free-vector/flat-sale-banner-with-photo_23-2149026968.jpg",
    priority: 5,
    isActive: false,
    action: "/finance",
    dates: "Non-stop",
  },
  {
    id: 3,
    title: "Đua top nhận quà",
    type: "EVENT_SECTION",
    image:
      "https://img.freepik.com/free-vector/game-leaderboard-banner_1284-18698.jpg",
    priority: 1,
    isActive: true,
    action: "/leaderboard",
    dates: "15/01 - 30/01",
  },
];

export default function BannerPage() {
  const [activeTab, setActiveTab] = useState("HOME_SLIDER");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const handleCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const filteredBanners = mockBanners.filter((b) => b.type === activeTab);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-purple-600" /> Banner & Sự kiện
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý hình ảnh hiển thị trên ứng dụng Client.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Thêm Banner Mới
        </button>
      </div>

      {/* 2. TABS & FILTER */}
      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          {[
            { id: "HOME_SLIDER", label: "Slider Trang chủ" },
            { id: "POPUP", label: "Popup (Quảng cáo)" },
            { id: "EVENT_SECTION", label: "Mục Sự kiện" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition
              ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative mr-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-1.5 border rounded-lg text-sm w-48"
          />
        </div>
      </div>

      {/* 3. BANNER GRID */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {/* Placeholder Card */}
          <button
            onClick={handleCreate}
            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-[250px] text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition"
          >
            <Plus size={40} className="mb-2 opacity-50" />
            <span className="font-bold">
              Thêm {activeTab === "POPUP" ? "Popup" : "Banner"}
            </span>
          </button>

          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group flex flex-col"
            >
              {/* Image Preview */}
              <div
                className={`relative bg-gray-100 overflow-hidden
                ${activeTab === "POPUP" ? "aspect-[3/4]" : "aspect-video"}`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Overlay Badge Status */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm
                    ${
                      banner.isActive
                        ? "bg-green-500/80 text-white"
                        : "bg-gray-500/80 text-white"
                    }`}
                  >
                    {banner.isActive ? "Đang hiện" : "Đang ẩn"}
                  </span>
                  <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">
                    Priority: {banner.priority}
                  </span>
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition duration-300">
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-white rounded-full text-slate-800 hover:bg-blue-50 hover:text-blue-600 shadow-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button className="p-2 bg-white rounded-full text-slate-800 hover:bg-red-50 hover:text-red-600 shadow-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className="font-bold text-slate-800 line-clamp-1"
                    title={banner.title}
                  >
                    {banner.title}
                  </h3>
                  <button className="text-gray-400 hover:text-blue-600">
                    <ExternalLink size={14} />
                  </button>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <Calendar size={12} /> {banner.dates}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded truncate max-w-[150px]">
                    Link: {banner.action}
                  </div>
                  <button
                    className={`text-xs font-bold flex items-center gap-1 
                     ${banner.isActive ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <BannerEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingBanner}
          type={activeTab}
        />
      )}
    </div>
  );
}

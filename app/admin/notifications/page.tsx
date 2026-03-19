"use client";

import { useState } from "react";
import {
  BellRing,
  Plus,
  Calendar,
  Users,
  BarChart3,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  Edit,
} from "lucide-react";
import PushComposerModal from "@/components/admin/marketing/PushComposerModal"; // Modal soạn thảo

// Mock Data
const mockNotifications = [
  {
    id: 1,
    title: "🎁 Lì xì đầu năm!",
    body: "Nhận ngay 500 Vàng may mắn khi đăng nhập hôm nay.",
    segment: "ALL_USERS",
    status: "SENT",
    time: "10:00 AM - 01/01/2026",
    sent: 15000,
    opened: 4500,
    ctr: "30%",
  },
  {
    id: 2,
    title: "🦁 Mr. Lion nhớ bạn!",
    body: "3 ngày rồi bé chưa vào học. Quay lại ngay nhé!",
    segment: "INACTIVE_3_DAYS",
    status: "SCHEDULED",
    time: "08:00 PM - Today",
    sent: 0,
    opened: 0,
    ctr: "-",
  },
  {
    id: 3,
    title: "🔥 Ưu đãi Flash Sale",
    body: "Giảm 50% gói trọn đời chỉ trong 1 giờ.",
    segment: "FREE_USERS",
    status: "DRAFT",
    time: "-",
    sent: 0,
    opened: 0,
    ctr: "-",
  },
];

export default function PushNotificationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
          <div>
            <p className="text-violet-100 text-xs font-bold uppercase mb-1">
              Tổng tin đã gửi
            </p>
            <h3 className="text-3xl font-bold">1.2M</h3>
          </div>
          <BellRing size={40} className="opacity-50" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">
            Tỉ lệ mở trung bình (CTR)
          </p>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            18.5%{" "}
            <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded font-bold">
              Cao
            </span>
          </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">
            Lịch gửi hôm nay
          </p>
          <h3 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            <Clock size={20} /> 2 chiến dịch
          </h3>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SENT">Đã gửi</option>
            <option value="SCHEDULED">Đang hẹn giờ</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Tạo Thông báo Mới
        </button>
      </div>

      {/* 3. CAMPAIGN LIST */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="p-4">Nội dung Thông báo</th>
                <th className="p-4">Đối tượng</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Hiệu quả (Open/Sent)</th>
                <th className="p-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockNotifications.map((push) => (
                <tr key={push.id} className="hover:bg-gray-50 group">
                  <td className="p-4 max-w-sm">
                    <div className="font-bold text-slate-800 truncate">
                      {push.title}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {push.body}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                      <Users size={12} /> {push.segment}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-mono">
                    {push.time}
                  </td>
                  <td className="p-4">
                    {push.status === "SENT" ? (
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          <BarChart3 size={14} /> {push.ctr}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {push.opened.toLocaleString()} /{" "}
                          {push.sent.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {push.status === "SENT" && (
                      <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1">
                        <CheckCircle size={14} /> Đã gửi
                      </span>
                    )}
                    {push.status === "SCHEDULED" && (
                      <span className="text-orange-500 font-bold text-xs flex items-center justify-end gap-1">
                        <Clock size={14} /> Đang chờ
                      </span>
                    )}
                    {push.status === "DRAFT" && (
                      <span className="text-gray-400 font-bold text-xs flex items-center justify-end gap-1">
                        <Edit size={14} /> Nháp
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <PushComposerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

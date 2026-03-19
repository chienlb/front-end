"use client";

import { useState } from "react";
import {
  TicketPercent,
  Plus,
  Search,
  Calendar,
  Copy,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import VoucherEditorModal from "@/components/admin/marketing/VoucherEditorModal";

// Mock Data
const mockVouchers = [
  {
    id: 1,
    code: "WELCOME50",
    type: "PERCENT",
    value: 50,
    maxReduce: 100000,
    used: 120,
    total: 500,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    desc: "Giảm 50% cho tài khoản mới",
  },
  {
    id: 2,
    code: "TET2026",
    type: "FIXED_AMOUNT",
    value: 200000,
    maxReduce: null,
    used: 45,
    total: 50,
    startDate: "2026-01-01",
    endDate: "2026-02-15",
    status: "ACTIVE",
    desc: "Lì xì Tết 200k cho gói Trọn đời",
  },
  {
    id: 3,
    code: "HOCVUI",
    type: "PERCENT",
    value: 10,
    maxReduce: 50000,
    used: 1000,
    total: 1000,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "EXPIRED",
    desc: "Mã khuyến mãi tháng 6",
  },
];

export default function VoucherPage() {
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  const handleCreate = () => {
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã: ${code}`);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
          <div>
            <p className="text-pink-100 text-xs font-bold uppercase mb-1">
              Mã đang hoạt động
            </p>
            <h3 className="text-3xl font-bold">05</h3>
          </div>
          <TicketPercent size={40} className="opacity-50" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">
            Lượt sử dụng tháng này
          </p>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            1,240{" "}
            <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded font-bold">
              +12%
            </span>
          </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">
            Doanh thu từ Voucher
          </p>
          <h3 className="text-2xl font-bold text-slate-800">₫ 125,000,000</h3>
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
              placeholder="Tìm mã voucher..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang chạy</option>
            <option value="EXPIRED">Đã hết hạn</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Tạo Mã Mới
        </button>
      </div>

      {/* 3. VOUCHER LIST (GRID VIEW) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVouchers.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition group relative"
            >
              {/* Ticket Top (Màu sắc theo loại) */}
              <div
                className={`h-2 flex items-center ${
                  v.status === "EXPIRED"
                    ? "bg-gray-300"
                    : "bg-gradient-to-r from-blue-400 to-purple-500"
                }`}
              ></div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div
                    onClick={() => copyToClipboard(v.code)}
                    className="bg-gray-100 hover:bg-gray-200 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg px-3 py-1 font-mono font-bold text-lg text-slate-700 flex items-center gap-2"
                    title="Click để copy"
                  >
                    {v.code} <Copy size={14} className="text-gray-400" />
                  </div>
                  <div
                    className={`text-[10px] font-bold px-2 py-1 rounded border
                     ${
                       v.status === "ACTIVE"
                         ? "bg-green-50 text-green-600 border-green-200"
                         : "bg-gray-100 text-gray-500 border-gray-200"
                     }`}
                  >
                    {v.status}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-xl text-slate-800">
                    {v.type === "PERCENT"
                      ? `Giảm ${v.value}%`
                      : `Giảm ${v.value.toLocaleString()}đ`}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{v.desc}</p>
                  {v.maxReduce && v.type === "PERCENT" && (
                    <p className="text-xs text-orange-500 font-medium mt-1">
                      Tối đa: {v.maxReduce.toLocaleString()}đ
                    </p>
                  )}
                </div>

                {/* Progress Bar Usage */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Đã dùng: <b>{v.used}</b>/{v.total}
                    </span>
                    <span>{Math.round((v.used / v.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        v.status === "EXPIRED" ? "bg-gray-400" : "bg-blue-500"
                      }`}
                      style={{ width: `${(v.used / v.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ticket Footer (Date & Action) */}
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <div className="text-gray-500 flex items-center gap-1">
                  <Calendar size={12} /> {v.endDate}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingVoucher(v);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sửa
                  </button>
                  <button className="text-red-600 font-bold hover:underline">
                    Xóa
                  </button>
                </div>
              </div>

              {/* Decorative Circles for Ticket Effect */}
              <div className="absolute top-[8px] -left-2 w-4 h-4 bg-gray-50 rounded-full"></div>
              <div className="absolute top-[8px] -right-2 w-4 h-4 bg-gray-50 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <VoucherEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingVoucher}
        />
      )}
    </div>
  );
}

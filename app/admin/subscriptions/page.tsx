"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  CreditCard,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Plus,
} from "lucide-react";

// --- TYPES ---
type SubStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE";
type PlanType = "FREE" | "BASIC" | "PREMIUM";
type BillingCycle = "MONTHLY" | "YEARLY";

interface Subscription {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  plan: PlanType;
  price: number;
  cycle: BillingCycle;
  startDate: string;
  nextBillingDate: string; // Hoặc End Date
  autoRenew: boolean;
  status: SubStatus;
  paymentMethod: string; // VD: Momo, Visa ending 4242
}

// --- MOCK DATA ---
const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "SUB-8821",
    user: {
      name: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    plan: "PREMIUM",
    price: 199000,
    cycle: "MONTHLY",
    startDate: "15/10/2023",
    nextBillingDate: "15/11/2023",
    autoRenew: true,
    status: "ACTIVE",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "SUB-8822",
    user: {
      name: "Trần Thị B",
      email: "btran@yahoo.com",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    plan: "BASIC",
    price: 99000,
    cycle: "MONTHLY",
    startDate: "01/09/2023",
    nextBillingDate: "01/10/2023",
    autoRenew: false,
    status: "EXPIRED",
    paymentMethod: "Momo Wallet",
  },
  {
    id: "SUB-8823",
    user: {
      name: "Lê Văn C",
      email: "cle@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    plan: "PREMIUM",
    price: 1990000, // Gói năm
    cycle: "YEARLY",
    startDate: "20/05/2023",
    nextBillingDate: "20/05/2024",
    autoRenew: false,
    status: "CANCELLED", // Đã hủy gia hạn nhưng vẫn còn hạn dùng
    paymentMethod: "VNPay QR",
  },
  {
    id: "SUB-8824",
    user: {
      name: "Phạm D",
      email: "dpham@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    plan: "BASIC",
    price: 99000,
    cycle: "MONTHLY",
    startDate: "10/10/2023",
    nextBillingDate: "10/11/2023",
    autoRenew: true,
    status: "PAST_DUE", // Nợ cước (thanh toán thất bại)
    paymentMethod: "Visa •••• 1111",
  },
];

export default function AdminSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SubStatus>("ALL");

  // Filter Logic
  const filteredSubs = SUBSCRIPTIONS.filter((sub) => {
    const matchSearch =
      sub.user.email.includes(searchTerm) || sub.id.includes(searchTerm);
    const matchStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Helper UI
  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case "PREMIUM":
        return (
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-200">
            <Zap size={12} fill="currentColor" /> PREMIUM
          </span>
        );
      case "BASIC":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
            BASIC
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
            FREE
          </span>
        );
    }
  };

  const getStatusBadge = (status: SubStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100 flex w-fit items-center gap-1">
            <CheckCircle2 size={12} /> Đang hoạt động
          </span>
        );
      case "EXPIRED":
        return (
          <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 flex w-fit items-center gap-1">
            <XCircle size={12} /> Hết hạn
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold border border-red-100 flex w-fit items-center gap-1">
            <XCircle size={12} /> Đã hủy
          </span>
        );
      case "PAST_DUE":
        return (
          <span className="text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-bold border border-orange-100 flex w-fit items-center gap-1">
            <AlertTriangle size={12} /> Nợ cước
          </span>
        );
    }
  };

  // Actions
  const handleCancelSub = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn HỦY gói đăng ký này ngay lập tức?")) {
      alert(`Đã hủy subscription ${id}`);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Quản lý Đăng ký (Subscriptions)
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi các gói dịch vụ và trạng thái gia hạn của học viên.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition">
          <Plus size={18} /> Cấp gói thủ công
        </button>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Active Subs
          </p>
          <p className="text-2xl font-black text-green-600 mt-1">1,240</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Doanh thu tháng (MRR)
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">245M</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Tỷ lệ hủy (Churn)
          </p>
          <p className="text-2xl font-black text-red-500 mt-1">2.4%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Nợ cước</p>
          <p className="text-2xl font-black text-orange-500 mt-1">15</p>
        </div>
      </div>

      {/* 3. MAIN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
            {["ALL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${statusFilter === status ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {status === "ALL" ? "Tất cả" : status}
                </button>
              ),
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder="Tìm user email, sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Khách hàng</th>
                <th className="p-4">Gói dịch vụ</th>
                <th className="p-4">Kỳ hạn / Giá</th>
                <th className="p-4">Ngày gia hạn</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/50 transition group"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.user.avatar}
                        className="w-9 h-9 rounded-full border border-slate-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {sub.user.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{sub.user.email}</span> • <span>{sub.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getPlanBadge(sub.plan)}
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <CreditCard size={10} /> {sub.paymentMethod}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-slate-700">
                      {sub.price.toLocaleString("vi-VN")}đ
                      <span className="text-slate-400 font-normal text-xs">
                        /{sub.cycle === "MONTHLY" ? "tháng" : "năm"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {sub.nextBillingDate}
                    </div>
                    {sub.autoRenew ? (
                      <span className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5 font-bold">
                        <RefreshCw size={10} /> Tự động gia hạn
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Không gia hạn
                      </span>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(sub.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      {/* Nút hủy chỉ hiện khi còn Active */}
                      {sub.status === "ACTIVE" && (
                        <button
                          onClick={() => handleCancelSub(sub.id)}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition"
                        >
                          Hủy gói
                        </button>
                      )}
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p>Không tìm thấy dữ liệu phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

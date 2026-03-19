"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Download,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  CreditCard,
  X,
  Printer,
  RotateCcw,
  AlertTriangle,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
type TransactionType =
  | "TUITION_FEE"
  | "SALARY_PAYOUT"
  | "REFUND"
  | "COURSE_PURCHASE";

interface Transaction {
  id: string;
  invoiceId: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: "STUDENT" | "TEACHER";
  };
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: string;
  paymentMethod: string;
  note?: string; // Ghi chú (ví dụ lý do hoàn tiền)
}

// --- MOCK DATA ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-001",
    invoiceId: "INV-2023-001",
    user: {
      name: "Nguyễn Văn A",
      email: "studentA@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=11",
      role: "STUDENT",
    },
    type: "TUITION_FEE",
    amount: 2500000,
    currency: "VND",
    status: "COMPLETED",
    date: "2023-11-20 10:30",
    paymentMethod: "MOMO",
  },
  {
    id: "TXN-002",
    invoiceId: "PAY-2023-882",
    user: {
      name: "Thầy John Doe",
      email: "john.doe@teacher.com",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "TEACHER",
    },
    type: "SALARY_PAYOUT",
    amount: 15000000,
    currency: "VND",
    status: "PENDING",
    date: "2023-11-19 15:45",
    paymentMethod: "BANK_TRANSFER",
  },
  {
    id: "TXN-005",
    invoiceId: "INV-2023-005",
    user: {
      name: "Phạm Minh D",
      email: "d.pham@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "STUDENT",
    },
    type: "TUITION_FEE",
    amount: 3000000,
    currency: "VND",
    status: "COMPLETED",
    date: "2023-11-17 14:20",
    paymentMethod: "BANK_TRANSFER",
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [filterStatus, setFilterStatus] = useState<"ALL" | TransactionStatus>(
    "ALL",
  );
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Modal
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  // --- LOGIC ---
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> Thành công
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Clock size={12} /> Chờ xử lý
          </span>
        );
      case "FAILED":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Thất bại
          </span>
        );
      case "REFUNDED":
        return (
          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <RotateCcw size={12} /> Đã hoàn tiền
          </span>
        );
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case "TUITION_FEE":
        return "Học phí Live Class";
      case "SALARY_PAYOUT":
        return "Trả lương GV";
      case "REFUND":
        return "Hoàn tiền";
      case "COURSE_PURCHASE":
        return "Mua khóa học";
    }
  };

  const isIncome = (type: TransactionType) =>
    type === "TUITION_FEE" || type === "COURSE_PURCHASE";

  // Xử lý hoàn tiền
  const handleProcessRefund = () => {
    if (!selectedTxn) return;

    // Update Mock Data
    const updatedList = transactions.map((t) =>
      t.id === selectedTxn.id
        ? { ...t, status: "REFUNDED" as TransactionStatus, note: refundReason }
        : t,
    );

    setTransactions(updatedList);

    // Update Modal View
    setSelectedTxn({ ...selectedTxn, status: "REFUNDED", note: refundReason });

    setShowRefundModal(false);
    setRefundReason("");
    alert("Đã hoàn tiền thành công!");
  };

  const filteredData = transactions.filter((t) => {
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchSearch =
      t.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* HEADER & STATS */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Quản lý Giao dịch
            </h1>
            <p className="text-slate-500 text-sm">
              Theo dõi dòng tiền và xử lý khiếu nại.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition shadow-sm">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-black text-green-600">
                +45.200.000 ₫
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Tổng chi / Hoàn tiền
              </p>
              <p className="text-2xl font-black text-red-600">-18.500.000 ₫</p>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <ArrowDownLeft size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                Số dư thực tế
              </p>
              <p className="text-2xl font-black text-slate-800">26.700.000 ₫</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS & TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {["ALL", "COMPLETED", "PENDING", "REFUNDED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${filterStatus === status ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >
                {status === "ALL" ? "Tất cả" : status}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition"
              placeholder="Tìm mã đơn, tên user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Mã giao dịch</th>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Loại giao dịch</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 transition group"
                >
                  <td className="p-4 pl-6">
                    <span className="font-bold text-slate-700 text-sm">
                      {tx.invoiceId}
                    </span>
                    <p className="text-[10px] text-slate-400">{tx.id}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tx.user.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {tx.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.user.role === "STUDENT"
                            ? "Học viên"
                            : "Giáo viên"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-slate-600">
                      {getTypeLabel(tx.type)}
                    </span>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <CreditCard size={10} /> {tx.paymentMethod}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`text-sm font-black ${isIncome(tx.type) ? "text-green-600" : "text-slate-800"}`}
                    >
                      {isIncome(tx.type) ? "+" : "-"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(tx.status)}</td>
                  <td className="p-4 text-sm text-slate-500">{tx.date}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedTxn(tx)}
                      className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- TRANSACTION DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTxn(null)}
            />

            {/* INVOICE CARD */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Chi tiết giao dịch
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTxn.invoiceId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Amount */}
              <div className="p-8 text-center border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Số tiền thanh toán
                </p>
                <h2
                  className={`text-3xl font-black ${isIncome(selectedTxn.type) ? "text-green-600" : "text-slate-800"}`}
                >
                  {isIncome(selectedTxn.type) ? "+" : "-"}
                  {formatCurrency(selectedTxn.amount, selectedTxn.currency)}
                </h2>
                <div className="mt-3 flex justify-center">
                  {getStatusBadge(selectedTxn.status)}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian</span>
                  <span className="font-bold text-slate-800">
                    {selectedTxn.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại giao dịch</span>
                  <span className="font-bold text-slate-800">
                    {getTypeLabel(selectedTxn.type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phương thức</span>
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard size={14} /> {selectedTxn.paymentMethod}
                  </span>
                </div>

                {selectedTxn.note && (
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-yellow-800 text-xs">
                    <span className="font-bold block mb-1">Ghi chú:</span>
                    {selectedTxn.note}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <span className="text-slate-500 block mb-2">
                    Thông tin người dùng
                  </span>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                    <img
                      src={selectedTxn.user.avatar}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedTxn.user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedTxn.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                <button className="py-2.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm">
                  <Printer size={16} /> In hóa đơn
                </button>

                {/* Nút hoàn tiền chỉ hiện khi COMPLETED và là khoản thu */}
                {selectedTxn.status === "COMPLETED" &&
                isIncome(selectedTxn.type) ? (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm"
                  >
                    <RotateCcw size={16} /> Hoàn tiền
                  </button>
                ) : (
                  <button className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition text-sm flex items-center justify-center gap-2">
                    <Send size={16} /> Gửi Email
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 4. REFUND CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRefundModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden p-6"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Xác nhận hoàn tiền?
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                Bạn có chắc chắn muốn hoàn tiền cho giao dịch{" "}
                <b>{selectedTxn?.invoiceId}</b>? Hành động này không thể hoàn
                tác.
              </p>

              <textarea
                className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-500 mb-4 bg-slate-50"
                rows={3}
                placeholder="Nhập lý do hoàn tiền (Bắt buộc)..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={!refundReason.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Zap,
  History,
  Download,
  AlertCircle,
  ChevronRight,
  Star,
} from "lucide-react";

// --- TYPES ---
interface ChildSubInfo {
  id: string;
  name: string;
  avatar: string;
  currentPlan: "FREE" | "BASIC" | "PREMIUM";
  expiryDate?: string;
  autoRenew: boolean;
}

interface Package {
  id: string;
  code: "BASIC" | "PREMIUM";
  name: string;
  price: number;
  duration: string;
  features: string[];
  recommend?: boolean;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  method: string;
}

// --- MOCK DATA ---
const MY_CHILDREN: ChildSubInfo[] = [
  {
    id: "C01",
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=12",
    currentPlan: "PREMIUM",
    expiryDate: "20/12/2026",
    autoRenew: true,
  },
  {
    id: "C02",
    name: "Trần Bảo Ngọc",
    avatar: "https://i.pravatar.cc/150?img=5",
    currentPlan: "FREE",
    autoRenew: false,
  },
];

// Dữ liệu gói cước
const PACKAGES: Package[] = [
  {
    id: "PKG_BASIC",
    code: "BASIC",
    name: "Cơ Bản",
    price: 99000,
    duration: "1 tháng",
    features: ["50 bài học/tháng", "Bài tập cơ bản", "Hỗ trợ qua Email"],
    color: "bg-blue-50 border-blue-200 text-blue-900",
  },
  {
    id: "PKG_PREMIUM",
    code: "PREMIUM",
    name: "Cao Cấp (VIP)",
    price: 199000,
    duration: "1 tháng",
    features: [
      "Không giới hạn bài học",
      "Lớp học Live với GV",
      "Hỗ trợ ưu tiên 24/7",
      "Kho media độc quyền",
    ],
    recommend: true,
    color: "bg-indigo-50 border-indigo-200 text-indigo-900",
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    date: "20/11/2023",
    desc: "Gia hạn gói Premium (Bé An)",
    amount: 199000,
    status: "SUCCESS",
    method: "VNPay",
  },
  {
    id: "TRX-002",
    date: "15/10/2023",
    desc: "Mua gói Basic (Bé An)",
    amount: 99000,
    status: "SUCCESS",
    method: "Momo",
  },
  {
    id: "TRX-003",
    date: "01/10/2023",
    desc: "Nâng cấp gói (Bé Ngọc)",
    amount: 199000,
    status: "FAILED",
    method: "Thẻ ATM",
  },
];

export default function SubscriptionPage() {
  const [selectedChild, setSelectedChild] = useState<ChildSubInfo>(
    MY_CHILDREN[0],
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    alert(
      `Đang chuyển hướng sang cổng thanh toán cho gói ${selectedPackage?.name}...`,
    );
    setShowPaymentModal(false);
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 pb-20">
      {/* 1. HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Gói Học & Thanh Toán
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Quản lý gói cước và gia hạn dịch vụ cho các con.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* === LEFT COLUMN: CHILD SELECTOR & PACKAGES === */}
        <div className="xl:col-span-2 space-y-8">
          {/* Child Selector & Current Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Chọn bé để quản lý:
            </h3>
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {MY_CHILDREN.map((child) => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`min-w-[200px] p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 relative overflow-hidden ${selectedChild.id === child.id ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-blue-300"}`}
                >
                  <img
                    src={child.avatar}
                    className="w-12 h-12 rounded-full border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      {child.name}
                    </p>
                    <p
                      className={`text-xs font-black mt-1 ${child.currentPlan === "PREMIUM" ? "text-indigo-600" : child.currentPlan === "BASIC" ? "text-blue-600" : "text-slate-500"}`}
                    >
                      {child.currentPlan === "FREE"
                        ? "Gói Miễn phí"
                        : child.currentPlan}
                    </p>
                  </div>
                  {selectedChild.id === child.id && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Current Plan Detail */}
            <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded border border-white/20 uppercase">
                      Gói hiện tại
                    </span>
                    {selectedChild.autoRenew && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                        <Zap size={10} fill="currentColor" /> Tự động gia hạn
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black mb-1">
                    {selectedChild.currentPlan === "FREE"
                      ? "MIỄN PHÍ"
                      : selectedChild.currentPlan}{" "}
                    MEMBER
                  </h2>
                  {selectedChild.expiryDate ? (
                    <p className="text-slate-400 text-sm">
                      Hết hạn vào:{" "}
                      <span className="text-white font-bold">
                        {selectedChild.expiryDate}
                      </span>
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      Nâng cấp để mở khóa tính năng
                    </p>
                  )}
                </div>
                {selectedChild.currentPlan !== "PREMIUM" && (
                  <button
                    onClick={() =>
                      document
                        .getElementById("pricing")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg animate-pulse"
                  >
                    Nâng cấp ngay
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
              <CreditCard className="text-blue-600" /> Chọn gói nâng cấp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-2xl border-2 transition hover:shadow-xl ${pkg.recommend ? "border-indigo-500 shadow-md scale-[1.02]" : "border-slate-200 bg-white"}`}
                >
                  {pkg.recommend && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Khuyên dùng
                    </div>
                  )}

                  <h4 className="text-xl font-black text-slate-800 text-center mb-2">
                    {pkg.name}
                  </h4>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-black text-blue-600">
                      {pkg.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      /{pkg.duration}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-green-500 shrink-0"
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${pkg.recommend ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    {selectedChild.currentPlan === pkg.code
                      ? "Gia hạn ngay"
                      : "Chọn gói này"}{" "}
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: HISTORY === */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-slate-400" /> Lịch sử giao
                dịch
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="p-2 flex-1 overflow-y-auto max-h-[500px]">
              {TRANSACTIONS.map((trx) => (
                <div
                  key={trx.id}
                  className="p-4 hover:bg-slate-50 rounded-xl transition border-b border-slate-50 last:border-none group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        trx.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : trx.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {trx.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {trx.date}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1 leading-snug">
                    {trx.desc}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-blue-600">
                      {trx.amount.toLocaleString()}đ
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {trx.method}
                    </span>
                  </div>

                  {trx.status === "SUCCESS" && (
                    <button className="w-full mt-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg hover:text-slate-600 hover:bg-white transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <Download size={14} /> Tải hóa đơn
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 flex gap-3 text-yellow-800">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-1">Lưu ý thanh toán:</p>
              Nếu gặp lỗi trong quá trình thanh toán, vui lòng liên hệ{" "}
              <span className="font-bold">Hotline 1900 1234</span> hoặc chat với
              hỗ trợ viên để được giải quyết nhanh nhất.
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-800">
                Xác nhận thanh toán
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Bạn đang đăng ký gói{" "}
                <span className="font-bold text-blue-600">
                  {selectedPackage.name}
                </span>{" "}
                cho bé <span className="font-bold">{selectedChild.name}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Gói cước</span>
                <span className="text-sm font-bold">
                  {selectedPackage.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Thời hạn</span>
                <span className="text-sm font-bold">
                  {selectedPackage.duration}
                </span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-800">
                  Tổng thanh toán
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {selectedPackage.price.toLocaleString()}đ
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase">
                Chọn phương thức
              </p>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="payment"
                  defaultChecked
                  className="w-4 h-4 text-blue-600"
                />
                <img
                  src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
                  className="h-6 w-auto object-contain"
                  alt="VNPay"
                />
                <span className="font-bold text-sm text-slate-700">
                  Ví VNPay / QR Code
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="payment"
                  className="w-4 h-4 text-blue-600"
                />
                <div className="w-8 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-500">
                  <CreditCard size={16} />
                </div>
                <span className="font-bold text-sm text-slate-700">
                  Thẻ ATM / Visa / Master
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <input
                  type="radio"
                  name="payment"
                  className="w-4 h-4 text-blue-600"
                />
                <div className="w-8 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-500">
                  <History size={16} />
                </div>
                <span className="font-bold text-sm text-slate-700">
                  Chuyển khoản Ngân hàng
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

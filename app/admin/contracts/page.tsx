"use client";
import { useState } from "react";
import {
  Search,
  FileText,
  DollarSign,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Plus,
  Filter,
  Banknote,
} from "lucide-react";

// --- TYPES ---
type TabType = "CONTRACTS" | "PAYROLL";

interface Contract {
  id: string;
  teacherName: string;
  avatar: string;
  type: "FULL_TIME" | "PART_TIME";
  startDate: string;
  endDate?: string;
  baseRate: number; // Lương cứng hoặc Lương theo giờ
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  fileUrl: string;
}

interface Payroll {
  id: string;
  teacherName: string;
  avatar: string;
  month: string; // VD: "10/2023"
  totalClasses: number;
  totalHours: number;
  bonus: number;
  totalAmount: number;
  status: "PENDING" | "PAID";
  paidDate?: string;
}

// --- MOCK DATA ---
const MOCK_CONTRACTS: Contract[] = [
  {
    id: "HD001",
    teacherName: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
    type: "FULL_TIME",
    startDate: "01/01/2023",
    baseRate: 15000000, // 15tr/tháng
    status: "ACTIVE",
    fileUrl: "#",
  },
  {
    id: "HD002",
    teacherName: "Thầy John Doe",
    avatar: "https://i.pravatar.cc/150?img=11",
    type: "PART_TIME",
    startDate: "15/03/2023",
    endDate: "15/03/2024",
    baseRate: 250000, // 250k/giờ
    status: "ACTIVE",
    fileUrl: "#",
  },
  {
    id: "HD003",
    teacherName: "Cô Lan Hương",
    avatar: "https://i.pravatar.cc/150?img=5",
    type: "PART_TIME",
    startDate: "01/06/2022",
    endDate: "01/06/2023",
    baseRate: 200000,
    status: "EXPIRED",
    fileUrl: "#",
  },
];

const MOCK_PAYROLL: Payroll[] = [
  {
    id: "PR001",
    teacherName: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
    month: "10/2023",
    totalClasses: 40,
    totalHours: 60,
    bonus: 500000,
    totalAmount: 15500000,
    status: "PAID",
    paidDate: "05/11/2023",
  },
  {
    id: "PR002",
    teacherName: "Thầy John Doe",
    avatar: "https://i.pravatar.cc/150?img=11",
    month: "10/2023",
    totalClasses: 12,
    totalHours: 18,
    bonus: 0,
    totalAmount: 4500000,
    status: "PENDING",
  },
];

export default function ContractsAndSalaryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("CONTRACTS");
  const [searchTerm, setSearchTerm] = useState("");

  // --- HANDLERS ---
  const handlePay = (id: string) => {
    if (confirm("Xác nhận đã thanh toán lương cho giảng viên này?")) {
      alert(`Đã thanh toán payroll ID: ${id}`);
      // Logic update state/API here
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* 1. HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Hợp Đồng & Lương
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý hồ sơ nhân sự và thanh toán thù lao.
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("CONTRACTS")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "CONTRACTS" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <FileText size={16} /> Hợp đồng
          </button>
          <button
            onClick={() => setActiveTab("PAYROLL")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === "PAYROLL" ? "bg-green-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Banknote size={16} /> Bảng lương
          </button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            placeholder="Tìm kiếm giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Bộ lọc
          </button>
          {activeTab === "CONTRACTS" ? (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Plus size={18} /> Tạo hợp đồng
            </button>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200">
              <DollarSign size={18} /> Chốt lương tháng
            </button>
          )}
        </div>
      </div>

      {/* 3. CONTENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* === VIEW: CONTRACTS === */}
        {activeTab === "CONTRACTS" && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Giáo viên</th>
                <th className="p-4">Loại hợp đồng</th>
                <th className="p-4">Ngày hiệu lực</th>
                <th className="p-4">Mức lương (Base)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_CONTRACTS.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={contract.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="font-bold text-slate-800">
                        {contract.teacherName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold ${contract.type === "FULL_TIME" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {contract.type === "FULL_TIME"
                        ? "Toàn thời gian"
                        : "Bán thời gian"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {contract.startDate}{" "}
                    {contract.endDate
                      ? `- ${contract.endDate}`
                      : "(Vô thời hạn)"}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-700">
                    {contract.baseRate.toLocaleString("vi-VN")}đ
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      /{contract.type === "FULL_TIME" ? "tháng" : "giờ"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        contract.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : contract.status === "EXPIRED"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${contract.status === "ACTIVE" ? "bg-green-500" : "bg-slate-400"}`}
                      ></span>
                      {contract.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Tải hợp đồng"
                      >
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* === VIEW: PAYROLL === */}
        {activeTab === "PAYROLL" && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Kỳ lương</th>
                <th className="p-4">Giáo viên</th>
                <th className="p-4">Chi tiết dạy</th>
                <th className="p-4">Tổng thực nhận</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Xác nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_PAYROLL.map((payroll) => (
                <tr
                  key={payroll.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  <td className="p-4 font-bold text-slate-600">
                    {payroll.month}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={payroll.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="font-bold text-slate-800">
                        {payroll.teacherName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex flex-col text-xs">
                      <span>
                        <strong>{payroll.totalClasses}</strong> lớp
                      </span>
                      <span>
                        <strong>{payroll.totalHours}</strong> giờ dạy
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-black text-slate-800 block">
                      {payroll.totalAmount.toLocaleString("vi-VN")}đ
                    </span>
                    {payroll.bonus > 0 && (
                      <span className="text-[10px] text-green-600 font-bold">
                        +Thưởng: {payroll.bonus.toLocaleString()}đ
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {payroll.status === "PAID" ? (
                      <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle size={14} /> Đã thanh toán
                        <span className="text-[10px] opacity-70 ml-1">
                          ({payroll.paidDate})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full w-fit">
                        <AlertCircle size={14} /> Chờ thanh toán
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {payroll.status === "PENDING" && (
                      <button
                        onClick={() => handlePay(payroll.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-green-200 transition"
                      >
                        Thanh toán
                      </button>
                    )}
                    {payroll.status === "PAID" && (
                      <button className="px-4 py-2 border border-slate-200 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed">
                        Đã xong
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

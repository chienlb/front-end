"use client";

import { useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  AlertTriangle,
  MessageSquare,
  User,
  FileText,
} from "lucide-react";
import ReportActionModal from "@/components/admin/reports/ReportActionModal";

// Mock Data
const mockReports = [
  {
    id: "RPT-001",
    reporter: "Bé Na (Lớp 2A)",
    targetType: "COMMENT",
    reason: "HARASSMENT",
    severity: "HIGH",
    status: "OPEN",
    createdAt: "10 phút trước",
    snapshot: {
      content: "Mày học dốt thế, có thế mà cũng sai!",
      author: "Hùng Dũng",
      authorId: "U-123",
    },
  },
  {
    id: "RPT-002",
    reporter: "Phụ huynh Chị Lan",
    targetType: "POST",
    reason: "INAPPROPRIATE_CONTENT", // Nội dung không phù hợp
    severity: "MEDIUM",
    status: "OPEN",
    createdAt: "1 giờ trước",
    snapshot: {
      content: "Ảnh này vui không mọi người?",
      image: "https://via.placeholder.com/150", // Giả lập ảnh
      author: "Nick Ẩn Danh",
      authorId: "U-999",
    },
  },
  {
    id: "RPT-003",
    reporter: "Hệ thống AI",
    targetType: "USER",
    reason: "SPAM",
    severity: "LOW",
    status: "RESOLVED",
    createdAt: "1 ngày trước",
    snapshot: {
      content: "Spam link quảng cáo game bài...",
      author: "Bot001",
      authorId: "U-BOT",
    },
  },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState("OPEN"); // OPEN, RESOLVED
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Helper: Icon theo loại đối tượng
  const getTargetIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return <MessageSquare size={14} className="text-blue-500" />;
      case "POST":
        return <FileText size={14} className="text-green-500" />;
      case "USER":
        return <User size={14} className="text-purple-500" />;
      default:
        return <ShieldAlert size={14} />;
    }
  };

  // Helper: Badge mức độ nghiêm trọng
  const getSeverityBadge = (level: string) => {
    if (level === "HIGH")
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200 flex items-center gap-1">
          <AlertTriangle size={10} /> CAO
        </span>
      );
    if (level === "MEDIUM")
      return (
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold border border-orange-200">
          TRUNG BÌNH
        </span>
      );
    return (
      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold border border-gray-200">
        THẤP
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Báo cáo Vi phạm 🚨
          </h1>
          <p className="text-gray-500 text-sm">
            Xử lý các báo cáo từ người dùng và hệ thống AI.
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <ShieldAlert size={18} /> 2 Báo cáo chưa xử lý
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex gap-2">
          {["OPEN", "RESOLVED", "DISMISSED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${
                filter === status
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {status === "OPEN"
                ? "Chưa xử lý"
                : status === "RESOLVED"
                  ? "Đã giải quyết"
                  : "Đã bỏ qua"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm người báo cáo..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
          />
        </div>
      </div>

      {/* 3. REPORTS TABLE */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0">
              <tr>
                <th className="p-4">Mức độ / Thời gian</th>
                <th className="p-4">Người báo cáo</th>
                <th className="p-4">Nội dung vi phạm (Bằng chứng)</th>
                <th className="p-4">Lý do</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockReports
                .filter((r) => r.status === filter)
                .map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-red-50/30 transition">
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getSeverityBadge(rpt.severity)}
                        <span className="text-xs text-gray-400">
                          {rpt.createdAt}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {rpt.reporter}
                      <div className="text-[10px] text-gray-400 font-normal mt-1">
                        ID: {rpt.id}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-md">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase">
                          {getTargetIcon(rpt.targetType)} {rpt.targetType}
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-600">
                            @{rpt.snapshot.author}
                          </span>
                        </div>

                        {/* Hiển thị nội dung bằng chứng */}
                        <p className="text-slate-800 italic">
                          "{rpt.snapshot.content}"
                        </p>

                        {/* Nếu có ảnh */}
                        {rpt.snapshot.image && (
                          <div className="mt-2 w-24 h-24 rounded-lg bg-gray-200 overflow-hidden relative group cursor-pointer border">
                            <img
                              src={rpt.snapshot.image}
                              alt="Evidence"
                              className="w-full h-full object-cover blur-sm group-hover:blur-0 transition"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold group-hover:hidden">
                              Nhạy cảm
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">
                        {rpt.reason}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {rpt.status === "OPEN" ? (
                        <button
                          onClick={() => setSelectedReport(rpt)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-blue-200 transition"
                        >
                          Xử lý ngay
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle size={14} /> Đã xong
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {mockReports.filter((r) => r.status === filter).length === 0 && (
            <div className="p-10 text-center text-gray-400">
              <CheckCircle size={48} className="mx-auto mb-2 text-green-100" />
              <p>Tuyệt vời! Không có báo cáo nào ở mục này.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTION MODAL */}
      {selectedReport && (
        <ReportActionModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      )}
    </div>
  );
}

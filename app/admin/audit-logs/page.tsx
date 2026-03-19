"use client";

import { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Edit,
  Plus,
  LogIn,
  ShieldAlert,
  FileText,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { auditService } from "@/services/audit.service";

// Mock Data
const mockLogs = [
  {
    id: "LOG-001",
    actor: "Admin Supper",
    action: "UPDATE",
    module: "SYSTEM",
    target: "Cấu hình chung",
    time: "10:30 AM - 11/01/2026",
    ip: "113.160.x.x",
    desc: "Đã bật chế độ Bảo trì hệ thống",
    detail: { old: { maintenance: false }, new: { maintenance: true } },
  },
  {
    id: "LOG-002",
    actor: "CSKH Lan",
    action: "UPDATE",
    module: "USER",
    target: "Nguyễn Tuấn Kiệt (U-123)",
    time: "09:15 AM - 11/01/2026",
    ip: "14.232.x.x",
    desc: "Cộng bù 500 Vàng cho user",
    detail: { old: { gold: 100 }, new: { gold: 600 } },
  },
  {
    id: "LOG-003",
    actor: "Editor Hùng",
    action: "DELETE",
    module: "COURSE",
    target: "Bài học: Unit 1 Lesson 5",
    time: "08:00 AM - 11/01/2026",
    ip: "42.112.x.x",
    desc: "Xóa bài học bị lỗi",
    detail: null,
  },
  {
    id: "LOG-004",
    actor: "Kế toán Mai",
    action: "EXPORT",
    module: "FINANCE",
    target: "Báo cáo doanh thu T1/2026",
    time: "Yesterday",
    ip: "118.69.x.x",
    desc: "Xuất file Excel doanh thu",
    detail: null,
  },
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterModule, setFilterModule] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch Logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res: any = await auditService.getLogs({
          module: filterModule,
          search: searchTerm,
        });
        setLogs(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => fetchLogs(), 500);
    return () => clearTimeout(timer);
  }, [filterModule, searchTerm]);

  // Helper format ngày
  const formatTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "HH:mm - dd/MM/yyyy");
    } catch {
      return isoString;
    }
  };
  // Helper: Màu sắc cho từng hành động
  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1 w-fit">
            <Plus size={10} /> TẠO MỚI
          </span>
        );
      case "UPDATE":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold border border-blue-200 flex items-center gap-1 w-fit">
            <Edit size={10} /> CẬP NHẬT
          </span>
        );
      case "DELETE":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200 flex items-center gap-1 w-fit">
            <Trash2 size={10} /> XÓA BỎ
          </span>
        );
      case "LOGIN":
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold border border-gray-200 flex items-center gap-1 w-fit">
            <LogIn size={10} /> ĐĂNG NHẬP
          </span>
        );
      default:
        return (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold border border-purple-200 flex items-center gap-1 w-fit">
            <Download size={10} /> EXPORT
          </span>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-gray-600" /> Nhật ký Hoạt động
          </h1>
          <p className="text-gray-500 text-sm">
            Theo dõi mọi thay đổi trong hệ thống để đảm bảo tính minh bạch.
          </p>
        </div>
        <button className="border border-gray-300 bg-white text-gray-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
          <Download size={18} /> Xuất Log (CSV)
        </button>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm theo tên Admin, đối tượng..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filter Select */}
          <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="border-none outline-none text-sm font-bold text-slate-700 bg-transparent cursor-pointer"
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <option value="ALL">Tất cả Module</option>
              <option value="USER">Người dùng</option>
              <option value="COURSE">Khóa học</option>
              <option value="FINANCE">Tài chính</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. LOG TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin inline" /> Đang tải nhật ký...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase sticky top-0">
                <tr>
                  <th className="p-4">Thời gian / IP</th>
                  <th className="p-4">Người thực hiện</th>
                  <th className="p-4">Hành động</th>
                  <th className="p-4">Chi tiết tác động</th>
                  <th className="p-4 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="p-4">
                      <div className="font-mono text-xs text-slate-600">
                        {formatTime(log.createdAt)}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                        <ShieldAlert size={10} /> IP: {log.ip || "Unknown"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700">
                        {log.actorName}
                      </div>
                    </td>
                    <td className="p-4">
                      {getActionBadge(log.action)}
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                        Module: {log.module}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">
                        {log.description}
                      </div>
                      <div
                        className="text-xs text-blue-600 truncate max-w-[200px]"
                        title={log.target}
                      >
                        Target: {log.target}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {log.detail &&
                        (log.detail.old ||
                          log.detail.new ||
                          log.detail.input ||
                          log.detail.output) && (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Eye size={16} />
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

      {/* MODAL DETAIL (DIFF VIEW) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Chi tiết thay
                đổi
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-red-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Đối tượng:</div>
                <div className="font-bold text-slate-800 bg-gray-100 p-2 rounded">
                  {selectedLog.target}
                </div>
              </div>

              {/* LOGIC HIỂN THỊ THÔNG MINH */}
              <div className="grid grid-cols-2 gap-4">
                {/* CỘT TRÁI: Dữ liệu Cũ hoặc Input đầu vào */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="text-xs font-bold text-red-500 uppercase mb-2">
                    {selectedLog.detail.old
                      ? "Dữ liệu cũ (Before)"
                      : "Dữ liệu gửi lên (Input)"}
                  </h4>
                  <pre className="text-xs font-mono text-red-800 whitespace-pre-wrap overflow-auto max-h-60">
                    {JSON.stringify(
                      selectedLog.detail.old ||
                        selectedLog.detail.input ||
                        "Không có dữ liệu",
                      null,
                      2,
                    )}
                  </pre>
                </div>

                {/* CỘT PHẢI: Kết quả trả về */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h4 className="text-xs font-bold text-green-600 uppercase mb-2">
                    {selectedLog.detail.new
                      ? "Dữ liệu mới (After)"
                      : "Kết quả trả về (Output)"}
                  </h4>
                  <pre className="text-xs font-mono text-green-800 whitespace-pre-wrap overflow-auto max-h-60">
                    {JSON.stringify(
                      selectedLog.detail.new ||
                        selectedLog.detail.output ||
                        "Không có dữ liệu",
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Terminal,
  Cpu,
  Clock,
  DollarSign,
} from "lucide-react";

// --- TYPES ---
interface AILog {
  id: string;
  feature: string;
  user: string;
  model: string; 
  tokens: number;
  cost: number;
  time: string;
  status: "SUCCESS" | "ERROR";
  prompt: string; 
  response: string; 
  errorDetails?: string; 
}

// --- MOCK DATA EXTENDED ---
const MOCK_LOGS: AILog[] = [
  {
    id: "req_123456789",
    feature: "Chatbot",
    user: "Nguyễn Văn A",
    model: "gpt-3.5-turbo",
    tokens: 450,
    cost: 0.0006,
    time: "2023-10-25 10:30:21",
    status: "SUCCESS",
    prompt: "Giải thích định luật Newton thứ 2 cho học sinh lớp 5.",
    response:
      "Chào em! Định luật 2 Newton giống như việc đẩy một chiếc xe đẩy...",
  },
  {
    id: "req_987654321",
    feature: "Chấm điểm",
    user: "Trần Thị B",
    model: "gpt-4-turbo",
    tokens: 2100,
    cost: 0.03,
    time: "2023-10-25 10:28:15",
    status: "SUCCESS",
    prompt: "Chấm điểm bài luận sau: 'In my opinion, pollution is...'",
    response:
      "Điểm: 7.5/10. \nNhận xét: Cấu trúc tốt, nhưng cần đa dạng từ vựng hơn.",
  },
  {
    id: "req_error_001",
    feature: "Tạo bài tập",
    user: "Admin System",
    model: "gemini-pro",
    tokens: 0,
    cost: 0,
    time: "2023-10-25 10:15:00",
    status: "ERROR",
    prompt: "Tạo 50 câu hỏi trắc nghiệm toán...",
    response: "",
    errorDetails: "Rate limit exceeded (429). Please try again later.",
  },
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `req_mock_${i}`,
    feature: i % 2 === 0 ? "Chatbot" : "Tạo nội dung",
    user: `User ${i}`,
    model: "gpt-3.5-turbo",
    tokens: 150 + i * 10,
    cost: 0.0002,
    time: `2023-10-24 09:${i < 10 ? "0" + i : i}:00`,
    status: "SUCCESS" as const,
    prompt: "Test prompt...",
    response: "Test response...",
  })),
];

interface LogsViewProps {
  logs?: AILog[]; // Make optional to use internal mock if needed
}

export default function LogsView({ logs = MOCK_LOGS }: LogsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "ERROR">(
    "ALL",
  );
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. FILTER LOGIC
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.feature.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 2. PAGINATION LOGIC
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in flex flex-col h-full min-h-[600px]">
        {/* --- TOOLBAR --- */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              placeholder="Tìm theo User, Request ID, Tính năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:border-indigo-500 outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="ERROR">Thất bại</option>
              </select>
              <Filter
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
              <Calendar size={16} />{" "}
              <span className="hidden sm:inline">Thời gian</span>
            </button>

            <button className="px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition shadow-sm">
              <Download size={16} />{" "}
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-4 whitespace-nowrap">Thời gian</th>
                <th className="p-4 whitespace-nowrap">Request ID</th>
                <th className="p-4 whitespace-nowrap">Tính năng</th>
                <th className="p-4 whitespace-nowrap">Người dùng</th>
                <th className="p-4 text-right whitespace-nowrap">Tokens</th>
                <th className="p-4 text-right whitespace-nowrap">Chi phí</th>
                <th className="p-4 text-center whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 transition group"
                  >
                    <td className="p-4 font-mono text-slate-500 text-xs">
                      {log.time}
                    </td>
                    <td
                      className="p-4 font-mono text-slate-800 text-xs font-bold"
                      title={log.id}
                    >
                      {log.id.length > 12
                        ? log.id.substring(0, 8) + "..."
                        : log.id}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700">
                        {log.feature}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.model}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{log.user}</td>
                    <td className="p-4 text-right font-mono">
                      {log.tokens.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-700 font-bold">
                      ${log.cost.toFixed(5)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border
                        ${
                          log.status === "SUCCESS"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle size={10} className="mr-1" />
                        ) : (
                          <AlertTriangle size={10} className="mr-1" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs font-bold whitespace-nowrap"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-slate-400 italic"
                  >
                    Không tìm thấy nhật ký nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -{" "}
            <strong>
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </strong>{" "}
            trên tổng <strong>{filteredLogs.length}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- LOG DETAIL MODAL (SLIDE OVER) --- */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
}

// --- INTERNAL COMPONENT: DETAIL MODAL ---
function LogDetailModal({ log, onClose }: { log: AILog; onClose: () => void }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-full bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5
                ${log.status === "SUCCESS" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
              >
                {log.status === "SUCCESS" ? (
                  <CheckCircle size={12} />
                ) : (
                  <AlertTriangle size={12} />
                )}
                {log.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {log.time}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Terminal size={20} className="text-indigo-600" /> Chi tiết
              Request
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-1">
              ID: {log.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                <Cpu size={10} /> Model
              </div>
              <div className="font-mono text-sm font-bold text-slate-700">
                {log.model}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                Tokens
              </div>
              <div className="font-mono text-sm font-bold text-slate-700">
                {log.tokens.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                <DollarSign size={10} /> Cost
              </div>
              <div className="font-mono text-sm font-bold text-slate-700">
                ${log.cost.toFixed(5)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                <Clock size={10} /> Latency
              </div>
              <div className="font-mono text-sm font-bold text-slate-700">
                1.2s
              </div>
            </div>
          </div>

          {/* Prompt Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                Input Prompt (Câu hỏi)
              </h3>
              <button
                onClick={() => copyToClipboard(log.prompt)}
                className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
              {log.prompt}
            </div>
          </div>

          {/* Response Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                {log.status === "SUCCESS"
                  ? "AI Response (Trả lời)"
                  : "Error Details (Chi tiết lỗi)"}
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    log.status === "SUCCESS"
                      ? log.response
                      : log.errorDetails || "",
                  )
                }
                className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition"
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            {log.status === "SUCCESS" ? (
              <div className="bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {log.response}
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-mono leading-relaxed">
                {log.errorDetails}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

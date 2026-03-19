"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  FileText,
  MessageSquare,
  Send,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

// --- TYPES ---
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type RequestType = "LEAVE" | "DEVICE" | "SALARY" | "OTHER";

interface Request {
  id: string;
  teacher: {
    name: string;
    avatar: string;
    email: string;
  };
  type: RequestType;
  title: string;
  content: string;
  createdAt: string;
  status: RequestStatus;
  adminResponse?: string;
}

// --- MOCK DATA ---
const REQUESTS: Request[] = [
  {
    id: "REQ-001",
    teacher: {
      name: "Cô Minh Anh",
      avatar: "https://i.pravatar.cc/150?img=9",
      email: "minhanh@gmail.com",
    },
    type: "LEAVE",
    title: "Xin nghỉ phép ngày 20/11",
    content: "Tôi có việc gia đình, xin phép nghỉ dạy các lớp tối thứ 4.",
    createdAt: "10:30 AM, Hôm nay",
    status: "PENDING",
  },
  {
    id: "REQ-002",
    teacher: {
      name: "Thầy John Doe",
      avatar: "https://i.pravatar.cc/150?img=11",
      email: "john@gmail.com",
    },
    type: "DEVICE",
    title: "Yêu cầu cấp Webcam mới",
    content: "Webcam hiện tại bị mờ, ảnh hưởng chất lượng lớp Live.",
    createdAt: "09:00 AM, Hôm qua",
    status: "PENDING",
  },
  {
    id: "REQ-003",
    teacher: {
      name: "Cô Lan Hương",
      avatar: "https://i.pravatar.cc/150?img=5",
      email: "lanhuong@gmail.com",
    },
    type: "SALARY",
    title: "Thắc mắc lương tháng 10",
    content: "Giờ dạy lớp K12 chưa được tính đủ.",
    createdAt: "01/11/2023",
    status: "REJECTED",
    adminResponse:
      "Đã kiểm tra log, cô vào lớp muộn 15p nên hệ thống không tính giờ.",
  },
  {
    id: "REQ-004",
    teacher: {
      name: "Thầy Hùng",
      avatar: "https://i.pravatar.cc/150?img=3",
      email: "hung@gmail.com",
    },
    type: "OTHER",
    title: "Đề xuất giáo trình mới",
    content: "Tôi muốn đề xuất thay đổi sách bài tập cho lớp IELTS.",
    createdAt: "28/10/2023",
    status: "APPROVED",
    adminResponse: "Đồng ý, thầy gửi bản thảo qua email cho phòng đào tạo nhé.",
  },
];

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | RequestStatus>("ALL");
  const [selectedReq, setSelectedReq] = useState<Request | null>(null);
  const [responseText, setResponseText] = useState("");

  // --- ACTIONS ---
  const handleProcess = (status: "APPROVED" | "REJECTED") => {
    if (!selectedReq) return;

    // Call API update status & response here
    alert(
      `Đã ${status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"} yêu cầu: ${selectedReq.title}`,
    );

    // Close modal & Reset
    setSelectedReq(null);
    setResponseText("");
  };

  // Filter Logic
  const filteredRequests = REQUESTS.filter(
    (r) => activeTab === "ALL" || r.status === activeTab,
  );
  const pendingCount = REQUESTS.filter((r) => r.status === "PENDING").length;

  // Helper UI
  const getTypeBadge = (type: RequestType) => {
    const map: Record<string, { label: string; color: string }> = {
      LEAVE: { label: "Nghỉ phép", color: "bg-purple-100 text-purple-700" },
      DEVICE: { label: "Thiết bị", color: "bg-blue-100 text-blue-700" },
      SALARY: { label: "Lương thưởng", color: "bg-green-100 text-green-700" },
      OTHER: { label: "Khác", color: "bg-slate-100 text-slate-700" },
    };
    const t = map[type];
    return (
      <span
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.color}`}
      >
        {t.label}
      </span>
    );
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
            <CheckCircle size={12} /> Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
            <XCircle size={12} /> Từ chối
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold border border-orange-200 animate-pulse">
            <Clock size={12} /> Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER & STATS */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          Quản lý Yêu cầu & Đề xuất
        </h1>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 pr-12">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {pendingCount}
              </p>
              <p className="text-xs text-slate-500 uppercase font-bold">
                Cần xử lý ngay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === tab ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-white hover:shadow-sm"}`}
              >
                {tab === "ALL"
                  ? "Tất cả"
                  : tab === "PENDING"
                    ? "Chờ xử lý"
                    : tab === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="Tìm kiếm giáo viên..."
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-4 pl-6">Mã đơn</th>
              <th className="p-4">Giáo viên</th>
              <th className="p-4">Loại / Tiêu đề</th>
              <th className="p-4">Ngày gửi</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-50/80 transition cursor-pointer"
                onClick={() => setSelectedReq(req)}
              >
                <td className="p-4 pl-6 font-mono text-xs text-slate-500">
                  {req.id}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.teacher.avatar}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {req.teacher.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {req.teacher.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {getTypeBadge(req.type)}
                    <p className="text-sm font-medium text-slate-700">
                      {req.title}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">{req.createdAt}</td>
                <td className="p-4">{getStatusBadge(req.status)}</td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-3 opacity-20" />
            <p>Không có yêu cầu nào.</p>
          </div>
        )}
      </div>

      {/* 3. PROCESS MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Xử lý yêu cầu
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedReq.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={selectedReq.teacher.avatar}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedReq.teacher.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Giáo viên • {selectedReq.teacher.email}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Nội dung yêu cầu
                  </span>
                  {getTypeBadge(selectedReq.type)}
                </div>
                <h4 className="font-bold text-slate-800 mb-2">
                  {selectedReq.title}
                </h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">
                  {selectedReq.content}
                </p>
              </div>

              {/* Admin Response Input (Only if PENDING) */}
              {selectedReq.status === "PENDING" ? (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                    Phản hồi của Admin
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none h-24 resize-none"
                    placeholder="Nhập lý do duyệt hoặc từ chối..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-xs font-bold text-yellow-700 uppercase mb-1">
                    Phản hồi từ Admin
                  </p>
                  <p className="text-sm text-yellow-900 italic">
                    {selectedReq.adminResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {selectedReq.status === "PENDING" ? (
              <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                <button
                  onClick={() => handleProcess("REJECTED")}
                  className="flex-1 py-2.5 border border-red-200 text-red-600 bg-white font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Từ chối
                </button>
                <button
                  onClick={() => handleProcess("APPROVED")}
                  className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Duyệt yêu cầu
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Yêu cầu này đã được xử lý.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

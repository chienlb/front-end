"use client";
import { useState } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  Send,
} from "lucide-react";

// --- TYPES ---
type RequestType = "LEAVE" | "DEVICE" | "SALARY" | "OTHER";
type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Request {
  id: number;
  type: RequestType;
  title: string;
  content: string;
  createdAt: string;
  status: Status;
  response?: string; // Phản hồi của Admin
}

// --- MOCK DATA ---
const MY_REQUESTS: Request[] = [
  {
    id: 1,
    type: "LEAVE",
    title: "Xin nghỉ phép ngày 20/11",
    content: "Tôi có việc gia đình, xin phép nghỉ dạy các lớp tối thứ 4.",
    createdAt: "10:00 AM, Hôm qua",
    status: "APPROVED",
    response: "Đã duyệt. Nhớ báo lại lịch dạy bù nhé.",
  },
  {
    id: 2,
    type: "DEVICE",
    title: "Yêu cầu cấp Webcam mới",
    content: "Webcam hiện tại bị mờ, ảnh hưởng chất lượng lớp Live.",
    createdAt: "09:00 AM, 15/10/2023",
    status: "PENDING",
  },
  {
    id: 3,
    type: "SALARY",
    title: "Thắc mắc lương tháng 9",
    content: "Giờ dạy lớp K12 chưa được tính đủ.",
    createdAt: "01/10/2023",
    status: "REJECTED",
    response: "Đã kiểm tra lại log, cô vào lớp muộn 15p nên không tính giờ.",
  },
];

export default function TeacherRequestsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [newRequest, setNewRequest] = useState({
    type: "LEAVE",
    title: "",
    content: "",
  });

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} /> Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={12} /> Từ chối
          </span>
        );
      default:
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={12} /> Đang chờ
          </span>
        );
    }
  };

  const getTypeLabel = (type: RequestType) => {
    const map: Record<string, string> = {
      LEAVE: "Nghỉ phép",
      DEVICE: "Thiết bị",
      SALARY: "Lương thưởng",
      OTHER: "Khác",
    };
    return map[type];
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Yêu Cầu & Đề Xuất
          </h1>
          <p className="text-slate-500 mt-1">
            Gửi đơn từ hành chính tới Ban Quản Trị.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <Plus size={20} /> Tạo yêu cầu mới
        </button>
      </div>

      {/* FILTER & LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${filter === s ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
            >
              {s === "ALL" ? "Tất cả" : s}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {MY_REQUESTS.filter(
            (r) => filter === "ALL" || r.status === filter,
          ).map((req) => (
            <div
              key={req.id}
              className="p-6 hover:bg-slate-50 transition group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">
                    {getTypeLabel(req.type)}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {req.title}
                  </h3>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <p className="text-slate-600 text-sm mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {req.content}
              </p>

              {/* Admin Response */}
              {req.response && (
                <div className="flex gap-3 items-start mt-3 pl-4 border-l-4 border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                    Admin:
                  </div>
                  <p className="text-sm text-slate-700 italic">
                    {req.response}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={14} /> {req.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-black text-slate-800 mb-6">
              Tạo Yêu Cầu Mới
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Loại yêu cầu
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none bg-slate-50"
                  value={newRequest.type}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, type: e.target.value })
                  }
                >
                  <option value="LEAVE">Xin nghỉ phép / Đổi lịch</option>
                  <option value="DEVICE">Hỗ trợ thiết bị / Kỹ thuật</option>
                  <option value="SALARY">Thắc mắc Lương / Thưởng</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Tiêu đề
                </label>
                <input
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                  placeholder="VD: Xin nghỉ dạy ngày 20/11"
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none h-32 resize-none"
                  placeholder="Trình bày rõ lý do và nguyện vọng..."
                  value={newRequest.content}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, content: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 justify-end">
              <button
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  alert("Đã gửi yêu cầu!");
                  setIsCreating(false);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Send size={18} /> Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

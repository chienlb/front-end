"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Send,
  User,
  Paperclip,
  Phone,
  Mail,
  Archive,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supportsService, type SupportItem, type SupportStatus } from "@/services/supports.service";

// --- TYPES ---
type TicketStatus = "PENDING" | "PROCESSING" | "RESOLVED" | "REJECTED";
type TicketPriority = "HIGH" | "NORMAL" | "LOW";

interface Message {
  id: string;
  sender: "PARENT" | "ADMIN";
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface Ticket {
  id: string;
  parentName: string;
  studentName: string;
  avatar: string;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  messages: Message[];
}

const mapStatus = (status?: SupportStatus): TicketStatus => {
  if (status === "in_progress") return "PROCESSING";
  if (status === "resolved") return "RESOLVED";
  if (status === "closed") return "REJECTED";
  return "PENDING";
};

const toTicket = (it: SupportItem, idx: number): Ticket => {
  const id = String(it._id || it.id || `support-${idx}`);
  const created = it.createdAt ? new Date(it.createdAt).toLocaleString("vi-VN") : "Vừa xong";
  const messages: Message[] = [
    {
      id: `${id}-u`,
      sender: "PARENT",
      content: String(it.message || ""),
      timestamp: created,
    },
  ];
  if (it.response) {
    messages.push({
      id: `${id}-a`,
      sender: "ADMIN",
      content: String(it.response),
      timestamp: it.updatedAt ? new Date(it.updatedAt).toLocaleString("vi-VN") : "Vừa xong",
    });
  }
  return {
    id,
    parentName: `User ${String(it.userId || "").slice(-6) || "N/A"}`,
    studentName: "—",
    avatar: "",
    category: "Support",
    subject: String(it.subject || "Yêu cầu hỗ trợ"),
    status: mapStatus(it.status),
    priority: "NORMAL",
    createdAt: created,
    messages,
  };
};

const extractSupportList = (payload: any): SupportItem[] => {
  if (Array.isArray(payload)) return payload as SupportItem[];
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data as SupportItem[];
  if (Array.isArray(payload.items)) return payload.items as SupportItem[];
  if (Array.isArray(payload.results)) return payload.results as SupportItem[];
  if (Array.isArray(payload.supports)) return payload.supports as SupportItem[];
  const nested = payload.data ?? payload.result ?? payload.payload;
  if (nested && typeof nested === "object") return extractSupportList(nested);
  return [];
};

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const styles = {
    PENDING: "bg-red-100 text-red-600 border-red-200",
    PROCESSING: "bg-blue-100 text-blue-600 border-blue-200",
    RESOLVED: "bg-green-100 text-green-600 border-green-200",
    REJECTED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const labels = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    RESOLVED: "Đã xong",
    REJECTED: "Đã hủy",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  useEffect(() => {
    const loadSupports = async () => {
      try {
        setLoading(true);
        const res: any = await supportsService.getSupports();
        const payload = res?.data ?? res;
        const list = extractSupportList(payload);
        const mapped = list.map((it: SupportItem, idx: number) => toTicket(it, idx));
        setTickets(mapped);
        setSelectedId((prev) => prev || mapped[0]?.id || null);
      } catch (error) {
        console.error("Load supports failed:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    void loadSupports();
  }, []);

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "ADMIN",
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedId) {
          return {
            ...t,
            status: t.status === "PENDING" ? "PROCESSING" : t.status, // Auto change status
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      }),
    );
    setReplyText("");
  };

  const changeStatus = (newStatus: TicketStatus) => {
    if (!selectedId) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: newStatus } : t)),
    );
  };

  const filteredTickets =
    filterStatus === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F1F5F9] font-sans">
      {/* 1. LEFT SIDEBAR: TICKET LIST */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-slate-200 bg-white">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-800">
              Yêu cầu hỗ trợ
            </h2>
            <div className="flex gap-2">
              <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-lg">
                {tickets.filter((t) => t.status === "PENDING").length} Chờ
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Tìm tên, mã yêu cầu..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {["ALL", "PENDING", "PROCESSING", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition
                  ${
                    filterStatus === status
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                {status === "ALL" ? "Tất cả" : status}
              </button>
            ))}
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4 text-sm text-slate-500">Đang tải dữ liệu...</div>}
          {!loading && filteredTickets.length === 0 && (
            <div className="p-4 text-sm text-slate-500">Chưa có yêu cầu hỗ trợ.</div>
          )}
          {!loading && filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedId(ticket.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50
                ${selectedId === ticket.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {ticket.priority === "HIGH" && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  <span className="font-bold text-sm text-slate-800 line-clamp-1">
                    {ticket.parentName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {ticket.createdAt}
                </span>
              </div>

              <h4
                className={`text-sm font-semibold mb-1 ${selectedId === ticket.id ? "text-blue-700" : "text-slate-600"}`}
              >
                {ticket.subject}
              </h4>

              <div className="flex justify-between items-center mt-3">
                <StatusBadge status={ticket.status} />
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  {ticket.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RIGHT CONTENT: TICKET DETAIL */}
      <div className="flex-1 bg-slate-50 flex flex-col min-w-0">
        {selectedTicket ? (
          <>
            {/* Detail Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {selectedTicket.subject}
                    <span className="text-xs font-normal text-slate-400">
                      ({selectedTicket.id})
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} /> {selectedTicket.parentName}
                    <span className="text-slate-300">|</span>
                    <span>Học sinh: {selectedTicket.studentName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedTicket.status !== "RESOLVED" ? (
                  <button
                    onClick={() => changeStatus("RESOLVED")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    <CheckCircle size={16} /> Hoàn tất
                  </button>
                ) : (
                  <button
                    onClick={() => changeStatus("PROCESSING")}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition"
                  >
                    <Archive size={16} /> Mở lại
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Alert */}
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 max-w-3xl mx-auto">
                <AlertCircle size={20} className="shrink-0" />
                <div>
                  <p className="font-bold">Lưu ý từ hệ thống:</p>
                  <p className="opacity-80">
                    Đây là yêu cầu ưu tiên {selectedTicket.priority}. Vui lòng
                    phản hồi trong vòng 24h.
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Phone size={12} /> 0912.345.678
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Mail size={12} /> parent@email.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-200 relative my-6">
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-slate-50 px-3 text-xs text-slate-400 font-bold">
                  Bắt đầu hội thoại
                </span>
              </div>

              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "ADMIN" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col max-w-[70%] ${msg.sender === "ADMIN" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-600">
                        {msg.sender === "ADMIN"
                          ? "Hỗ trợ viên (Bạn)"
                          : selectedTicket.parentName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${
                        msg.sender === "ADMIN"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Reply Area */}
            <div className="p-5 bg-white border-t border-slate-200 shrink-0">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none"
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Paperclip size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
                      Mẫu câu chào
                    </button>
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
                      Mẫu câu kết thúc
                    </button>
                  </div>
                  <button
                    onClick={handleReply}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-200"
                  >
                    <Send size={16} /> Gửi phản hồi
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <MessageSquare size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              Chưa chọn yêu cầu nào
            </h3>
            <p className="text-slate-500 text-sm">
              Vui lòng chọn một yêu cầu từ danh sách bên trái để bắt đầu xử lý.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

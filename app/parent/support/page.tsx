"use client";
import { useState, useRef, useEffect } from "react";
import {
  LifeBuoy,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Send,
  X,
  Paperclip,
} from "lucide-react";

// --- TYPES ---
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Message {
  id: string;
  sender: "ME" | "ADMIN";
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  createdAt: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastUpdate: string;
  messages: Message[];
}

interface FAQ {
  question: string;
  answer: string;
}

// --- MOCK DATA ---
const MY_TICKETS: Ticket[] = [
  {
    id: "#TK-2023-001",
    subject: "Lỗi thanh toán gói Premium qua VNPay",
    category: "Thanh toán",
    createdAt: "10:30 AM, Hôm nay",
    status: "OPEN",
    priority: "URGENT",
    lastUpdate: "Vừa xong",
    messages: [
      {
        id: "m1",
        sender: "ME",
        content:
          "Tôi đã thanh toán qua VNPay nhưng tài khoản vẫn chưa được nâng cấp.",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: "#TK-2023-002",
    subject: "Không xem được video bài học Unit 5",
    category: "Lỗi kỹ thuật",
    createdAt: "15/11/2023",
    status: "RESOLVED",
    priority: "MEDIUM",
    lastUpdate: "16/11/2023",
    messages: [
      {
        id: "m1",
        sender: "ME",
        content: "Video bài học Unit 5 bị lỗi loading mãi không chạy.",
        timestamp: "15/11/2023 09:00",
      },
      {
        id: "m2",
        sender: "ADMIN",
        content:
          "Chào bạn, kỹ thuật đã kiểm tra và khắc phục server. Bạn thử tải lại trang nhé.",
        timestamp: "15/11/2023 10:30",
      },
      {
        id: "m3",
        sender: "ME",
        content: "Cảm ơn, mình xem được rồi ạ.",
        timestamp: "15/11/2023 11:00",
      },
    ],
  },
];

const FAQS: FAQ[] = [
  {
    question: "Làm sao để gia hạn gói học?",
    answer:
      "Quý phụ huynh vui lòng truy cập menu 'Gói học & Thanh toán', chọn gói muốn mua và tiến hành thanh toán.",
  },
  {
    question: "Tôi có thể dùng chung tài khoản cho 2 bé không?",
    answer:
      "Không. Mỗi bé cần một tài khoản riêng để hệ thống theo dõi tiến độ chính xác.",
  },
];

export default function ParentSupportPage() {
  const [activeTab, setActiveTab] = useState<"TICKETS" | "FAQ">("TICKETS");
  const [isCreating, setIsCreating] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTicket = MY_TICKETS.find((t) => t.id === selectedTicketId);

  // Auto scroll khi mở ticket hoặc có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket]);

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedTicket) return;
    // Mock gửi tin nhắn (Trong thực tế sẽ gọi API)
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "ME",
      content: replyInput,
      timestamp: "Vừa xong",
    };
    selectedTicket.messages.push(newMessage);
    setReplyInput("");
  };

  const getStatusBadge = (status: TicketStatus) => {
    const styles = {
      OPEN: "bg-blue-50 text-blue-600 border-blue-100",
      IN_PROGRESS: "bg-orange-50 text-orange-600 border-orange-100",
      RESOLVED: "bg-green-50 text-green-600 border-green-100",
      CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const icons = {
      OPEN: <Clock size={12} />,
      IN_PROGRESS: <LifeBuoy size={12} />,
      RESOLVED: <CheckCircle size={12} />,
      CLOSED: <X size={12} />,
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${styles[status]}`}
      >
        {icons[status]} {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER HERO */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Trung tâm Hỗ trợ</h1>
            <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
              Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc 24/7.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
            >
              <Plus size={20} /> Tạo yêu cầu mới
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 flex-col lg:flex-row h-[calc(100vh-300px)] min-h-[500px]">
        {/* LEFT: TICKET LIST / MENU */}
        <div
          className={`flex-1 flex flex-col ${selectedTicketId ? "hidden lg:flex" : "flex"}`}
        >
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-1">
            <button
              onClick={() => setActiveTab("TICKETS")}
              className={`pb-3 text-sm font-bold border-b-2 transition ${activeTab === "TICKETS" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-800"}`}
            >
              Lịch sử yêu cầu
            </button>
            <button
              onClick={() => setActiveTab("FAQ")}
              className={`pb-3 text-sm font-bold border-b-2 transition ${activeTab === "FAQ" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-800"}`}
            >
              Câu hỏi thường gặp
            </button>
          </div>

          {/* List Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            {activeTab === "TICKETS" ? (
              <div className="flex-1 overflow-y-auto">
                {MY_TICKETS.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition group
                      ${selectedTicketId === ticket.id ? "bg-blue-50 border-l-4 border-l-blue-600 pl-3" : "pl-4"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-400">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ticket.lastUpdate}
                      </span>
                    </div>
                    <h4
                      className={`font-bold text-sm mb-2 ${selectedTicketId === ticket.id ? "text-blue-700" : "text-slate-800"}`}
                    >
                      {ticket.subject}
                    </h4>
                    <div className="flex justify-between items-center">
                      {getStatusBadge(ticket.status)}
                      {ticket.priority === "URGENT" && (
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          KHẨN CẤP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 space-y-4 overflow-y-auto">
                {FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <h3 className="font-bold text-slate-800 text-sm mb-2 flex gap-2">
                      <span className="text-blue-600">Q:</span> {faq.question}
                    </h3>
                    <p className="text-slate-600 text-sm pl-5">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: TICKET DETAIL / CHAT */}
        <div
          className={`w-full lg:w-[60%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden 
          ${selectedTicketId ? "flex" : "hidden lg:flex"}`}
        >
          {selectedTicket ? (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="lg:hidden p-2 -ml-2 hover:bg-slate-200 rounded-full text-slate-500"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">
                      {selectedTicket.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {selectedTicket.id}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {selectedTicket.category}
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "ME" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm
                      ${
                        msg.sender === "ME"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${msg.sender === "ME" ? "text-blue-200" : "text-slate-400"}`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* System Message */}
                {selectedTicket.status === "RESOLVED" && (
                  <div className="flex justify-center my-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                      Yêu cầu đã được giải quyết
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {selectedTicket.status !== "RESOLVED" &&
                selectedTicket.status !== "CLOSED" && (
                  <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="flex gap-2">
                      <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition">
                        <Paperclip size={20} />
                      </button>
                      <input
                        type="text"
                        placeholder="Nhập phản hồi..."
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-xl px-4 text-sm outline-none transition"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendReply()
                        }
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyInput.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                )}
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={32} />
              </div>
              <p className="font-medium">Chọn một yêu cầu để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo yêu cầu mới</h2>
              <button onClick={() => setIsCreating(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full border rounded-xl p-3 text-sm"
                placeholder="Tiêu đề..."
              />
              <textarea
                className="w-full border rounded-xl p-3 text-sm h-32"
                placeholder="Chi tiết..."
              />
              <button
                onClick={() => setIsCreating(false)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

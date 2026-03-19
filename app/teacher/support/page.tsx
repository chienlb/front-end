"use client";
import { useState } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Check,
  Clock,
  Headphones,
  ChevronLeft,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: "OPEN" | "RESOLVED";
  lastMsg: string;
  time: string;
}

const MY_TICKETS: Ticket[] = [
  {
    id: "TK-001",
    subject: "Lỗi không vào được lớp Live",
    status: "OPEN",
    lastMsg: "Admin: Bạn thử f5 lại nhé",
    time: "5p trước",
  },
  {
    id: "TK-002",
    subject: "Hỏi về quy trình chấm điểm",
    status: "RESOLVED",
    lastMsg: "Cảm ơn admin đã hỗ trợ",
    time: "2 ngày trước",
  },
];

export default function TeacherSupportPage() {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(
    MY_TICKETS[0],
  );
  const [msgInput, setMsgInput] = useState("");

  // Mock Chat content
  const messages = [
    {
      id: 1,
      sender: "ME",
      content: "Alo admin ơi, lớp Live 10A1 mình không vào được.",
      time: "10:00",
    },
    {
      id: 2,
      sender: "ADMIN",
      content: "Chào thầy/cô. Hệ thống báo lỗi gì vậy ạ?",
      time: "10:02",
    },
    {
      id: 3,
      sender: "ME",
      content: "Nó cứ quay vòng tròn mãi không load được video.",
      time: "10:03",
    },
    {
      id: 4,
      sender: "ADMIN",
      content:
        "Bạn thử f5 lại hoặc đổi trình duyệt giúp mình nhé. Server vừa update.",
      time: "10:05",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* LEFT: TICKET LIST */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <h1 className="font-black text-xl text-slate-800 flex items-center gap-2">
            <Headphones className="text-blue-600" /> Hỗ Trợ
          </h1>
          <button className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition">
            + Tạo ticket mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MY_TICKETS.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${activeTicket?.id === ticket.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-xs text-slate-500">
                  {ticket.id}
                </span>
                <span className="text-[10px] text-slate-400">
                  {ticket.time}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate mb-1">
                {ticket.subject}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {ticket.lastMsg}
              </p>
              {ticket.status === "OPEN" ? (
                <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  Đang xử lý
                </span>
              ) : (
                <span className="mt-2 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                  Đã xong
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {activeTicket ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm">
              <div>
                <h2 className="font-bold text-slate-800">
                  {activeTicket.subject}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Admin Support đang trực tuyến
                </p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "ME" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === "ME" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"}`}
                  >
                    <p>{msg.content}</p>
                    <span
                      className={`text-[10px] block mt-1 text-right ${msg.sender === "ME" ? "text-blue-200" : "text-slate-400"}`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2 items-end bg-slate-100 p-2 rounded-xl border border-slate-200">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition">
                  <Paperclip size={20} />
                </button>
                <textarea
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 resize-none max-h-32 py-2"
                  rows={1}
                  placeholder="Nhập tin nhắn..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                />
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageSquare size={64} className="opacity-20 mb-4" />
            <p className="font-bold">Chọn một hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}

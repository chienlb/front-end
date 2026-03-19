"use client";
import { useState } from "react";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  CheckCheck,
  Clock,
  ChevronLeft,
} from "lucide-react";

// --- TYPES ---
interface TeacherContact {
  id: string;
  name: string;
  avatar: string;
  subject: string; // Môn dạy
  childName: string; // Dạy bé nào
  status: "ONLINE" | "OFFLINE";
  lastSeen?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: "ME" | "TEACHER";
  content: string;
  timestamp: string;
  status: "SENT" | "READ";
}

// --- MOCK DATA ---
const CONTACTS: TeacherContact[] = [
  {
    id: "T01",
    name: "Cô Lan Anh",
    avatar: "https://ui-avatars.com/api/?name=Lan+Anh&background=random",
    subject: "Tiếng Anh Giao Tiếp (Lớp 3A)",
    childName: "Bé An",
    status: "ONLINE",
    lastMessage: "Bé An hôm nay học rất tốt ạ!",
    lastMessageTime: "10:30",
    unreadCount: 2,
  },
  {
    id: "T02",
    name: "Thầy John Smith",
    avatar: "https://ui-avatars.com/api/?name=John+Smith&background=random",
    subject: "IELTS Speaking",
    childName: "Bé An",
    status: "OFFLINE",
    lastSeen: "Online 2 giờ trước",
    lastMessage: "Please remind him to do homework.",
    lastMessageTime: "Hôm qua",
    unreadCount: 0,
  },
  {
    id: "T03",
    name: "Cô Thu Hà",
    avatar: "https://ui-avatars.com/api/?name=Thu+Ha&background=random",
    subject: "Ngữ Pháp Cơ Bản",
    childName: "Bé Ngọc",
    status: "OFFLINE",
    lastSeen: "Online 15 phút trước",
    lastMessage: "Vâng chị, em đã nhận được thông tin.",
    lastMessageTime: "2 ngày trước",
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "M1",
    senderId: "ME",
    content: "Chào cô, hôm nay bé An có vẻ hơi mệt.",
    timestamp: "08:00",
    status: "READ",
  },
  {
    id: "M2",
    senderId: "TEACHER",
    content: "Chào chị. Vâng em thấy bé ít phát biểu hơn mọi ngày.",
    timestamp: "08:15",
    status: "READ",
  },
  {
    id: "M3",
    senderId: "ME",
    content: "Nhờ cô để ý giúp bé nhé. Cảm ơn cô.",
    timestamp: "08:20",
    status: "READ",
  },
  {
    id: "M4",
    senderId: "TEACHER",
    content: "Dạ chị yên tâm. Cuối giờ em sẽ nhắn lại tình hình ạ.",
    timestamp: "08:30",
    status: "READ",
  },
  {
    id: "M5",
    senderId: "TEACHER",
    content: "Bé An hôm nay học rất tốt ạ! Em đã cho bé nghỉ sớm 5 phút.",
    timestamp: "10:30",
    status: "READ",
  },
];

export default function ParentMessagesPage() {
  const [selectedContact, setSelectedContact] = useState<TeacherContact | null>(
    CONTACTS[0],
  );
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "ME",
      content: inputMsg,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "SENT",
    };
    setMessages([...messages, newMsg]);
    setInputMsg("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. LEFT SIDEBAR: CONTACT LIST */}
      <div
        className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-80 bg-white border-r border-slate-200 flex-col`}
      >
        {/* Header Search */}
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-xl font-black text-slate-800 mb-4">Tin nhắn</h1>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
              placeholder="Tìm giáo viên..."
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {CONTACTS.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition hover:bg-slate-50 ${selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
            >
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {contact.status === "ONLINE" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {contact.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {contact.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                    {contact.subject} • {contact.childName}
                  </p>
                  <p
                    className={`text-xs truncate ${contact.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500"}`}
                  >
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RIGHT SIDE: CHAT WINDOW */}
      {selectedContact ? (
        <div
          className={`flex-1 flex flex-col h-full bg-[#F2F6FC] ${!selectedContact ? "hidden md:flex" : "flex"}`}
        >
          {/* Chat Header */}
          <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-6 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="relative">
                <img
                  src={selectedContact.avatar}
                  className="w-10 h-10 rounded-full"
                />
                {selectedContact.status === "ONLINE" && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm md:text-base">
                  {selectedContact.name}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {selectedContact.status === "ONLINE" ? (
                    <span className="text-green-600 font-bold">
                      Đang trực tuyến
                    </span>
                  ) : (
                    selectedContact.lastSeen
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-1 md:gap-3">
              <button
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"
                title="Gọi điện"
              >
                <Phone size={20} />
              </button>
              <button
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"
                title="Video call"
              >
                <Video size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === "ME" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[80%] md:max-w-[60%] ${msg.senderId === "ME" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.senderId === "ME"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {msg.timestamp}
                    </span>
                    {msg.senderId === "ME" &&
                      (msg.status === "READ" ? (
                        <CheckCheck size={12} className="text-blue-500" />
                      ) : (
                        <CheckCheck size={12} className="text-slate-300" />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition hidden sm:block">
                <ImageIcon size={20} />
              </button>

              <div className="flex-1 bg-slate-100 rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition">
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="Nhập tin nhắn..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="ml-2 text-slate-400 hover:text-orange-500">
                  <Smile size={20} />
                </button>
              </div>

              <button
                onClick={handleSend}
                className={`p-3 rounded-full text-white shadow-lg transition transform active:scale-95 ${inputMsg.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"}`}
              >
                <Send size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50 text-slate-400">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Phone size={40} className="text-slate-300" />
          </div>
          <p className="font-bold text-lg text-slate-600">
            Chọn một giáo viên để bắt đầu trò chuyện
          </p>
          <p className="text-sm">
            Bạn có thể trao đổi về tình hình học tập của con.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
  Image as ImageIcon,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Edit,
} from "lucide-react";

// --- TYPES ---
type UserStatus = "ONLINE" | "OFFLINE" | "BUSY";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  role: "TEACHER" | "STUDENT" | "GROUP";
  status: UserStatus;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: "ME" | "OTHER";
  content: string;
  timestamp: string;
  type: "TEXT" | "IMAGE";
  status: "SENT" | "DELIVERED" | "READ";
}

// --- MOCK DATA ---
const CONTACTS: Contact[] = [
  {
    id: "C1",
    name: "Lớp Tiếng Anh 3A",
    avatar:
      "https://ui-avatars.com/api/?name=Lop+3A&background=6366f1&color=fff&bold=true",
    role: "GROUP",
    status: "ONLINE",
    lastMessage: "Cô Lan: Nhớ làm bài tập về nhà nhé các em! 📚",
    time: "10:30",
    unread: 3,
  },
  {
    id: "C2",
    name: "Ms. Sarah Wilson",
    avatar: "https://i.pravatar.cc/150?img=32",
    role: "TEACHER",
    status: "ONLINE",
    lastMessage: "Great job on your pronunciation today! 🌟",
    time: "09:15",
    unread: 0,
  },
  {
    id: "C3",
    name: "Trần Minh Hiếu",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "STUDENT",
    status: "OFFLINE",
    lastMessage: "Tối nay cậu có rảnh không? Chơi game đi 🎮",
    time: "Hôm qua",
    unread: 0,
  },
  {
    id: "C4",
    name: "Bé Nana",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "STUDENT",
    status: "BUSY",
    lastMessage: "Mai đi học nhớ đem sách cho tớ nha",
    time: "Hôm qua",
    unread: 0,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "OTHER",
    content: "Hello! How are you today? 👋",
    timestamp: "09:00",
    type: "TEXT",
    status: "READ",
  },
  {
    id: "2",
    senderId: "ME",
    content:
      "I'm fine, thank you teacher. And you? \nI just finished my homework! 📝",
    timestamp: "09:01",
    type: "TEXT",
    status: "READ",
  },
  {
    id: "3",
    senderId: "OTHER",
    content: "I'm doing great. Did you find the exercise difficult?",
    timestamp: "09:02",
    type: "TEXT",
    status: "READ",
  },
  {
    id: "4",
    senderId: "ME",
    content: "A little bit, but I tried my best! 💪",
    timestamp: "09:05",
    type: "TEXT",
    status: "READ",
  },
  {
    id: "5",
    senderId: "OTHER",
    content: "Great job on your pronunciation today! Keep it up 🌟",
    timestamp: "09:15",
    type: "TEXT",
    status: "READ",
  },
];

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khi chuyển Contact -> Cuộn tức thì (Auto) để tránh cảm giác bị kéo
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  // }, [selectedContact]);

  // Khi có tin nhắn mới -> Cuộn mượt (Smooth)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "ME",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "TEXT",
      status: "SENT",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F0F4F8] font-sans md:p-4 overflow-hidden box-border">
      <div className="flex w-full h-full bg-white md:rounded-[2rem] shadow-sm md:shadow-xl overflow-hidden border border-slate-200">
        {/* --- SIDEBAR --- */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-100 flex flex-col transition-all duration-300
          ${selectedContact ? "hidden md:flex" : "flex"}`}
        >
          {/* Header Sidebar */}
          <div className="p-5 pb-2 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Tin nhắn
              </h2>
              <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition">
                <Edit size={18} />
              </button>
            </div>
            <div className="relative group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Contact List (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar space-y-1 min-h-0">
            <div className="px-2 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gần đây
            </div>
            {CONTACTS.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`group p-3 flex gap-3.5 cursor-pointer rounded-2xl transition-all duration-200 border border-transparent
                ${
                  selectedContact?.id === contact.id
                    ? "bg-indigo-50 border-indigo-100 shadow-sm"
                    : "hover:bg-slate-50 hover:border-slate-100"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                  />
                  {contact.status === "ONLINE" && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {contact.status === "BUSY" && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4
                      className={`font-bold truncate text-sm ${selectedContact?.id === contact.id ? "text-indigo-900" : "text-slate-700"}`}
                    >
                      {contact.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-xs truncate max-w-[160px] ${contact.unread > 0 ? "text-slate-800 font-bold" : "text-slate-500"}`}
                    >
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full shadow-sm">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- CHAT AREA --- */}
        <div
          className={`flex-1 flex flex-col bg-[#F8FAFC] relative min-w-0 ${!selectedContact ? "hidden md:flex" : "flex"}`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header (Fixed Height) */}
              <div className="h-18 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedContact.avatar}
                      className="w-10 h-10 rounded-full border border-slate-200 shadow-sm"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${selectedContact.status === "ONLINE" ? "bg-green-500" : "bg-slate-300"}`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                      {selectedContact.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      {selectedContact.status === "ONLINE" ? (
                        <span className="text-green-600">Đang hoạt động</span>
                      ) : (
                        "Hoạt động 15 phút trước"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition">
                    <Phone size={18} />
                  </button>
                  <button className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition">
                    <Video size={18} />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-h-0">
                <div className="text-center py-2">
                  <span className="bg-slate-200/50 backdrop-blur text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/50">
                    Hôm nay
                  </span>
                </div>

                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === "ME";
                  const isLast =
                    idx === messages.length - 1 ||
                    messages[idx + 1].senderId !== msg.senderId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    >
                      {!isMe && (
                        <img
                          src={selectedContact.avatar}
                          className={`w-8 h-8 rounded-full self-end mr-2 shadow-sm border border-white ${!isLast ? "opacity-0" : ""}`}
                        />
                      )}
                      <div
                        className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`px-5 py-3 text-sm leading-relaxed shadow-sm break-words relative
                          ${isMe ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100"} 
                          ${!isLast && isMe ? "mb-1 rounded-tr-2xl" : ""} ${!isLast && !isMe ? "mb-1 rounded-tl-2xl" : ""}`}
                        >
                          {msg.content.split("\n").map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-1" : ""}>
                              {line}
                            </p>
                          ))}
                        </div>
                        {isLast && (
                          <div
                            className={`flex items-center gap-1 mt-1 px-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-slate-400" : "text-slate-400"}`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe &&
                              (msg.status === "READ" ? (
                                <CheckCheck
                                  size={12}
                                  className="text-indigo-500"
                                />
                              ) : (
                                <Check size={12} />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area (Fixed Bottom) */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 max-w-4xl mx-auto"
                >
                  <div className="flex gap-1 pb-2">
                    <button
                      type="button"
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      type="button"
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition hidden sm:block"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <input
                      className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-32 py-2 font-medium"
                      placeholder="Nhập tin nhắn..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="ml-2 p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition"
                    >
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`p-3.5 rounded-full shadow-lg transition transform active:scale-95 mb-0.5 ${inputValue.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                  >
                    {inputValue.trim() ? (
                      <Send size={18} fill="currentColor" className="ml-0.5" />
                    ) : (
                      <Mic size={18} />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
              <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100 border border-white rotate-3 mb-6">
                <span className="text-6xl">💬</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
                Smart<span className="text-indigo-600">Chat</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-xs mb-8">
                Kết nối với bạn bè và thầy cô ngay!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

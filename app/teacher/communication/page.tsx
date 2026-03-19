"use client";
import { useState } from "react";
import {
  Search,
  MessageSquare,
  Users,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Check,
  CheckCheck,
  Archive,
  Star,
  PhoneIncoming,
  AlertCircle,
  FileText,
} from "lucide-react";

// --- TYPES ---
type ChatType = "PROFESSIONAL" | "PARENT";

interface Message {
  id: number;
  sender: "ME" | "OTHER";
  content: string;
  time: string;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  type: ChatType;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isOnline?: boolean;
  membersCount?: number;
  studentName?: string;
  relatedClass?: string;
  phone?: string;
}

// --- MOCK DATA ---
const PROFESSIONAL_CHATS: Conversation[] = [
  {
    id: "pro1",
    name: "Tổ Tiếng Anh - THPT",
    avatar: "https://ui-avatars.com/api/?name=TE&background=0D8ABC&color=fff",
    type: "PROFESSIONAL",
    lastMessage: "Mọi người nhớ nộp giáo án tuần tới nhé!",
    lastTime: "10:30",
    unreadCount: 3,
    membersCount: 15,
  },
  {
    id: "pro2",
    name: "Hội đồng sư phạm",
    avatar: "https://ui-avatars.com/api/?name=HD&background=6366f1&color=fff",
    type: "PROFESSIONAL",
    lastMessage: "Thông báo lịch họp tháng 11...",
    lastTime: "Hôm qua",
    unreadCount: 0,
    membersCount: 42,
  },
];

const PARENT_CHATS: Conversation[] = [
  {
    id: "par1",
    name: "PH em Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=11",
    type: "PARENT",
    lastMessage: "Thưa cô, sao hôm nay lớp Live bị mất tiếng ạ?",
    lastTime: "Vừa xong",
    unreadCount: 1,
    isOnline: true,
    studentName: "Nguyễn Văn An",
    relatedClass: "Lớp Tiếng Anh Giao Tiếp K12",
    phone: "0912.345.678",
  },
  {
    id: "par2",
    name: "PH em Trần Bảo Ngọc",
    avatar: "https://i.pravatar.cc/150?img=5",
    type: "PARENT",
    lastMessage: "Cảm ơn cô đã quan tâm cháu ạ.",
    lastTime: "Hôm qua",
    unreadCount: 0,
    studentName: "Trần Bảo Ngọc",
    relatedClass: "Luyện thi IELTS 6.0",
    phone: "0987.654.321",
  },
];

const MOCK_MESSAGES: Message[] = [
  { id: 1, sender: "OTHER", content: "Chào cô giáo ạ!", time: "09:00" },
  {
    id: 2,
    sender: "ME",
    content: "Vâng chào anh/chị, mình cần hỗ trợ gì không ạ?",
    time: "09:05",
    isRead: true,
  },
  {
    id: 3,
    sender: "OTHER",
    content:
      "Thưa cô, sao hôm nay lớp Live bị mất tiếng ạ? Cháu nhà tôi không nghe thấy gì.",
    time: "Vừa xong",
  },
];

export default function TeacherCommunicationPage() {
  const [activeTab, setActiveTab] = useState<ChatType>("PROFESSIONAL");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  // Lấy danh sách chat dựa theo tab
  const conversationList =
    activeTab === "PROFESSIONAL" ? PROFESSIONAL_CHATS : PARENT_CHATS;

  // Lấy hội thoại đang chọn
  const activeConversation =
    conversationList.find((c) => c.id === selectedChatId) || PARENT_CHATS[0]; // Mặc định để demo

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      {/* 1. SIDEBAR DANH SÁCH (LEFT)  */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-slate-100">
          <h1 className="font-black text-xl text-slate-800 mb-4">Tin nhắn</h1>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("PROFESSIONAL")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === "PROFESSIONAL" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users size={14} /> Chuyên môn
            </button>
            <button
              onClick={() => setActiveTab("PARENT")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === "PARENT" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Star size={14} /> Phụ huynh
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition"
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversationList.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 flex gap-3 cursor-pointer transition hover:bg-slate-50 ${selectedChatId === chat.id ? "bg-blue-50/60 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4
                    className={`text-sm font-bold truncate ${selectedChatId === chat.id ? "text-blue-900" : "text-slate-800"}`}
                  >
                    {chat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {chat.lastTime}
                  </span>
                </div>
                <p
                  className={`text-xs truncate ${chat.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500"}`}
                >
                  {chat.unreadCount > 0 && (
                    <span className="text-blue-600">● </span>
                  )}
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MAIN CHAT WINDOW (CENTER) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#EFEAE2] relative">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
        ></div>

        {/* Chat Header */}
        <div className="bg-white px-6 py-3 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={activeConversation.avatar}
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {activeConversation.name}
                {activeConversation.type === "PARENT" && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full uppercase">
                    Phụ huynh
                  </span>
                )}
              </h3>
              {activeConversation.isOnline ? (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{" "}
                  Đang hoạt động
                </p>
              ) : (
                <p className="text-xs text-slate-400">Truy cập 15 phút trước</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2.5 hover:bg-slate-100 text-blue-600 rounded-full transition bg-blue-50">
              <Phone size={20} />
            </button>
            <button className="p-2.5 hover:bg-slate-100 text-blue-600 rounded-full transition bg-blue-50">
              <Video size={20} />
            </button>
            <button className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-full transition">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
          {activeConversation.type === "PARENT" &&
            activeConversation.relatedClass && (
              <div className="flex justify-center">
                <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-sm">
                  <AlertCircle size={14} />
                  Phụ huynh đang hỏi về:{" "}
                  <strong>{activeConversation.relatedClass}</strong>
                </div>
              </div>
            )}

          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "ME" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative group ${msg.sender === "ME" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"}`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div
                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.sender === "ME" ? "text-blue-200" : "text-slate-400"}`}
                >
                  {msg.time}
                  {msg.sender === "ME" &&
                    (msg.isRead ? (
                      <CheckCheck size={12} />
                    ) : (
                      <Check size={12} />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200 z-10">
          <div className="flex gap-3 items-end bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex gap-1 pb-1">
              <button className="p-2 text-slate-400 hover:bg-white hover:text-blue-600 rounded-lg transition">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:bg-white hover:text-blue-600 rounded-lg transition">
                <ImageIcon size={20} />
              </button>
            </div>
            <textarea
              className="flex-1 bg-transparent outline-none text-sm text-slate-800 resize-none max-h-32 py-2.5 placeholder:text-slate-400"
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <div className="flex gap-1 pb-1">
              <button className="p-2 text-slate-400 hover:text-yellow-500 transition">
                <Smile size={20} />
              </button>
              <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INFO SIDEBAR (RIGHT) */}
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col hidden xl:flex">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center">
          <img
            src={activeConversation.avatar}
            className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-sm mb-3"
          />
          <h3 className="font-black text-slate-800 text-center text-lg">
            {activeConversation.name}
          </h3>
          {activeConversation.type === "PARENT" && (
            <span className="mt-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {activeConversation.phone}
            </span>
          )}
        </div>

        {/* Thông tin cụ thể */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeConversation.type === "PROFESSIONAL" ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Tài liệu đã chia sẻ
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        Bien_ban_hop.docx
                      </p>
                      <p className="text-[10px] text-slate-400">
                        1.2 MB • Hôm qua
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Thành viên ({activeConversation.membersCount})
                </h4>
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src={`https://i.pravatar.cc/150?img=${i + 20}`}
                    />
                  ))}
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-2 ring-white">
                    +11
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Giao diện cho Phụ huynh
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                  <Users size={14} /> Thông tin học sinh
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ tên:</span>
                    <span className="font-bold text-slate-800">
                      {activeConversation.studentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lớp:</span>
                    <span
                      className="font-bold text-slate-800 truncate w-32 text-right"
                      title={activeConversation.relatedClass}
                    >
                      {activeConversation.relatedClass}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Lịch sử cuộc gọi
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-full">
                      <PhoneIncoming size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Cuộc gọi nhỡ
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Hôm qua, 18:30
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2">
            <Archive size={16} /> Lưu trữ hội thoại
          </button>
        </div>
      </div>
    </div>
  );
}

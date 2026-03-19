"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Search,
  MessageCircle,
  UserMinus,
  UserPlus,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Mail,
  Zap,
  Star,
  Gamepad2,
  Trophy,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const MOCK_FRIENDS = [
  {
    id: "1",
    name: "Bé Nana",
    avatar: "https://i.pravatar.cc/150?img=5",
    level: 12,
    status: "online",
    rank: "Kim Cương",
  },
  {
    id: "2",
    name: "Siêu Nhân",
    avatar: "https://i.pravatar.cc/150?img=11",
    level: 8,
    status: "offline",
    rank: "Vàng",
  },
  {
    id: "3",
    name: "Mèo Kitty",
    avatar: "🐱",
    level: 5,
    status: "online",
    rank: "Bạc",
  },
];

const MOCK_REQUESTS = [
  {
    id: "req_1",
    name: "Khủng Long T-Rex",
    avatar: "🦖",
    level: 15,
    time: new Date().toISOString(),
  },
  {
    id: "req_2",
    name: "Công Chúa Elsa",
    avatar: "https://i.pravatar.cc/150?img=9",
    level: 6,
    time: new Date().toISOString(),
  },
];

// --- CHAT MODAL (Cool Blue Theme) ---
const ChatModal = ({ friend, onClose }: any) => {
  const [messages, setMessages] = useState<any[]>([
    { sender: "friend", text: `Hi! Tớ là ${friend.name}. 👋` },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "me", text: input }]);
    setInput("");
    setTimeout(() => {
      const replies = [
        "Tuyệt quá! 🌟",
        "Chiến game ko? 🎮",
        "Tớ đang làm bài tập 📚",
        "Hihi 😂",
      ];
      setMessages((prev) => [
        ...prev,
        {
          sender: "friend",
          text: replies[Math.floor(Math.random() * replies.length)],
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[600px] border-[6px] border-white ring-4 ring-indigo-200 relative">
        {/* Header */}
        <div className="bg-[#4F46E5] p-4 pb-6 flex justify-between items-center text-white shadow-md relative overflow-hidden">
          {/* Decor Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          ></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-lg">
                {friend.avatar?.includes("http") ? (
                  <img
                    src={friend.avatar}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                    {friend.avatar}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">
                {friend.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded text-indigo-100">
                  Lv.{friend.level}
                </span>
                <span className="text-[10px] text-indigo-200 font-medium">
                  • Đang online
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 text-white"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] -mt-4 rounded-t-[1.5rem] relative z-10 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm relative transition-all
                ${
                  msg.sender === "me"
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-200"
                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition placeholder:font-medium placeholder:text-slate-400"
            placeholder="Nhập tin nhắn..."
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition active:scale-95"
          >
            <Send size={18} className="-ml-0.5 mt-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "requests" | "find">(
    "list",
  );
  const [friends, setFriends] = useState<any[]>(MOCK_FRIENDS);
  const [requests, setRequests] = useState<any[]>(MOCK_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSearchResults([
        {
          _id: "new_1",
          fullName: "Bạn Mới Tí Hon",
          avatar: "🐨",
          stats: { level: 2 },
        },
        {
          _id: "new_2",
          fullName: "Siêu Nhân Nhện",
          avatar: "🕷️",
          stats: { level: 9 },
        },
      ]);
      setLoading(false);
    }, 800);
  };

  const handleUnfriend = (id: string) => {
    if (confirm("Chắc chắn muốn nghỉ chơi với bạn này? 😢")) {
      setFriends(friends.filter((f) => f.id !== id));
    }
  };

  const handleAccept = (reqId: string) => {
    setRequests(requests.filter((r) => r.id !== reqId));
    alert("Đã thêm bạn mới! 🎉");
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans pb-32 p-4 md:p-8 pt-24 relative overflow-hidden selection:bg-indigo-100">
      {/* BACKGROUND DECORATIONS (Cool & Dynamic) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top Right Circle */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl opacity-60"></div>
        {/* Bottom Left Blob */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-cyan-100/50 to-teal-100/50 rounded-full blur-3xl opacity-60"></div>

        {/* Floating Icons */}
        <div className="absolute top-32 left-10 text-4xl opacity-20 animate-bounce delay-1000 rotate-12 text-indigo-400">
          <Gamepad2 size={48} />
        </div>
        <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse delay-500 -rotate-12 text-yellow-500">
          <Zap size={48} fill="currentColor" />
        </div>
        <div className="absolute bottom-40 right-10 text-4xl opacity-20 animate-bounce delay-700 rotate-45 text-blue-400">
          <Rocket size={48} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HERO TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 tracking-tight drop-shadow-sm flex items-center justify-center gap-3">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg transform -rotate-3">
              <Users size={32} />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Cộng Đồng
            </span>
            Bạn Bè
          </h1>
          <p className="text-slate-500 font-bold bg-white/60 backdrop-blur-sm inline-block px-6 py-2 rounded-full border border-white shadow-sm text-sm">
            Kết nối, thách đấu và cùng nhau thăng hạng! 🚀
          </p>
        </div>

        {/* TABS NAVIGATION (Pill Style) */}
        <div className="flex justify-center mb-10 sticky top-24 z-20">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-indigo-900/5 border border-white flex gap-1 ring-1 ring-slate-100">
            {[
              {
                id: "list",
                label: "Bạn Bè",
                icon: Users,
                activeColor: "bg-indigo-600 text-white shadow-indigo-200",
              },
              {
                id: "requests",
                label: "Lời Mời",
                icon: Mail,
                activeColor: "bg-orange-500 text-white shadow-orange-200",
                count: requests.length,
              },
              {
                id: "find",
                label: "Tìm Bạn",
                icon: Search,
                activeColor: "bg-emerald-500 text-white shadow-emerald-200",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-5 md:px-7 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center gap-2 group
                  ${
                    activeTab === tab.id
                      ? `${tab.activeColor} shadow-lg scale-105`
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-700"
                  }`}
              >
                <tab.icon
                  size={18}
                  className={`transition-transform ${activeTab === tab.id ? "" : "group-hover:scale-110"}`}
                  strokeWidth={2.5}
                />
                <span className="hidden md:inline">{tab.label}</span>
                {tab.count ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-black shadow-sm border-2 border-white animate-bounce">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {/* === LIST FRIENDS === */}
          {activeTab === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {friends.map((friend, i) => (
                <div
                  key={friend.id}
                  className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:border-indigo-100 overflow-hidden"
                >
                  {/* Decorative Banner */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50 transition-colors group-hover:from-indigo-100 group-hover:to-blue-100"></div>

                  <div className="relative flex flex-col items-center pt-2">
                    {/* Rank Badge */}
                    <div className="absolute top-0 right-0 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-100 shadow-sm flex items-center gap-1">
                      <Trophy
                        size={12}
                        className="text-yellow-500"
                        fill="currentColor"
                      />{" "}
                      {friend.rank}
                    </div>

                    {/* Avatar */}
                    <div className="relative mb-3">
                      <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-300 border-2 border-white">
                        {friend.avatar.includes("http") ? (
                          <img
                            src={friend.avatar}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50 rounded-xl">
                            {friend.avatar}
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute bottom-0 right-[-4px] w-4 h-4 rounded-full border-2 border-white ${friend.status === "online" ? "bg-green-500" : "bg-slate-300"}`}
                      ></div>
                    </div>

                    {/* Info */}
                    <h3 className="font-black text-lg text-slate-800 mb-1">
                      {friend.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        Lv.{friend.level}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Học sinh giỏi
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setActiveChatFriend(friend)}
                        className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} /> Nhắn tin
                      </button>
                      <button
                        onClick={() => handleUnfriend(friend.id)}
                        className="w-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition border border-slate-200"
                        title="Hủy kết bạn"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* === REQUESTS === */}
          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-4"
            >
              {requests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-4xl">
                    📭
                  </div>
                  <p className="text-slate-500 font-bold">
                    Hiện chưa có lời mời nào.
                  </p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-300 hover:shadow-md flex items-center justify-between gap-4 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-3xl border border-orange-100 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                        {req.avatar.includes("http") ? (
                          <img
                            src={req.avatar}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          req.avatar
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">
                          {req.name}
                        </h4>
                        <p className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-lg w-fit mt-1 border border-orange-100">
                          Level {req.level} • Muốn kết bạn
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-green-600 transition active:scale-90"
                      >
                        <CheckCircle size={20} strokeWidth={2.5} />
                      </button>
                      <button className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition active:scale-90 border border-slate-200">
                        <XCircle size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* === FIND FRIENDS === */}
          {activeTab === "find" && (
            <motion.div
              key="find"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative group mb-8">
                <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white p-1.5 rounded-2xl shadow-lg flex items-center border border-slate-100">
                  <Search
                    className="ml-3 text-slate-400"
                    size={20}
                    strokeWidth={2.5}
                  />
                  <input
                    className="flex-1 bg-transparent px-3 py-3 outline-none text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-medium text-base"
                    placeholder="Nhập tên hoặc ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-200 transition active:scale-95 text-sm"
                  >
                    TÌM KIẾM
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center py-10 text-slate-400 gap-3">
                    <Loader2
                      size={32}
                      className="animate-spin text-emerald-500"
                    />
                    <span className="text-sm font-bold animate-pulse">
                      Đang quét radar...
                    </span>
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 flex items-center justify-between shadow-sm transition hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3 pl-1">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm ring-1 ring-emerald-100">
                          {user.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {user.fullName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              Lv.{user.stats?.level}
                            </span>
                            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap size={10} fill="currentColor" /> 120 XP
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="bg-slate-50 text-slate-600 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 group-hover:shadow-md border border-slate-200 hover:border-emerald-500">
                        <UserPlus size={16} strokeWidth={2.5} /> Kết bạn
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CHAT MODAL */}
      {activeChatFriend && (
        <ChatModal
          friend={activeChatFriend}
          onClose={() => setActiveChatFriend(null)}
        />
      )}
    </div>
  );
}

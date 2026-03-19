"use client";
import { useState } from "react";
import {
  Users,
  Video,
  Plus,
  MessageCircle,
  MoreHorizontal,
  LogOut,
  Settings,
  Search,
  Mic,
  ArrowLeft,
  Send,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface GroupPost {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  membersCount: number;
  isLive: boolean;
  description: string;
  posts: GroupPost[];
  members: Member[]; // Thêm danh sách thành viên chi tiết
  isLeader: boolean; // Cờ xác định user hiện tại có phải trưởng nhóm ko
}

// --- MOCK DATA ---
const MOCK_GROUPS: StudyGroup[] = [
  {
    id: "g1",
    name: "Team Cày Speaking 🗣️",
    topic: "Speaking",
    membersCount: 3,
    isLive: true,
    description: "Nhóm dành cho các bạn muốn luyện phản xạ, call mỗi tối 8h.",
    isLeader: true, // User là trưởng nhóm này
    members: [
      {
        id: 1,
        name: "Minh (Leader)",
        avatar: "https://i.pravatar.cc/150?img=3",
        isOnline: true,
      },
      {
        id: 2,
        name: "An Nguyen",
        avatar: "https://i.pravatar.cc/150?img=5",
        isOnline: true,
      },
      {
        id: 3,
        name: "Bao Tran",
        avatar: "https://i.pravatar.cc/150?img=8",
        isOnline: false,
      },
    ],
    posts: [
      {
        id: 1,
        user: "Minh",
        avatar: "https://i.pravatar.cc/150?img=3",
        content: "Tối nay chủ đề Environment nhé mọi người!",
        time: "10p trước",
      },
    ],
  },
];

export default function TabGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>(MOCK_GROUPS);
  const [activeGroup, setActiveGroup] = useState<StudyGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // --- ACTIONS ---
  const handleCreateGroup = (name: string, topic: string) => {
    const newGroup: StudyGroup = {
      id: `g${Date.now()}`,
      name,
      topic,
      membersCount: 1,
      isLive: false,
      description: "Nhóm mới tạo",
      posts: [],
      members: [
        {
          id: 99,
          name: "Tôi (Leader)",
          avatar: "https://i.pravatar.cc/150?img=15",
          isOnline: true,
        },
      ],
      isLeader: true,
    };
    setGroups([...groups, newGroup]);
    setIsCreating(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (
      confirm(
        "Bạn chắc chắn muốn giải tán nhóm này? Hành động không thể hoàn tác.",
      )
    ) {
      setGroups(groups.filter((g) => g.id !== groupId));
      setActiveGroup(null);
    }
  };

  const handleKickMember = (groupId: string, memberId: number) => {
    if (confirm("Đuổi thành viên này khỏi nhóm?")) {
      const updatedGroups = groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            members: g.members.filter((m) => m.id !== memberId),
            membersCount: g.membersCount - 1,
          };
        }
        return g;
      });
      setGroups(updatedGroups);
      // Cập nhật activeGroup để UI render lại ngay
      if (activeGroup && activeGroup.id === groupId) {
        setActiveGroup(updatedGroups.find((g) => g.id === groupId) || null);
      }
    }
  };

  // --- VIEW: LOBBY ---
  if (!activeGroup) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" /> Nhóm Học Tập
            </h2>
            <p className="text-slate-500 mt-1">
              Tham gia các nhóm nhỏ để luyện tập và thảo luận sâu hơn.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition"
          >
            <Plus size={20} /> Tạo nhóm mới
          </button>
        </div>

        {/* Grid Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setActiveGroup(group)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer relative overflow-hidden"
            >
              {group.isLive && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse z-10">
                  <Video size={12} /> LIVE
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                  📚
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">
                  {group.membersCount} mems
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition mb-2">
                {group.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                {group.description}
              </p>
              <button className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                Truy cập
              </button>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {isCreating && (
          <CreateGroupModal
            onClose={() => setIsCreating(false)}
            onSubmit={handleCreateGroup}
          />
        )}
      </div>
    );
  }

  // --- VIEW: DETAIL ---
  return (
    <GroupDetail
      group={activeGroup}
      onBack={() => setActiveGroup(null)}
      onDelete={() => handleDeleteGroup(activeGroup.id)}
      onKick={(memId) => handleKickMember(activeGroup.id, memId)}
    />
  );
}

// --- SUB-COMPONENT: GROUP DETAIL ---
function GroupDetail({
  group,
  onBack,
  onDelete,
  onKick,
}: {
  group: StudyGroup;
  onBack: () => void;
  onDelete: () => void;
  onKick: (id: number) => void;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(group.posts);
  const [chatInput, setChatInput] = useState("");
  const [showSettings, setShowSettings] = useState(false); // Menu cài đặt nhóm

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        user: "Tôi",
        avatar: "https://i.pravatar.cc/150?img=15",
        content: chatInput,
        time: "Vừa xong",
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-right-4 relative">
      {/* 1. HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-full transition text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              {group.name}
              {group.isLeader && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded border border-yellow-200">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              {group.membersCount} thành viên • {group.topic}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/live-room/group-${group.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition animate-pulse"
          >
            <Video size={18} /> {group.isLive ? "Vào Live" : "Tạo Live"}
          </button>

          {/* Settings Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition ${showSettings ? "bg-slate-200 text-slate-800" : "hover:bg-white text-slate-400"}`}
            >
              <Settings size={20} />
            </button>

            {/* Dropdown Menu (Chỉ hiện cho Leader) */}
            {showSettings && group.isLeader && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                <button className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <UserPlus size={16} /> Mời thành viên
                </button>
                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                >
                  <Trash2 size={16} /> Giải tán nhóm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.user === "Tôi" ? "flex-row-reverse" : ""}`}
              >
                <img
                  src={msg.avatar}
                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                />
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.user === "Tôi" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
            <input
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-400 transition"
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar Members (Có nút Kick nếu là Leader) */}
        <div className="w-72 bg-white border-l border-slate-100 hidden md:flex flex-col">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 text-sm">
              Thành viên ({group.membersCount})
            </h4>
            {group.isLeader && (
              <button
                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition"
                title="Mời thêm"
              >
                <UserPlus size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {group.members?.map((mem) => (
              <div
                key={mem.id}
                className="flex items-center justify-between group/mem"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={mem.avatar}
                      className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                    />
                    {mem.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 w-32 truncate">
                      {mem.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {mem.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Nút Đuổi (Chỉ hiện khi là Leader và không phải chính mình) */}
                {group.isLeader && mem.name !== "Minh (Leader)" && (
                  <button
                    onClick={() => onKick(mem.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition opacity-0 group-hover/mem:opacity-100"
                    title="Mời ra khỏi nhóm"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 mt-auto">
            <button className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold hover:bg-red-50 p-2.5 rounded-lg w-full transition border border-red-100">
              <LogOut size={16} /> Rời nhóm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: CREATE MODAL ---
function CreateGroupModal({ onClose, onSubmit }: any) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <h3 className="font-bold text-xl mb-4 text-slate-800">
          Tạo nhóm học tập mới
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Tên nhóm
            </label>
            <input
              className="w-full border p-3 rounded-xl mt-1 focus:border-blue-500 outline-none"
              placeholder="VD: Luyện thi IELTS 8.0"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Chủ đề
            </label>
            <select className="w-full border p-3 rounded-xl mt-1 bg-white outline-none">
              <option>Speaking</option>
              <option>Grammar</option>
              <option>Homework</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(name, "Speaking")}
            disabled={!name}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Tạo ngay
          </button>
        </div>
      </div>
    </div>
  );
}

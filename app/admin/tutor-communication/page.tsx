"use client";
import { useState } from "react";
import {
  Megaphone,
  MessageSquare,
  Search,
  Plus,
  Filter,
  Pin,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Send,
  User,
  CheckCircle,
  Image as ImageIcon,
  Paperclip,
  Bell,
  Eye,
  Trash2,
} from "lucide-react";

// --- TYPES ---
type TabType = "ANNOUNCEMENTS" | "DISCUSSIONS";

interface Post {
  id: number;
  author: { name: string; avatar: string; role: "ADMIN" | "TEACHER" };
  title?: string;
  content: string;
  time: string;
  type: "ANNOUNCEMENT" | "DISCUSSION";
  isPinned?: boolean;
  likes: number;
  comments: number;
  tags?: string[];
  viewCount?: number; // Chỉ cho thông báo
}

// --- MOCK DATA ---
const ANNOUNCEMENTS: Post[] = [
  {
    id: 1,
    author: {
      name: "Ban Quản Trị",
      avatar: "https://ui-avatars.com/api/?name=Admin&bg=000&color=fff",
      role: "ADMIN",
    },
    title: "🔥 QUAN TRỌNG: Cập nhật quy chế tính lương mới từ tháng 11",
    content:
      "Chào các thầy cô, Ban quản trị xin thông báo về việc điều chỉnh cách tính lương giờ dạy Live Class. Chi tiết vui lòng xem file đính kèm bên dưới...",
    time: "2 giờ trước",
    type: "ANNOUNCEMENT",
    isPinned: true,
    likes: 15,
    comments: 4,
    tags: ["Hành chính", "Lương thưởng"],
    viewCount: 45,
  },
  {
    id: 2,
    author: {
      name: "Phòng Đào Tạo",
      avatar: "https://ui-avatars.com/api/?name=DT&bg=2563eb&color=fff",
      role: "ADMIN",
    },
    title: "Lịch họp chuyên môn định kỳ",
    content:
      "Mời các thầy cô tham gia buổi họp online vào 20:00 tối thứ 6 tuần này để thống nhất giáo trình mới.",
    time: "Hôm qua",
    type: "ANNOUNCEMENT",
    likes: 8,
    comments: 0,
    tags: ["Họp", "Chuyên môn"],
    viewCount: 32,
  },
];

const DISCUSSIONS: Post[] = [
  {
    id: 101,
    author: {
      name: "Cô Minh Anh",
      avatar: "https://i.pravatar.cc/150?img=9",
      role: "TEACHER",
    },
    content:
      "Mọi người cho mình hỏi, làm sao để tạo bài kiểm tra trắc nghiệm có giới hạn thời gian cho từng câu hỏi ạ? Mình tìm mãi không thấy chức năng này.",
    time: "30 phút trước",
    type: "DISCUSSION",
    likes: 3,
    comments: 5,
    tags: ["Hỏi đáp", "Kỹ thuật"],
  },
  {
    id: 102,
    author: {
      name: "Thầy John Doe",
      avatar: "https://i.pravatar.cc/150?img=11",
      role: "TEACHER",
    },
    content:
      "Chia sẻ với các thầy cô bộ tài liệu luyện thi IELTS Speaking mới nhất mình vừa sưu tầm được. Link drive bên dưới nhé 👇",
    time: "5 giờ trước",
    type: "DISCUSSION",
    likes: 24,
    comments: 12,
    tags: ["Chia sẻ", "Tài liệu"],
  },
];

export default function TutorCommunicationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ANNOUNCEMENTS");
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  const posts = activeTab === "ANNOUNCEMENTS" ? ANNOUNCEMENTS : DISCUSSIONS;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. LEFT SIDEBAR (Menu & Filters) */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col p-5">
        <h1 className="text-2xl font-black text-slate-800 mb-6">
          Kênh Giáo Viên
        </h1>

        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition mb-6"
        >
          <Plus size={20} /> Tạo bài viết mới
        </button>

        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === "ANNOUNCEMENTS" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <div
              className={`p-2 rounded-lg ${activeTab === "ANNOUNCEMENTS" ? "bg-white shadow-sm text-red-500" : "bg-slate-100 text-slate-400"}`}
            >
              <Megaphone size={18} />
            </div>
            Thông báo chung
          </button>

          <button
            onClick={() => setActiveTab("DISCUSSIONS")}
            className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === "DISCUSSIONS" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <div
              className={`p-2 rounded-lg ${activeTab === "DISCUSSIONS" ? "bg-white shadow-sm text-blue-500" : "bg-slate-100 text-slate-400"}`}
            >
              <MessageSquare size={18} />
            </div>
            Thảo luận chuyên môn
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Tags phổ biến
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Lương thưởng", "Họp", "Tài liệu", "Quy chế", "Kỹ thuật"].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-slate-200 transition"
                >
                  #{tag}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Feed) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Search */}
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {activeTab === "ANNOUNCEMENTS" ? (
              <Megaphone className="text-red-500" />
            ) : (
              <MessageSquare className="text-blue-500" />
            )}
            {activeTab === "ANNOUNCEMENTS"
              ? "Bảng tin thông báo"
              : "Diễn đàn thảo luận"}
          </h2>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                placeholder="Tìm kiếm bài viết..."
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Create Post Box (Inline) */}
        {isCreating && (
          <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  A
                </div>
                <div className="flex-1">
                  {activeTab === "ANNOUNCEMENTS" && (
                    <input
                      className="w-full font-bold text-lg mb-2 outline-none placeholder:text-slate-400"
                      placeholder="Tiêu đề thông báo..."
                      autoFocus
                    />
                  )}
                  <textarea
                    className="w-full resize-none outline-none text-slate-600 min-h-[100px]"
                    placeholder={
                      activeTab === "ANNOUNCEMENTS"
                        ? "Nội dung chi tiết..."
                        : "Bạn đang nghĩ gì?"
                    }
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                    <Paperclip size={20} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Send size={16} /> Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-2xl border p-6 transition hover:shadow-md ${post.isPinned ? "border-blue-200 shadow-sm ring-1 ring-blue-50" : "border-slate-200 shadow-sm"}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    className="w-10 h-10 rounded-full border border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {post.author.name}
                      {post.author.role === "ADMIN" && (
                        <CheckCircle
                          size={14}
                          className="text-blue-500"
                          fill="currentColor"
                          color="white"
                        />
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">{post.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPinned && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <Pin size={10} fill="currentColor" /> Đã ghim
                    </span>
                  )}
                  <button className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                {post.title && (
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {post.title}
                  </h3>
                )}
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Tags */}
              {post.tags && (
                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                    <ThumbsUp size={18} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                    <MessageCircle size={18} /> {post.comments}{" "}
                    <span className="hidden sm:inline">bình luận</span>
                  </button>
                </div>

                {post.type === "ANNOUNCEMENT" && (
                  <div
                    className="flex items-center gap-1.5 text-xs text-slate-400"
                    title="Đã xem"
                  >
                    <Eye size={16} /> {post.viewCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (Quick Info) */}
      <div className="w-72 bg-white border-l border-slate-200 hidden xl:flex flex-col p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-orange-500" /> Sắp diễn ra
        </h3>
        <div className="space-y-3 mb-8">
          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
            <p className="text-xs font-bold text-orange-800 uppercase mb-1">
              Họp chuyên môn
            </p>
            <p className="text-sm font-bold text-slate-800">
              20:00, Thứ 6 (15/11)
            </p>
            <a
              href="#"
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              Link Google Meet
            </a>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-1">
              Hạn nộp điểm
            </p>
            <p className="text-sm font-bold text-slate-800">
              23:59, Chủ Nhật (17/11)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="font-bold text-slate-800 mb-4">Admin trực tuyến</h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    AD
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Admin Support {i}
                  </p>
                  <p className="text-[10px] text-slate-400">Sẵn sàng hỗ trợ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

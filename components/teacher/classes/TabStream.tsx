"use client";
import { useState } from "react";
import {
  MoreVertical,
  Send,
  MessageCircle,
  Heart,
  Image as ImageIcon,
  Paperclip,
  Smile,
  FileText,
  Share2,
  Pin,
  PinOff,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  User,
} from "lucide-react";

// --- TYPES ---
type UserRole = "GV" | "HS";
type Status = "APPROVED" | "PENDING";

interface Attachment {
  type: "file" | "image";
  name: string;
  url?: string;
  size?: string;
}

interface Comment {
  id: number;
  user: string;
  avatar: string;
  role: UserRole;
  content: string;
  time: string;
  status: Status; // Trạng thái bình luận
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: UserRole;
  time: string;
  content: string;
  attachments: Attachment[];
  images: string[];
  likes: number;
  isLiked: boolean;
  isPinned: boolean;
  status: Status; // Trạng thái bài viết
  comments: Comment[];
}

// --- MOCK DATA ---
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Nguyễn Văn Nam",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "HS",
    time: "Vừa xong",
    content:
      "Thưa cô, em muốn xin phép nghỉ học buổi tới do bị ốm ạ. Em có thể nộp bài tập bù vào hôm sau không ạ?",
    attachments: [],
    images: [],
    likes: 0,
    isLiked: false,
    isPinned: false,
    status: "PENDING", // Bài viết chờ duyệt
    comments: [],
  },
  {
    id: 2,
    author: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "GV",
    time: "2 giờ trước",
    content:
      "🔔 THÔNG BÁO QUAN TRỌNG\nTuần sau chúng ta sẽ có bài kiểm tra 15 phút đầu giờ. Các em nhớ ôn tập kỹ Unit 1 nhé!",
    attachments: [
      { type: "file", name: "De_cuong_on_tap.pdf", size: "1.2 MB" },
    ],
    images: [],
    likes: 15,
    isLiked: true,
    isPinned: true, // Bài viết đã ghim
    status: "APPROVED",
    comments: [
      {
        id: 101,
        user: "Trần Thị B",
        avatar: "https://i.pravatar.cc/150?img=5",
        role: "HS",
        content: "Cô ơi bài kiểm tra trắc nghiệm hay tự luận ạ?",
        time: "1 giờ trước",
        status: "APPROVED",
      },
      {
        id: 102,
        user: "Lê Văn C",
        avatar: "https://i.pravatar.cc/150?img=8",
        role: "HS",
        content: "Bài khó quá cô ơi, giảm tải đi ạ huhu...",
        time: "30 phút trước",
        status: "PENDING", // Bình luận chờ duyệt
      },
    ],
  },
  {
    id: 3,
    author: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "GV",
    time: "Hôm qua",
    content:
      "Một số hình ảnh hoạt động nhóm lớp mình hôm qua. Các em làm rất tốt! 🌟",
    attachments: [],
    images: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=500",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=500",
    ],
    likes: 24,
    isLiked: true,
    isPinned: false,
    status: "APPROVED",
    comments: [],
  },
];

export default function TabStream() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(
    null,
  );
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [newPostContent, setNewPostContent] = useState("");

  // --- ACTIONS ---

  // 1. Đăng bài mới (Giáo viên đăng luôn được duyệt)
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      author: "Cô Minh Anh",
      avatar: "https://i.pravatar.cc/150?img=9",
      role: "GV",
      time: "Vừa xong",
      content: newPostContent,
      attachments: [],
      images: [],
      likes: 0,
      isLiked: false,
      isPinned: false,
      status: "APPROVED",
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  // 2. Duyệt / Từ chối bài viết
  const handlePostApproval = (postId: number, isApproved: boolean) => {
    if (isApproved) {
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, status: "APPROVED" } : p)),
      );
    } else {
      if (confirm("Bạn muốn từ chối bài viết này?")) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    }
  };

  // 3. Duyệt / Xóa bình luận
  const handleCommentAction = (
    postId: number,
    commentId: number,
    action: "APPROVE" | "DELETE",
  ) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (action === "DELETE") {
            return {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
            };
          } else {
            return {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId ? { ...c, status: "APPROVED" } : c,
              ),
            };
          }
        }
        return post;
      }),
    );
  };

  // 4. Ghim bài
  const togglePin = (postId: number) => {
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)),
    );
    setMenuOpenId(null);
  };

  // 5. Các actions khác
  const handleDeletePost = (postId: number) => {
    if (confirm("Xóa bài viết này?"))
      setPosts(posts.filter((p) => p.id !== postId));
  };

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  };

  // Sắp xếp bài viết: Chờ duyệt -> Ghim -> Mới nhất
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // Giữ nguyên thứ tự thời gian mock
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* SIDEBAR TRÁI (Giữ nguyên logic nhắc việc) */}
      <div className="hidden lg:block space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
          <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">
            Sắp đến hạn
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 group cursor-pointer hover:bg-red-100 transition">
              <p className="text-[10px] font-bold text-red-500 mb-1 uppercase">
                Hôm nay, 23:59
              </p>
              <p className="font-bold text-sm text-slate-800 group-hover:text-red-700 transition">
                Bài tập Unit 1
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FEED */}
      <div className="lg:col-span-3 space-y-6">
        {/* INPUT BOX */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              GV
            </div>
            <textarea
              className="flex-1 bg-slate-50 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition resize-none h-20 placeholder:text-slate-400"
              placeholder="Thông báo nội dung mới cho lớp học..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <ImageIcon size={18} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Paperclip size={18} />
              </button>
            </div>
            <button
              onClick={handleCreatePost}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition"
            >
              <Send size={16} /> Đăng
            </button>
          </div>
        </div>

        {/* POST LIST */}
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden relative transition-all 
              ${post.status === "PENDING" ? "border-orange-300 shadow-orange-100 ring-2 ring-orange-50" : "border-slate-200"}
              ${post.isPinned ? "border-blue-300 shadow-blue-50" : ""}
            `}
          >
            {/* BADGES */}
            {post.status === "PENDING" && (
              <div className="absolute top-0 left-0 right-0 bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center justify-between z-10">
                <span className="text-xs font-bold text-orange-700 flex items-center gap-2">
                  <ShieldAlert size={14} /> Bài viết chờ duyệt
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePostApproval(post.id, true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> Duyệt
                  </button>
                  <button
                    onClick={() => handlePostApproval(post.id, false)}
                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <XCircle size={12} /> Từ chối
                  </button>
                </div>
              </div>
            )}

            {post.isPinned && post.status === "APPROVED" && (
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 z-10">
                <Pin size={12} fill="currentColor" /> Đã Ghim
              </div>
            )}

            {/* Header Post */}
            <div
              className={`p-5 pb-3 flex justify-between items-start relative ${post.status === "PENDING" ? "mt-8" : ""}`}
            >
              <div className="flex gap-3">
                {post.role === "GV" ? (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                    GV
                  </div>
                ) : (
                  <img
                    src={post.avatar}
                    className="w-10 h-10 rounded-full border border-slate-200"
                    alt={post.author}
                  />
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {post.author}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    {post.time}{" "}
                    {post.role === "HS" && (
                      <span className="bg-slate-100 px-1.5 rounded text-[10px] text-slate-500">
                        Học sinh
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === post.id ? null : post.id)
                  }
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpenId === post.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => togglePin(post.id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      {post.isPinned ? (
                        <>
                          <PinOff size={16} /> Bỏ ghim
                        </>
                      ) : (
                        <>
                          <Pin size={16} /> Ghim bài viết
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                    >
                      <Trash2 size={16} /> Xóa bài viết
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="px-5 pb-4">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line mb-4">
                {post.content}
              </p>

              {/* Attachments */}
              {post.attachments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {post.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition group"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {file.size} • File
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Images */}
              {post.images.length > 0 && (
                <div
                  className={`grid gap-2 mb-4 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      className="rounded-xl object-cover w-full h-64 border border-slate-100"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition ${post.isLiked ? "text-pink-500" : "text-slate-500"}`}
                >
                  <Heart
                    size={18}
                    fill={post.isLiked ? "currentColor" : "none"}
                  />{" "}
                  {post.likes}
                </button>
                <button
                  onClick={() =>
                    setActiveCommentPostId(
                      activeCommentPostId === post.id ? null : post.id,
                    )
                  }
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  <MessageCircle size={18} /> {post.comments.length}
                </button>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            {activeCommentPostId === post.id && (
              <div className="bg-slate-50 border-t border-slate-100 p-5 animate-in slide-in-from-top-2">
                <div className="space-y-4 mb-5">
                  {post.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className={`flex gap-3 ${cmt.status === "PENDING" ? "opacity-100" : ""}`}
                    >
                      {cmt.role === "GV" ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          GV
                        </div>
                      ) : (
                        <img
                          src={cmt.avatar}
                          className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
                        />
                      )}

                      <div className="flex-1">
                        <div
                          className={`p-3 rounded-2xl rounded-tl-none border shadow-sm inline-block relative ${cmt.status === "PENDING" ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-800">
                              {cmt.user}
                            </span>
                            {cmt.role === "GV" && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                Giáo viên
                              </span>
                            )}
                            {cmt.status === "PENDING" && (
                              <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                <Clock size={10} /> Chờ duyệt
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700">
                            {cmt.content}
                          </p>
                        </div>

                        {/* Comment Actions for Teacher */}
                        <div className="flex gap-3 mt-1 ml-2 items-center">
                          <span className="text-[10px] text-slate-300">
                            {cmt.time}
                          </span>

                          {/* Nút duyệt comment */}
                          {cmt.status === "PENDING" && (
                            <button
                              onClick={() =>
                                handleCommentAction(post.id, cmt.id, "APPROVE")
                              }
                              className="text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <CheckCircle size={10} /> Duyệt
                            </button>
                          )}

                          {/* Nút xóa comment */}
                          <button
                            onClick={() =>
                              handleCommentAction(post.id, cmt.id, "DELETE")
                            }
                            className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    GV
                  </div>
                  <div className="flex-1 relative">
                    <input
                      className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-sm outline-none focus:border-blue-300 transition"
                      placeholder="Viết bình luận..."
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import {
  MessageSquare,
  Pin,
  User,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Heart,
  Send,
  Plus,
  X,
} from "lucide-react";

// --- TYPES ---
interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: "TEACHER" | "STUDENT";
  content: string;
  date: string;
  isPinned?: boolean;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  showComments?: boolean; // Trạng thái mở khung comment
}

// --- MOCK DATA ---
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "TEACHER",
    content:
      "Chào cả lớp, tuần này chúng ta sẽ có bài kiểm tra Speaking vào thứ 6 nhé! Các em nhớ ôn tập kỹ Unit 1 và Unit 2.",
    date: "2 giờ trước",
    isPinned: true,
    likes: 12,
    isLiked: false,
    comments: [
      {
        id: 101,
        author: "Nguyễn Văn A",
        avatar: "https://i.pravatar.cc/150?img=11",
        content: "Dạ rõ ạ cô ơi!",
        date: "1 giờ trước",
      },
    ],
  },
  {
    id: 2,
    author: "Trần Văn B",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "STUDENT",
    content:
      "Mọi người ơi cho mình hỏi phần ngữ pháp Unit 2 trang 45 có ai hiểu không giải thích giúp mình với?",
    date: "10 phút trước",
    isPinned: false,
    likes: 2,
    isLiked: true,
    comments: [],
  },
];

export default function StudentStream() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // State cho bài đăng mới
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  // State cho bình luận mới (lưu theo id bài viết)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {},
  );

  // --- HANDLERS ---

  // 1. Đăng bài viết mới
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: "Tôi (Học viên)",
      avatar: "https://i.pravatar.cc/150?img=50",
      role: "STUDENT",
      content: newPostContent,
      date: "Vừa xong",
      likes: 0,
      isLiked: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setIsPostModalOpen(false);
  };

  // 2. Thả tim (Like/Unlike)
  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      }),
    );
  };

  // 3. Mở/Đóng khung bình luận
  const toggleComments = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, showComments: !post.showComments }
          : post,
      ),
    );
  };

  // 4. Gửi bình luận
  const handleSendComment = (postId: number) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "Tôi (Học viên)",
      avatar: "https://i.pravatar.cc/150?img=50",
      content: content,
      date: "Vừa xong",
    };

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
            showComments: true, // Mở khung comment nếu đang đóng
          };
        }
        return post;
      }),
    );

    // Clear input
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- CỘT TRÁI: STREAM --- */}
      <div className="lg:col-span-2 space-y-6">
        {/* THANH ĐĂNG BÀI */}
        <div
          onClick={() => setIsPostModalOpen(true)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center cursor-pointer hover:bg-slate-50 transition group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
            Tôi
          </div>
          <div className="flex-1 bg-slate-50 h-11 rounded-full border border-slate-200 flex items-center px-5 text-sm text-slate-500 group-hover:bg-white group-hover:border-blue-300 transition select-none">
            Bạn đang thắc mắc điều gì? Chia sẻ với lớp ngay...
          </div>
        </div>

        {/* DANH SÁCH BÀI ĐĂNG */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden transition hover:shadow-md"
            >
              {/* Pinned Badge */}
              {post.isPinned && (
                <div className="absolute top-0 left-0 bg-orange-100 text-orange-600 px-3 py-1 rounded-br-xl text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                  <Pin size={12} fill="currentColor" /> Đã ghim
                </div>
              )}

              {/* Post Header */}
              <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex gap-3">
                  <div className="relative">
                    <img
                      src={post.avatar}
                      className="w-11 h-11 rounded-full border border-slate-100 object-cover"
                      alt={post.author}
                    />
                    {post.role === "TEACHER" && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border-2 border-white">
                        GV
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {post.author}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      {post.date} •{" "}
                      <span className="bg-slate-100 px-1.5 rounded text-[10px] text-slate-500">
                        {post.role === "TEACHER" ? "Thông báo" : "Thảo luận"}
                      </span>
                    </p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="text-slate-700 text-sm leading-relaxed mb-4 pl-14 whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Footer Stats & Actions */}
              <div className="pl-14">
                <div className="border-t border-slate-50 pt-3 flex gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`text-xs font-bold flex items-center gap-1.5 transition ${post.isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                  >
                    <Heart
                      size={18}
                      fill={post.isLiked ? "currentColor" : "none"}
                    />{" "}
                    {post.likes} Yêu thích
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={`text-xs font-bold flex items-center gap-1.5 transition ${post.showComments ? "text-blue-600" : "text-slate-400 hover:text-blue-600"}`}
                  >
                    <MessageSquare size={18} /> {post.comments.length} Bình luận
                  </button>
                </div>

                {/* Comment Section (Collapsible) */}
                {post.showComments && (
                  <div className="mt-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* List Comments */}
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            src={comment.avatar}
                            className="w-8 h-8 rounded-full border border-slate-100 object-cover mt-1"
                          />
                          <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-xs text-slate-700">
                                {comment.author}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {comment.date}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input Comment */}
                    <div className="flex gap-2 items-center">
                      <img
                        src="https://i.pravatar.cc/150?img=50"
                        className="w-8 h-8 rounded-full border border-slate-100 object-cover"
                      />
                      <div className="flex-1 relative">
                        <input
                          className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:border-blue-300 transition"
                          placeholder="Viết bình luận..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendComment(post.id)
                          }
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CỘT PHẢI: WIDGET --- */}
      <div className="space-y-6">
        {/* Widget: Quy tắc lớp học */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <h4 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Quy tắc thảo luận
          </h4>
          <ul className="text-xs space-y-2 text-blue-100 list-disc pl-4">
            <li>Tôn trọng giáo viên và các bạn học.</li>
            <li>Không spam hoặc đăng nội dung quảng cáo.</li>
            <li>Sử dụng ngôn từ lịch sự, văn minh.</li>
            <li>Khuyến khích chia sẻ kiến thức bổ ích.</li>
          </ul>
        </div>

        {/* Widget Deadline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 text-xs uppercase flex items-center gap-2">
            <Clock size={16} className="text-orange-500" /> Sắp đến hạn
          </h4>
          <div className="text-center py-4 text-slate-400 text-xs">
            Không có bài tập nào sắp hết hạn.
          </div>
        </div>
      </div>

      {/* --- MODAL TẠO BÀI VIẾT MỚI --- */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Tạo bài viết mới</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <img
                  src="https://i.pravatar.cc/150?img=50"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold text-sm text-slate-800">
                    Tôi (Học viên)
                  </p>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Công khai
                  </span>
                </div>
              </div>
              <textarea
                className="w-full h-32 p-0 border-none outline-none resize-none text-slate-700 text-sm placeholder:text-slate-400"
                placeholder="Bạn muốn chia sẻ điều gì với lớp học?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                autoFocus
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
                <Plus size={16} /> Thêm ảnh/File
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

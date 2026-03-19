"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Sparkles,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  MoreHorizontal,
  Clock,
  Rocket,
  Zap,
  Globe,
  CornerDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. MOCK DATA & TYPES ---

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  isLiked: boolean;
}

interface Post {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
  time: string;
  isFeatured: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    user: "Bảo An",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BaoAn",
    content: "Chúc mừng bạn nhé! Giỏi quá đi 🤩",
    time: "5 phút trước",
    isLiked: true,
  },
  {
    id: "c2",
    user: "Minh Khôi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinhKhoi",
    content: "Bạn học bài này trong bao lâu thế? Chỉ mình bí quyết với!",
    time: "10 phút trước",
    isLiked: false,
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: "mock_1",
    userId: "user_1",
    user: {
      name: "Bé Gia Hân",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GiaHan",
      level: 12,
    },
    content:
      "Yeahh! Cuối cùng tớ cũng hoàn thành khóa 'Tiếng Anh Khởi Động' rồi nè các bạn ơi! 🥳 Cảm ơn cô giáo đã giúp đỡ em rất nhiều ạ.",
    images: [
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
    ],
    likes: 45,
    isLiked: true,
    commentsCount: 2,
    comments: MOCK_COMMENTS,
    createdAt: new Date().toISOString(),
    time: "2 giờ trước",
    isFeatured: true,
  },
  {
    id: "mock_2",
    userId: "user_2",
    user: {
      name: "Tuấn Tú",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TuanTu",
      level: 5,
    },
    content:
      "Hôm nay mình học được từ mới là 'Astronaut' - Phi hành gia. Có bạn nào muốn làm phi hành gia giống tớ không? 🚀✨",
    images: [],
    likes: 8,
    isLiked: false,
    commentsCount: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    time: "4 giờ trước",
    isFeatured: false,
  },
];

// --- 2. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
};

// --- 3. MAIN COMPONENT ---
export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Create Post States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Comment States
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // INIT DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock fetch user profile
        const userRes = {
          fullName: "Bạn",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
          stats: { level: 8 },
        };
        setCurrentUser(userRes);

        // Mock fetch posts
        setTimeout(() => {
          setPosts(MOCK_POSTS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !p.isLiked,
          };
        }
        return p;
      }),
    );
  };

  const handleToggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
    setCommentInput(""); // Reset input khi chuyển bài
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      user: currentUser?.fullName || "Bạn",
      avatar: currentUser?.avatar,
      content: commentInput,
      time: "Vừa xong",
      isLiked: false,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [newComment, ...p.comments],
            commentsCount: p.commentsCount + 1,
          };
        }
        return p;
      }),
    );

    setCommentInput("");
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newPost: Post = {
      id: `new_${Date.now()}`,
      userId: "me",
      user: {
        name: currentUser?.fullName || "Bạn",
        avatar: currentUser?.avatar,
        level: currentUser?.stats?.level || 1,
      },
      content: newPostContent,
      images: [],
      likes: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      time: "Vừa xong",
      isFeatured: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setShowCreateModal(false);
    setIsPosting(false);
  };

  // --- RENDER ---

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F9FF] text-slate-500 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="font-bold text-indigo-400 animate-pulse">
          Đang tải bảng tin...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-32 font-sans text-slate-900 selection:bg-indigo-100 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-10 rotate-12 text-indigo-300">
          <Rocket size={64} />
        </div>
        <div className="absolute top-40 right-20 text-6xl opacity-10 -rotate-12 text-yellow-400">
          <Zap size={64} fill="currentColor" />
        </div>
      </div>

      {/* HEADER HERO */}
      <div className="relative z-10 pt-24 pb-16 text-center px-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-black text-slate-800 mb-3 tracking-tight drop-shadow-sm flex items-center justify-center gap-3"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Cộng Đồng
          </span>
          Học Tập 🌟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 font-medium max-w-xl mx-auto"
        >
          Nơi chia sẻ thành tích, kiến thức và niềm vui mỗi ngày!
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-20 -mt-6">
        {/* === CREATE POST BAR === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-2 rounded-[2rem] shadow-xl shadow-indigo-900/5 border border-white hover:border-indigo-100 transition-all group cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-50 p-0.5 bg-white shrink-0 overflow-hidden">
              <img
                src={currentUser?.avatar}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition rounded-full px-5 py-3 text-slate-400 text-sm font-medium border border-transparent group-hover:border-indigo-100 truncate">
              {currentUser?.fullName ? `Hi ${currentUser.fullName}, ` : ""}bạn
              đang nghĩ gì thế?
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-2 mt-1">
            <div className="flex gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs font-bold">
                <ImageIcon size={16} /> Ảnh
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-600 text-xs font-bold">
                <Smile size={16} /> Cảm xúc
              </span>
            </div>
            <button className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md">
              Đăng bài
            </button>
          </div>
        </motion.div>

        {/* === FEED POSTS === */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300"
              >
                {/* 1. Header Post */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-white shadow-sm overflow-hidden p-0.5">
                        <img
                          src={post.user.avatar}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-md border-2 border-white shadow-sm flex items-center gap-0.5">
                        <Zap size={8} fill="currentColor" /> {post.user.level}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        {post.user.name}
                        {post.user.level >= 10 && (
                          <Crown
                            size={14}
                            className="text-yellow-500 fill-yellow-500 animate-pulse"
                          />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {post.time}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Globe size={10} /> Công khai
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-indigo-500 p-2 rounded-xl hover:bg-indigo-50 transition">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* 2. Content */}
                <div className="text-slate-700 mb-4 leading-relaxed whitespace-pre-wrap text-[15px] pl-1">
                  {post.content}
                </div>

                {post.isFeatured && (
                  <div className="mb-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-orange-200">
                    <Sparkles size={14} fill="currentColor" /> BÀI VIẾT NỔI BẬT
                  </div>
                )}

                {post.images && post.images.length > 0 && (
                  <div className="w-full relative rounded-2xl overflow-hidden mb-5 border-2 border-white shadow-sm">
                    <img
                      src={post.images[0]}
                      className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition duration-700"
                    />
                  </div>
                )}

                {/* 3. Actions Bar */}
                <div className="flex items-center gap-2 pt-2 pb-2 border-b border-slate-50">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      post.isLiked
                        ? "text-pink-500 bg-pink-50 border border-pink-100"
                        : "text-slate-500 bg-slate-50 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={post.isLiked ? "currentColor" : "none"}
                      className={post.isLiked ? "animate-bounce" : ""}
                    />
                    {post.likes > 0 ? post.likes : "Thích"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent
                      ${expandedPostId === post.id ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600"}`}
                  >
                    <MessageCircle size={18} />
                    {post.commentsCount > 0 ? post.commentsCount : "Bình luận"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-12 flex items-center justify-center py-2.5 rounded-xl text-slate-400 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <Share2 size={18} />
                  </motion.button>
                </div>

                {/* 4. Comments Section (Collapsible) */}
                <AnimatePresence>
                  {expandedPostId === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-4"
                    >
                      {/* Input */}
                      <div className="flex gap-3 mb-5">
                        <img
                          src={currentUser?.avatar}
                          className="w-9 h-9 rounded-full border border-slate-200 bg-white"
                        />
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition pr-10"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSendComment(post.id)
                            }
                          />
                          <button
                            onClick={() => handleSendComment(post.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 p-1"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>

                      {/* List */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment, idx) => (
                            <div
                              key={comment.id || idx}
                              className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                              <img
                                src={comment.avatar}
                                className="w-8 h-8 rounded-full border border-slate-100 mt-1"
                              />
                              <div className="flex-1">
                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-100 inline-block min-w-[150px]">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-sm text-slate-800">
                                      {comment.user}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {comment.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                                <div className="flex gap-3 mt-1 ml-2">
                                  <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 transition">
                                    Thích
                                  </button>
                                  <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 transition">
                                    Phản hồi
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm italic flex flex-col items-center">
                            <MessageCircle
                              size={24}
                              className="mb-2 opacity-20"
                            />
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="text-center pt-8 pb-4">
          <p className="text-slate-400 text-sm font-medium bg-white/50 inline-block px-4 py-2 rounded-full">
            Đã hiển thị hết tin mới 😴
          </p>
        </div>
      </div>

      {/* === CREATE POST MODAL === */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-white ring-4 ring-indigo-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-xl text-slate-800">
                  Tạo bài viết
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={currentUser?.avatar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base">
                      {currentUser?.fullName || "Bạn"}
                    </p>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold mt-1 inline-block">
                      🌏 Công khai
                    </span>
                  </div>
                </div>
                <textarea
                  className="w-full h-40 resize-none text-slate-700 text-lg placeholder:text-slate-300 focus:outline-none bg-transparent"
                  placeholder="Chia sẻ thành tích hoặc câu hỏi của bạn..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  autoFocus
                ></textarea>

                <div className="border border-slate-200 rounded-2xl p-2 flex items-center justify-between mt-4 bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 pl-3 uppercase tracking-wider">
                    Đính kèm
                  </span>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-green-500 transition">
                      <ImageIcon size={22} />
                    </button>
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-yellow-500 transition">
                      <Smile size={22} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isPosting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 text-lg"
                >
                  {isPosting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} /> Đăng bài
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

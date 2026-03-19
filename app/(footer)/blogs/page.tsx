"use client";

import { useEffect, useState } from "react";
import { blogService, BlogQueryParams } from "@/services/blogs.service"; // Import interface
import {
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// --- ANIMATION VARIANTS (Giữ nguyên) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: BlogQueryParams = {
          page: 1,
          limit: 10,
          sort: 'createdAt',
          order: 'desc'
        };

        const res: any = await blogService.findAllBlogs(params);
        console.log(res)

        let data = res.data || res.data || res;

        if (activeTab !== "ALL") {
          data = data.filter((p: any) => p.category === activeTab);
        }

        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        setPosts([]); // Tránh lỗi map khi failed
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* HERO SECTION (Giữ nguyên) */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Góc Học Tập & Tin Tức</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">Cập nhật những tin tức và bí quyết từ SmartKids.</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        {/* TABS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center flex-wrap gap-4 mb-12">
          {[
            { id: "ALL", label: "Tất cả", icon: BookOpen },
            { id: "NEWS", label: "Tin tức", icon: Calendar },
            { id: "TIPS", label: "Bí quyết học", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all border ${activeTab === tab.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-white hover:bg-slate-50"
                }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </motion.div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            </motion.div>
          ) : (
            <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <motion.div
                    key={post._id}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col h-full hover:shadow-xl transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="h-52 overflow-hidden relative bg-slate-100">
                      <img
                        src={post.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-md text-white uppercase tracking-wider ${post.category === "TIPS" ? "bg-purple-500" : "bg-blue-600"}`}>
                          {post.category === "TIPS" ? "Bí Quyết" : "Tin Tức"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase">
                        <Calendar size={12} /> {new Date(post.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                        {post.content?.substring(0, 100)}...
                      </p>
                      <Link
                        href={`/blogs/${post._id}`}
                        className="flex items-center gap-2 text-slate-700 font-bold text-sm group/link hover:text-blue-600 mt-auto"
                      >
                        Đọc tiếp <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed">
                  <Sparkles size={32} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Chưa có bài viết nào trong mục này.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
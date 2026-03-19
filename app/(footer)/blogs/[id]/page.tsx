"use client";

import { useEffect, useState, use } from "react";
import { blogService } from "@/services/blogs.service";
import {
  Calendar,
  User,
  Eye,
  ArrowLeft,
  Clock,
  Share2,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  MessageCircle,
  ChevronUp,
  Bookmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// 1. Interface
interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  createdAt: string;
  views: number;
  author?: {
    fullName: string;
    avatar?: string;
    bio?: string;
  };
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function BlogPostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<Heading[]>([]); // State cho mục lục
  const [activeId, setActiveId] = useState<string>(""); // State để highlight mục lục
  const [scrollProgress, setScrollProgress] = useState(0); // State thanh tiến độ
  const [showScrollTop, setShowScrollTop] = useState(false); // Nút lên đầu trang

  // --- 2. CONFIG FRAMER MOTION HOOKS ---
  const { scrollYProgress, scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500], [0, 200]); // Hiệu ứng Parallax cho ảnh bìa
  const headerOpacity = useTransform(scrollY, [0, 400], [1, 0]); // Mờ dần ảnh bìa khi cuộn

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res: any = await blogService.findBlogById(id);
        setPost(res.data || res);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // --- HANDLE SCROLL & TOC ---
  useEffect(() => {
    if (!post) return;

    // 1. Tạo mục lục tự động từ content HTML
    const article = document.querySelector("article");
    if (article) {
      const elements = Array.from(article.querySelectorAll("h2, h3"));
      const headingData = elements.map((elem, index) => {
        const id = `heading-${index}`;
        elem.id = id; // Gán ID cho thẻ h2, h3 trong bài viết để anchor link hoạt động
        return {
          id,
          text: elem.textContent || "",
          level: Number(elem.tagName.substring(1)),
        };
      });
      setHeadings(headingData);
    }

    // 2. Xử lý Scroll
    const handleScroll = () => {
      // Tính % đọc
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Hiện nút Back to Top
      setShowScrollTop(window.scrollY > 500);

      // Highlight Mục lục
      const headingElements = document.querySelectorAll("h2, h3");
      let currentId = "";
      headingElements.forEach((elem) => {
        const top = elem.getBoundingClientRect().top;
        if (top < 150) currentId = elem.id;
      });
      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  // --- ACTIONS ---
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết bài viết!");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- LOADING SKELETON ---
  if (loading || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8 animate-pulse">
          <div className="h-[40vh] bg-slate-200 rounded-3xl w-full"></div>
          <div className="h-12 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">
      {/* 1. PROGRESS BAR (Thanh tiến độ đọc) */}
      <motion.div
        className="fixed top-0 left-0 h-1.5 bg-blue-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* 2. HEADER HERO */}
      <div className="h-[55vh] relative group overflow-hidden bg-slate-900">
        {/* Parallax Image */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={
              post.thumbnail ||
              "https://images.unsplash.com/photo-1499750310159-525446cc0ef6"
            }
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Overlay gradient đậm hơn ở đáy để text nổi bật */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-900/90"></div>

        {/* Nút Back - Animation xuất hiện */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 left-6 md:left-10 z-20"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full hover:bg-white hover:text-slate-900 transition-all duration-300 font-medium text-sm"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
        </motion.div>

        {/* Title nằm trên ảnh header - Animation bay lên */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-24 max-w-5xl mx-auto z-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wider">
              {post.category || "Blog"}
            </span>
            <span className="text-slate-300 text-sm flex items-center gap-1">
              <Clock size={14} /> 5 phút đọc
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight shadow-black drop-shadow-md">
            {post.title}
          </h1>
        </motion.div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR (Social Share - Sticky) --- */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky top-32 flex flex-col gap-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-3 bg-white rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 shadow-md transition border border-slate-100"
                title="Chia sẻ"
              >
                <Share2 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white rounded-full text-slate-500 hover:text-blue-700 hover:bg-blue-50 shadow-md transition border border-slate-100"
                title="Facebook"
              >
                <Facebook size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 shadow-md transition border border-slate-100"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </motion.button>
              <div className="h-8 w-px bg-slate-300 my-2"></div>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white rounded-full text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 shadow-md transition border border-slate-100"
                title="Lưu bài viết"
              >
                <Bookmark size={20} />
              </motion.button>
            </motion.div>
          </div>

          {/* --- CENTER CONTENT (Bài viết) --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-12 border border-slate-100">
              {/* Meta Info Compact */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm">
                    {/* Giả lập avatar nếu không có */}
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {post.author?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")} •{" "}
                      <Eye size={10} /> {post.views}
                    </p>
                  </div>
                </div>

                {/* Mobile Share Button */}
                <button
                  onClick={handleShare}
                  className="lg:hidden p-2 text-slate-400 hover:text-blue-600"
                >
                  <LinkIcon size={20} />
                </button>
              </div>

              {/* HTML CONTENT */}
              <article
                className="
                prose prose-lg prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-24
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:w-full prose-img:object-cover prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                prose-li:marker:text-blue-500
              "
              >
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="mt-12 pt-6 border-t border-slate-100 flex gap-2 flex-wrap">
                {["Giáo dục", "Tiếng Anh", "Trẻ em"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 cursor-pointer transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author Bio Box */}
              <div className="mt-12 bg-slate-50 p-6 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                  <User className="w-full h-full p-3 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    Viết bởi {post.author?.fullName || "SmartKids Team"}
                  </h4>
                  <p className="text-slate-600 text-sm mt-1">
                    {post.author?.bio ||
                      "Chia sẻ kiến thức và phương pháp học tiếng Anh hiệu quả cho trẻ em. Cùng SmartKids kiến tạo tương lai."}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Posts Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Bookmark className="text-blue-600" /> Bài viết liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((item) => (
                  <motion.div
                    whileHover={{ y: -5 }}
                    key={item}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="h-40 bg-slate-200 relative overflow-hidden">
                      <img
                        src={`https://source.unsplash.com/random/800x600?sig=${item}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt="Related"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        Mẹo học tập
                      </span>
                      <h4 className="font-bold text-slate-800 mt-2 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        5 phương pháp giúp trẻ nhớ từ vựng tiếng Anh lâu hơn
                      </h4>
                      <p className="text-slate-500 text-xs">
                        20 Tháng 10, 2024
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT SIDEBAR (Table of Contents - Sticky) --- */}
          <div className="hidden lg:block lg:col-span-3 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="sticky top-32"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                  Mục lục
                </h3>
                {headings.length > 0 ? (
                  <ul className="space-y-3">
                    {headings.map((heading) => (
                      <li
                        key={heading.id}
                        className={`text-sm transition-colors duration-200 border-l-2 pl-3 ${
                          activeId === heading.id
                            ? "text-blue-600 border-blue-600 font-medium"
                            : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                        }`}
                        style={{ marginLeft: (heading.level - 2) * 12 }} // Thụt đầu dòng cho H3
                      >
                        <a
                          href={`#${heading.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .getElementById(heading.id)
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    Bài viết ngắn, không có mục lục.
                  </p>
                )}
              </div>

              {/* Newsletter / CTA Box */}
              <div className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <h4 className="font-bold text-lg mb-2">Đăng ký nhận tin</h4>
                <p className="text-blue-100 text-xs mb-4">
                  Nhận bài viết mới nhất về giáo dục trẻ em hàng tuần.
                </p>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none mb-3"
                />
                <button className="w-full bg-white text-blue-700 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                  Đăng ký ngay
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 4. SCROLL TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 z-50"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

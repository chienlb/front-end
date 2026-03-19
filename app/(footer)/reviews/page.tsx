"use client";

import { motion } from "framer-motion";
import {
  Star,
  Quote,
  Heart,
  MessageCircle,
  PlayCircle,
  Users,
  CheckCircle2,
  ArrowRight,
  PenTool,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- MOCK DATA ---
const REVIEWS = [
  {
    id: 1,
    name: "Chị Thu Hà",
    role: "Mẹ bé Bon (7 tuổi)",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    content:
      "Mình rất bất ngờ vì Bon trước giờ rất sợ học tiếng Anh, nhưng từ khi dùng SmartKids, tối nào con cũng tự giác xin mẹ mở máy để học. Chương trình thiết kế như game nên bé rất thích!",
    date: "2 ngày trước",
  },
  {
    id: 2,
    name: "Anh Quốc Tuấn",
    role: "Bố bé Mít (Lớp 3)",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    content:
      "Giao diện đẹp, dễ sử dụng. Mình thích nhất tính năng báo cáo tiến độ, đi làm xa vẫn biết hôm nay con học được bao nhiêu từ vựng. Đáng đồng tiền bát gạo.",
    date: "1 tuần trước",
  },
  {
    id: 3,
    name: "Chị Mai Phương",
    role: "Mẹ bé Sóc (5 tuổi)",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 4,
    content:
      "Bé nhà mình mới 5 tuổi nhưng đã biết đếm số và chào hỏi bằng tiếng Anh nhờ xem video trên này. Mong App cập nhật thêm nhiều bài hát thiếu nhi hơn nữa nhé.",
    date: "3 tuần trước",
  },
  {
    id: 4,
    name: "Gia đình bé Ken",
    role: "Thành viên VIP",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 5,
    content:
      "Chức năng luyện nói với AI quá đỉnh. Nó phát hiện lỗi sai phát âm của Ken rất chuẩn, giờ con nói tự tin hơn hẳn. Cảm ơn đội ngũ phát triển!",
    date: "1 tháng trước",
  },
  {
    id: 5,
    name: "Cô giáo Lan",
    role: "Giáo viên Tiếng Anh",
    avatar: "https://i.pravatar.cc/150?img=32",
    rating: 5,
    content:
      "Tôi thường xuyên giới thiệu SmartKids cho phụ huynh học sinh của mình như một công cụ bổ trợ tại nhà. Nội dung rất bám sát chương trình sách giáo khoa mới.",
    date: "2 tháng trước",
  },
  {
    id: 6,
    name: "Mẹ Bỉm Sữa 4.0",
    role: "Influencer",
    avatar: "https://i.pravatar.cc/150?img=20",
    rating: 5,
    content:
      "Đã thử qua nhiều app học tập nhưng SmartKids là app giữ chân bé nhà mình lâu nhất. Không quảng cáo, nội dung sạch, rất yên tâm.",
    date: "2 tháng trước",
  },
];

const BLOG_POSTS = [
  {
    id: 1,
    title: "Hành trình cùng con chinh phục Starters sau 3 tháng",
    author: "Mẹ Su Hào",
    excerpt:
      "Chia sẻ lộ trình tự học tại nhà và cách sử dụng SmartKids để ôn thi chứng chỉ Cambridge.",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    likes: 124,
    comments: 45,
  },
  {
    id: 2,
    title: "5 trò chơi tiếng Anh giúp cả nhà gắn kết cuối tuần",
    author: "Admin Team",
    excerpt:
      "Tổng hợp các mini-game gia đình vừa vui vừa học, không cần thiết bị điện tử.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    title: "Làm sao khi con chán học? Tâm sự của một người mẹ",
    author: "Chị Thanh Vân",
    excerpt:
      "Những lúc con mè nheo, không chịu học, ba mẹ nên xử lý thế nào cho khéo léo?",
    image:
      "https://images.unsplash.com/photo-1484069555935-785be6779f09?auto=format&fit=crop&w=800&q=80",
    likes: 256,
    comments: 102,
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans pb-20">
      {/* 1. HEADER HERO */}
      <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 text-white pt-32 pb-48 overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full blur-[100px]"
        ></motion.div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold mb-6 border border-white/30 shadow-lg"
          >
            <Heart
              size={16}
              className="text-red-200 fill-red-200 animate-pulse"
            />{" "}
            Cộng đồng 50.000+ Phụ huynh
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            Những Lời Chia Sẻ <br />{" "}
            <span className="text-yellow-200">Từ Trái Tim ❤️</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-orange-50 text-lg max-w-2xl mx-auto font-medium"
          >
            Niềm tự hào lớn nhất của SmartKids không phải là những giải thưởng
            công nghệ, mà là sự tin yêu và tiến bộ mỗi ngày của hàng ngàn bạn
            nhỏ Việt Nam.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 inline-flex flex-col md:flex-row items-center gap-8 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20"
          >
            <div className="text-center px-4 border-r border-white/20 last:border-0">
              <div className="text-3xl font-black text-white">4.9/5</div>
              <div className="text-xs text-orange-100 uppercase tracking-wide font-bold">
                App Store Rating
              </div>
            </div>
            <div className="text-center px-4 border-r border-white/20 last:border-0">
              <div className="text-3xl font-black text-white">15K+</div>
              <div className="text-xs text-orange-100 uppercase tracking-wide font-bold">
                Học sinh giỏi
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-black text-white">98%</div>
              <div className="text-xs text-orange-100 uppercase tracking-wide font-bold">
                Hài lòng
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. REVIEWS GRID (Masonry Layout feeling) */}
      <div className="container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-50 relative flex flex-col h-full"
            >
              <Quote
                className="absolute top-6 right-6 text-orange-100 fill-orange-50"
                size={40}
              />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full border-2 border-orange-100 overflow-hidden">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">
                    {review.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                    {review.role}
                  </p>
                </div>
              </div>

              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < review.rating ? "currentColor" : "none"}
                    className={i >= review.rating ? "text-slate-200" : ""}
                  />
                ))}
              </div>

              <p className="text-slate-600 italic flex-1 leading-relaxed">
                "{review.content}"
              </p>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-medium">
                <span className="text-slate-400">{review.date}</span>
                <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Đã xác thực
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white hover:bg-orange-50 text-orange-600 font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-200 border-2 border-orange-100 transition-all transform hover:-translate-y-1 flex items-center gap-2 mx-auto">
            <PenTool size={18} /> Viết đánh giá của bạn
          </button>
        </div>
      </div>

      {/* 3. VIDEO TESTIMONIALS */}
      <section className="py-24 mt-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-orange-600 font-bold uppercase text-sm tracking-wider block mb-2">
                Người thật việc thật
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800">
                Video Câu Chuyện Thành Công
              </h2>
            </div>
            <Link
              href="#"
              className="text-orange-600 font-bold flex items-center gap-2 hover:underline"
            >
              Xem tất cả video <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group relative rounded-3xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img
                  src={`https://images.unsplash.com/photo-${item === 1 ? "1544717305-2782549b5136" : item === 2 ? "1543269865-cbf427effbad" : "1556484687-306361646342"}?auto=format&fit=crop&w=800&q=80`}
                  className="w-full h-64 object-cover transition duration-700 group-hover:scale-110"
                  alt="Video Thumbnail"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white group-hover:scale-110 transition">
                    <PlayCircle size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="font-bold text-lg">
                    Bé Na nói tiếng Anh như gió sau 6 tháng
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Phụ huynh: Chị Thanh Hằng
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMMUNITY BLOG */}
      <section className="py-24 bg-white relative">
        {/* Decor Wave Top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[60px] fill-[#FFFBF0]"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Góc Chia Sẻ <span className="text-blue-600">Kinh Nghiệm</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Nơi phụ huynh trao đổi phương pháp dạy con, tài liệu học tập và
              những câu chuyện gia đình thú vị.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full cursor-pointer group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                    {post.author}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 group-hover:text-red-500 transition">
                        <Heart size={14} /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 group-hover:text-blue-500 transition">
                        <MessageCircle size={14} /> {post.comments}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-blue-600 group-hover:underline">
                      Đọc ngay <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA JOIN */}
      <div className="container mx-auto px-6 pb-24">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-30"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Tham Gia Cộng Đồng SmartKids Ngay Hôm Nay
            </h2>
            <p className="text-slate-300 text-lg mb-10">
              Kết nối với hàng ngàn phụ huynh khác, nhận tài liệu miễn phí và
              đồng hành cùng con khôn lớn.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                <Users size={20} /> Tham Gia Group Facebook
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-2xl hover:bg-white/20 transition">
                Đăng Ký Tài Khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

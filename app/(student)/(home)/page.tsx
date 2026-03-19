"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Star,
  Trophy,
  Users,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  Zap,
  Award,
  Quote,
  Calendar,
  ArrowUpRight,
  Heart,
  MapPin,
} from "lucide-react";

// --- ANIMATION CONFIG ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, duration: 0.8 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const floatAnim = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 2, -2, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 overflow-x-hidden font-sans selection:bg-blue-200 selection:text-blue-900 relative">
      {/* 1. DYNAMIC BACKGROUND */}
      <div className="fixed inset-0 z-0 opacity-60 pointer-events-none overflow-hidden bg-[url('/grid-pattern.svg')] bg-[length:40px_40px]">
        {/* Blob Tím */}
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[80px]"
        ></motion.div>

        {/* Blob Vàng */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px]"
        ></motion.div>

        {/* Blob Hồng */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -30, 20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-20 left-[30%] w-[700px] h-[700px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px]"
        ></motion.div>
      </div>

      {/* 1.5. FLOATING ICONS (Biểu tượng bay lơ lửng) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] text-5xl opacity-20 blur-[1px] grayscale hover:grayscale-0 transition-all"
        >
          ✏️
        </motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
          className="absolute top-[45%] right-[5%] text-5xl opacity-20 blur-[1px]"
        >
          📐
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
          className="absolute bottom-[20%] left-[12%] text-5xl opacity-20 blur-[1px]"
        >
          📚
        </motion.div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 container mx-auto px-6 pt-40 pb-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-200/50 px-5 py-2 rounded-full shadow-lg shadow-blue-500/5 text-blue-700 text-sm font-bold"
          >
            <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Ứng dụng Gamification số 1 Việt Nam
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900"
          >
            Đánh Thức Đam Mê <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
              Tiếng Anh Cho Bé
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-medium"
          >
            Biến việc học khô khan thành cuộc phiêu lưu kỳ thú. Giúp bé{" "}
            <strong>6-12 tuổi</strong> tự giác học tập, phát âm chuẩn bản xứ và
            tự tin giao tiếp chỉ sau <strong>3 tháng</strong>.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/register"
              className="group relative bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 flex items-center gap-3 transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
              <span>Học Thử Miễn Phí</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <button className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-sm hover:shadow-md">
              <PlayCircle size={22} className="text-red-500 fill-red-100" />{" "}
              Video Giới Thiệu
            </button>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 text-sm font-medium text-slate-500 pt-4"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full border-[3px] border-white bg-slate-200 overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 15}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="flex flex-col">
              <span className="text-slate-800 font-bold text-base">
                15,000+
              </span>
              <span className="text-xs">Phụ huynh tin dùng</span>
            </p>
          </motion.div>
        </motion.div>

        {/* --- HERO IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, type: "spring", delay: 0.2 }}
          className="relative lg:h-[600px] w-full flex items-center justify-center lg:justify-end"
        >
          {/* Main Image Container */}
          <div className="relative w-full max-w-lg aspect-[4/5] lg:aspect-auto lg:h-full rounded-[3rem] overflow-hidden border-8 border-white/40 shadow-2xl shadow-blue-200/50 backdrop-blur-sm transform rotate-[-2deg] hover:rotate-0 transition-all duration-700">
            {/* Ảnh học sinh */}
            <img
              src="/images/bg-student-learning.png"
              alt="Học sinh SmartKids đang học vui vẻ"
              className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-1000 ease-in-out"
            />

            {/* Lớp phủ Gradient nhẹ */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent"></div>
          </div>

          {/* Decorative Circles phía sau ảnh */}
          <div className="absolute -z-10 top-10 right-10 w-full h-full bg-blue-100/50 rounded-[3rem] transform rotate-[3deg] scale-95 border-4 border-white/30"></div>

          {/* Floating Badge 1: Streak (Góc trên phải) */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 -right-4 lg:-right-12 bg-white p-4 pr-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 z-20 flex items-center gap-4"
          >
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Streak
              </p>
              <p className="text-xl font-black text-slate-800">30 Ngày 🔥</p>
            </div>
          </motion.div>

          {/* Floating Badge 2: Live Class (Góc dưới trái) */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 -left-4 lg:-left-12 bg-white/90 backdrop-blur-md p-4 pr-6 rounded-2xl shadow-xl shadow-purple-900/5 border border-slate-100 z-20 flex items-center gap-4"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden">
                <img
                  src="/images/bg-student-learning.png"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="animate-pulse w-2 h-2 bg-purple-500 rounded-full inline-block"></span>{" "}
                Live Class
              </p>
              <p className="text-lg font-bold text-slate-800">Cô Sarah </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. STATS BAR */}
      <section className="bg-white py-16 border-y border-slate-100 relative z-10 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {[
              {
                num: "50+",
                label: "Chủ đề Học tập",
                icon: <BookOpen className="text-blue-500 w-8 h-8 mb-3" />,
              },
              {
                num: "15K+",
                label: "Học sinh Giỏi",
                icon: <Users className="text-green-500 w-8 h-8 mb-3" />,
              },
              {
                num: "100%",
                label: "An toàn & Bảo mật",
                icon: <ShieldCheck className="text-purple-500 w-8 h-8 mb-3" />,
              },
              {
                num: "4.9",
                label: "Đánh giá AppStore",
                icon: (
                  <Star
                    className="text-yellow-500 w-8 h-8 mb-3"
                    fill="currentColor"
                  />
                ),
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center px-4 group hover:transform hover:scale-105 transition-transform duration-300"
              >
                <div className="p-3 bg-slate-50 rounded-2xl mb-3 group-hover:bg-blue-50 transition-colors">
                  {stat.icon}
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-slate-800 mb-1">
                  {stat.num}
                </h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE LEARNING JOURNEY */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <span className="bg-blue-100 text-blue-700 font-bold tracking-wider uppercase text-xs px-3 py-1 rounded-full mb-4 inline-block">
              Quy trình hiệu quả
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Con Sẽ Học Như Thế Nào?
            </h2>
            <p className="text-lg text-slate-600">
              SmartKids áp dụng mô hình "Vừa học vừa chơi" (Play-to-Learn) giúp
              kiến thức đi vào não bộ một cách tự nhiên nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-blue-200 to-yellow-200 z-0 rounded-full"></div>
            {[
              {
                title: "1. Khởi động",
                desc: "Xem video hoạt hình tương tác để làm quen từ vựng mới.",
                icon: "https://img.icons8.com/color/96/tv.png",
                color: "bg-pink-100 text-pink-600 border-pink-200",
              },
              {
                title: "2. Tương tác",
                desc: "Chơi mini-game để ghi nhớ mặt chữ và ngữ nghĩa.",
                icon: "https://img.icons8.com/color/96/controller.png",
                color: "bg-purple-100 text-purple-600 border-purple-200",
              },
              {
                title: "3. Luyện nói",
                desc: "AI chấm điểm phát âm, sửa lỗi sai ngay lập tức.",
                icon: "https://img.icons8.com/color/96/microphone.png",
                color: "bg-blue-100 text-blue-600 border-blue-200",
              },
              {
                title: "4. Nhận quà",
                desc: "Hoàn thành bài học để nhận Vàng, mở khóa Thẻ bài.",
                icon: "https://img.icons8.com/color/96/gift.png",
                color: "bg-yellow-100 text-yellow-600 border-yellow-200",
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative z-10 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-24 h-24 mx-auto rounded-full ${step.color} border-4 flex items-center justify-center mb-6 shadow-sm`}
                >
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-12 h-12"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. METHODOLOGY */}
      <section className="py-24 container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-2 block">
              Công nghệ giáo dục
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Phương Pháp <span className="text-blue-600">3C Độc Quyền</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Chúng tôi kết hợp 3 yếu tố cốt lõi để tạo nên sự khác biệt, giúp
              trẻ không chỉ học tiếng Anh mà còn phát triển tư duy.
            </p>

            <div className="space-y-8">
              {[
                {
                  head: "Creative (Sáng tạo)",
                  text: "Bài học được thiết kế như một cốt truyện game, kích thích trí tưởng tượng phong phú của trẻ.",
                  icon: <Sparkles className="text-purple-600" />,
                  bg: "bg-purple-50 border-purple-100",
                },
                {
                  head: "Conquer (Chinh phục)",
                  text: "Hệ thống huy hiệu, bảng xếp hạng tạo động lực để bé nỗ lực vượt qua thử thách mỗi ngày.",
                  icon: <Trophy className="text-yellow-600" />,
                  bg: "bg-yellow-50 border-yellow-100",
                },
                {
                  head: "Connect (Kết nối)",
                  text: "Cộng đồng bạn bè cùng tiến bộ, thi đấu đối kháng lành mạnh giúp bé tự tin hơn.",
                  icon: <Users className="text-blue-600" />,
                  bg: "bg-blue-50 border-blue-100",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 border shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {item.head}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grid Cards bên phải */}
          <div className="grid grid-cols-2 gap-5">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-purple-50 p-6 rounded-[2rem] space-y-4 border border-purple-100 shadow-sm"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src="https://img.icons8.com/color/96/artificial-intelligence.png"
                  className="w-7 h-7"
                  alt="AI"
                />
              </div>
              <h3 className="font-bold text-purple-900 text-lg">
                AI Speaking Coach
              </h3>
              <p className="text-sm text-purple-700 leading-relaxed">
                Công nghệ nhận diện giọng nói giúp bé sửa lỗi phát âm chuẩn bản xứ.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-orange-50 p-6 rounded-[2rem] space-y-4 border border-orange-100 shadow-sm mt-8"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src="https://img.icons8.com/color/96/combo-chart--v1.png"
                  className="w-7 h-7"
                  alt="Chart"
                />
              </div>
              <h3 className="font-bold text-orange-900 text-lg">
                Báo Cáo Real-time
              </h3>
              <p className="text-sm text-orange-700 leading-relaxed">
                Phụ huynh theo dõi sát sao tiến độ và điểm mạnh yếu của con.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-blue-50 p-6 rounded-[2rem] space-y-4 border border-blue-100 shadow-sm"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src="https://img.icons8.com/color/96/puzzle.png"
                  className="w-7 h-7"
                  alt="Puzzle"
                />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">
                Micro-learning
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Bài học chia nhỏ 15 phút, phù hợp với khả năng tập trung của trẻ.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-green-50 p-6 rounded-[2rem] space-y-4 border border-green-100 shadow-sm mt-8"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src="https://img.icons8.com/color/96/security-checked.png"
                  className="w-7 h-7"
                  alt="Safe"
                />
              </div>
              <h3 className="font-bold text-green-900 text-lg">
                Kid-Safe Standard
              </h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Không quảng cáo, nội dung được kiểm duyệt 100%.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. LỘ TRÌNH (Courses) */}
      <section className="py-24 bg-white relative z-10 border-t border-slate-100" >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Lộ Trình Chuẩn Quốc Tế
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Thiết kế bám sát khung chương trình Sách Giáo Khoa của Bộ GD&ĐT và
              chuẩn Cambridge (Starters, Movers).
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ y: -8 }}
              className="group relative bg-gradient-to-br from-blue-50/80 to-white p-10 rounded-[40px] border border-blue-100 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.2)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors"></div>

              <span className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-md shadow-blue-200">
                Lớp 1 (6-7 Tuổi)
              </span>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Tiếng Anh Khởi Động
                  </h3>
                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                    Xây dựng nền tảng từ vựng và ngữ âm cơ bản. Giúp bé yêu thích tiếng
                    Anh ngay từ đầu.
                  </p>
                </div>

                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <img
                    src="https://img.icons8.com/color/96/sprout.png"
                    alt="sprout"
                    className="w-10 h-10"
                  />
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "500+ Từ vựng chủ đề",
                  "Làm quen bảng chữ cái (Phonics)",
                  "Số đếm & Màu sắc cơ bản",
                ].map((txt, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-white/50 p-2 rounded-lg"
                  >
                    <div className="bg-blue-100 p-1 rounded-full">
                      <CheckCircle2 size={14} className="text-blue-600" />
                    </div>
                    {txt}
                  </li>
                ))}
              </ul>

              <div className="w-full bg-white border border-blue-100 h-14 rounded-2xl flex items-center justify-center text-blue-700 font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                Xem Chi Tiết Lộ Trình
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="group relative bg-gradient-to-br from-orange-50/80 to-white p-10 rounded-[40px] border border-orange-100 shadow-[0_10px_40px_-10px_rgba(234,88,12,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(234,88,12,0.2)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-orange-100/50 rounded-full blur-3xl group-hover:bg-orange-200/50 transition-colors"></div>

              <span className="inline-block bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-md shadow-orange-200">
                Lớp 2 (7-8 Tuổi)
              </span>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Tiếng Anh Giao Tiếp
                  </h3>
                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                    Mở rộng mẫu câu giao tiếp, luyện phản xạ nghe nói và tự tin giới
                    thiệu bản thân.
                  </p>
                </div>

                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <img
                    src="https://img.icons8.com/color/96/rocket.png"
                    alt="rocket"
                    className="w-10 h-10"
                  />
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "1000+ Từ vựng mở rộng",
                  "Mẫu câu giao tiếp hàng ngày",
                  "Luyện nghe & Phản xạ",
                ].map((txt, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-white/50 p-2 rounded-lg"
                  >
                    <div className="bg-orange-100 p-1 rounded-full">
                      <CheckCircle2 size={14} className="text-orange-600" />
                    </div>
                    {txt}
                  </li>
                ))}
              </ul>

              <div className="w-full bg-white border border-orange-100 h-14 rounded-2xl flex items-center justify-center text-orange-700 font-bold group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                Xem Chi Tiết Lộ Trình
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6.5. MEET OUR TUTORS */}
      < section className="py-24 bg-gradient-to-br from-indigo-50/50 to-white relative z-10" >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">
                Đội ngũ giảng dạy
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Gặp Gỡ Những{" "}
                <span className="text-indigo-600">Người Bạn Đồng Hành</span>
              </h2>
              <p className="text-slate-600 text-lg">
                Không chỉ là giáo viên, họ là những người truyền lửa đam mê. Đội
                ngũ SmartKids bao gồm cả AI Tutor thông minh và các thầy cô bản
                ngữ giàu kinh nghiệm.
              </p>
            </div>
            <Link
              href="/live-tutors"
              className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors group"
            >
              Xem tất cả gia sư{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "Cô Sarah",
                role: "Native Speaker",
                img: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
                tag: "🇺🇸 USA",
              },
              {
                name: "Thầy David",
                role: "IELTS 8.5",
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                tag: "🇬🇧 UK",
              },
              {
                name: "Nova AI",
                role: "Trợ lý ảo 24/7",
                img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
                tag: "🤖 AI",
                isAI: true,
              },
              {
                name: "Cô Lan Anh",
                role: "Thạc sĩ GD",
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
                tag: "🇻🇳 VN",
              },
            ].map((tutor, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                className="group bg-white p-4 rounded-[2rem] shadow-lg shadow-indigo-100 border border-indigo-50/50 text-center relative overflow-hidden transition-all duration-300"
              >
                <div className="w-full h-56 rounded-2xl overflow-hidden mb-5 relative shadow-inner">
                  <img
                    src={tutor.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    alt={tutor.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    {tutor.tag}
                  </span>

                  {tutor.isAI && (
                    <span className="absolute bottom-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
                      <Zap size={10} fill="currentColor" /> Online 24/7
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">
                  {tutor.name}
                </h3>
                <p className="text-indigo-600 font-semibold text-sm mb-3 uppercase tracking-wide">
                  {tutor.role}
                </p>
                <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-200">
                  Kết nối ngay
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </ section>

      {/* 6.6. LATEST BLOGS */}
      < section className="py-24 bg-white relative z-10" >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">
              Góc cha mẹ thông thái
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Bí Quyết <span className="text-green-600">Nuôi Dạy Con</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Cập nhật những phương pháp giáo dục hiện đại và kinh nghiệm đồng
              hành cùng con học tiếng Anh hiệu quả.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title:
                  "5 sai lầm khi dạy con học tiếng Anh tại nhà cha mẹ hay mắc phải",
                cat: "Phương pháp",
                date: "12/10/2023",
                img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: "Làm sao để con tự giác học mà không cần nhắc nhở?",
                cat: "Tâm lý",
                date: "10/10/2023",
                img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80",
              },
              {
                title:
                  "Top 10 phim hoạt hình giúp bé luyện nghe tiếng Anh cực đỉnh",
                cat: "Giải trí",
                date: "05/10/2023",
                img: "https://images.unsplash.com/photo-1513258496098-dad22d5830b0?auto=format&fit=crop&w=800&q=80",
              },
            ].map((post, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md">
                    {post.cat}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-medium">
                    <Calendar size={14} /> {post.date}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-green-600 transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                  >
                    Đọc tiếp <ArrowUpRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-8 py-3 rounded-full font-bold transition-all border border-slate-200"
            >
              Xem Thư Viện Bài Viết <BookOpen size={18} />
            </Link>
          </div>
        </div>
      </ section>

      {/* 7. PARENTS FEEDBACK */}
      < section className="py-24 bg-slate-50 relative z-10 border-t border-slate-200/60" >
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center text-slate-900 mb-16">
            Phụ Huynh Nói Gì Về{" "}
            <span className="text-blue-600">SmartKids?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Chị Minh Anh",
                role: "Mẹ bé Su (Lớp 2)",
                text: "Trước đây Su rất sợ học tiếng Anh, mỗi lần học là khóc. Từ khi dùng SmartKids, con tự giác cầm máy học mỗi tối để cày huy hiệu. Rất bất ngờ!",
                avatar: 30,
              },
              {
                name: "Anh Tuấn Hưng",
                role: "Bố bé Bin (Lớp 1)",
                text: "Giao diện đẹp, dễ dùng. Tôi thích nhất tính năng báo cáo, đi làm xa vẫn biết con hôm nay học được từ gì, phát âm sai chỗ nào. Rất yên tâm.",
                avatar: 12,
              },
              {
                name: "Chị Lan Phương",
                role: "Mẹ bé Bống (Lớp 3)",
                text: "Con mình phát âm chuẩn hơn hẳn nhờ tính năng AI Coach. Cô giáo trên lớp cũng khen Bống dạo này tự tin nói tiếng Anh hơn trước nhiều.",
                avatar: 45,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative hover:shadow-lg transition-shadow"
              >
                <Quote
                  className="absolute top-8 right-8 text-slate-100 fill-slate-100"
                  size={50}
                />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <img
                    src={`https://i.pravatar.cc/100?img=${item.avatar}`}
                    className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                    alt={item.name}
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {item.role}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4 relative z-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-base italic leading-relaxed relative z-10">
                  "{item.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </ section>

      {/* 8. CTA SECTION */}
      <section className="py-24 container mx-auto px-6 relative z-10" >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden text-center shadow-2xl shadow-blue-500/30"
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-30"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight drop-shadow-sm">
              Đừng Để Bé Bỏ Lỡ <br />
              <span className="text-yellow-300">Giai Đoạn Vàng!</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Độ tuổi 6-12 là thời điểm tốt nhất để não bộ tiếp thu ngôn ngữ.
              Đăng ký ngay hôm nay để nhận gói quà tặng{" "}
              <strong className="text-white border-b-2 border-yellow-300">
                VIP Starter Pack
              </strong>{" "}
              trị giá 500.000đ.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <button className="bg-yellow-400 text-yellow-900 px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-yellow-500/30 hover:bg-yellow-300 transition transform hover:-translate-y-1">
                Đăng Ký Học Thử Ngay
              </button>
              <button className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition">
                Nhận Tư Vấn Miễn Phí
              </button>
            </div>

            <p className="mt-10 text-sm text-blue-200/80 font-medium">
              🎁 <strong>Ưu đãi bao gồm:</strong> 7 ngày học Full tính năng • Bộ
              Ebook từ vựng • Kiểm tra trình độ 1:1
            </p>
          </div>
        </motion.div>
      </section>
    </div >
  );
}

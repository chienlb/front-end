"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  User,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { liveClassService } from "@/services/live-class.service";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50 },
  },
};

export default function LiveTutorPage() {
  const router = useRouter();

  // --- STATE DATA ---
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await liveClassService.getAvailableClasses(searchTerm);
        setClasses(res.data || res);
      } catch (error) {
        console.error("Lỗi tải lớp:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // --- [TÍCH HỢP CHECKOUT TẠI ĐÂY] ---
  const handleEnroll = async (cls: any) => {
    // TRƯỜNG HỢP 1: LỚP MIỄN PHÍ -> Đăng ký luôn
    if (!cls.price || cls.price === 0) {
      if (!confirm(`Xác nhận đăng ký lớp miễn phí: "${cls.name}"?`)) return;

      setRegisteringId(cls._id);
      try {
        await liveClassService.enrollClass(cls._id);
        alert("Đăng ký thành công! Bạn sẽ được chuyển đến lớp học.");
        router.push("/my-classes");
      } catch (error: any) {
        alert(error.message || "Đăng ký thất bại. Lớp có thể đã đầy.");
      } finally {
        setRegisteringId(null);
      }
      return;
    }

    // TRƯỜNG HỢP 2: LỚP CÓ PHÍ -> Chuyển sang trang Checkout
    // Chuẩn bị dữ liệu để gửi qua URL
    const params = new URLSearchParams({
      type: "LIVE_CLASS",
      id: cls._id,
      name: cls.name,
      price: cls.price.toString(),
      // Tạo mô tả ngắn gọn về giáo viên và lịch học
      desc: `GV: ${cls.tutorId?.fullName || "Tutor"} • ${
        cls.schedule?.[0]?.startTime
          ? format(new Date(cls.schedule[0].startTime), "dd/MM/yyyy HH:mm")
          : "Lịch chưa cập nhật"
      }`,
      image:
        cls.baseCourseId?.thumbnail ||
        "https://cdn-icons-png.flaticon.com/512/3204/3204216.png",
    });

    // Chuyển hướng người dùng
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 text-white pt-24 pb-20 px-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Video size={14} /> Live Learning Platform
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Lịch Khai Giảng <br />{" "}
            <span className="text-blue-500">Lớp Học Trực Tuyến</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Học trực tiếp cùng giáo viên bản ngữ và đội ngũ gia sư hàng đầu.
            Tương tác 2 chiều, sửa lỗi ngay lập tức.
          </p>

          {/* Search Bar */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="max-w-xl mx-auto bg-white rounded-full flex items-center p-1.5 shadow-2xl shadow-blue-900/20"
          >
            <Search className="text-slate-400 ml-4" size={20} />
            <input
              className="flex-1 px-4 py-3 outline-none text-slate-800 bg-transparent placeholder:text-slate-400 font-medium"
              placeholder="Tìm theo tên lớp, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition shadow-md">
              Tìm kiếm
            </button>
          </motion.div>
        </motion.div>

        {/* Background Decor */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent skew-x-12 translate-x-20 pointer-events-none"
        ></motion.div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. CLASS LIST */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-12 shadow-sm text-center border border-slate-100"
            >
              <Loader2
                className="animate-spin mx-auto text-blue-600 mb-4"
                size={40}
              />
              <p className="text-slate-500 font-medium">
                Đang tìm lớp học phù hợp...
              </p>
            </motion.div>
          ) : classes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-16 shadow-sm text-center border border-slate-100"
            >
              <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                Không tìm thấy lớp nào
              </h3>
              <p className="text-slate-500 mb-6">
                Thử thay đổi từ khóa hoặc quay lại sau nhé.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 font-bold hover:bg-blue-50 px-6 py-2 rounded-full transition"
              >
                Xem tất cả lớp
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {classes.map((cls) => (
                <ClassCard
                  key={cls._id}
                  data={cls}
                  onEnroll={() => handleEnroll(cls)}
                  isProcessing={registeringId === cls._id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- 3. SUB-COMPONENT: CLASS CARD ---
function ClassCard({ data, onEnroll, isProcessing }: any) {
  const firstSession = data.schedule?.find((s: any) => s.startTime) || {};
  const startTime = firstSession.startTime
    ? new Date(firstSession.startTime)
    : null;

  const isPaid = data.price && data.price > 0;

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Ảnh bìa */}
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={
            data.baseCourseId?.thumbnail ||
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
          }
          className="w-full h-full object-cover"
          alt="Course Thumbnail"
        />

        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
        </div>

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 shadow-sm border border-slate-100">
          {data.baseCourseId?.title || "Khóa học"}
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {data.name}
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden relative">
              <img
                src={
                  data.tutorId?.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    data.tutorId?.fullName || "Tutor"
                  }`
                }
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Giảng viên
              </p>
              <p className="font-bold text-slate-700 text-sm">
                {data.tutorId?.fullName || "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-slate-600">
            <Calendar
              size={18}
              className="text-blue-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="font-bold text-slate-700 text-xs uppercase mb-0.5">
                Khai giảng
              </p>
              <span>
                {startTime
                  ? format(startTime, "HH:mm - dd/MM/yyyy")
                  : "Lịch chưa cập nhật"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm text-slate-600">
            <User size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-700 text-xs uppercase mb-0.5">
                Sĩ số
              </p>
              <span>{data.students?.length || 0} / 20 học viên</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block">
              Học phí
            </span>
            <span
              className={`font-black text-xl ${isPaid ? "text-blue-600" : "text-green-600"}`}
            >
              {isPaid ? `${data.price.toLocaleString()}đ` : "Miễn phí"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnroll}
            disabled={isProcessing}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
              isPaid
                ? "bg-slate-900 text-white hover:bg-blue-700 shadow-slate-200"
                : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isPaid ? "Mua ngay" : "Đăng ký"}
                {isPaid ? <CreditCard size={16} /> : <CheckCircle2 size={16} />}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

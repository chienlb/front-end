"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
  Search,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { liveClassService } from "@/services/live-class.service";
import { format, isFuture, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// --- INTERFACES ---
interface Session {
  _id: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  recordingUrl?: string;
}

interface ClassItem {
  _id: string;
  name: string;
  baseCourseId: { title: string; thumbnail?: string };
  tutorId: { fullName: string; avatar?: string };
  students: any[];
  schedule: Session[];
}

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay giữa các phần tử con
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

export default function MyClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res: any = await liveClassService.getMyClasses();
        setClasses(res.data || res);
      } catch (error) {
        console.error("Lỗi tải danh sách lớp:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // --- HELPER: Tính toán thông số lớp học ---
  const getClassStats = (cls: ClassItem) => {
    const total = cls.schedule?.length || 0;
    const completed =
      cls.schedule?.filter(
        (s) => s.isCompleted || (s.endTime && isPast(new Date(s.endTime))),
      ).length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const nextSession = cls.schedule
      ?.filter((s) => s.startTime && isFuture(new Date(s.startTime)))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )[0];

    return { total, completed, progress, nextSession };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <span className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
                <BookOpen size={24} />
              </span>
              Lớp Học Của Tôi
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Theo dõi tiến độ và tham gia các buổi học trực tuyến.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/live-tutor")}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
          >
            <Search size={18} /> Đăng ký lớp mới
          </motion.button>
        </motion.div>

        {/* --- MAIN CONTENT --- */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[400px] flex flex-col items-center justify-center gap-3"
            >
              <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
              <p className="text-slate-500 font-medium animate-pulse">
                Đang tải lớp học của bạn...
              </p>
            </motion.div>
          ) : classes.length === 0 ? (
            /* EMPTY STATE */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white p-16 rounded-[2.5rem] text-center shadow-sm border border-slate-100 flex flex-col items-center max-w-2xl mx-auto mt-10"
            >
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <AlertCircle size={48} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Bạn chưa tham gia lớp học nào
              </h3>
              <p className="text-slate-500 mb-8 max-w-md leading-relaxed">
                Khám phá các khóa học trực tuyến với giáo viên bản ngữ để cải
                thiện trình độ tiếng Anh ngay hôm nay.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/live-tutor")}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
              >
                Xem lịch khai giảng <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          ) : (
            /* CLASS GRID */
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {classes.map((cls) => {
                const stats = getClassStats(cls);

                return (
                  <motion.div
                    key={cls._id}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => router.push(`/my-classes/${cls._id}`)}
                    className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex flex-col h-full relative"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {stats.progress === 100 ? (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                          <CheckCircle size={10} /> HOÀN THÀNH
                        </span>
                      ) : (
                        <span className="bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-white">
                          ĐANG HỌC
                        </span>
                      )}
                    </div>

                    {/* 1. COVER AREA */}
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 group-hover:scale-105 transition-transform duration-700"></div>

                      {/* Course Title Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
                        <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1">
                          {cls.baseCourseId?.title || "Khóa học"}
                        </div>
                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                          {cls.name}
                        </h3>
                      </div>
                    </div>

                    {/* 2. BODY CONTENT */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Tutor Profile */}
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                        <div className="relative">
                          <img
                            src={
                              cls.tutorId?.avatar ||
                              `https://ui-avatars.com/api/?name=${cls.tutorId?.fullName || "Tutor"}&background=random`
                            }
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                            alt="Tutor"
                          />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Giảng viên
                          </p>
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                            {cls.tutorId?.fullName || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      {/* Next Session Highlight */}
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6">
                        <div className="flex items-center gap-2 text-orange-700 text-xs font-bold mb-1.5 uppercase tracking-wide">
                          <Clock size={14} className="animate-pulse" /> Buổi học
                          tiếp theo
                        </div>
                        <div className="text-base font-bold text-slate-800">
                          {stats.nextSession ? (
                            format(
                              new Date(stats.nextSession.startTime),
                              "HH:mm - dd/MM/yyyy",
                            )
                          ) : (
                            <span className="text-slate-400 font-normal italic text-sm">
                              Chưa có lịch sắp tới
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>Tiến độ khóa học</span>
                          <span className="text-blue-600">
                            {stats.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress}%` }}
                            transition={{
                              duration: 1,
                              delay: 0.5,
                              ease: "easeOut",
                            }}
                            className="bg-blue-600 h-full rounded-full"
                          ></motion.div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right">
                          Đã học {stats.completed}/{stats.total} buổi
                        </p>
                      </div>
                    </div>

                    {/* 3. FOOTER ACTION */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 group-hover:bg-blue-50/50 transition-colors flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition flex items-center gap-2">
                        <PlayCircle size={16} /> Vào lớp học
                      </span>
                      <motion.div initial={{ x: 0 }} whileHover={{ x: 4 }}>
                        <ArrowRight
                          size={16}
                          className="text-slate-300 group-hover:text-blue-600 transition-colors"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

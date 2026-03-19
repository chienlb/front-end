"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { courseService } from "@/services/course.service";
import { BookOpen, Users, ArrowRight, Star, Sparkles } from "lucide-react";

export default function CoursesPage() {
  // --- 1. STATE & CONFIG ---
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ màu sắc Card (Pastel)
  const CARD_THEMES = [
    { bg: "#FFF0F0", color: "#FF6B6B", shadow: "shadow-red-200" },
    { bg: "#E0F9F6", color: "#4ECDC4", shadow: "shadow-teal-200" },
    { bg: "#FFFBE6", color: "#F6E05E", shadow: "shadow-yellow-200" },
    { bg: "#F3E8FF", color: "#9F7AEA", shadow: "shadow-purple-200" },
  ];

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getAllCourses();

        console.log(data);

        // Lọc khóa học: Bỏ các khóa có chữ "Live" hoặc danh mục LIVE
        const gameOnly = data.filter(
          (c: any) =>
            c.title.toLowerCase().includes("lớp") &&
            !c.title.toLowerCase().includes("live") &&
            c.category !== "LIVE", // Cần thêm field category
        );

        // Map dữ liệu sang format UI
        const mappedData = gameOnly.map((c: any, idx: number) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          return {
            id: c._id,
            title: c.title,
            description:
              c.description || "Khám phá thế giới tiếng Anh đầy màu sắc!",
            thumbnail: c.thumbnail,
            grade: c.grade || "grade-1", // Mặc định grade-1 nếu thiếu
            lessons: c.totalLessons || 12,
            students: 100 + idx * 50,
            icon: ["🐶", "🚀", "🎨", "🐸", "🦁", "🤖"][idx % 6],
            theme: theme,
          };
        });
        setCourses(mappedData);
      } catch (err) {
        console.error("Lỗi tải khóa học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Lọc khóa học theo Tab
  const filteredCourses =
    activeTab === "all"
      ? courses
      : courses.filter((course) => course.grade === activeTab);

  // --- 3. LOADING STATE ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-blue-500 font-bold text-xl animate-pulse">
          Đang tải thư viện...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen relative font-sans text-slate-800 pb-24 overflow-x-hidden">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-course.png"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          className="opacity-100"
        />
        {/* Lớp phủ gradient */}
        {/* <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div> */}
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 container mx-auto px-4">
        {/* 1. HEADER SECTION */}
        <motion.div
          className="text-center pt-28 pb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full font-bold text-sm mb-4 border border-blue-200 shadow-sm">
            <Sparkles size={16} /> Cùng bé chinh phục tri thức
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 drop-shadow-sm tracking-tight">
            Thư Viện Khóa Học 📚
          </h1>
          <p className="text-lg text-slate-600 bg-white/60 backdrop-blur-md inline-block px-6 py-2 rounded-2xl shadow-sm border border-white/50">
            Chọn cấp độ phù hợp để bắt đầu hành trình của bé
          </p>
        </motion.div>

        {/* 2. TABS FILTER (Bộ lọc) */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: "all", label: "Tất cả" },
            { id: "grade-1", label: "Lớp 1 🐣" },
            { id: "grade-2", label: "Lớp 2 🐥" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 rounded-full font-extrabold text-lg transition-all duration-300 shadow-md border-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-300 scale-105"
                  : "bg-white/80 text-slate-500 border-transparent hover:bg-white hover:border-blue-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* 3. COURSES GRID (Danh sách khóa học) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="w-full max-w-[400px] mx-auto flex flex-col h-full bg-white/90 backdrop-blur-xl rounded-[2rem] border-[3px] border-white shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
              >
                {/* A. Card Image Area */}
                <div
                  className="h-48 relative flex items-center justify-center overflow-hidden rounded-t-[1.8rem]"
                  style={{ backgroundColor: course.theme.bg }}
                >
                  {/* Bong bóng trang trí */}
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute top-5 right-5 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>

                  {course.thumbnail ? (
                    <motion.img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <motion.span
                      className="text-7xl filter drop-shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                    >
                      {course.icon}
                    </motion.span>
                  )}

                  {/* Badge Lớp */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-black uppercase text-white shadow-sm"
                      style={{ backgroundColor: course.theme.color }}
                    >
                      {course.grade === "grade-1" ? "Lớp 1" : "Lớp 2"}
                    </span>
                  </div>
                </div>

                {/* B. Card Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-1">
                    {course.description}
                  </p>

                  {/* Stats Divider */}
                  <div className="flex items-center justify-between border-t-2 border-dashed border-slate-100 pt-4 mb-6">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <BookOpen size={16} className="text-blue-400" />
                      {course.lessons} bài
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <Users size={16} className="text-green-400" />
                      {course.students} bạn
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/courses/${course.id}/units/`}
                    className="block w-full py-3.5 rounded-2xl font-black text-white text-center shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all duration-150 group-hover:brightness-110"
                    style={{ backgroundColor: course.theme.color }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Bắt đầu học <ArrowRight size={20} strokeWidth={3} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 4. EMPTY STATE */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-4 border-dashed border-slate-200 mt-8">
            <p className="text-6xl mb-4 grayscale opacity-50">📭</p>
            <p className="text-slate-500 font-bold text-lg">
              Chưa có khóa học nào cho mục này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

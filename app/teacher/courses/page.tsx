"use client";

import Link from "next/link";
import {
  Edit,
  Plus,
  Trash2,
  BookOpen,
  Pencil,
  GraduationCap,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { courseService } from "@/services/course.service";
import CourseEditModal from "@/components/teacher/course/CourseEditModal";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    const title = prompt("Nhập tên khóa học mới:");
    if (!title || title.trim() === "") return;
    try {
      await courseService.createCourse(title);
      fetchCourses();
    } catch (e) {
      alert("Lỗi tạo khóa");
    }
  };

  const handleEditBtnClick = (e: React.MouseEvent, course: any) => {
    e.preventDefault();
    setEditingCourse(course);
  };

  const handleDeleteCourse = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await courseService.deleteCourse(id);
      fetchCourses();
    } catch (e) {
      alert("Lỗi xóa khóa");
    }
  };

  const getStats = (course: any) => {
    const units = course.units || [];
    const lessonCount = units.reduce((acc: number, unit: any) => {
      return acc + (unit.lessons?.length || 0);
    }, 0);
    return { unitCount: units.length, lessonCount };
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">
            Đang tải dữ liệu khóa học...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans w-full">
      <div className="w-full">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <LayoutGrid className="text-blue-600" size={32} />
              Quản Lý Khóa Học
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Xây dựng lộ trình và quản lý nội dung học tập
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 font-bold transition-colors"
          >
            <Plus size={20} strokeWidth={3} />
            Tạo Khóa Mới
          </motion.button>
        </motion.div>

        {/* CONTENT GRID */}
        {courses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {courses.map((course) => {
                const { unitCount, lessonCount } = getStats(course);

                return (
                  <motion.div
                    layout
                    variants={itemVariants}
                    key={course._id}
                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative"
                  >
                    {/* Image Area */}
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                          <span className="text-5xl drop-shadow-sm filter grayscale group-hover:grayscale-0 transition-all duration-500">
                            🎓
                          </span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleEditBtnClick(e, course)}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-slate-600 hover:text-blue-600"
                        title="Chỉnh sửa thông tin"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-snug">
                          {course.description ||
                            "Chưa có mô tả cho khóa học này."}
                        </p>
                      </div>

                      {/* Stats Badges */}
                      <div className="flex gap-2 mb-5 flex-wrap">
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <BookOpen size={12} /> {unitCount} Chương
                        </div>
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <GraduationCap size={12} /> {lessonCount} Bài
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                        <Link
                          href={`/teacher/courses/${course._id}/structure`}
                          className="flex-1"
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 text-xs shadow-md"
                          >
                            <Edit size={14} /> Quản lý nội dung
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDeleteCourse(e, course._id)}
                          className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 hover:border-red-200 transition"
                          title="Xóa khóa học"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-blue-300" size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">
              Hãy bắt đầu tạo lộ trình học tập đầu tiên cho học viên của bạn.
            </p>
            <button
              onClick={handleCreateCourse}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Tạo ngay
            </button>
          </motion.div>
        )}

        {/* Edit Modal */}
        {editingCourse && (
          <CourseEditModal
            isOpen={!!editingCourse}
            data={editingCourse}
            onClose={() => setEditingCourse(null)}
            onSave={() => {
              fetchCourses();
              setEditingCourse(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

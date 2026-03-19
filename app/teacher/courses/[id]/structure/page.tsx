"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Folder,
  FileText,
  Video,
  Edit,
  Pencil,
  Trash2,
  Settings,
  Gamepad2,
  Radio,
  FileQuestion,
  BookOpen,
} from "lucide-react";
import { courseService } from "@/services/course.service";
import ItemEditModal from "@/components/teacher/course/unit/ItemEditModal";

export default function CourseStructurePage() {
  const params = useParams();
  const id = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Modal Edit
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: "unit" | "lesson";
    data: any;
  } | null>(null);

  const fetchCourse = async () => {
    if (!id) return;
    try {
      const data = await courseService.getTree(id);
      setCourse(data);
    } catch (error) {
      console.error(error);
      alert("Không tìm thấy khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // --- HÀM MỞ MODAL SỬA ---
  const handleOpenSettings = (type: "unit" | "lesson", item: any) => {
    setEditModal({ isOpen: true, type, data: item });
  };

  // --- HELPER: CHỌN ICON THEO LOẠI BÀI HỌC ---
  const getLessonIcon = (type: string) => {
    switch (type) {
      case "LIVE_SESSION":
        return <Radio size={18} className="text-red-500 animate-pulse" />;
      case "EXAM":
        return <FileQuestion size={18} className="text-orange-500" />;
      case "VIDEO":
        return <Video size={18} className="text-blue-500" />;
      case "GAME":
      default:
        return <Gamepad2 size={18} className="text-purple-500" />;
    }
  };

  // --- ACTIONS ---
  const handleAddUnit = async () => {
    const title = prompt("Nhập tên Unit mới:");
    if (!title) return;
    try {
      await courseService.addUnit(id, { title });
      fetchCourse();
    } catch (error) {
      alert("Lỗi khi thêm Unit");
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Unit này?")) return;
    try {
      await courseService.deleteUnit(unitId);
      fetchCourse();
    } catch (error) {
      alert("Lỗi khi xóa Unit");
    }
  };

  const handleAddLesson = async (unitId: string) => {
    const title = prompt("Nhập tên bài học mới:");
    if (!title) return;
    try {
      await courseService.addLesson(unitId, { title });
      fetchCourse();
    } catch (error) {
      alert("Lỗi khi thêm Lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này không?")) return;
    try {
      await courseService.deleteLesson(lessonId);
      fetchCourse();
    } catch (error) {
      alert("Lỗi khi xóa bài học");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Đang tải cấu trúc...
      </div>
    );
  if (!course)
    return (
      <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu.</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      {/* HEADER PAGE */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
          <p className="text-gray-500">Xây dựng lộ trình học tập chi tiết</p>
        </div>
        <button
          onClick={handleAddUnit}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-900 transition shadow-lg shadow-slate-200"
        >
          <Plus size={18} /> Thêm Unit
        </button>
      </div>

      <div className="space-y-6">
        {course.units?.map((unit: any) => (
          <div
            key={unit._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* --- HEADER UNIT --- */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center group/header">
              <div className="flex items-center gap-3">
                <Folder className="text-blue-600" size={20} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-lg">
                      {unit.title}
                    </span>
                    <button
                      onClick={() => handleOpenSettings("unit", unit)}
                      className="text-gray-400 hover:text-blue-600 opacity-0 group-hover/header:opacity-100 transition"
                      title="Sửa tên Unit"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                  {unit.videoUrl && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mt-1">
                      <Video size={10} /> Intro Video
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenSettings("unit", unit)}
                  className={`text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition opacity-0 group-hover/header:opacity-100
                        ${
                          unit.videoUrl
                            ? "bg-white border border-red-200 text-red-500 hover:bg-red-50"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }
                    `}
                >
                  <Video size={14} /> {unit.videoUrl ? "Sửa Intro" : "+ Intro"}
                </button>

                <button
                  onClick={() => handleDeleteUnit(unit._id)}
                  className="text-xs font-bold p-1.5 rounded transition opacity-0 group-hover/header:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Xóa Unit"
                >
                  <Trash2 size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <button
                  onClick={() => handleAddLesson(unit._id)}
                  className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center gap-1"
                >
                  <Plus size={14} /> Thêm bài học
                </button>
              </div>
            </div>

            {/* --- DANH SÁCH LESSON --- */}
            <div className="divide-y divide-gray-100">
              {unit.lessons?.map((lesson: any) => (
                <div
                  key={lesson._id}
                  className="p-4 flex justify-between items-center hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-4">
                    {/* ICON TYPE */}
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                      {getLessonIcon(lesson.type)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 block">
                          {lesson.title}
                        </span>
                        <button
                          onClick={() => handleOpenSettings("lesson", lesson)}
                          className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>

                      {/* BADGES INFO */}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {/* 1. Loại bài */}
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border uppercase
                          ${
                            lesson.type === "LIVE_SESSION"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : lesson.type === "EXAM"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : lesson.type === "VIDEO"
                                  ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : "bg-purple-50 text-purple-600 border-purple-100" // Game
                          }`}
                        >
                          {lesson.type?.replace("_", " ") || "GAME"}
                        </span>

                        {/* 2. Video */}
                        {lesson.videoUrl && (
                          <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <Video size={10} /> Video
                          </span>
                        )}

                        {/* 3. Tài liệu */}
                        {lesson.materials && lesson.materials.length > 0 && (
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                            <FileText size={10} /> {lesson.materials.length} Tài
                            liệu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    {/* NÚT CẤU HÌNH (Mở Modal Edit) */}
                    <button
                      onClick={() => handleOpenSettings("lesson", lesson)}
                      className="text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-slate-200 hover:bg-white text-slate-600 bg-slate-50 transition"
                    >
                      <Settings size={14} /> Cấu hình
                    </button>

                    {(lesson.type === "GAME" ||
                      lesson.type === "EXAM" ||
                      !lesson.type) && (
                      <Link
                        href={`/teacher/courses/${course._id}/units/${unit._id}/lessons/${lesson._id}/builder`}
                        className="flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded border border-purple-100 hover:bg-purple-100 transition"
                      >
                        <Edit size={14} /> Soạn Game
                      </Link>
                    )}

                    <button
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className="p-1.5 rounded bg-white border border-transparent text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition"
                      title="Xóa bài học"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {unit.lessons?.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-400 italic bg-slate-50/50">
                  <div className="mb-2">📭</div>
                  Chưa có bài học nào trong Unit này.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL EDIT --- */}
      {editModal && (
        <ItemEditModal
          isOpen={editModal.isOpen}
          type={editModal.type}
          data={editModal.data}
          onClose={() => setEditModal(null)}
          onSave={() => {
            fetchCourse();
          }}
        />
      )}
    </div>
  );
}

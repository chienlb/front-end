"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  // Icons cơ bản
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
  // Icons loại bài học
  Video,
  PlayCircle,
  CheckSquare,
  BookOpen,
  Clock,
  // Icons tài liệu & bài tập
  FileText,
  Link as LinkIcon,
  Download,
  Gamepad2,
  FileQuestion,
  Mic,
  // Icons trạng thái & hành động
  MonitorPlay,
  Users,
  ClipboardCheck,
  BarChart2,
} from "lucide-react";

import { Lesson, Material, Exercise } from "./ts/types";
import UploadMaterialModal from "@/components/teacher/classes/TabClasswork/modals/UploadMaterialModal";

interface LessonItemProps {
  lesson: Lesson;
  classId: string;
  unitId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LessonItem({
  lesson,
  classId,
  unitId,
  onEdit,
  onDelete,
}: LessonItemProps) {
  const router = useRouter();

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false); // Đóng/Mở Accordion
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Local state
  const [localMaterials, setLocalMaterials] = useState<Material[]>(
    lesson.materials || [],
  );
  const [localExercises, setLocalExercises] = useState<Exercise[]>(
    lesson.exercises || [],
  );

  // --- LOGIC TRẠNG THÁI ---
  const isLiveNow = lesson.status === "LIVE";
  const isCompleted = lesson.status === "COMPLETED";
  const hasRecording = !!lesson.recordingUrl;

  // Cấu hình giao diện (Màu sắc, Icon) theo loại bài học
  const config = (() => {
    switch (lesson.type) {
      case "LIVE":
        return {
          icon: Video,
          color: isLiveNow
            ? "bg-red-500 animate-pulse shadow-red-200"
            : "bg-blue-500 shadow-blue-200",
          text: "Lớp Trực Tuyến",
          border: isLiveNow
            ? "border-l-4 border-red-500 bg-red-50/10"
            : "border-l-4 border-transparent hover:border-blue-200",
        };
      case "VIDEO":
        return {
          icon: PlayCircle,
          color: "bg-purple-500 shadow-purple-200",
          text: "Bài Giảng Video",
          border: "border-l-4 border-transparent hover:border-purple-200",
        };
      case "EXAM":
        return {
          icon: CheckSquare,
          color: "bg-orange-500 shadow-orange-200",
          text: "Bài Kiểm Tra",
          border: "border-l-4 border-transparent hover:border-orange-200",
        };
      default:
        return {
          icon: BookOpen,
          color: "bg-slate-500 shadow-slate-200",
          text: "Tài Liệu",
          border: "border-l-4 border-transparent hover:border-slate-200",
        };
    }
  })();

  const Icon = config.icon;

  // --- HANDLERS ---

  // 1. Xử lý Tài liệu
  const handleAddMaterial = (newMat: Material) => {
    setLocalMaterials([...localMaterials, newMat]);
    setIsUploadModalOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa tài liệu này?")) {
      setLocalMaterials(localMaterials.filter((m) => m.id !== id));
    }
  };

  // 2. Xử lý Bài học (Vào lớp / Xem lại)
  const handleJoinClass = () => {
    if (lesson.meetingLink) window.open(lesson.meetingLink, "_blank");
    else
      alert("Chưa có link phòng học! Vui lòng chỉnh sửa bài học để thêm link.");
  };

  const handleWatchRecording = () => {
    if (lesson.recordingUrl) window.open(lesson.recordingUrl, "_blank");
  };

  // 3. Điều hướng
  const goToAttendance = () =>
    router.push(
      `/teacher/classes/${classId}/units/${unitId}/lessons/${lesson.id}/attendance`,
    );

  // Đến trang soạn thảo bài tập (Builder)
  const goToBuilder = (exerciseId?: string) => {
    const url = exerciseId
      ? `/teacher/assignments/builder?classId=${classId}&lessonId=${lesson.id}&exerciseId=${exerciseId}`
      : `/teacher/assignments/builder?classId=${classId}&lessonId=${lesson.id}`; // Tạo mới
    router.push(url);
  };

  // Đến trang Chấm bài (Grading Interface)
  const goToGrading = (exerciseId: string) => {
    router.push(`/teacher/grading/${exerciseId}`);
  };

  // Đến trang Thống kê (cho bài trắc nghiệm)
  const goToStats = (exerciseId: string) => {
    // router.push(`/teacher/stats/${exerciseId}`);
    alert("Chức năng xem thống kê đang cập nhật...");
  };

  return (
    <>
      <div
        className={`group transition-all duration-200 ${config.border} border-b border-slate-100 last:border-b-0`}
      >
        {/* ========================================================================================
            HEADER BÀI HỌC (Luôn hiển thị) 
           ======================================================================================== */}
        <div
          className="p-5 flex items-center gap-5 cursor-pointer relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Icon Box */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg transition-transform group-hover:scale-105 ${config.color}`}
          >
            <Icon size={24} />
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-slate-100 text-slate-500">
                {config.text}
              </span>

              {/* Badges trạng thái */}
              {isLiveNow && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>{" "}
                  ĐANG DIỄN RA
                </span>
              )}
              {isCompleted && hasRecording && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  <MonitorPlay size={10} /> CÓ BẢN GHI
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
              {lesson.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
              {lesson.startTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {format(new Date(lesson.startTime), "HH:mm - dd/MM/yyyy")}
                </span>
              )}
              {lesson.duration && <span>• {lesson.duration}</span>}
              <span className="hidden sm:inline">
                • {localMaterials.length} tài liệu
              </span>
              <span className="hidden sm:inline">
                • {localExercises.length} bài tập
              </span>
            </div>
          </div>

          {/* Actions: Edit/Delete (Hiện khi hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Sửa"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`}
          />
        </div>

        {/* ========================================================================================
            NỘI DUNG CHI TIẾT (Accordion Body) 
           ======================================================================================== */}
        {isOpen && (
          <div className="px-5 pb-6 pt-0 ml-0 md:ml-[4.5rem] border-l-2 border-slate-100 animate-in slide-in-from-top-1 duration-200">
            {/* 1. BUTTONS ACTION GROUP (Các hành động chính của lớp học) */}
            <div className="flex flex-wrap gap-3 mb-8 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {lesson.type === "LIVE" && !isCompleted && (
                <button
                  onClick={handleJoinClass}
                  className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition transform active:scale-95"
                >
                  <Video size={18} /> Vào Lớp Ngay
                </button>
              )}

              {isCompleted && hasRecording && (
                <button
                  onClick={handleWatchRecording}
                  className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition transform active:scale-95"
                >
                  <PlayCircle size={18} /> Xem Lại Video
                </button>
              )}

              {lesson.type === "LIVE" && (
                <button
                  onClick={goToAttendance}
                  className="flex-1 min-w-[140px] bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  <Users size={18} /> Điểm Danh
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* --- CỘT TRÁI: TÀI LIỆU --- */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Tài liệu (
                    {localMaterials.length})
                  </h4>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Plus size={12} /> Thêm
                  </button>
                </div>

                {localMaterials.length > 0 ? (
                  <div className="space-y-2">
                    {localMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition group/file"
                      >
                        <a
                          href={mat.url}
                          target="_blank"
                          className="flex items-center gap-3 overflow-hidden flex-1"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${mat.type === "PDF" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {mat.type === "PDF" ? (
                              <FileText size={18} />
                            ) : (
                              <LinkIcon size={18} />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover/file:text-blue-700 transition">
                              {mat.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {mat.size || "Unknown size"}
                            </p>
                          </div>
                        </a>
                        <div className="flex gap-1">
                          <a
                            href={mat.url}
                            target="_blank"
                            className="p-2 text-slate-300 hover:text-blue-600 rounded-full transition"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-2 text-slate-300 hover:text-red-500 rounded-full transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    <p className="text-xs text-slate-400 italic">
                      Chưa có tài liệu đính kèm.
                    </p>
                  </div>
                )}
              </div>

              {/* --- CỘT PHẢI: BÀI TẬP (LOGIC THÔNG MINH) --- */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                    <CheckSquare size={14} className="text-orange-500" /> Bài
                    tập ({localExercises.length})
                  </h4>
                  <button
                    onClick={() => goToBuilder()}
                    className="text-[10px] bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Plus size={12} /> Soạn mới
                  </button>
                </div>

                {localExercises.length > 0 ? (
                  <div className="space-y-2">
                    {localExercises.map((ex) => {
                      // Logic phân loại Auto vs Manual
                      const isAutoGraded =
                        ex.type === "QUIZ" || ex.type === "GAME";
                      const ExIcon =
                        ex.type === "GAME"
                          ? Gamepad2
                          : ex.type === "SPEAKING"
                            ? Mic
                            : FileQuestion;
                      const iconBg =
                        ex.type === "GAME"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600";

                      return (
                        <div
                          key={ex.id}
                          className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-orange-300 hover:shadow-sm transition group/ex"
                        >
                          {/* Info */}
                          <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => goToBuilder(ex.id)}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                            >
                              <ExIcon size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm group-hover/ex:text-orange-600 transition">
                                {ex.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span>
                                  {ex.completedCount}/{ex.totalStudents} nộp bài
                                </span>
                                {isAutoGraded ? (
                                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    AUTO
                                  </span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    MANUAL
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {isAutoGraded ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToStats(ex.id);
                                }}
                                className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-100 transition"
                              >
                                <BarChart2 size={14} /> Thống kê
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToGrading(ex.id);
                                }}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition"
                              >
                                <ClipboardCheck size={14} /> Chấm bài
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToBuilder(ex.id);
                              }}
                              className="p-1.5 text-slate-300 hover:text-orange-500 transition"
                              title="Sửa nội dung"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    <p className="text-xs text-slate-400 italic">
                      Chưa có bài tập nào.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL UPLOAD TÀI LIỆU */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleAddMaterial}
      />
    </>
  );
}

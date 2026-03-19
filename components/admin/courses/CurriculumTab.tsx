"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";

// --- TYPES ---
type LessonType = "VIDEO" | "TEXT" | "QUIZ";
type LessonStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

interface Lesson {
  id: number | string;
  title: string;
  type: LessonType;
  duration: string;
  status: LessonStatus; 
  rejectReason?: string;
}

interface Chapter {
  id: number | string;
  title: string;
  lessons: Lesson[];
}

// --- MOCK DATA ---
const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu & Làm quen",
    lessons: [
      {
        id: 101,
        title: "1.1. Lộ trình học tập",
        type: "VIDEO",
        duration: "10:00",
        status: "APPROVED",
      },
      {
        id: 102,
        title: "1.2. Cài đặt môi trường",
        type: "TEXT",
        duration: "05:00",
        status: "APPROVED",
      },
      {
        id: 103,
        title: "1.3. Bài kiểm tra đầu vào",
        type: "QUIZ",
        duration: "30:00",
        status: "PENDING",
      }, // Đang chờ duyệt
    ],
  },
  {
    id: 2,
    title: "Chương 2: Kiến thức nền tảng",
    lessons: [
      {
        id: 201,
        title: "2.1. Khái niệm cơ bản",
        type: "VIDEO",
        duration: "15:00",
        status: "REJECTED",
        rejectReason: "Video bị mất tiếng ở phút thứ 3.",
      }, // Bị từ chối
      {
        id: 202,
        title: "2.2. Thực hành Hello World",
        type: "VIDEO",
        duration: "20:00",
        status: "DRAFT",
      },
    ],
  },
];

export default function CurriculumTab() {
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);

  // --- ACTIONS ---
  const handleApprove = (
    chapterId: number | string,
    lessonId: number | string,
  ) => {
    if (confirm("Xác nhận duyệt bài học này và công khai cho học viên?")) {
      updateLessonStatus(chapterId, lessonId, "APPROVED");
    }
  };

  const handleReject = (
    chapterId: number | string,
    lessonId: number | string,
  ) => {
    const reason = prompt("Nhập lý do từ chối bài học này:");
    if (reason) {
      updateLessonStatus(chapterId, lessonId, "REJECTED", reason);
    }
  };

  const updateLessonStatus = (
    cId: number | string,
    lId: number | string,
    status: LessonStatus,
    reason?: string,
  ) => {
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== cId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((l) =>
            l.id === lId ? { ...l, status, rejectReason: reason } : l,
          ),
        };
      }),
    );
  };

  // Helper: Render Badge trạng thái
  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
            <CheckCircle2 size={10} /> Đã duyệt
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200 animate-pulse">
            <Clock size={10} /> Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
            <XCircle size={10} /> Từ chối
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            <Edit2 size={10} /> Bản nháp
          </span>
        );
    }
  };

  const getIcon = (type: LessonType) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle size={18} />;
      case "QUIZ":
        return <HelpCircle size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-slate-800">
            Nội dung khóa học
          </h3>
          <p className="text-sm text-slate-500">
            Kiểm duyệt nội dung trước khi xuất bản.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          <Plus size={16} /> Thêm chương mới
        </button>
      </div>

      {/* Chapters List */}
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Chapter Header */}
            <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <GripVertical
                  size={20}
                  className="text-slate-400 cursor-move"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{chapter.title}</h4>
                  <p className="text-xs text-slate-500">
                    {chapter.lessons.length} bài học
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="divide-y divide-slate-50">
              {chapter.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`p-4 transition group ${lesson.status === "PENDING" ? "bg-yellow-50/50" : "hover:bg-slate-50/50"}`}
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex gap-4">
                      <div
                        className={`p-2 rounded-lg h-fit ${lesson.type === "VIDEO" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
                      >
                        {getIcon(lesson.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800">
                            {lesson.title}
                          </span>
                          {getStatusBadge(lesson.status)}
                        </div>
                        <div className="flex gap-3 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {lesson.duration}
                          </span>
                          <span className="bg-slate-100 px-1.5 rounded text-slate-500">
                            {lesson.type}
                          </span>
                        </div>

                        {/* Reason if Rejected */}
                        {lesson.status === "REJECTED" &&
                          lesson.rejectReason && (
                            <div className="mt-2 flex gap-2 items-start text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 max-w-md">
                              <AlertTriangle
                                size={14}
                                className="shrink-0 mt-0.5"
                              />
                              <span>
                                Lý do từ chối: <b>{lesson.rejectReason}</b>
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* ADMIN APPROVAL ACTIONS */}
                      {lesson.status === "PENDING" ? (
                        <div className="flex gap-2 mr-2">
                          <button
                            onClick={() => handleReject(chapter.id, lesson.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 shadow-sm"
                          >
                            <XCircle size={14} /> Từ chối
                          </button>
                          <button
                            onClick={() => handleApprove(chapter.id, lesson.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-md shadow-green-200"
                          >
                            <CheckCircle2 size={14} /> Duyệt bài
                          </button>
                        </div>
                      ) : (
                        // Normal Actions
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded"
                            title="Xem trước"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-3 text-xs text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition uppercase tracking-wide">
                <Plus size={14} /> Thêm bài học mới
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

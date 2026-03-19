"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Filter,
  Search,
  FileText,
  ArrowRight,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import GradingDashboard from "@/components/teacher/grading/GradingDashboard";

// --- TYPES ---
export type Status = "PENDING" | "GRADED" | "LATE";

export interface SubmissionContent {
  type: "ESSAY" | "VIDEO";
  fileUrl: string;
  text?: string;
  preview?: string;
}

export interface Submission {
  id: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  assignmentTitle: string;
  submittedAt: string;
  status: Status;
  score?: number;
  maxScore: number;
  content?: SubmissionContent;
  feedback?: string;
}

// --- MOCK DATA ---
const SUBMISSIONS: Submission[] = [
  {
    id: "S01",
    studentName: "Nguyễn Văn A",
    studentAvatar: "https://i.pravatar.cc/150?img=11",
    className: "IELTS Intensive K12",
    assignmentTitle: "Writing Task 2: Environment",
    submittedAt: "10:30 AM, Hôm nay",
    status: "PENDING",
    maxScore: 100,
    content: {
      type: "ESSAY",
      fileUrl: "writing_task2.pdf",
      text: "Em gửi thầy bài viết về môi trường ạ.",
      preview: "https://via.placeholder.com/600x800?text=PDF+Preview",
    },
  },
  {
    id: "S02",
    studentName: "Trần Thị B",
    studentAvatar: "https://i.pravatar.cc/150?img=5",
    className: "Giao tiếp cơ bản A1",
    assignmentTitle: "Record Video: Introduce yourself",
    submittedAt: "09:15 AM, Hôm qua",
    status: "PENDING",
    maxScore: 10,
    content: {
      type: "VIDEO",
      fileUrl: "intro.mp4",
      text: "Video giới thiệu bản thân.",
      preview: "https://via.placeholder.com/600x400?text=Video+Thumbnail",
    },
  },
  {
    id: "S03",
    studentName: "Lê Văn C",
    studentAvatar: "https://i.pravatar.cc/150?img=3",
    className: "IELTS Intensive K12",
    assignmentTitle: "Reading Practice Test 1",
    submittedAt: "2 ngày trước",
    status: "GRADED",
    score: 8.5,
    maxScore: 9.0,
    feedback: "Good job! Keep it up.",
    content: {
      type: "ESSAY",
      fileUrl: "reading_test.pdf",
      text: "Reading test submission.",
      preview: "https://via.placeholder.com/600x800?text=PDF+Preview",
    },
  },
  {
    id: "S04",
    studentName: "Phạm Minh D",
    studentAvatar: "https://i.pravatar.cc/150?img=8",
    className: "Giao tiếp cơ bản A1",
    assignmentTitle: "Homework Unit 3",
    submittedAt: "5 phút trước",
    status: "LATE",
    maxScore: 100,
    content: {
      type: "ESSAY",
      fileUrl: "hw_unit3.docx",
      text: "Submitted late due to internet issues.",
      preview: "https://via.placeholder.com/600x800?text=DOCX+Preview",
    },
  },
];

export default function GradingCenterPage() {
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("PENDING");
  const [selectedClass, setSelectedClass] = useState("ALL");

  // State for Modal
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null,
  );

  // Filter Logic
  const filteredList = SUBMISSIONS.filter((item) => {
    const matchStatus =
      filterStatus === "ALL" ? true : item.status === filterStatus;
    const matchClass =
      selectedClass === "ALL" ? true : item.className === selectedClass;
    return matchStatus && matchClass;
  });

  const pendingCount = SUBMISSIONS.filter((s) => s.status === "PENDING").length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER & STATS */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-2">
          Trung Tâm Chấm Điểm
        </h1>
        <p className="text-slate-500">
          Quản lý và chấm bài tập trung cho tất cả các lớp học.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase mb-1">
                Cần chấm ngay
              </p>
              <p className="text-3xl font-black text-slate-800">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <Clock size={24} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase mb-1">
                Đã chấm xong (Tuần này)
              </p>
              <p className="text-3xl font-black text-slate-800">24</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                Điểm trung bình
              </p>
              <p className="text-3xl font-black text-slate-800">8.2</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {["PENDING", "LATE", "GRADED", "ALL"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status === "PENDING"
                ? "Chưa chấm"
                : status === "LATE"
                  ? "Nộp muộn"
                  : status === "GRADED"
                    ? "Đã chấm"
                    : "Tất cả"}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="ALL">Tất cả lớp học</option>
              <option value="IELTS Intensive K12">IELTS Intensive K12</option>
              <option value="Giao tiếp cơ bản A1">Giao tiếp cơ bản A1</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>

          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
              placeholder="Tìm tên HS, bài tập..."
            />
          </div>
        </div>
      </div>

      {/* 3. SUBMISSION LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50/50 transition group"
            >
              {/* Student Info */}
              <div className="flex items-center gap-4 w-full md:w-1/4">
                <img
                  src={item.studentAvatar}
                  className="w-12 h-12 rounded-full border border-slate-200 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {item.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.className}
                  </p>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="flex-1 w-full">
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition">
                  {item.assignmentTitle}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Nộp lúc: {item.submittedAt}</span>
                  {item.status === "LATE" && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <AlertCircle size={10} /> Muộn
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between w-full md:w-auto gap-6">
                {item.status === "GRADED" ? (
                  <div className="text-right">
                    <span className="block text-2xl font-black text-blue-600">
                      {item.score}
                      <span className="text-sm text-slate-400 font-medium">
                        /{item.maxScore}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Đã chấm
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-slate-400">
                      Chưa có điểm
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Chờ chấm
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setCurrentSubmission(item)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
                    item.status === "GRADED"
                      ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                  }`}
                >
                  {item.status === "GRADED" ? "Xem lại" : "Chấm bài"}{" "}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredList.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="opacity-50" />
              </div>
              <p>Không tìm thấy bài tập nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- GRADING DASHBOARD MODAL --- */}
      <AnimatePresence>
        {currentSubmission && (
          <GradingDashboard
            submission={currentSubmission}
            onClose={() => setCurrentSubmission(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

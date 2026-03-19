"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Trophy,
  Search,
  FileQuestion,
  Calendar,
  BarChart3,
} from "lucide-react";

// --- TYPES ---
type AssignmentStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";

interface ClassAssignment {
  id: string;
  title: string;
  deadline: string;
  status: AssignmentStatus;
  score?: number;
  maxScore?: number;
  description?: string;
  duration?: string; // Thời gian làm bài (nếu có giới hạn)
}

// --- MOCK DATA ---
const MOCK_DATA: ClassAssignment[] = [
  {
    id: "A01",
    title: "Bài tập về nhà: Unit 5 - Vocabulary",
    description: "Hoàn thành bài trắc nghiệm từ vựng về chủ đề Animals.",
    deadline: "20:00 Hôm nay",
    status: "PENDING",
    duration: "15 phút",
  },
  {
    id: "A02",
    title: "Speaking Practice: My Holiday",
    description: "Quay video ngắn 2 phút kể về kỳ nghỉ của em.",
    deadline: "Hôm qua",
    status: "LATE",
  },
  {
    id: "A03",
    title: "Mid-term Test (Kiểm tra giữa kỳ)",
    deadline: "15/10/2023",
    status: "GRADED",
    score: 9.5,
    maxScore: 10,
    duration: "45 phút",
  },
  {
    id: "A04",
    title: "Reading Comprehension: The Little Prince",
    deadline: "18/10/2023",
    status: "SUBMITTED", // Đã nộp nhưng chưa chấm
  },
];

export default function StudentAssignmentsTab({
  classId,
}: {
  classId: string;
}) {
  const [activeTab, setActiveTab] = useState<"TODO" | "DONE">("TODO");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredList = MOCK_DATA.filter((item) => {
    // 1. Filter by Tab
    const isTodo = item.status === "PENDING" || item.status === "LATE";
    if (activeTab === "TODO" && !isTodo) return false;
    if (activeTab === "DONE" && isTodo) return false;

    // 2. Filter by Search
    if (!item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;

    return true;
  });

  // Helper: Status Badge Styling
  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={12} /> Sắp hết hạn
          </span>
        );
      case "LATE":
        return (
          <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle size={12} /> Quá hạn
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={12} /> Đợi chấm
          </span>
        );
      case "GRADED":
        return (
          <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Đã chấm
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. CONTROLS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {/* Tabs Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("TODO")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "TODO"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Cần làm (
            {
              MOCK_DATA.filter(
                (i) => i.status === "PENDING" || i.status === "LATE",
              ).length
            }
            )
          </button>
          <button
            onClick={() => setActiveTab("DONE")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "DONE"
                ? "bg-white text-green-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Đã xong (
            {
              MOCK_DATA.filter(
                (i) => i.status === "GRADED" || i.status === "SUBMITTED",
              ).length
            }
            )
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm font-medium outline-none transition-all placeholder:text-slate-400"
            placeholder="Tìm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2. ASSIGNMENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(item.status)}
                  {item.duration && (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock size={10} /> {item.duration}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                  <span
                    className={`flex items-center gap-1.5 ${item.status === "LATE" ? "text-red-500 font-bold" : ""}`}
                  >
                    <Calendar size={14} /> Hạn: {item.deadline}
                  </span>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Score Display (Only for Graded) */}
                {item.status === "GRADED" && (
                  <div className="text-right mr-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Điểm số
                    </span>
                    <span className="text-2xl font-black text-green-600 flex items-baseline gap-0.5">
                      {item.score}
                      <span className="text-sm text-green-400 font-bold">
                        /{item.maxScore}
                      </span>
                    </span>
                  </div>
                )}

                {/* Buttons */}
                {item.status === "PENDING" || item.status === "LATE" ? (
                  <Link
                    href={`/assignments/${item.id}/play`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition active:scale-95"
                  >
                    Làm bài ngay <ArrowUpRight size={16} />
                  </Link>
                ) : (
                  <Link
                    href={`/assignments/${item.id}/review`}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm transition"
                  >
                    <BarChart3 size={16} /> Xem kết quả
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              {activeTab === "TODO" ? (
                <CheckCircle2 size={40} className="text-green-500" />
              ) : (
                <FileQuestion size={40} className="text-slate-300" />
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              {activeTab === "TODO"
                ? "Tuyệt vời! Không có bài tập mới."
                : "Chưa có bài tập nào đã xong."}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs text-center">
              {activeTab === "TODO"
                ? "Bạn đã hoàn thành tất cả bài tập được giao. Hãy nghỉ ngơi nhé!"
                : "Các bài tập đã hoàn thành sẽ xuất hiện tại đây."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

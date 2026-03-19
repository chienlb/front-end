"use client";
import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  PenTool,
  Trophy,
  ArrowUpRight,
  Video,
  MonitorPlay,
  Zap,
} from "lucide-react";

// --- TYPES ---
type AssignmentStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
type AssignmentSource = "LIVE_CLASS" | "COURSE" | "SYSTEM";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  source: AssignmentSource;
  sourceName?: string;
  teacher?: string;
  deadline: string;
  status: AssignmentStatus;
  score?: number;
  duration?: string;
  priority?: "HIGH" | "NORMAL";
}

// --- MOCK DATA ---
const ASSIGNMENTS: Assignment[] = [
  {
    id: "A1",
    title: "Bài tập thì hiện tại đơn",
    subject: "Ngữ pháp",
    source: "LIVE_CLASS",
    sourceName: "Lớp Tiếng Anh 3A - Cô Lan",
    teacher: "Cô Lan Anh",
    deadline: "Hôm nay, 20:00",
    status: "PENDING",
    duration: "15 phút",
    priority: "HIGH",
  },
  {
    id: "A2",
    title: "Quiz: Video Lesson 5",
    subject: "Nghe hiểu",
    source: "COURSE",
    sourceName: "Khóa học: English for Kids (Level 1)",
    teacher: "Hệ thống",
    deadline: "Không giới hạn",
    status: "PENDING",
    duration: "10 phút",
    priority: "NORMAL",
  },
  {
    id: "A3",
    title: "Thử thách từ vựng mỗi ngày",
    subject: "Từ vựng",
    source: "SYSTEM",
    sourceName: "Daily Challenge",
    deadline: "Hôm qua",
    status: "LATE",
    duration: "5 phút",
    priority: "HIGH",
  },
  {
    id: "A4",
    title: "Kiểm tra giữa kỳ Unit 1-3",
    subject: "Tổng hợp",
    source: "LIVE_CLASS",
    sourceName: "Lớp Gia sư 1-1",
    teacher: "Thầy John",
    deadline: "10/11/2023",
    status: "GRADED",
    score: 9.5,
    duration: "45 phút",
  },
];

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<"TODO" | "DONE">("TODO");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | AssignmentSource>(
    "ALL",
  );

  const filteredList = ASSIGNMENTS.filter((item) => {
    // 1. Filter by Tab (Status)
    const isTodo = item.status === "PENDING" || item.status === "LATE";
    if (activeTab === "TODO" && !isTodo) return false;
    if (activeTab === "DONE" && isTodo) return false;

    // 2. Filter by Search Query
    if (!item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;

    // 3. Filter by Source
    if (sourceFilter !== "ALL" && item.source !== sourceFilter) return false;

    return true;
  });

  const getStatusBadge = (item: Assignment) => {
    switch (item.status) {
      case "PENDING":
        return item.priority === "HIGH" ? (
          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Sắp hết hạn
          </span>
        ) : (
          <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Còn hạn
          </span>
        );
      case "LATE":
        return (
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <AlertCircle size={12} /> Quá hạn
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Đã nộp
          </span>
        );
      case "GRADED":
        return (
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Đã chấm
          </span>
        );
    }
  };

  const getSourceIcon = (source: AssignmentSource) => {
    switch (source) {
      case "LIVE_CLASS":
        return <MonitorPlay size={14} className="text-red-500" />;
      case "COURSE":
        return <Video size={14} className="text-blue-500" />;
      case "SYSTEM":
        return <Zap size={14} className="text-yellow-500" />;
    }
  };

  const getSourceLabel = (source: AssignmentSource) => {
    switch (source) {
      case "LIVE_CLASS":
        return "Lớp Live";
      case "COURSE":
        return "Khóa học Video";
      case "SYSTEM":
        return "Nhiệm vụ ngày";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* 1. HEADER SUMMARY */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <BookOpen size={32} /> Bài tập về nhà
          </h1>
          <p className="text-blue-100 font-medium mb-6">
            Danh sách bài tập từ lớp học và nhiệm vụ hàng ngày.
          </p>

          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-400 text-white rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-3xl font-black">
                  {ASSIGNMENTS.filter((a) => a.status === "PENDING").length}
                </p>
                <p className="text-xs text-blue-100 uppercase font-bold">
                  Cần làm ngay
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-3xl font-black">
                  {ASSIGNMENTS.filter((a) => a.status === "GRADED").length}
                </p>
                <p className="text-xs text-blue-100 uppercase font-bold">
                  Đã hoàn thành
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        {/* Controls */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("TODO")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "TODO" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Cần làm
            </button>
            <button
              onClick={() => setActiveTab("DONE")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "DONE" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Đã xong
            </button>
          </div>

          {/* [NEW] Source Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSourceFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition ${sourceFilter === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSourceFilter("LIVE_CLASS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition flex items-center gap-1 ${sourceFilter === "LIVE_CLASS" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <MonitorPlay size={12} /> Lớp Live
            </button>
            <button
              onClick={() => setSourceFilter("SYSTEM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition flex items-center gap-1 ${sourceFilter === "SYSTEM" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <Zap size={12} /> Nhiệm vụ
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition"
              placeholder="Tìm tên bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ASSIGNMENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition group flex flex-col h-full"
              >
                {/* Header Card: Subject & Source */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {item.subject}
                    </span>
                    {/* Badge hiển thị nguồn gốc bài tập */}
                    <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      {getSourceIcon(item.source)} {getSourceLabel(item.source)}
                    </span>
                  </div>
                  {getStatusBadge(item)}
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition line-clamp-2">
                    {item.title}
                  </h3>
                  {/* Hiển thị tên lớp/khóa học nguồn */}
                  <p className="text-xs text-slate-400 font-medium mb-3 line-clamp-1">
                    Từ:{" "}
                    <span className="text-slate-600">{item.sourceName}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {item.teacher && (
                      <span className="flex items-center gap-1">
                        <PenTool size={12} /> {item.teacher}
                      </span>
                    )}
                    {item.teacher && <span>•</span>}
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {item.duration}
                    </span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold">Hạn nộp</p>
                    <p
                      className={`font-bold ${item.status === "LATE" ? "text-red-600" : "text-slate-700"}`}
                    >
                      {item.deadline}
                    </p>
                  </div>

                  {item.status === "PENDING" || item.status === "LATE" ? (
                    <Link
                      href={`/assignments/${item.id}/play`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-1"
                    >
                      Làm bài <ArrowUpRight size={14} />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      {item.score && (
                        <span className="text-xl font-black text-green-600 flex items-center gap-1">
                          {item.score}
                          <span className="text-xs text-green-400 font-bold">
                            đ
                          </span>
                        </span>
                      )}
                      <Link
                        href={`/assignments/${item.id}/review`}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Xem lại
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-blue-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                Không tìm thấy bài tập nào
              </h3>
              <p className="text-slate-500 text-sm">
                Bạn đã hoàn thành hết bài tập rồi. Tuyệt vời!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

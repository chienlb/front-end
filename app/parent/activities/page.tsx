"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  Gamepad2,
  Filter,
  Search,
  BookOpen,
  AlertCircle,
  Users,
  ChevronDown,
  Sparkles,
  Trophy,
} from "lucide-react";

// --- TYPES ---
type ActivityType = "LEARNING" | "EXERCISE" | "ACHIEVEMENT" | "GAME" | "SYSTEM";

interface ActivityLog {
  id: string;
  studentId: string;
  studentName: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  score?: number;
  duration?: string;
}

// --- MOCK DATA ---
const CHILDREN = [
  {
    id: "STU01",
    name: "Bé Nana",
    class: "Lớp 2",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "STU02",
    name: "Anh Bo",
    class: "Lớp 5",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const ACTIVITIES: ActivityLog[] = [
  {
    id: "LOG-01",
    studentId: "STU01",
    studentName: "Bé Nana",
    type: "LEARNING",
    title: "Đã học bài: Hello Friends",
    description: "Hoàn thành bài học từ vựng và xem video bài giảng.",
    timestamp: "2023-10-25T19:30:00",
    duration: "15 phút",
  },
  {
    id: "LOG-02",
    studentId: "STU01",
    studentName: "Bé Nana",
    type: "EXERCISE",
    title: "Nộp bài tập về nhà Unit 1",
    description: "Đã nộp bài đúng hạn. Đang chờ giáo viên chấm điểm.",
    timestamp: "2023-10-25T20:00:00",
  },
  {
    id: "LOG-03",
    studentId: "STU02",
    studentName: "Anh Bo",
    type: "ACHIEVEMENT",
    title: "Nhận huy hiệu 'Ong chăm chỉ'",
    description: "Duy trì chuỗi học tập liên tục 7 ngày.",
    timestamp: "2023-10-25T10:15:00",
  },
  {
    id: "LOG-04",
    studentId: "STU02",
    studentName: "Anh Bo",
    type: "EXERCISE",
    title: "Hoàn thành kiểm tra 15 phút",
    description: "Bài kiểm tra ngữ pháp thì hiện tại đơn.",
    timestamp: "2023-10-24T15:45:00",
    score: 9.5,
  },
  {
    id: "LOG-05",
    studentId: "STU01",
    studentName: "Bé Nana",
    type: "GAME",
    title: "Đổi quà tại Cửa hàng",
    description: "Dùng 500 coin để đổi Sticker bộ sưu tập.",
    timestamp: "2023-10-24T20:10:00",
  },
];

export default function ParentActivityLogPage() {
  const [selectedChild, setSelectedChild] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | ActivityType>("ALL");

  // Filter
  const filteredLogs = ACTIVITIES.filter((log) => {
    const matchChild =
      selectedChild === "ALL" || log.studentId === selectedChild;
    const matchType = filterType === "ALL" || log.type === filterType;
    return matchChild && matchType;
  });

  // Styles Config
  const getTypeStyles = (type: ActivityType) => {
    switch (type) {
      case "LEARNING":
        return {
          icon: BookOpen,
          color: "text-blue-600",
          bg: "bg-blue-100",
          border: "border-blue-200",
          label: "Học tập",
        };
      case "EXERCISE":
        return {
          icon: FileText,
          color: "text-orange-600",
          bg: "bg-orange-100",
          border: "border-orange-200",
          label: "Bài tập",
        };
      case "ACHIEVEMENT":
        return {
          icon: Trophy,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          border: "border-yellow-200",
          label: "Thành tích",
        };
      case "GAME":
        return {
          icon: Gamepad2,
          color: "text-purple-600",
          bg: "bg-purple-100",
          border: "border-purple-200",
          label: "Giải trí",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-slate-600",
          bg: "bg-slate-100",
          border: "border-slate-200",
          label: "Hệ thống",
        };
    }
  };

  // Group by Date
  const groupedLogs = filteredLogs.reduce(
    (groups, log) => {
      const date = new Date(log.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
      return groups;
    },
    {} as Record<string, ActivityLog[]>,
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* 1. PAGE TITLE */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="flex justify-between items-center mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <HistoryIcon className="text-indigo-600" /> Nhật Ký Hoạt Động
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Theo dõi sát sao hành trình học tập của con.
            </p>
          </div>

          <div className="hidden md:flex gap-4">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-400 uppercase">
                Hôm nay
              </span>
              <span className="text-lg font-black text-slate-800">
                {
                  ACTIVITIES.filter(
                    (a) =>
                      new Date(a.timestamp).toDateString() ===
                      new Date().toDateString(),
                  ).length
                }{" "}
                hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-6 py-8">
        {/* 2. CONTROL BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Child Tabs */}
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedChild("ALL")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                ${selectedChild === "ALL" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Users size={16} /> Tất cả
            </button>
            {CHILDREN.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                  ${selectedChild === child.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-5 h-5 rounded-full border border-white/30"
                />
                {child.name}
              </button>
            ))}
          </div>

          {/* Type Dropdown */}
          <div className="relative flex-1 md:max-w-xs group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-slate-400" />
            </div>
            <select
              className="appearance-none w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-sm transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Tất cả hoạt động</option>
              <option value="LEARNING">📚 Học tập</option>
              <option value="EXERCISE">📝 Bài tập</option>
              <option value="ACHIEVEMENT">🏆 Thành tích</option>
              <option value="GAME">🎮 Giải trí</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* 3. TIMELINE */}
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([dateKey, logs]) => {
            const dateObj = new Date(dateKey);
            const isToday =
              dateObj.toDateString() === new Date().toDateString();
            const dayStr = dateObj.toLocaleDateString("vi-VN", {
              weekday: "long",
            });
            const dateStr = dateObj.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <div key={dateKey} className="relative pl-4 md:pl-0">
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2
                    ${isToday ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-500"}`}
                  >
                    <Calendar size={14} />
                    {isToday ? "Hôm nay" : `${dayStr}, ${dateStr}`}
                  </div>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Vertical Line */}
                <div className="absolute left-8 md:left-[135px] top-12 bottom-0 w-0.5 bg-slate-200 -z-10 hidden md:block"></div>

                <div className="space-y-6">
                  {logs.map((log) => {
                    const styles = getTypeStyles(log.type);
                    const Icon = styles.icon;
                    const child = CHILDREN.find((c) => c.id === log.studentId);
                    const timeStr = new Date(log.timestamp).toLocaleTimeString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" },
                    );

                    return (
                      <div
                        key={log.id}
                        className="group relative flex flex-col md:flex-row gap-4 md:gap-8 items-start"
                      >
                        {/* Time & Avatar Column */}
                        <div className="flex items-center md:flex-col md:items-end gap-3 md:gap-1 md:w-[120px] shrink-0 pt-1">
                          <span className="text-sm font-black text-slate-700">
                            {timeStr}
                          </span>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-2 py-0.5 shadow-sm">
                            <img
                              src={child?.avatar}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-[10px] font-bold text-slate-500 max-w-[60px] truncate">
                              {child?.name}
                            </span>
                          </div>
                        </div>

                        {/* Timeline Node */}
                        <div className="absolute left-8 md:left-[135px] -translate-x-1/2 mt-1.5 hidden md:flex items-center justify-center">
                          <div
                            className={`w-3 h-3 rounded-full border-2 border-white ring-2 ring-slate-200 ${styles.bg}`}
                          ></div>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all duration-300 group-hover:-translate-y-0.5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-2 rounded-lg ${styles.bg} ${styles.color}`}
                              >
                                <Icon size={18} />
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles.bg} ${styles.color} ${styles.border}`}
                              >
                                {styles.label}
                              </span>
                            </div>

                            {/* Score Badge */}
                            {log.score !== undefined && (
                              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100">
                                <Sparkles
                                  size={12}
                                  className="fill-green-600"
                                />
                                <span className="text-xs font-bold">
                                  {log.score} điểm
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-slate-800 font-bold text-base mb-1 group-hover:text-blue-600 transition-colors">
                            {log.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed">
                            {log.description}
                          </p>

                          {/* Footer Meta */}
                          {log.duration && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400 font-medium">
                              <Clock size={12} /> Thời gian thực hiện:{" "}
                              <span className="text-slate-600">
                                {log.duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {Object.keys(groupedLogs).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">
                Không tìm thấy hoạt động nào
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Thử thay đổi bộ lọc hoặc chọn khoảng thời gian khác xem sao nhé.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon helper
function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Calendar,
  MoreVertical,
  Bell,
  CreditCard,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";

// --- 1. TYPES & INTERFACES ---
interface ChildSummary {
  id: string;
  name: string;
  avatar: string;
  level: string;
  weeklyProgress: number;
  streak: number;
  lastActivity: string;
  status: "ACTIVE" | "INACTIVE";
}

interface ActivityLog {
  id: string;
  childName: string;
  action: string;
  time: string;
  type: "LEARNING" | "ACHIEVEMENT" | "SYSTEM";
}

interface SkillStat {
  name: string;
  score: number;
  color: string;
  textColor: string;
}

interface WeeklyData {
  day: string;
  minutes: number;
  label: string;
}

// --- 2. MOCK DATA ---
const MY_CHILDREN: ChildSummary[] = [
  {
    id: "C01",
    name: "Bé Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=12",
    level: "Level 3 (A2)",
    weeklyProgress: 80,
    streak: 12,
    lastActivity: "Vừa xong",
    status: "ACTIVE",
  },
  {
    id: "C02",
    name: "Bé Trần Bảo Ngọc",
    avatar: "https://i.pravatar.cc/150?img=5",
    level: "Level 1 (Pre-A1)",
    weeklyProgress: 30,
    streak: 0,
    lastActivity: "2 ngày trước",
    status: "ACTIVE",
  },
];

const WEEKLY_STATS: WeeklyData[] = [
  { day: "T2", minutes: 20, label: "20p" },
  { day: "T3", minutes: 45, label: "45p" },
  { day: "T4", minutes: 30, label: "30p" },
  { day: "T5", minutes: 60, label: "1h" },
  { day: "T6", minutes: 15, label: "15p" },
  { day: "T7", minutes: 0, label: "" },
  { day: "CN", minutes: 10, label: "10p" },
];

const SKILLS_DATA: SkillStat[] = [
  {
    name: "Từ vựng (Vocabulary)",
    score: 85,
    color: "bg-green-500",
    textColor: "text-green-600",
  },
  {
    name: "Phát âm (Speaking)",
    score: 40,
    color: "bg-red-500",
    textColor: "text-red-600",
  },
  {
    name: "Nghe hiểu (Listening)",
    score: 65,
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  {
    name: "Ngữ pháp (Grammar)",
    score: 72,
    color: "bg-blue-500",
    textColor: "text-blue-600",
  },
];

const RECENT_ACTIVITIES: ActivityLog[] = [
  {
    id: "A1",
    childName: "Bé An",
    action: "Đạt điểm 10/10 bài kiểm tra Unit 3",
    time: "10:30 AM",
    type: "ACHIEVEMENT",
  },
  {
    id: "A2",
    childName: "Bé An",
    action: "Hoàn thành bài học: Từ vựng Gia đình",
    time: "09:15 AM",
    type: "LEARNING",
  },
  {
    id: "A3",
    childName: "Hệ thống",
    action: "Gói học của Bé Ngọc sắp hết hạn trong 3 ngày",
    time: "Hôm qua",
    type: "SYSTEM",
  },
  {
    id: "A4",
    childName: "Bé Ngọc",
    action: "Đã bỏ lỡ bài tập về nhà",
    time: "2 ngày trước",
    type: "LEARNING",
  },
];

// --- 3. MAIN COMPONENT ---
export default function ParentDashboardPage() {
  const [selectedChild, setSelectedChild] = useState(MY_CHILDREN[0]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Tổng Quan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chào Phụ huynh{" "}
            <span className="font-bold text-slate-700">Nguyễn Văn Ba</span> 👋
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {MY_CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedChild.id === child.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <img
                src={child.avatar}
                className="w-5 h-5 rounded-full border border-white/20"
              />
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* === LEFT COLUMN (MAIN CONTENT) === */}
        <div className="xl:col-span-2 space-y-6">
          {/* 1. Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-blue-300 transition group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={22} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Thời gian học
                </p>
                <p className="text-xl font-black text-slate-800">3.5 giờ</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-green-300 transition group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={22} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bài tập xong
                </p>
                <p className="text-xl font-black text-slate-800">24/30</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-orange-300 transition group">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cần chú ý
                </p>
                <p className="text-xl font-black text-slate-800">02</p>
              </div>
            </div>
          </div>

          {/* 2. Charts Section (Time & Skills) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart: Learning Time */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" size={20} /> Biểu đồ
                  tuần
                </h3>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">
                  Phút
                </span>
              </div>

              <div className="h-40 flex items-end justify-between gap-2">
                {WEEKLY_STATS.map((item, idx) => {
                  const height = Math.min((item.minutes / 60) * 100, 100);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center flex-1 group relative"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity mb-1 whitespace-nowrap z-10 pointer-events-none">
                        {item.label || "0p"}
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full max-w-[24px] rounded-t-md transition-all duration-700 ease-out ${item.minutes > 0 ? "bg-blue-500 group-hover:bg-blue-600" : "bg-slate-100 h-1"}`}
                        style={{ height: `${item.minutes > 0 ? height : 2}%` }}
                      ></div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart: Skills Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Brain className="text-purple-500" size={20} /> Năng lực
                </h3>
                <Link
                  href="#"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Chi tiết
                </Link>
              </div>

              <div className="space-y-5">
                {SKILLS_DATA.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600">{skill.name}</span>
                      <span className={skill.textColor}>{skill.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.color} transition-all duration-1000`}
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Detailed Child Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedChild.avatar}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800">
                      {selectedChild.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                        {selectedChild.level}
                      </span>
                      <span className="text-xs text-slate-400">
                        • Streak {selectedChild.streak} 🔥
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/parent/reports?childId=${selectedChild.id}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg transition flex items-center gap-1"
                >
                  Báo cáo đầy đủ <ChevronRight size={14} />
                </Link>
              </div>

              {/* Weekly Goals Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Tiến độ tuần này</span>
                  <span>{selectedChild.weeklyProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${selectedChild.weeklyProgress >= 80 ? "bg-green-500" : "bg-orange-500"}`}
                    style={{ width: `${selectedChild.weeklyProgress}%` }}
                  >
                    {/* Striped pattern effect */}
                    <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (SIDEBAR) === */}
        <div className="space-y-6">
          {/* 1. Subscription Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400 opacity-20 rounded-full blur-xl -ml-8 -mb-8"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 inline-flex items-center gap-1.5">
                  <Star
                    size={12}
                    fill="currentColor"
                    className="text-yellow-300"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Gói học
                  </span>
                </div>
                <CreditCard className="text-white/80" size={24} />
              </div>

              <h3 className="text-2xl font-black mb-1">VIP MEMBER</h3>
              <p className="text-indigo-200 text-xs mb-6 flex items-center gap-1">
                <Clock size={12} /> Hết hạn: 20/12/2026
              </p>

              <button className="w-full py-3 bg-white text-indigo-700 text-xs font-black rounded-xl hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2">
                <Zap size={14} fill="currentColor" /> GIA HẠN NGAY
              </button>
            </div>
          </div>

          {/* 2. Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" /> Hoạt động mới
              </h3>
            </div>

            <div className="p-2">
              {RECENT_ACTIVITIES.map((act) => (
                <div
                  key={act.id}
                  className="p-3 hover:bg-slate-50 rounded-xl transition flex gap-3 group cursor-default"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                      act.type === "ACHIEVEMENT"
                        ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                        : act.type === "SYSTEM"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                  ></div>
                  <div>
                    <div className="flex justify-between items-center w-full">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                        {act.childName} • {act.time}
                      </p>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed group-hover:text-slate-900">
                      {act.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-100">
              <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition">
                Xem tất cả lịch sử
              </button>
            </div>
          </div>

          {/* 3. Quick Support */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-center">
            <p className="text-xs font-bold text-blue-800 mb-2">Cần hỗ trợ?</p>
            <p className="text-[10px] text-blue-600 mb-3 leading-relaxed">
              Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc của phụ huynh.
            </p>
            <button className="px-4 py-2 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition w-full">
              Liên hệ ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

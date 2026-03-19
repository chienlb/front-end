"use client";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  Calendar,
  Filter,
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// --- TYPES ---
interface ScoreRecord {
  id: string;
  subject: string; // VD: Vocabulary, Grammar...
  title: string;
  score: number;
  maxScore: number;
  date: string;
  status: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  feedback?: string;
}

interface SkillProgress {
  skill: string;
  currentScore: number; // 0-100
  lastMonthScore: number;
}

// --- MOCK DATA ---
const CHILDREN = [
  {
    id: "C01",
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "C02",
    name: "Trần Bảo Ngọc",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const SKILLS_ANALYSIS: SkillProgress[] = [
  { skill: "Từ vựng (Vocabulary)", currentScore: 85, lastMonthScore: 78 },
  { skill: "Ngữ pháp (Grammar)", currentScore: 72, lastMonthScore: 75 },
  { skill: "Phát âm (Speaking)", currentScore: 60, lastMonthScore: 55 },
  { skill: "Nghe hiểu (Listening)", currentScore: 88, lastMonthScore: 80 },
];

const GRADE_HISTORY: ScoreRecord[] = [
  {
    id: "S1",
    subject: "Grammar",
    title: "Kiểm tra thì hiện tại đơn",
    score: 9.5,
    maxScore: 10,
    date: "15/11/2023",
    status: "EXCELLENT",
    feedback: "Làm bài rất tốt, nắm chắc kiến thức.",
  },
  {
    id: "S2",
    subject: "Speaking",
    title: "Topic: My Family",
    score: 6.0,
    maxScore: 10,
    date: "12/11/2023",
    status: "AVERAGE",
    feedback: "Cần chú ý phát âm ending sounds (s, es).",
  },
  {
    id: "S3",
    subject: "Vocabulary",
    title: "Unit 3: School things",
    score: 8.0,
    maxScore: 10,
    date: "10/11/2023",
    status: "GOOD",
  },
  {
    id: "S4",
    subject: "Listening",
    title: "Nghe đoạn hội thoại ngắn",
    score: 10,
    maxScore: 10,
    date: "08/11/2023",
    status: "EXCELLENT",
  },
  {
    id: "S5",
    subject: "Writing",
    title: "Viết đoạn văn ngắn về sở thích",
    score: 4.5,
    maxScore: 10,
    date: "01/11/2023",
    status: "POOR",
    feedback: "Lạc đề, sai nhiều lỗi chính tả.",
  },
];

export default function ParentReportsPage() {
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [filterSubject, setFilterSubject] = useState("ALL");

  const filteredHistory =
    filterSubject === "ALL"
      ? GRADE_HISTORY
      : GRADE_HISTORY.filter((h) => h.subject === filterSubject);

  // Helper: Get status color & label
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          label: "Xuất sắc",
          icon: CheckCircle,
        };
      case "GOOD":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          label: "Khá giỏi",
          icon: CheckCircle,
        };
      case "AVERAGE":
        return {
          color: "text-orange-600 bg-orange-50 border-orange-200",
          label: "Trung bình",
          icon: AlertCircle,
        };
      case "POOR":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          label: "Cần cố gắng",
          icon: XCircle,
        };
      default:
        return { color: "text-slate-600", label: "N/A", icon: AlertCircle };
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Báo Cáo Học Tập
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chi tiết điểm số và đánh giá năng lực.
          </p>
        </div>

        <div className="flex gap-3">
          {/* Child Selector */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {CHILDREN.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${selectedChild.id === child.id ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <img
                  src={child.avatar}
                  className="w-5 h-5 rounded-full border border-white/20"
                />
                {child.name}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition">
            <Download size={18} /> Xuất PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* === 2. SKILLS ANALYSIS (LEFT COL) === */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="text-purple-600" size={20} /> Phân tích kỹ
              năng
            </h3>

            <div className="space-y-6">
              {SKILLS_ANALYSIS.map((item, idx) => {
                const diff = item.currentScore - item.lastMonthScore;
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {item.skill}
                        </p>
                        <p className="text-2xl font-black text-slate-800">
                          {item.currentScore}/100
                        </p>
                      </div>
                      <div
                        className={`text-xs font-bold flex items-center gap-1 ${diff >= 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {diff >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {diff > 0 && "+"}
                        {diff}%
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.currentScore >= 80 ? "bg-green-500" : item.currentScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${item.currentScore}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Summary Card */}
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <h3 className="text-lg font-bold mb-1 relative z-10">
              Nhận xét tháng 11
            </h3>
            <p className="text-blue-100 text-sm mb-4 relative z-10 opacity-90 leading-relaxed">
              "Bé An có tiến bộ vượt bậc ở kỹ năng Nghe. Tuy nhiên cần luyện tập
              thêm phần Viết để tránh các lỗi ngữ pháp cơ bản."
            </p>
            <div className="flex items-center gap-3 relative z-10 border-t border-blue-500 pt-4 mt-2">
              <img
                src="https://ui-avatars.com/api/?name=Teacher+Lan&background=fff&color=2563eb"
                className="w-10 h-10 rounded-full border-2 border-blue-400"
              />
              <div>
                <p className="text-sm font-bold">Cô Lan Anh</p>
                <p className="text-xs text-blue-200">Giáo viên chủ nhiệm</p>
              </div>
            </div>
          </div>
        </div>

        {/* === 3. GRADE HISTORY (RIGHT COL - MAIN) === */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
            {/* Table Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> Lịch sử điểm số
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <select
                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="ALL">Tất cả môn</option>
                    <option value="Vocabulary">Từ vựng</option>
                    <option value="Grammar">Ngữ pháp</option>
                    <option value="Listening">Nghe hiểu</option>
                    <option value="Speaking">Nói</option>
                    <option value="Writing">Viết</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Bài kiểm tra</th>
                    <th className="p-4">Môn học</th>
                    <th className="p-4">Ngày nộp</th>
                    <th className="p-4 text-center">Điểm số</th>
                    <th className="p-4">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredHistory.map((row) => {
                    const status = getStatusInfo(row.status);
                    const StatusIcon = status.icon;
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition group"
                      >
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-800">
                            {row.title}
                          </p>
                          {row.feedback && (
                            <p className="text-xs text-slate-500 mt-1 italic flex items-start gap-1">
                              <span className="shrink-0 text-blue-500 font-bold">
                                GV:
                              </span>{" "}
                              "{row.feedback}"
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200">
                            {row.subject}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 flex items-center gap-2 h-full">
                          <Calendar size={14} /> {row.date}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-lg font-black ${row.score >= 8 ? "text-green-600" : row.score >= 5 ? "text-orange-600" : "text-red-600"}`}
                          >
                            {row.score}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            /{row.maxScore}
                          </span>
                        </td>
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                          >
                            <StatusIcon size={14} /> {status.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredHistory.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <p>Không tìm thấy dữ liệu điểm số nào.</p>
                </div>
              )}
            </div>

            {/* Footer Pagination */}
            <div className="p-4 border-t border-slate-100 flex justify-center">
              <button className="text-xs font-bold text-blue-600 hover:underline">
                Xem thêm lịch sử cũ hơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

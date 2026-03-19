"use client";
import { useState } from "react";
import {
  Search,
  Download,
  Filter,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";

// --- TYPES ---
interface Assignment {
  id: string;
  title: string;
  type: "QUIZ" | "ESSAY" | "EXAM";
  maxScore: number;
}

interface StudentGrade {
  id: string;
  name: string;
  code: string;
  avatar: string;
  scores: Record<string, number | null>;
}

// --- MOCK DATA ---
const ASSIGNMENTS: Assignment[] = [
  { id: "a1", title: "Quiz Unit 1", type: "QUIZ", maxScore: 10 },
  { id: "a2", title: "Bài viết luận", type: "ESSAY", maxScore: 10 },
  { id: "a3", title: "Kiểm tra giữa kỳ", type: "EXAM", maxScore: 100 },
  { id: "a4", title: "Quiz Unit 2", type: "QUIZ", maxScore: 10 },
];

const STUDENTS: StudentGrade[] = [
  {
    id: "s1",
    name: "Nguyễn Văn An",
    code: "HS001",
    avatar: "https://i.pravatar.cc/150?img=11",
    scores: { a1: 9, a2: 8.5, a3: 85, a4: 10 },
  },
  {
    id: "s2",
    name: "Trần Thị Bình",
    code: "HS002",
    avatar: "https://i.pravatar.cc/150?img=5",
    scores: { a1: 7, a2: null, a3: 65, a4: 8 }, // null = chưa nộp
  },
  {
    id: "s3",
    name: "Lê Văn Cường",
    code: "HS003",
    avatar: "https://i.pravatar.cc/150?img=3",
    scores: { a1: 5, a2: 6, a3: 45, a4: null },
  },
  {
    id: "s4",
    name: "Phạm Thu Hà",
    code: "HS004",
    avatar: "https://i.pravatar.cc/150?img=9",
    scores: { a1: 10, a2: 9.5, a3: 98, a4: 10 },
  },
  {
    id: "s5",
    name: "Hoàng Minh Đức",
    code: "HS005",
    avatar: "https://i.pravatar.cc/150?img=12",
    scores: { a1: null, a2: null, a3: null, a4: null }, // Học sinh mới/bỏ học
  },
];

export default function TabGrades() {
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC TÍNH TOÁN ---

  // 1. Tính điểm trung bình của 1 học sinh (Quy đổi về thang 10)
  const calculateStudentAvg = (scores: Record<string, number | null>) => {
    let total = 0;
    let count = 0;
    ASSIGNMENTS.forEach((asg) => {
      const score = scores[asg.id];
      if (score !== null && score !== undefined) {
        // Quy đổi về thang 10 nếu maxScore khác 10
        const normalizedScore = (score / asg.maxScore) * 10;
        total += normalizedScore;
        count++;
      }
    });
    return count === 0 ? 0 : total / count;
  };

  // 2. Thống kê tổng quan
  const classAvg =
    STUDENTS.reduce((acc, st) => acc + calculateStudentAvg(st.scores), 0) /
    STUDENTS.length;
  const submitRate = (() => {
    const totalSlots = STUDENTS.length * ASSIGNMENTS.length;
    const submitted = STUDENTS.reduce((acc, st) => {
      return acc + Object.values(st.scores).filter((s) => s !== null).length;
    }, 0);
    return Math.round((submitted / totalSlots) * 100);
  })();

  // Lọc danh sách
  const filteredStudents = STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Helper render màu điểm số
  const getScoreColor = (score: number | null, max: number) => {
    if (score === null) return "text-slate-300 bg-slate-50"; // Chưa nộp
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "text-green-700 bg-green-50 font-bold";
    if (percentage >= 50) return "text-slate-700";
    return "text-red-600 bg-red-50 font-bold";
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 space-y-8">
      {/* --- SECTION 1: ANALYTICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              Điểm TB Lớp
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {classAvg.toFixed(1)}/10
            </h3>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <ChevronDown className="rotate-180" size={14} /> +0.5 so với tháng
              trước
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              Tỷ lệ nộp bài
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {submitRate}%
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Trên tổng số bài tập
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              Cần lưu ý
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {STUDENTS.filter((s) => calculateStudentAvg(s.scores) < 5).length}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Học sinh có ĐTB dưới 5.0
            </p>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: GRADEBOOK TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none shadow-sm"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2">
              <Filter size={16} /> Lọc
            </button>
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2">
              <FileSpreadsheet size={18} /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Table Wrapper for Horizontal Scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            {/* Header */}
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="p-4 pl-6 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[250px]">
                  Học viên
                </th>
                {ASSIGNMENTS.map((asg) => (
                  <th key={asg.id} className="p-4 text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-700">{asg.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Max: {asg.maxScore}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center min-w-[100px] text-blue-600 bg-blue-50/30">
                  Điểm TB
                </th>
                <th className="p-4 text-center min-w-[100px]">Xếp loại</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st, idx) => {
                const avg = calculateStudentAvg(st.scores);
                return (
                  <tr
                    key={st.id}
                    className="hover:bg-blue-50/30 transition group"
                  >
                    {/* Cột Tên (Sticky) */}
                    <td className="p-4 pl-6 sticky left-0 bg-white group-hover:bg-[#f8faff] z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          className="w-9 h-9 rounded-full border border-slate-200"
                          alt={st.name}
                        />
                        <div>
                          <p className="font-bold text-slate-700">{st.name}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {st.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cột Điểm */}
                    {ASSIGNMENTS.map((asg) => {
                      const score = st.scores[asg.id];
                      return (
                        <td key={asg.id} className="p-2 text-center">
                          <div
                            className={`py-1.5 px-3 rounded-lg inline-block w-16 ${getScoreColor(score, asg.maxScore)}`}
                          >
                            {score !== null ? score : "-"}
                          </div>
                        </td>
                      );
                    })}

                    {/* Cột Trung Bình */}
                    <td className="p-4 text-center bg-blue-50/10 font-bold text-slate-800">
                      {avg.toFixed(1)}
                    </td>

                    {/* Cột Xếp Loại */}
                    <td className="p-4 text-center">
                      {avg >= 8 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-bold">
                          Giỏi
                        </span>
                      ) : avg >= 6.5 ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">
                          Khá
                        </span>
                      ) : avg >= 5 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md font-bold">
                          TB
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-bold">
                          Yếu
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium flex justify-between items-center">
          <span>Hiển thị {filteredStudents.length} học viên</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> &ge;
              8.0
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> &lt; 5.0
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Chưa
              nộp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

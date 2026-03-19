"use client";

import { useState, useMemo } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Award,
  MoreHorizontal,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Medal,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- MOCK DATA ---
const CLASSES = [
  { id: "C01", name: "Tiếng Anh K12 - A", schedule: "T2-T4-T6" },
  { id: "C02", name: "Luyện thi IELTS - B", schedule: "T3-T5-T7" },
  { id: "C03", name: "Giao tiếp nâng cao - C", schedule: "CN" },
];

const STUDENTS_DATA = [
  {
    id: 1,
    classId: "C01",
    name: "Nguyễn Văn An",
    progress: 92,
    avgScore: 9.5,
    status: "EXCELLENT",
    lastActive: "2 giờ trước",
  },
  {
    id: 2,
    classId: "C01",
    name: "Trần Thị Bích",
    progress: 45,
    avgScore: 6.0,
    status: "AVERAGE",
    lastActive: "1 ngày trước",
  },
  {
    id: 3,
    classId: "C01",
    name: "Lê Văn Cường",
    progress: 15,
    avgScore: 3.5,
    status: "RISK",
    lastActive: "5 ngày trước",
  },
  {
    id: 4,
    classId: "C02",
    name: "Phạm Minh Dũng",
    progress: 88,
    avgScore: 8.8,
    status: "GOOD",
    lastActive: "30 phút trước",
  },
  {
    id: 5,
    classId: "C02",
    name: "Hoàng Thùy Linh",
    progress: 10,
    avgScore: 2.0,
    status: "RISK",
    lastActive: "1 tuần trước",
  },
  {
    id: 6,
    classId: "C03",
    name: "Đỗ Hùng Dũng",
    progress: 60,
    avgScore: 7.0,
    status: "GOOD",
    lastActive: "Hôm qua",
  },
  {
    id: 7,
    classId: "C01",
    name: "Vũ Thị Mai",
    progress: 85,
    avgScore: 8.2,
    status: "GOOD",
    lastActive: "3 giờ trước",
  },
  {
    id: 8,
    classId: "C01",
    name: "Ngô Kiến Huy",
    progress: 70,
    avgScore: 7.5,
    status: "GOOD",
    lastActive: "Hôm qua",
  },
];

export default function TeacherAnalyticsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>(CLASSES[0].id);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lọc học sinh theo Lớp đang chọn
  const classStudents = useMemo(() => {
    return STUDENTS_DATA.filter((s) => s.classId === selectedClassId);
  }, [selectedClassId]);

  // 2. Tính toán chỉ số tổng quan & Biểu đồ
  const analyticsData = useMemo(() => {
    const total = classStudents.length;
    if (total === 0)
      return {
        total: 0,
        avgProgress: 0,
        avgScore: "0.0",
        riskCount: 0,
        chartData: [],
        topStudents: [],
      };

    const avgProgress = Math.round(
      classStudents.reduce((acc, s) => acc + s.progress, 0) / total,
    );
    const avgScore = (
      classStudents.reduce((acc, s) => acc + s.avgScore, 0) / total
    ).toFixed(1);
    const riskCount = classStudents.filter((s) => s.status === "RISK").length;

    // Phân phối điểm số (Chart Data)
    const distribution = [
      { name: "0-4 (Yếu)", count: 0, color: "#EF4444" },
      { name: "4-6 (TB)", count: 0, color: "#EAB308" },
      { name: "6-8 (Khá)", count: 0, color: "#3B82F6" },
      { name: "8-10 (Giỏi)", count: 0, color: "#22C55E" },
    ];

    classStudents.forEach((s) => {
      if (s.avgScore < 4) distribution[0].count++;
      else if (s.avgScore < 6) distribution[1].count++;
      else if (s.avgScore < 8) distribution[2].count++;
      else distribution[3].count++;
    });

    // Top 3 học sinh
    const topStudents = [...classStudents]
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    return {
      total,
      avgProgress,
      avgScore,
      riskCount,
      chartData: distribution,
      topStudents,
    };
  }, [classStudents]);

  // 3. Lọc danh sách hiển thị (Search + Filter Status)
  const displayedStudents = classStudents.filter((s) => {
    const matchStatus = filterStatus === "ALL" || s.status === filterStatus;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Helper UI
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return (
          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Award size={12} /> Xuất sắc
          </span>
        );
      case "GOOD":
        return (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
            Tốt
          </span>
        );
      case "RISK":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit animate-pulse">
            <AlertTriangle size={12} /> Cần chú ý
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
            Trung bình
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans text-slate-800 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Báo cáo Tiến độ
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Phân tích hiệu quả học tập theo thời gian thực.
          </p>
        </div>

        {/* CLASS SELECTOR */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 pr-2">
          <div className="bg-slate-100 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 uppercase">
            Lớp học
          </div>
          <select
            className="bg-transparent text-slate-800 font-bold text-sm py-1 outline-none cursor-pointer min-w-[180px]"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +2 mới
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">
            {analyticsData.total}
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Tổng học sinh
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">
            {analyticsData.avgProgress}%
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Tiến độ trung bình
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <BookOpen size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">
            {analyticsData.avgScore}
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Điểm trung bình
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-sm transition hover:shadow-md ${analyticsData.riskCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-2.5 rounded-xl ${analyticsData.riskCount > 0 ? "bg-white text-red-600" : "bg-slate-100 text-slate-400"}`}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3
            className={`text-2xl font-black mb-1 ${analyticsData.riskCount > 0 ? "text-red-600" : "text-slate-800"}`}
          >
            {analyticsData.riskCount}
          </h3>
          <p
            className={`text-xs font-bold uppercase ${analyticsData.riskCount > 0 ? "text-red-800" : "text-slate-400"}`}
          >
            Học sinh cần chú ý
          </p>
        </div>
      </div>

      {/* CHARTS & TOP STUDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart: Score Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" /> Phân phối điểm số
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.chartData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analyticsData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <Medal size={20} className="text-yellow-500" /> Top Học Sinh
          </h3>
          <div className="flex-1 space-y-4">
            {analyticsData.topStudents.map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm
                  ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-700"}`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">
                    {student.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Điểm TB: {student.avgScore}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-green-600 block">
                    {student.progress}%
                  </span>
                  <span className="text-[10px] text-slate-400">Tiến độ</span>
                </div>
              </div>
            ))}
            {analyticsData.topStudents.length === 0 && (
              <p className="text-slate-400 text-sm text-center italic">
                Chưa có dữ liệu.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "EXCELLENT", label: "Xuất sắc" },
              { id: "RISK", label: "Cần chú ý" },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setFilterStatus(status.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  filterStatus === status.id
                    ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 w-1/4">Học sinh</th>
                <th className="p-4 w-1/4">Tiến độ khóa học</th>
                <th className="p-4">Điểm TB</th>
                <th className="p-4">Hoạt động cuối</th>
                <th className="p-4">Đánh giá</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {displayedStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-blue-50/30 transition group"
                >
                  <td className="p-4 pl-6 font-bold text-slate-800">
                    {student.name}
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                      ID: ST{student.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600">
                        {student.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${student.progress < 30 ? "bg-red-500" : student.progress > 80 ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-700">
                    {student.avgScore}
                  </td>
                  <td className="p-4 text-slate-500 flex items-center gap-1">
                    <Clock size={12} className="text-slate-300" />{" "}
                    {student.lastActive}
                  </td>
                  <td className="p-4">{getStatusBadge(student.status)}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition shadow-sm">
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedStudents.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Không tìm thấy học sinh nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

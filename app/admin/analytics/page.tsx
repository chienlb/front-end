"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BrainCircuit,
  AlertCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7_DAYS");

  // Mock Data: Chỉ số tổng quan
  const stats = [
    {
      label: "Điểm trung bình",
      value: "8.5/10",
      change: "+0.5",
      isUp: true,
      icon: <BrainCircuit size={20} />,
      color: "bg-purple-500",
    },
    {
      label: "Tỉ lệ hoàn thành bài",
      value: "72%",
      change: "-3%",
      isUp: false,
      icon: <CheckCircleIcon />,
      color: "bg-blue-500",
    },
    {
      label: "Thời gian học TB",
      value: "18 phút",
      change: "+2m",
      isUp: true,
      icon: <Clock size={20} />,
      color: "bg-green-500",
    },
    {
      label: "User đang học (Realtime)",
      value: "142",
      change: "",
      isUp: true,
      icon: <Users size={20} />,
      color: "bg-orange-500",
    },
  ];

  // Mock Data: Các câu hỏi khó nhất (Tỉ lệ sai cao)
  const hardQuestions = [
    {
      id: 1,
      content: "Sắp xếp câu: 'Is / he / teacher / a?'",
      unit: "Unit 2",
      wrongRate: 85,
      avgTime: 45,
      type: "SCRAMBLE",
    },
    {
      id: 2,
      content: "Nghe và chọn: 'Umbrella'",
      unit: "Unit 5",
      wrongRate: 72,
      avgTime: 12,
      type: "LISTENING",
    },
    {
      id: 3,
      content: "Điền từ: 'She ___ my sister.'",
      unit: "Unit 3",
      wrongRate: 68,
      avgTime: 30,
      type: "GRAMMAR",
    },
    {
      id: 4,
      content: "Phát âm từ: 'Squirrel'",
      unit: "Unit 8",
      wrongRate: 65,
      avgTime: 25,
      type: "SPEAKING",
    },
  ];

  // Mock Data: Phân bổ kỹ năng
  const skills = [
    { name: "Từ vựng (Vocab)", score: 85, color: "bg-green-500" },
    { name: "Nghe (Listening)", score: 70, color: "bg-blue-500" },
    { name: "Đọc hiểu (Reading)", score: 65, color: "bg-yellow-500" },
    { name: "Nói (Speaking)", score: 45, color: "bg-red-500" }, // Kỹ năng yếu nhất
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER & FILTER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Phân tích Học tập 📈
          </h1>
          <p className="text-gray-500 text-sm">
            Theo dõi hiệu quả đào tạo và hành vi học viên.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm">
          <Calendar size={16} className="ml-2 text-gray-400" />
          <select
            className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none p-2 cursor-pointer"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7_DAYS">7 ngày qua</option>
            <option value="30_DAYS">30 ngày qua</option>
            <option value="THIS_MONTH">Tháng này</option>
          </select>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-2 rounded-lg text-white shadow-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
            {stat.change && (
              <div
                className={`text-xs font-bold flex items-center gap-1 ${
                  stat.isUp ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.isUp ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {stat.change} so với kỳ trước
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3. SKILL GAP ANALYSIS */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BrainCircuit size={18} className="text-purple-600" /> Năng lực
              theo Kỹ năng
            </h3>

            <div className="space-y-6">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {skill.name}
                    </span>
                    <span className="font-bold text-slate-800">
                      {skill.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${skill.color}`}
                      style={{ width: `${skill.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                <AlertCircle size={14} /> Cảnh báo: Kỹ năng NÓI yếu
              </h4>
              <p className="text-xs text-red-600 leading-relaxed">
                Học viên đang gặp khó khăn với bài Speaking. Đề xuất: Thêm video
                hướng dẫn khẩu hình miệng hoặc giảm độ khó bài phát âm.
              </p>
            </div>
          </div>

          {/* 4. HARDEST QUESTIONS */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" /> Top Câu hỏi
                gây "Mất điểm"
              </h3>
              <button className="text-xs text-blue-600 font-bold hover:underline">
                Xem tất cả
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">Nội dung câu hỏi</th>
                  <th className="p-3">Bài học</th>
                  <th className="p-3 text-center">Tỉ lệ sai</th>
                  <th className="p-3 text-center">TG làm bài</th>
                  <th className="p-3 rounded-r-lg text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hardQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition">
                    <td
                      className="p-3 font-medium text-slate-700 max-w-xs truncate"
                      title={q.content}
                    >
                      {q.content}
                      <div className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">
                        {q.type}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 text-xs">{q.unit}</td>
                    <td className="p-3 text-center">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        {q.wrongRate}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-500 text-xs">
                      {q.avgTime}s
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto">
                        Sửa <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. RETENTION CHART */}
        <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-2">
            Biểu đồ Giờ học cao điểm (Heatmap)
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Thời điểm học viên truy cập nhiều nhất trong ngày.
          </p>

          <div className="h-48 flex items-end justify-between gap-1">
            {[
              10, 20, 15, 40, 60, 85, 95, 80, 50, 30, 20, 10, 5, 20, 40, 70, 90,
              100, 80, 60, 40, 20, 10, 5,
            ].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-full bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all hover:bg-blue-600 relative"
                  style={{ height: `${h}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {i}h: {h} users
                  </div>
                </div>
                <span className="text-[9px] text-gray-400">{i}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

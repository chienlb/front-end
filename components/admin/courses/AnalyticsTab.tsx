"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Star,
  Clock,
  Calendar,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- MOCK DATA ---
const REVENUE_DATA = [
  { name: "T1", revenue: 12000000, students: 10 },
  { name: "T2", revenue: 18500000, students: 15 },
  { name: "T3", revenue: 15000000, students: 12 },
  { name: "T4", revenue: 22000000, students: 20 },
  { name: "T5", revenue: 28500000, students: 25 },
  { name: "T6", revenue: 24000000, students: 22 },
  { name: "T7", revenue: 32000000, students: 30 },
];

const COMPLETION_DATA = [
  { name: "Hoàn thành", value: 35, color: "#22c55e" }, // Green
  { name: "Đang học", value: 45, color: "#6366f1" }, // Indigo
  { name: "Chưa bắt đầu", value: 20, color: "#94a3b8" }, // Slate
];

const LESSON_VIEWS_DATA = [
  { name: "Bài 1.1", views: 120 },
  { name: "Bài 1.2", views: 98 },
  { name: "Bài 1.3", views: 86 },
  { name: "Bài 2.1", views: 75 },
  { name: "Bài 2.2", views: 50 },
];

export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState("30_DAYS");

  // Helper Format Tiền tệ
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. FILTER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-black text-xl text-slate-800">
          Tổng quan hiệu suất
        </h3>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {["7_DAYS", "30_DAYS", "90_DAYS"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timeRange === range
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {range === "7_DAYS"
                ? "7 ngày"
                : range === "30_DAYS"
                  ? "30 ngày"
                  : "3 tháng"}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Tổng doanh thu"
          value="120.5M"
          trend="+12%"
          isPositive={true}
          icon={DollarSign}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Học viên mới"
          value="34"
          trend="+5"
          isPositive={true}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Đánh giá TB"
          value="4.8"
          subValue="/ 5.0"
          trend="-0.1"
          isPositive={false}
          icon={Star}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Tỷ lệ hoàn thành"
          value="35%"
          trend="+2%"
          isPositive={true}
          icon={Clock}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* 3. CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-slate-800">Biểu đồ doanh thu</h4>
              <p className="text-xs text-slate-500">
                Thu nhập theo tháng (VND)
              </p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <Download size={18} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
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
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PROGRESS PIE CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 mb-2">Trạng thái học tập</h4>
          <p className="text-xs text-slate-500 mb-6">
            Tỉ lệ học viên hoàn thành khóa học
          </p>

          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={COMPLETION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COMPLETION_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="block text-2xl font-black text-slate-800">
                  120
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Học viên
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHARTS ROW 2 & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LESSON ENGAGEMENT (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-6">
            Lượt xem theo bài học
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LESSON_VIEWS_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9", radius: 8 }}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar
                  dataKey="views"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY LIST */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800">Hoạt động gần đây</h4>
            <button className="text-xs font-bold text-indigo-600 hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    <span className="font-bold text-slate-900">
                      Nguyễn Văn A
                    </span>{" "}
                    đã hoàn thành bài thi cuối khóa.
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">2 giờ trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENT: STAT CARD ---
const StatCard = ({
  label,
  value,
  subValue,
  trend,
  isPositive,
  icon: Icon,
  color,
}: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-black text-slate-800">{value}</span>
        {subValue && (
          <span className="text-sm font-medium text-slate-400 mb-1">
            {subValue}
          </span>
        )}
      </div>
      <div
        className={`flex items-center gap-1 mt-2 text-xs font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}
      >
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{trend}</span>
        <span className="text-slate-400 font-medium ml-1">
          so với tháng trước
        </span>
      </div>
    </div>
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={20} />
    </div>
  </div>
);

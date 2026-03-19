"use client";

import { useState } from "react";
import {
  Users,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Calendar,
  Download,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  FileText,
  Settings,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Mail,
  PieChart as PieChartIcon,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

// --- MOCK DATA ---
const REVENUE_DATA = [
  { name: "T2", revenue: 45000, newStudents: 24 },
  { name: "T3", revenue: 32000, newStudents: 18 },
  { name: "T4", revenue: 28000, newStudents: 15 },
  { name: "T5", revenue: 52000, newStudents: 42 },
  { name: "T6", revenue: 38000, newStudents: 28 },
  { name: "T7", revenue: 65000, newStudents: 55 },
  { name: "CN", revenue: 58000, newStudents: 48 },
];

const COURSE_DISTRIBUTION = [
  { name: "Tiếng Anh Giao Tiếp", value: 45, color: "#3B82F6" }, // Blue
  { name: "Luyện thi IELTS", value: 30, color: "#8B5CF6" }, // Purple
  { name: "Tiếng Anh Trẻ Em", value: 15, color: "#10B981" }, // Green
  { name: "TOEIC Cấp Tốc", value: 10, color: "#F59E0B" }, // Orange
];

const RECENT_TRANSACTIONS = [
  {
    id: 1,
    user: "Phạm Văn Minh",
    action: "đã thanh toán",
    detail: "Khóa IELTS 6.5+",
    time: "2 phút trước",
    amount: "+5.500.000đ",
    type: "income",
  },
  {
    id: 2,
    user: "Ms. Sarah Wilson",
    action: "yêu cầu rút tiền",
    detail: "Lương tháng 10",
    time: "15 phút trước",
    amount: "-12.000.000đ",
    type: "expense",
  },
  {
    id: 3,
    user: "Lê Thị Lan",
    action: "đăng ký mới",
    detail: "Tiếng Anh cho người đi làm",
    time: "1 giờ trước",
    amount: "+3.200.000đ",
    type: "income",
  },
];

const REGISTRATION_LIST = [
  {
    id: "#REG-001",
    student: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    course: "IELTS Intensive K12",
    date: "25/10/2023",
    paymentStatus: "Paid",
    amount: "7.500.000đ",
  },
  {
    id: "#REG-002",
    student: "Trần Thị B",
    email: "tranthib@gmail.com",
    course: "Giao tiếp cơ bản",
    date: "24/10/2023",
    paymentStatus: "Pending",
    amount: "2.800.000đ",
  },
  {
    id: "#REG-003",
    student: "Lê Văn C",
    email: "levanc@gmail.com",
    course: "Tiếng Anh trẻ em (Lớp 3)",
    date: "24/10/2023",
    paymentStatus: "Paid",
    amount: "3.500.000đ",
  },
  {
    id: "#REG-004",
    student: "Hoàng Minh D",
    email: "hoangminh@gmail.com",
    course: "TOEIC 450+",
    date: "23/10/2023",
    paymentStatus: "Failed",
    amount: "1.500.000đ",
  },
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("Tuần này");

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans text-slate-800 pb-20">
      {/* 1. HEADER HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Shield size={32} className="text-blue-600" /> English Center Admin
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Calendar size={16} />{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          {/* Global Search */}
          <div className="relative flex-1 sm:flex-none sm:w-80 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm học viên, giáo viên, hóa đơn..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="relative bg-white border border-slate-200 text-slate-600 p-3 rounded-xl hover:bg-slate-50 transition shadow-sm group">
              <Bell size={20} className="group-hover:animate-swing" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition flex items-center gap-2 active:scale-95">
              <Download size={18} /> Báo cáo tài chính
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. BUSINESS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Doanh thu tuần",
            value: "320.5M",
            change: "+12.5%",
            isUp: true,
            icon: CreditCard,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Học viên mới",
            value: "128",
            change: "+8.2%",
            isUp: true,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Giáo viên Active",
            value: "45",
            change: "+2",
            isUp: true,
            icon: Briefcase,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            label: "Lớp đang mở",
            value: "86",
            change: "-4",
            isUp: false,
            icon: GraduationCap,
            color: "text-orange-600",
            bg: "bg-orange-100",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
              >
                <stat.icon size={22} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${stat.isUp ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}
              >
                {stat.isUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. ANALYTICS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Main Chart: Revenue & Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" /> Biểu đồ tăng
                trưởng
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Tương quan doanh thu và lượng học viên mới.
              </p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              {["Tuần này", "Tháng này", "Quý này"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDateRange(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${dateRange === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REVENUE_DATA}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <CartesianGrid
                  vertical={false}
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh thu ($)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="newStudents"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                  name="Học viên mới"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Course Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col"
        >
          <h3 className="font-bold text-xl text-slate-800 mb-2 flex items-center gap-2">
            <PieChartIcon size={20} className="text-purple-500" /> Phân bổ doanh
            thu
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Tỷ trọng doanh thu theo loại khóa học.
          </p>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COURSE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COURSE_DISTRIBUTION.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">100%</span>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Tổng
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {COURSE_DISTRIBUTION.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 truncate w-24">
                    {cat.name}
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {cat.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 4. OPERATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap size={24} className="text-yellow-400 fill-yellow-400" />
            <h3 className="font-bold text-xl">Quản trị nhanh</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl text-left transition border border-white/10 group">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <p className="font-bold text-sm">Thêm Giáo viên</p>
              <p className="text-[10px] text-blue-100 opacity-80">
                Tạo tài khoản GV mới
              </p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl text-left transition border border-white/10 group">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <p className="font-bold text-sm">Duyệt khóa học</p>
              <p className="text-[10px] text-blue-100 opacity-80">
                Kiểm duyệt nội dung
              </p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl text-left transition border border-white/10 group">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <p className="font-bold text-sm">Gửi Thông báo</p>
              <p className="text-[10px] text-blue-100 opacity-80">
                Toàn hệ thống
              </p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl text-left transition border border-white/10 group">
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings size={20} />
              </div>
              <p className="font-bold text-sm">Cấu hình</p>
              <p className="text-[10px] text-blue-100 opacity-80">
                Hệ thống & AI
              </p>
            </button>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800">
              Giao dịch gần đây
            </h3>
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[250px] custom-scrollbar">
            {RECENT_TRANSACTIONS.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform ${item.type === "income" ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"}`}
                >
                  {item.type === "income" ? (
                    <ArrowDownRight size={20} />
                  ) : (
                    <ArrowUpRight size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-slate-800 font-medium truncate">
                      <span className="font-black">{item.user}</span>{" "}
                      {item.action}
                    </p>
                    <span
                      className={`text-[12px] font-black ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {item.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500 font-bold">
                      {item.detail}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={10} /> {item.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-dashed border-slate-200 hover:border-blue-200">
            Xem tất cả giao dịch
          </button>
        </motion.div>
      </div>

      {/* 5. DATA TABLE: REGISTRATIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-xl text-slate-800">
              Đăng ký mới nhất
            </h3>
            <p className="text-sm text-slate-400">
              Danh sách học viên chờ xếp lớp hoặc đã thanh toán.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              <Filter size={16} /> Bộ lọc
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">
              <Plus size={16} /> Tạo đăng ký
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 pl-6 font-bold w-24">Mã ĐK</th>
                <th className="py-4 font-bold">Học viên</th>
                <th className="py-4 font-bold">Khóa học đăng ký</th>
                <th className="py-4 font-bold">Ngày đăng ký</th>
                <th className="py-4 font-bold">Học phí</th>
                <th className="py-4 font-bold">Thanh toán</th>
                <th className="py-4 pr-6 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {REGISTRATION_LIST.map((reg, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-4 pl-6 font-mono text-slate-400 text-xs font-bold">
                    {reg.id}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">
                        {reg.student}
                      </span>
                      <span className="text-xs text-slate-400">
                        {reg.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-slate-700 font-medium">
                      {reg.course}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{reg.date}</td>
                  <td className="py-4 font-mono font-bold text-slate-700">
                    {reg.amount}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        reg.paymentStatus === "Paid"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : reg.paymentStatus === "Pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                            : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          reg.paymentStatus === "Paid"
                            ? "bg-green-500"
                            : reg.paymentStatus === "Pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      ></span>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-bold text-slate-500">
            Hiển thị 4 trong 150 đăng ký
          </p>
          <div className="flex gap-2">
            <button
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition text-slate-600">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";
import { useState } from "react";
import {
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowUpDown,
  MoreHorizontal,
  Users,
} from "lucide-react";

// --- TYPES ---
type StudentStatus = "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";

interface StudentStat {
  id: string;
  name: string;
  code: string;
  avatar: string;
  attendanceRate: number; // % Tham gia lớp Live
  avgScore: number; // Điểm trung bình
  totalHours: number;
  distribution: {
    live: number;
    video: number;
    exercise: number;
  };
  lastActive: string;
  status: StudentStatus;
}

// --- MOCK DATA ---
const DATA: StudentStat[] = [
  {
    id: "1",
    name: "Phạm Thu Hà",
    code: "HS001",
    avatar: "https://i.pravatar.cc/150?img=9",
    attendanceRate: 95,
    avgScore: 9.2,
    totalHours: 42.5,
    distribution: { live: 40, video: 30, exercise: 30 },
    lastActive: "Vừa xong",
    status: "EXCELLENT",
  },
  {
    id: "2",
    name: "Nguyễn Văn An",
    code: "HS002",
    avatar: "https://i.pravatar.cc/150?img=11",
    attendanceRate: 85,
    avgScore: 7.5,
    totalHours: 38.0,
    distribution: { live: 50, video: 20, exercise: 30 },
    lastActive: "2 giờ trước",
    status: "GOOD",
  },
  {
    id: "3",
    name: "Trần Thị Bình",
    code: "HS003",
    avatar: "https://i.pravatar.cc/150?img=5",
    attendanceRate: 60,
    avgScore: 6.5,
    totalHours: 25.5,
    distribution: { live: 30, video: 40, exercise: 30 },
    lastActive: "1 ngày trước",
    status: "WARNING",
  },
  {
    id: "4",
    name: "Lê Văn Cường",
    code: "HS004",
    avatar: "https://i.pravatar.cc/150?img=3",
    attendanceRate: 40,
    avgScore: 4.5,
    totalHours: 12.0,
    distribution: { live: 20, video: 10, exercise: 70 },
    lastActive: "3 ngày trước",
    status: "CRITICAL",
  },
  {
    id: "5",
    name: "Hoàng Minh Đức",
    code: "HS005",
    avatar: "https://i.pravatar.cc/150?img=12",
    attendanceRate: 10,
    avgScore: 0,
    totalHours: 4.5,
    distribution: { live: 10, video: 10, exercise: 80 },
    lastActive: "1 tuần trước",
    status: "CRITICAL",
  },
];

export default function TabAnalytics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentStat;
    direction: "asc" | "desc";
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | StudentStatus>(
    "ALL",
  );

  // --- LOGIC ---

  // 1. Filter
  let processedData = DATA.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "ALL" || s.status === filterStatus),
  );

  // 2. Sort
  if (sortConfig) {
    processedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: keyof StudentStat) => {
    let direction: "asc" | "desc" = "desc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Helper render status
  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case "EXCELLENT":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
            Xuất sắc
          </span>
        );
      case "GOOD":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            Tốt
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
            Cần cố gắng
          </span>
        );
      case "CRITICAL":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
            Cảnh báo
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in space-y-6">
      {/* --- HEADER CONTROL --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Thống kê hoạt động
          </h2>
          <p className="text-xs text-slate-500">
            Cập nhật lần cuối: 15:30 - 24/10/2023
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">
            <Calendar size={14} /> 30 ngày qua
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100">
            <Download size={14} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* --- OVERVIEW CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
              <TrendingUp size={10} /> +2
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">95%</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">
              Tỷ lệ chuyên cần
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">7.8/10</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">
              Điểm trung bình lớp
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">124h</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">
              Tổng giờ học tuần này
            </p>
          </div>
        </div>

        {/* Card 4 - Warning */}
        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white text-red-600 rounded-lg shadow-sm">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-red-700">02</h3>
            <p className="text-xs font-bold text-red-500 uppercase mt-1">
              Học sinh cần lưu ý
            </p>
          </div>
        </div>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Lọc theo:
            </span>
            {["ALL", "EXCELLENT", "WARNING", "CRITICAL"].map((status: any) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL"
                  ? "Tất cả"
                  : status === "CRITICAL"
                    ? "Cảnh báo"
                    : status === "WARNING"
                      ? "Cần cố gắng"
                      : "Xuất sắc"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th
                  className="p-4 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Học viên <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="p-4 text-center cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("attendanceRate")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Chuyên cần <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="p-4 text-center cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("avgScore")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Điểm TB <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="p-4 text-center cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("totalHours")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Thời gian học <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 w-1/4">Phân bổ hoạt động</th>
                <th className="p-4 text-right">Trạng thái</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedData.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition group">
                  {/* Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        className="w-9 h-9 rounded-full border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-700">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {st.code} • Online: {st.lastActive}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Attendance */}
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-sm font-bold ${st.attendanceRate >= 80 ? "text-green-600" : st.attendanceRate >= 50 ? "text-orange-500" : "text-red-500"}`}
                      >
                        {st.attendanceRate}%
                      </span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${st.attendanceRate >= 80 ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${st.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {st.avgScore.toFixed(1)}
                    </span>
                  </td>

                  {/* Total Hours */}
                  <td className="p-4 text-center font-medium text-slate-600">
                    {st.totalHours}h
                  </td>

                  {/* Distribution Bar */}
                  <td className="p-4">
                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="bg-blue-500"
                        style={{ width: `${st.distribution.live}%` }}
                        title="Live Class"
                      ></div>
                      <div
                        className="bg-purple-500"
                        style={{ width: `${st.distribution.video}%` }}
                        title="Video"
                      ></div>
                      <div
                        className="bg-orange-500"
                        style={{ width: `${st.distribution.exercise}%` }}
                        title="Bài tập"
                      ></div>
                    </div>
                    <div className="flex gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{" "}
                        Live
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>{" "}
                        Video
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{" "}
                        Bài tập
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-right">
                    {getStatusBadge(st.status)}
                  </td>

                  {/* Menu */}
                  <td className="p-4">
                    <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {processedData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-400 text-sm italic"
                  >
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

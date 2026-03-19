"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCog,
  History,
  School,
  MonitorPlay,
  X,
} from "lucide-react";

// --- TYPES ---
type ClassStatus = "UPCOMING" | "ONGOING" | "FINISHED" | "CANCELLED";

interface Teacher {
  id: string;
  name: string;
  avatar: string;
}

interface ClassSession {
  id: string;
  name: string; // VD: Tiếng Anh Giao Tiếp K12
  code: string; // Mã lớp
  teacher: Teacher;
  schedule: string; // VD: T2-T4-T6 (19:30)
  studentsCount: number;
  maxStudents: number;
  startDate: string;
  status: ClassStatus;
  type: "ONLINE" | "OFFLINE";
  issue?: string; // Cảnh báo nếu có (VD: Chưa có GV)
}

// --- MOCK DATA ---
const CLASSES: ClassSession[] = [
  {
    id: "CLS-001",
    name: "IELTS Intensive 6.5+",
    code: "IELTS-INT-01",
    teacher: {
      id: "T1",
      name: "Cô Lan Anh",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    schedule: "T3-T5-T7 (18:00 - 19:30)",
    studentsCount: 15,
    maxStudents: 20,
    startDate: "15/10/2023",
    status: "ONGOING",
    type: "ONLINE",
  },
  {
    id: "CLS-002",
    name: "Tiếng Anh Trẻ Em (Level 1)",
    code: "KIDS-L1-05",
    teacher: {
      id: "T2",
      name: "Thầy John Smith",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    schedule: "T7-CN (09:00 - 10:30)",
    studentsCount: 8,
    maxStudents: 10,
    startDate: "01/11/2023",
    status: "UPCOMING",
    type: "ONLINE",
  },
  {
    id: "CLS-003",
    name: "Giao Tiếp Phản Xạ Cơ Bản",
    code: "COMM-L1-02",
    teacher: { id: "T0", name: "Chưa phân công", avatar: "" }, // Lớp có vấn đề
    schedule: "T2-T4-T6 (20:00 - 21:30)",
    studentsCount: 12,
    maxStudents: 15,
    startDate: "20/11/2023",
    status: "UPCOMING",
    type: "ONLINE",
    issue: "Thiếu giảng viên đứng lớp",
  },
];

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | ClassStatus>("ALL");
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // ID lớp đang cần gán GV

  // Filter Logic
  const filteredClasses = CLASSES.filter(
    (c) => activeTab === "ALL" || c.status === activeTab,
  );

  const getStatusBadge = (status: ClassStatus) => {
    switch (status) {
      case "ONGOING":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />{" "}
            Đang diễn ra
          </span>
        );
      case "UPCOMING":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            Sắp khai giảng
          </span>
        );
      case "FINISHED":
        return (
          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
            Đã kết thúc
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
            Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Quản lý Lớp học
          </h1>
          <p className="text-slate-500 mt-1">
            Điều phối lịch học, phân công giảng viên và giám sát vận hành.
          </p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition">
          <Plus size={20} /> Mở lớp mới
        </button>
      </div>

      {/* 2. STATS & ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <School size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">45</p>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Tổng lớp học
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <MonitorPlay size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">12</p>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Lớp đang Active
            </p>
          </div>
        </div>
        {/* Cảnh báo vận hành */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-red-600 rounded-lg shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-red-600">1</p>
            <p className="text-xs text-red-800 font-bold uppercase">
              Lớp thiếu GV
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["ALL", "ONGOING", "UPCOMING", "FINISHED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "ALL"
                  ? "Tất cả"
                  : tab === "ONGOING"
                    ? "Đang chạy"
                    : tab === "UPCOMING"
                      ? "Sắp tới"
                      : "Đã xong"}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="Tìm tên lớp, mã lớp..."
            />
          </div>
        </div>

        {/* Table List */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Thông tin lớp</th>
              <th className="p-4">Giảng viên</th>
              <th className="p-4">Lịch học</th>
              <th className="p-4">Sĩ số</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClasses.map((cls) => (
              <tr
                key={cls.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer">
                      {cls.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {cls.code}
                    </p>
                    {cls.issue && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                        <AlertCircle size={10} /> {cls.issue}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {cls.teacher.avatar ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={cls.teacher.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {cls.teacher.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAssignModal(cls.id)}
                      className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 flex items-center gap-1 transition"
                    >
                      <UserCog size={14} /> Phân công ngay
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {cls.startDate}
                    </p>
                    <p className="flex items-center gap-1.5 font-bold">
                      <Clock size={14} className="text-slate-400" />{" "}
                      {cls.schedule}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(cls.studentsCount / cls.maxStudents) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {cls.studentsCount}/{cls.maxStudents}
                    </span>
                  </div>
                </td>
                <td className="p-4">{getStatusBadge(cls.status)}</td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. ASSIGN TEACHER MODAL (Nghiệp vụ Vận hành) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-slate-800">
                Phân công Giảng viên
              </h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                  Lưu ý: Việc thay đổi giảng viên giữa chừng sẽ gửi thông báo tự
                  động đến toàn bộ học viên trong lớp.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Chọn giảng viên thay thế
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                    placeholder="Tìm tên giáo viên..."
                  />
                </div>
              </div>

              {/* Mock Search Result */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {[
                  "Cô Minh Anh (IELTS)",
                  "Thầy David (Native)",
                  "Cô Lan Hương (Giao tiếp)",
                ].map((t, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert("Đã phân công!");
                  setShowAssignModal(null);
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Check,
  X,
  Clock,
  Search,
  Filter,
  ChevronRight,
  UserCheck,
  Calendar,
} from "lucide-react";

// Dữ liệu giả lập
const MOCK_STUDENTS = [
  { id: 1, name: "Nguyễn Văn An", code: "HS001", status: "PRESENT", note: "" },
  {
    id: 2,
    name: "Trần Thị Bình",
    code: "HS002",
    status: "ABSENT",
    note: "Báo ốm",
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    code: "HS003",
    status: "LATE",
    note: "Xe hỏng",
  },
  { id: 4, name: "Phạm Thu Hà", code: "HS004", status: "PRESENT", note: "" },
  { id: 5, name: "Hoàng Minh Đức", code: "HS005", status: "", note: "" },
  { id: 6, name: "Đỗ Ngọc Ánh", code: "HS006", status: "PRESENT", note: "" },
];

interface PageProps {
  params: Promise<{
    id: string; // Class ID
    unitId: string; // Unit ID
    lessonId: string; // Lesson ID
  }>;
}

export default function AttendancePage({ params }: PageProps) {
  const { id, unitId, lessonId } = use(params);
  const router = useRouter();

  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");

  // --- HANDLERS ---
  const updateStatus = (studentId: number, status: string) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, status } : s)),
    );
  };

  const updateNote = (studentId: number, note: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, note } : s)));
  };

  const handleMarkAllPresent = () => {
    if (confirm("Đánh dấu tất cả học sinh là CÓ MẶT?")) {
      setStudents(students.map((s) => ({ ...s, status: "PRESENT" })));
    }
  };

  // --- STATS ---
  const stats = {
    present: students.filter((s) => s.status === "PRESENT").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
    late: students.filter((s) => s.status === "LATE").length,
    total: students.length,
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-2 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-500 flex items-center gap-2">
          <span
            onClick={() => router.push(`/teacher/classes/${id}`)}
            className="hover:text-blue-600 cursor-pointer hover:underline"
          >
            Lớp Học
          </span>
          <ChevronRight size={14} />
          <span className="text-slate-400">Unit {unitId}</span>
          <ChevronRight size={14} />
          <span className="text-slate-800">Lesson {lessonId}</span>
        </div>

        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-blue-600" /> Điểm Danh
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-2">
                <Calendar size={12} /> Hôm nay:{" "}
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <button
              onClick={handleMarkAllPresent}
              className="hidden md:block px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
            >
              Tất cả có mặt
            </button>

            <button
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95"
              onClick={() => alert("Đã lưu dữ liệu điểm danh thành công!")}
            >
              <Save size={18} /> Lưu Lại
            </button>
          </div>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="max-w-5xl mx-auto w-full px-6 mt-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Sĩ số
            </span>
            <span className="text-2xl font-black text-slate-800">
              {stats.total}
            </span>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center">
            <span className="text-xs font-bold text-green-600 uppercase">
              Có mặt
            </span>
            <span className="text-2xl font-black text-green-700">
              {stats.present}
            </span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center">
            <span className="text-xs font-bold text-yellow-600 uppercase">
              Đi muộn
            </span>
            <span className="text-2xl font-black text-yellow-700">
              {stats.late}
            </span>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center">
            <span className="text-xs font-bold text-red-600 uppercase">
              Vắng
            </span>
            <span className="text-2xl font-black text-red-700">
              {stats.absent}
            </span>
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="max-w-5xl mx-auto w-full p-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                placeholder="Tìm tên hoặc mã học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2">
              <Filter size={16} /> Lọc: Tất cả
            </button>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6 w-[30%]">Học viên</th>
                  <th className="p-4 text-center w-[40%]">Trạng thái</th>
                  <th className="p-4 w-[30%]">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, index) => (
                  <tr
                    key={st.id}
                    className="hover:bg-blue-50/30 group transition duration-150"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-bold text-xs w-6">
                          {index + 1}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200 shadow-sm">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">
                            {st.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {st.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200 shadow-sm">
                        <button
                          onClick={() => updateStatus(st.id, "PRESENT")}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold ${st.status === "PRESENT" ? "bg-white text-green-600 shadow-sm scale-105 ring-1 ring-green-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                        >
                          <Check size={14} strokeWidth={3} />{" "}
                          <span className="hidden sm:inline">Có mặt</span>
                        </button>
                        <div className="w-px bg-slate-200 my-1 mx-1"></div>
                        <button
                          onClick={() => updateStatus(st.id, "LATE")}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold ${st.status === "LATE" ? "bg-white text-yellow-600 shadow-sm scale-105 ring-1 ring-yellow-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                        >
                          <Clock size={14} strokeWidth={3} />{" "}
                          <span className="hidden sm:inline">Muộn</span>
                        </button>
                        <div className="w-px bg-slate-200 my-1 mx-1"></div>
                        <button
                          onClick={() => updateStatus(st.id, "ABSENT")}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold ${st.status === "ABSENT" ? "bg-white text-red-600 shadow-sm scale-105 ring-1 ring-red-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                        >
                          <X size={14} strokeWidth={3} />{" "}
                          <span className="hidden sm:inline">Vắng</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-4 pr-6">
                      <input
                        className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-slate-700 placeholder:text-slate-300 transition text-sm py-1 font-medium px-2 rounded focus:bg-blue-50"
                        placeholder="Nhập lý do..."
                        value={st.note}
                        onChange={(e) => updateNote(st.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Mail,
  UserX,
  Eye,
} from "lucide-react";

// --- MOCK DATA ---
const INITIAL_STUDENTS = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    joined: "20/10/2023",
    progress: 85,
    lastActive: "2 giờ trước",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "btran@gmail.com",
    joined: "22/10/2023",
    progress: 40,
    lastActive: "1 ngày trước",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "cle@gmail.com",
    joined: "25/10/2023",
    progress: 10,
    lastActive: "5 phút trước",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "Phạm Minh D",
    email: "dpham@gmail.com",
    joined: "26/10/2023",
    progress: 100,
    lastActive: "Vừa truy cập",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 5,
    name: "Hoàng Yến",
    email: "yenh@gmail.com",
    joined: "27/10/2023",
    progress: 55,
    lastActive: "3 ngày trước",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 6,
    name: "Vũ Long",
    email: "longvu@gmail.com",
    joined: "28/10/2023",
    progress: 0,
    lastActive: "Chưa truy cập",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const ITEMS_PER_PAGE = 5;

export default function StudentsTab() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- LOGIC: FILTERING ---
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // --- HANDLERS ---
  const handleRemove = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa học viên này khỏi khóa học?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleExport = () => {
    alert("Đang xuất file Excel danh sách học viên...");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2">
      {/* 1. FILTERS & ACTIONS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            <Filter size={16} /> Lọc
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg transition"
          >
            <Download size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* 2. DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Học viên</th>
                <th className="p-4">Ngày tham gia</th>
                <th className="p-4">Tiến độ</th>
                <th className="p-4">Hoạt động cuối</th>
                <th className="p-4 text-right pr-6">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {student.joined}
                    </td>
                    <td className="p-4 w-48">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600">
                          {student.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            student.progress === 100
                              ? "bg-green-500"
                              : student.progress >= 50
                                ? "bg-indigo-500"
                                : "bg-orange-400"
                          }`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {student.lastActive}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                          title="Gửi email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleRemove(student.id)}
                          className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition"
                          title="Xóa khỏi lớp"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">
                        Không tìm thấy học viên nào phù hợp.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. PAGINATION FOOTER */}
        {paginatedStudents.length > 0 && (
          <div className="p-4 border-t border-slate-200 mt-auto flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Hiển thị {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)}{" "}
              trên tổng {filteredStudents.length} học viên
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

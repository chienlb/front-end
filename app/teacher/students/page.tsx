// app/teacher/students/page.tsx
"use client";
import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";

export default function TeacherStudentsPage() {
  const students = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      class: "Tiếng Anh K12",
      progress: 85,
      status: "Online",
    },
    {
      id: 2,
      name: "Trần Thị Bé",
      class: "Luyện thi IELTS",
      progress: 45,
      status: "Offline",
    },
    {
      id: 3,
      name: "Lê Hoàng C",
      class: "Tiếng Anh K12",
      progress: 92,
      status: "Online",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">
          Danh sách Học sinh
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:bg-white focus:border-blue-200 transition"
              placeholder="Tìm học sinh..."
            />
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="p-6">Học sinh</th>
            <th className="p-6">Lớp đang học</th>
            <th className="p-6">Tiến độ</th>
            <th className="p-6">Trạng thái</th>
            <th className="p-6 text-right">Liên hệ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((st) => (
            <tr key={st.id} className="hover:bg-blue-50/50 transition group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">
                      {st.name}
                    </p>
                    <p className="text-xs text-slate-400">ID: #{st.id}</p>
                  </div>
                </div>
              </td>
              <td className="p-6 text-sm font-medium text-slate-600">
                {st.class}
              </td>
              <td className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.progress > 80 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${st.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {st.progress}%
                  </span>
                </div>
              </td>
              <td className="p-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${st.status === "Online" ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${st.status === "Online" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
                  ></div>
                  {st.status}
                </span>
              </td>
              <td className="p-6 text-right">
                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                  <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={16} />
                  </button>
                  <button className="p-2 hover:bg-green-100 text-green-600 rounded-lg">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

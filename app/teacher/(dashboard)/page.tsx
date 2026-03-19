"use client";
import {
  Users,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  Bell,
  Calendar,
} from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      {/* 1. WELCOME SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">
            Chào buổi sáng, Cô Minh Anh! ☀️
          </h1>
          <p className="text-blue-100 max-w-2xl text-lg">
            Hôm nay cô có{" "}
            <span className="font-bold text-white">3 lớp học</span> và{" "}
            <span className="font-bold text-white">5 bài tập</span> cần chấm.
            Chúc cô một ngày giảng dạy tràn đầy năng lượng!
          </p>
          <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition flex items-center gap-2 shadow-lg">
            Xem lịch dạy hôm nay <ArrowRight size={16} />
          </button>
        </div>
        {/* Decor */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Users size={300} />
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Học sinh phụ trách",
            val: "128",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Giờ dạy tuần này",
            val: "24h",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Đánh giá trung bình",
            val: "4.9/5",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Tỷ lệ hoàn thành bài",
            val: "92%",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon size={24} />
              </div>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600">
                ...
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">
              {item.val}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* 3. TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-500" /> Lớp học sắp tới
            </h3>
            <button className="text-sm font-bold text-slate-400 hover:text-blue-600">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition group cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                  <span className="text-xs font-bold text-slate-400">
                    09:30
                  </span>
                  <span className="text-lg font-black text-slate-800">AM</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">
                    Tiếng Anh Giao Tiếp K12
                  </h4>
                  <p className="text-sm text-slate-500">
                    Phòng Live 01 • 25 Học viên
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transition shadow-lg shadow-blue-200">
                  Vào lớp
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-6">
            <Bell className="text-amber-500" /> Nhắc nhở
          </h3>
          <div className="space-y-4">
            {[
              {
                text: "Chấm bài tập về nhà lớp K12-A",
                time: "Hạn chót: 17:00",
                type: "urgent",
              },
              {
                text: "Họp chuyên môn tổ Tiếng Anh",
                time: "Ngày mai, 09:00",
                type: "normal",
              },
              {
                text: "Cập nhật đề cương Unit 5",
                time: "Hạn chót: Thứ 6",
                type: "normal",
              },
            ].map((note, idx) => (
              <div key={idx} className="flex gap-3">
                <div
                  className={`w-1 h-full rounded-full shrink-0 ${note.type === "urgent" ? "bg-red-500" : "bg-blue-300"}`}
                ></div>
                <div>
                  <p
                    className={`text-sm font-bold ${note.type === "urgent" ? "text-red-500" : "text-slate-700"}`}
                  >
                    {note.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{note.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

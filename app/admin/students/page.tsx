"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Crown,
  UserX,
  UserCheck,
  Eye,
  ShieldAlert,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { userService } from "@/services/user.service";

// --- TYPES ---
type UserStatus = "ACTIVE" | "BLOCKED" | "INACTIVE";
type PackageType = "FREE" | "BASIC" | "PREMIUM";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  package: PackageType;
  level: string; // VD: A1, B2
  joinedDate: string;
  status: UserStatus;
  streak: number; // Chuỗi ngày học
}

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res: any = await userService.getUsersByRole("student");
        const payload = res?.data ?? res;
        const list: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.users)
              ? payload.users
              : [];

        const mapped: Student[] = list.map((u) => {
          const rawPkg = String(u?.package || u?.packageType || "FREE").toUpperCase();
          const pkg: PackageType =
            rawPkg === "PREMIUM" ? "PREMIUM" : rawPkg === "BASIC" ? "BASIC" : "FREE";
          const active = Boolean(u?.isActive ?? true);
          return {
            id: String(u?._id || u?.id || ""),
            name: String(u?.fullName || u?.name || "Học viên"),
            email: String(u?.email || ""),
            avatar:
              u?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                String(u?.fullName || u?.name || "Student"),
              )}`,
            phone: u?.phone || "",
            package: pkg,
            level: String(u?.level || u?.currentLevel || "N/A"),
            joinedDate: u?.createdAt
              ? new Date(u.createdAt).toLocaleDateString("vi-VN")
              : "—",
            status: active ? "ACTIVE" : "BLOCKED",
            streak: Number(u?.streak || 0),
          };
        });
        setStudents(mapped);
      } catch (error) {
        console.error("Lỗi lấy danh sách học viên:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Logic lọc dữ liệu
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.includes(searchTerm);
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getPackageBadge = (pkg: PackageType) => {
    switch (pkg) {
      case "PREMIUM":
        return (
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-200">
            <Crown size={12} /> PREMIUM
          </span>
        );
      case "BASIC":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
            BASIC
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
            FREE
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    return status === "ACTIVE" ? (
      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <UserCheck size={12} /> Hoạt động
      </span>
    ) : (
      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <UserX size={12} /> Đã khóa
      </span>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Danh sách Học viên
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý hồ sơ, gói cước và tiến độ học tập.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition">
            <ShieldAlert size={18} /> Báo cáo xấu
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition">
            <GraduationCap size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["ALL", "ACTIVE", "BLOCKED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${statusFilter === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {s === "ALL"
                  ? "Tất cả"
                  : s === "ACTIVE"
                    ? "Hoạt động"
                    : "Đã khóa"}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder="Tìm tên, email học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            Đang tải danh sách học viên...
          </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Học viên</th>
              <th className="p-4">Gói cước</th>
              <th className="p-4">Trình độ / Streak</th>
              <th className="p-4">Ngày tham gia</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((stu) => (
              <tr
                key={stu.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={stu.avatar}
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {stu.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {stu.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">{getPackageBadge(stu.package)}</td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      {stu.level}
                    </p>
                    <p className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit font-bold">
                      🔥 {stu.streak} ngày streak
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{stu.joinedDate}</td>
                <td className="p-4">{getStatusBadge(stu.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Khóa tài khoản"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {filteredStudents.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-sm">
            Không tìm thấy học viên nào.
          </div>
        )}
      </div>
    </div>
  );
}

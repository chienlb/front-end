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
  Plus,
  X,
  EyeOff,
  UserPlus,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";

// --- TYPES ---
type UserStatus = "ACTIVE" | "BLOCKED" | "INACTIVE";
type PackageType = "FREE" | "BASIC" | "PREMIUM";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  username?: string;
  role?: string;
  typeAccount?: string;
  isVerified?: boolean;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  package: PackageType;
  joinedDate: string;
  status: UserStatus;
  streak: number; // Chuỗi ngày học
}

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  const passwordStrength = (pw: string) => {
    const s = String(pw || "");
    let score = 0;
    if (s.length >= 6) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^a-zA-Z0-9]/.test(s)) score++;
    return score; // 0..4
  };
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    avatar: "",
  });

  const getStudentPhone = (u: any) => {
    const fromObjectPhone =
      typeof u?.phone === "object"
        ? u?.phone?.number || u?.phone?.value || u?.phone?.phoneNumber
        : undefined;

    return String(
      u?.phone ||
        fromObjectPhone ||
        u?.phoneNumber ||
        u?.phone_number ||
        u?.mobile ||
        u?.mobileNumber ||
        u?.tel ||
        u?.contactPhone ||
        u?.contact?.phone ||
        u?.profile?.phone ||
        "",
    ).trim();
  };

  const getStudentUsername = (u: any) => {
    return String(u?.username || u?.userName || u?.account?.username || "").trim();
  };

  const getGenderVi = (value?: string) => {
    const g = String(value || "").trim().toLowerCase();
    if (["male", "m", "nam"].includes(g)) return "Nam";
    if (["female", "f", "nu", "nữ"].includes(g)) return "Nữ";
    if (["other", "khac", "khác"].includes(g)) return "Khác";
    return "—";
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN");
  };

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
          const firstName = String(u?.firstName || "").trim();
          const lastName = String(u?.lastName || "").trim();
          const mergedName = `${firstName} ${lastName}`.trim();
          const resolvedName = String(
            u?.fullName ||
              u?.fullname ||
              u?.name ||
              u?.displayName ||
              mergedName ||
              u?.username ||
              u?.email ||
              `ID: ${String(u?._id || u?.id || "")}`,
          );
          return {
            id: String(u?._id || u?.id || ""),
            name: resolvedName,
            email: String(u?.email || ""),
            avatar:
              u?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  resolvedName,
              )}`,
            phone: getStudentPhone(u),
            username: getStudentUsername(u),
            role: String(u?.role || "student"),
            typeAccount: String(u?.typeAccount || u?.authProvider || ""),
            isVerified: Boolean(u?.isVerified ?? u?.verified ?? false),
            gender: String(u?.gender || ""),
            dateOfBirth: String(u?.dateOfBirth || u?.dob || ""),
            address: String(u?.address || u?.location || u?.profile?.address || ""),
            createdAt: String(u?.createdAt || ""),
            updatedAt: String(u?.updatedAt || ""),
            lastLoginAt: String(u?.lastLoginAt || u?.lastLogin || u?.lastSeenAt || ""),
            package: pkg,
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
        const firstName = String(u?.firstName || "").trim();
        const lastName = String(u?.lastName || "").trim();
        const mergedName = `${firstName} ${lastName}`.trim();
        const resolvedName = String(
          u?.fullName ||
            u?.fullname ||
            u?.name ||
            u?.displayName ||
            mergedName ||
            u?.username ||
            u?.email ||
            `ID: ${String(u?._id || u?.id || "")}`,
        );
        return {
          id: String(u?._id || u?.id || ""),
          name: resolvedName,
          email: String(u?.email || ""),
          avatar:
            u?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                resolvedName,
            )}`,
          phone: getStudentPhone(u),
          username: getStudentUsername(u),
          role: String(u?.role || "student"),
          typeAccount: String(u?.typeAccount || u?.authProvider || ""),
          isVerified: Boolean(u?.isVerified ?? u?.verified ?? false),
          gender: String(u?.gender || ""),
          dateOfBirth: String(u?.dateOfBirth || u?.dob || ""),
          address: String(u?.address || u?.location || u?.profile?.address || ""),
          createdAt: String(u?.createdAt || ""),
          updatedAt: String(u?.updatedAt || ""),
          lastLoginAt: String(u?.lastLoginAt || u?.lastLogin || u?.lastSeenAt || ""),
          package: pkg,
          joinedDate: u?.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—",
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

  const openCreateModal = () => {
    setFormData({ fullName: "", email: "", phone: "", password: "", avatar: "" });
    setCreateError("");
    setShowPassword(false);
    setOpenCreate(true);
  };

  const handleCreateStudent = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setCreateError("Vui lòng nhập Họ tên, Email và Mật khẩu.");
      return;
    }
    try {
      setSubmitting(true);
      setCreateError("");
      const username = String(formData.email || "")
        .split("@")[0]
        ?.replace(/[^a-zA-Z0-9_.-]/g, "")
        .slice(0, 24);
      await authService.register({
        fullname: formData.fullName,
        username: username || `student_${Date.now()}`,
        email: formData.email,
        password: formData.password,
        role: "student",
        typeAccount: "email",
        phone: formData.phone || undefined,
      });
      setOpenCreate(false);
      await fetchStudents();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setCreateError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tạo học viên.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportStudents = async () => {
    try {
      setExporting(true);
      const blob = await adminService.exportToExcel({
        type: "users",
        role: "student",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-students-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Xuất Excel học viên thất bại:", error);
      alert("Xuất Excel học viên thất bại.");
    } finally {
      setExporting(false);
    }
  };

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
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
          >
            <Plus size={18} /> Thêm học viên
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition">
            <ShieldAlert size={18} /> Báo cáo xấu
          </button>
          <button
            onClick={handleExportStudents}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition disabled:opacity-60"
          >
            <GraduationCap size={18} /> {exporting ? "Đang xuất..." : "Xuất Excel"}
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
              <th className="p-4">Streak</th>
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
                  <p className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit font-bold">
                    🔥 {stu.streak} ngày streak
                  </p>
                </td>
                <td className="p-4 text-sm text-slate-600">{stu.joinedDate}</td>
                <td className="p-4">{getStatusBadge(stu.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setSelectedStudent(stu)}
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

      {openCreate && (
        <div className="fixed inset-0 z-[130] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(680px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_55%,#F5F3FF_100%)] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-lg shadow-blue-200">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Thêm học viên</h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      Tạo tài khoản học viên bằng email
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4">
                {createError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {createError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs font-bold text-slate-600">
                    Họ và tên *
                    <input
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, fullName: e.target.value }))
                      }
                      placeholder="VD: Nguyễn Văn A"
                      className="mt-1 w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Email *
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                      className="mt-1 w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Số điện thoại
                    <input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="09xxx..."
                      className="mt-1 w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Mật khẩu *
                    <div className="mt-1 relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <KeyRound size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, password: e.target.value }))
                        }
                        placeholder="Nhập mật khẩu"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        title={showPassword ? "Ẩn" : "Hiện"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength(formData.password) <= 1
                              ? "bg-red-400"
                              : passwordStrength(formData.password) === 2
                                ? "bg-amber-400"
                                : passwordStrength(formData.password) === 3
                                  ? "bg-blue-400"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${(passwordStrength(formData.password) / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {passwordStrength(formData.password) <= 1
                          ? "Yếu"
                          : passwordStrength(formData.password) === 2
                            ? "Vừa"
                            : passwordStrength(formData.password) === 3
                              ? "Khá"
                              : "Mạnh"}
                      </span>
                    </div>
                  </label>
                  <label className="text-xs font-bold text-slate-600 md:col-span-2">
                    Avatar URL (tuỳ chọn)
                    <input
                      value={formData.avatar}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, avatar: e.target.value }))
                      }
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>

                {(formData.avatar || "").trim() ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={formData.avatar}
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-white"
                      alt="avatar preview"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-500" />
                        Preview avatar
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[420px]">
                        {formData.avatar}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreateStudent}
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-200"
                >
                  {submitting ? "Đang tạo..." : "Tạo học viên"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-[140] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(720px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_55%,#F5F3FF_100%)] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedStudent.avatar}
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                    alt={selectedStudent.name}
                  />
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Chi tiết học viên</h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      Hồ sơ và trạng thái tài khoản
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-black text-slate-900">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-500 mt-1">ID: {selectedStudent.id || "—"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Username: {selectedStudent.username || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 break-all">
                      <Mail size={14} className="text-slate-400" /> {selectedStudent.email || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" /> {selectedStudent.phone || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Gói cước</p>
                    <div>{getPackageBadge(selectedStudent.package)}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Vai trò</p>
                    <p className="text-sm font-semibold text-slate-800 uppercase">
                      {selectedStudent.role || "STUDENT"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Trạng thái</p>
                    <div>{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Xác minh email</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedStudent.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Loại tài khoản</p>
                    <p className="text-sm font-semibold text-slate-800 uppercase">
                      {selectedStudent.typeAccount || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Giới tính</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {getGenderVi(selectedStudent.gender)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Streak</p>
                    <p className="text-sm font-semibold text-orange-600">🔥 {selectedStudent.streak} ngày</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Ngày tham gia</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedStudent.joinedDate || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Lần đăng nhập cuối</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDateTime(selectedStudent.lastLoginAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Ngày tạo tài khoản</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDateTime(selectedStudent.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Cập nhật lần cuối</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDateTime(selectedStudent.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Thông tin thêm</p>
                  <div className="text-sm text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p>
                      <span className="font-semibold">Ngày sinh:</span>{" "}
                      {selectedStudent.dateOfBirth
                        ? new Date(selectedStudent.dateOfBirth).toLocaleDateString("vi-VN")
                        : "—"}
                    </p>
                    <p className="md:col-span-2 break-words">
                      <span className="font-semibold">Địa chỉ:</span>{" "}
                      {selectedStudent.address || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

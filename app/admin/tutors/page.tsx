"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";

export default function TutorManager() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordStrength = (pw: string) => {
    const s = String(pw || "");
    let score = 0;
    if (s.length >= 6) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^a-zA-Z0-9]/.test(s)) score++;
    return score; // 0..4
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    avatar: "",
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res: any = await userService.getUsersByRole("teacher");
      const payload = res?.data ?? res;
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.users)
            ? payload.users
            : [];
      setTutors(data);
    } catch (error) {
      console.error(error);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormError("");
    setShowPassword(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      avatar: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tutor: any) => {
    setIsEditing(true);
    setFormError("");
    setShowPassword(false);
    setCurrentId(String(tutor._id || tutor.id || ""));
    setFormData({
      fullName: tutor.fullName || "",
      email: tutor.email || "",
      phone: tutor.phone || "",
      password: "",
      avatar: tutor.avatar || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email)
      return setFormError("Vui lòng nhập đủ Họ tên và Email.");

    setSubmitting(true);
    try {
      setFormError("");
      if (isEditing && currentId) {
        const { password, ...updateData } = formData;
        await userService.updateUser(currentId, updateData);
      } else {
        if (!formData.password) {
          setFormError("Vui lòng nhập mật khẩu.");
          return;
        }
        const username = String(formData.email || "")
          .split("@")[0]
          ?.replace(/[^a-zA-Z0-9_.-]/g, "")
          .slice(0, 24);
        await authService.register({
          fullname: formData.fullName,
          username: username || `teacher_${Date.now()}`,
          email: formData.email,
          password: formData.password,
          role: "teacher",
          typeAccount: "email",
          phone: formData.phone || undefined,
        });
      }
      setIsModalOpen(false);
      fetchTutors();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Gia sư này?")) {
      try {
        await userService.deleteUser(id);
        fetchTutors();
      } catch (error) {
        alert("Lỗi khi xóa gia sư");
      }
    }
  };

  const handleExportTutors = async () => {
    try {
      setExporting(true);
      const blob = await adminService.exportToExcel({
        type: "users",
        role: "teacher",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-teachers-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Xuất Excel giáo viên thất bại:", error);
      alert("Xuất Excel giáo viên thất bại.");
    } finally {
      setExporting(false);
    }
  };

  // Filter Logic
  const filteredTutors = tutors.filter(
    (t) =>
      String(t.fullname || t.fullName || t.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(t.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getTutorFullName = (tutor: any) => {
    return String(tutor?.fullname || tutor?.fullName || tutor?.name || "").trim();
  };

  const getTutorUsername = (tutor: any) => {
    return String(
      tutor?.username || tutor?.userName || tutor?.account?.username || "",
    ).trim();
  };

  const getGenderVi = (value: any) => {
    const g = String(value || "").trim().toLowerCase();
    if (["male", "m", "nam"].includes(g)) return "Nam";
    if (["female", "f", "nu", "nữ"].includes(g)) return "Nữ";
    if (["other", "khac", "khác"].includes(g)) return "Khác";
    return "—";
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50/50 min-h-screen font-sans text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Danh sách Gia sư
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Quản lý đội ngũ giáo viên và tài khoản truy cập.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <Plus size={20} /> Thêm Gia Sư
        </button>
        <button
          onClick={handleExportTutors}
          disabled={exporting}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition disabled:opacity-60"
        >
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Filter size={16} /> <span>{filteredTutors.length} Giáo viên</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2
              className="animate-spin mx-auto text-blue-500 mb-2"
              size={32}
            />
            <p className="text-slate-400 text-sm font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <User size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Không tìm thấy gia sư nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-5 pl-6">Thông tin cá nhân</th>
                  <th className="p-5">Liên hệ</th>
                  <th className="p-5 text-center">Trạng thái</th>
                  <th className="p-5 pr-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTutors.map((t) => (
                  <tr
                    key={String(t._id || t.id)}
                    className="hover:bg-blue-50/30 transition group"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={
                              t.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                getTutorFullName(t) || "Tutor",
                              )}`
                            }
                            className="w-full h-full object-cover"
                            alt={getTutorFullName(t) || "Tutor"}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">
                            {getTutorFullName(t) || "—"}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: {String(t._id || t.id || "").slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          <span className="font-medium">{t.email || "—"}</span>
                        </div>
                        {(t.phone || "").trim() && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span>{t.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {t.isActive === false ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                          <ShieldCheck size={12} strokeWidth={3} /> Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                          <ShieldCheck size={12} strokeWidth={3} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-5 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedTutor(t)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(String(t._id || t.id || ""))}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_55%,#F5F3FF_100%)]">
              <div>
                <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  {isEditing ? "Cập nhật giáo viên" : "Thêm giáo viên mới"}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {isEditing ? "Cập nhật thông tin cơ bản" : "Tạo tài khoản giáo viên bằng email"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-white rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto"
            >
              {formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                  {formError}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-slate-200 p-3 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    Số điện thoại
                  </label>
                  <input
                    className="w-full border border-slate-200 p-3 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                    placeholder="09xxx..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                  Email đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-200 p-3 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-700 transition disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isEditing}
                  required
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                      placeholder="Nhập mật khẩu..."
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
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
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                  Link Avatar (URL)
                </label>
                <input
                  className="w-full border border-slate-200 p-3 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                />
              </div>
              {(formData.avatar || "").trim() ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={formData.avatar}
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-white"
                    alt="avatar preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="text-sm">
                    <div className="font-bold text-slate-800">Preview avatar</div>
                    <div className="text-xs text-slate-500 truncate max-w-[420px]">
                      {formData.avatar}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-2xl transition text-sm border border-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTutor && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full w-full flex items-start md:items-center justify-center py-8">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_55%,#F5F3FF_100%)]">
                <div>
                  <h2 className="font-black text-lg text-slate-900">Chi tiết giáo viên</h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Thông tin tài khoản và liên hệ
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-white rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                  <img
                    src={
                      selectedTutor.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        getTutorFullName(selectedTutor) || "Tutor",
                      )}`
                    }
                    className="w-14 h-14 rounded-full border border-slate-200 object-cover"
                    alt={getTutorFullName(selectedTutor) || "Tutor"}
                  />
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {getTutorFullName(selectedTutor) || "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      ID: {String(selectedTutor._id || selectedTutor.id || "—")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Username: {getTutorUsername(selectedTutor) || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-800 break-all flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {selectedTutor.email || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {selectedTutor.phone || selectedTutor.phoneNumber || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Username</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {getTutorUsername(selectedTutor) || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Trạng thái</p>
                    {selectedTutor.isActive === false ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">
                        <ShieldCheck size={12} strokeWidth={3} /> Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                        <ShieldCheck size={12} strokeWidth={3} /> Active
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Vai trò</p>
                    <p className="text-sm font-semibold text-slate-800 uppercase">
                      {selectedTutor.role || "TEACHER"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Giới tính</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {getGenderVi(selectedTutor.gender)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
                <button
                  type="button"
                  onClick={() => setSelectedTutor(null)}
                  className="px-5 py-2.5 text-slate-700 font-bold hover:bg-white rounded-2xl transition text-sm border border-slate-200"
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

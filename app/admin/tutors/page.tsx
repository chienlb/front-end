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
} from "lucide-react";
import { liveService } from "@/services/live.service";

export default function TutorManager() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      const res: any = await liveService.getTutors();
      const data = Array.isArray(res) ? res : res?.data || [];
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
    setCurrentId(tutor._id);
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
      return alert("Vui lòng nhập đủ thông tin!");

    setSubmitting(true);
    try {
      if (isEditing && currentId) {
        const { password, ...updateData } = formData;
        await liveService.updateTutor(currentId, updateData);
        alert("Cập nhật thành công!");
      } else {
        if (!formData.password) return alert("Vui lòng nhập mật khẩu!");
        await liveService.createTutor(formData);
        alert("Tạo gia sư thành công!");
      }
      setIsModalOpen(false);
      fetchTutors();
    } catch (error) {
      alert("Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Gia sư này?")) {
      try {
        await liveService.deleteTutor(id);
        fetchTutors();
      } catch (error) {
        alert("Lỗi khi xóa gia sư");
      }
    }
  };

  // Filter Logic
  const filteredTutors = tutors.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                    key={t._id}
                    className="hover:bg-blue-50/30 transition group"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={
                              t.avatar ||
                              `https://ui-avatars.com/api/?name=${t.fullName}`
                            }
                            className="w-full h-full object-cover"
                            alt={t.fullName}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">
                            {t.fullName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: {t._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          <span className="font-medium">{t.email}</span>
                        </div>
                        {t.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span>{t.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                        <ShieldCheck size={12} strokeWidth={3} /> Active
                      </span>
                    </td>
                    <td className="p-5 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-lg text-slate-800">
                {isEditing ? "Cập nhật thông tin" : "Thêm Gia sư Mới"}
              </h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
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
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
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
                  className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 transition disabled:bg-slate-100 disabled:text-slate-500"
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
                  <input
                    type="password"
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                    placeholder="Nhập mật khẩu..."
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                  Link Avatar (URL)
                </label>
                <input
                  className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-slate-700 transition"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

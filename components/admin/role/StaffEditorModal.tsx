"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Mail, Lock, Shield } from "lucide-react";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";

export default function StaffEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]); // Danh sách Role để chọn

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: "",
  });

  // 1. Load danh sách Roles khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const res: any = await roleService.getRoles();
          setRoles(res); // Lưu vào state roles để map trong select
        } catch (e) {
          console.error("Lỗi load roles:", e);
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  // 2. Load data user để Edit (Khi initialData thay đổi)
  useEffect(() => {
    if (initialData) {
      // Logic xử lý roleId an toàn
      let roleIdValue = "";

      if (initialData.role) {
        if (typeof initialData.role === "string") {
          roleIdValue = initialData.role;
        } else if (initialData.role._id) {
          roleIdValue = initialData.role._id;
        }
      }

      setFormData({
        fullName: initialData.fullName,
        email: initialData.email,
        password: "",
        roleId: roleIdValue,
      });
    } else {
      // Reset form khi tạo mới
      setFormData({ fullName: "", email: "", password: "", roleId: "" });
    }
  }, [initialData, isOpen]); // Thêm isOpen để reset khi mở modal tạo mới

  const handleSubmit = async () => {
    if (!formData.email || !formData.roleId)
      return alert("Vui lòng điền đủ thông tin!");

    setLoading(true);
    try {
      if (initialData) {
        // Edit logic
        await userService.updateUserRole(initialData._id, formData.roleId);
      } else {
        // Create Logic
        await userService.createStaff(formData);
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.response?.data?.message || "Lỗi xử lý nhân viên");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b flex justify-between bg-gray-50">
          <h3 className="font-bold text-lg">
            {initialData ? "Sửa Nhân viên" : "Thêm Nhân viên"}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tên */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                className="w-full border pl-9 p-2 rounded-lg text-sm"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                disabled={!!initialData}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Email đăng nhập
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                className="w-full border pl-9 p-2 rounded-lg text-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!!initialData}
              />
            </div>
          </div>

          {/* Password (Chỉ hiện khi tạo mới) */}
          {!initialData && (
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="password"
                  className="w-full border pl-9 p-2 rounded-lg text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••"
                />
              </div>
            </div>
          )}

          {/* Role Select */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Phân quyền (Role)
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3 top-2.5 text-blue-500"
              />
              <select
                className="w-full border pl-9 p-2 rounded-lg text-sm bg-white font-bold text-slate-700"
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
              >
                <option value="">-- Chọn vai trò --</option>

                {/* Luôn hiển thị danh sách roles */}
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-900"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}{" "}
            Lưu nhân viên
          </button>
        </div>
      </div>
    </div>
  );
}

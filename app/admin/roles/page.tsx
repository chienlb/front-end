"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Key,
  Loader2,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { roleService } from "@/services/role.service";
import { userService } from "@/services/user.service";
import StaffEditorModal from "@/components/admin/role/StaffEditorModal";

const PERMISSION_MODULES = [
  {
    label: "Quản lý Khóa học (LMS)",
    module: "COURSE",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    actions: [
      { key: "COURSE_VIEW", label: "Xem khóa học" },
      { key: "COURSE_CREATE", label: "Tạo mới" },
      { key: "COURSE_EDIT", label: "Chỉnh sửa" },
      { key: "COURSE_DELETE", label: "Xóa bỏ" },
    ],
  },
  {
    label: "Người dùng (Users)",
    module: "USER",
    color: "bg-green-50 text-green-700 border-green-200",
    actions: [
      { key: "USER_VIEW", label: "Xem danh sách" },
      { key: "USER_EDIT", label: "Sửa thông tin" },
      { key: "USER_BAN", label: "Khóa tài khoản" },
      { key: "TICKET_MANAGE", label: "Trả lời Support" },
    ],
  },
  {
    label: "Kinh doanh (Finance)",
    module: "FINANCE",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    actions: [
      { key: "FINANCE_VIEW", label: "Xem doanh thu" },
      { key: "PACKAGE_MANAGE", label: "Cấu hình Gói cước" },
      { key: "ORDER_MANAGE", label: "Duyệt đơn hàng" },
    ],
  },
  {
    label: "Hệ thống (System)",
    module: "SYSTEM",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    actions: [
      { key: "SETTINGS_MANAGE", label: "Cài đặt chung" },
      { key: "AI_CONFIG", label: "Cấu hình AI" },
      { key: "ADMIN_MANAGE", label: "Quản lý Admin" },
    ],
  },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<"ADMINS" | "ROLES">("ADMINS");
  const [loading, setLoading] = useState(false);

  // Data State
  const [roles, setRoles] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  // Modal & Form State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await roleService.getRoles();
      setRoles(res);
      if (activeTab === "ADMINS") {
        const res: any = await userService.getStaffs();
        setAdmins(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staff: any) => {
    const isConfirmed = confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN nhân viên "${staff.fullName}" không?\n\nHành động này không thể hoàn tác!`,
    );

    if (!isConfirmed) return;

    try {
      setLoading(true);
      await userService.deleteUser(staff._id);
      alert("Đã xóa nhân viên thành công!");
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra, không thể xóa!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 2. Logic Role Form
  const togglePerm = (key: string) => {
    if (roleForm.permissions.includes(key)) {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter((p) => p !== key),
      });
    } else {
      setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, key] });
    }
  };

  const handleSubmitRole = async () => {
    try {
      if (editingRoleId) {
        await roleService.updateRole(editingRoleId, roleForm);
      } else {
        await roleService.createRole(roleForm);
      }
      setShowRoleModal(false);
      fetchData();
    } catch (error) {
      alert("Lỗi lưu vai trò!");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm("Bạn có chắc chắn xóa?")) {
      await roleService.deleteRole(id);
      fetchData();
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRoleId(role._id);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    });
    setShowRoleModal(true);
  };

  const openCreateModal = () => {
    setEditingRoleId(null);
    setRoleForm({ name: "", description: "", permissions: [] });
    setShowRoleModal(true);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6 bg-slate-50/50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            Phân Quyền & Nhân Sự <Lock className="text-slate-400" size={24} />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Quản lý tài khoản quản trị viên và vai trò hệ thống.
          </p>
        </div>

        {/* TABS */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
          <button
            onClick={() => setActiveTab("ADMINS")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "ADMINS"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Users size={18} /> Nhân viên
          </button>
          <button
            onClick={() => setActiveTab("ROLES")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "ROLES"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Shield size={18} /> Vai trò
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center gap-3 text-slate-400 font-medium">
            <Loader2 className="animate-spin text-blue-500" size={32} /> Đang
            tải dữ liệu...
          </div>
        ) : (
          <>
            {/* TAB ROLES */}
            {activeTab === "ROLES" && (
              <div className="p-8 h-full overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Create Button */}
                  <button
                    onClick={openCreateModal}
                    className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition min-h-[180px] group"
                  >
                    <div className="p-3 bg-slate-100 rounded-full mb-3 group-hover:bg-blue-100 transition">
                      <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Tạo Vai trò mới</span>
                  </button>

                  {/* Role Cards */}
                  {roles.map((role) => (
                    <div
                      key={role._id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition relative group flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-xl ${role.isSystem ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
                        >
                          {role.isSystem ? (
                            <Lock size={24} />
                          ) : (
                            <Shield size={24} />
                          )}
                        </div>
                        {!role.isSystem && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-800 text-xl mb-1">
                        {role.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10 leading-relaxed">
                        {role.description || "Không có mô tả."}
                      </p>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Quyền hạn
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                          <Key size={14} /> {role.permissions.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB ADMINS */}
            {activeTab === "ADMINS" && (
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 flex justify-end bg-slate-50/50">
                  <button
                    onClick={handleCreateStaff}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition active:scale-95"
                  >
                    <Plus size={18} /> Thêm Nhân viên
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="p-5 pl-8 border-b border-slate-200">
                          Thông tin nhân viên
                        </th>
                        <th className="p-5 border-b border-slate-200">
                          Vai trò / Chức vụ
                        </th>
                        <th className="p-5 pr-8 border-b border-slate-200 text-right">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {admins.map((admin) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-blue-50/30 transition group"
                        >
                          <td className="p-5 pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                                {/* Avatar placeholder if needed */}
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-white">
                                  {admin.fullName.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-base">
                                  {admin.fullName}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                  {admin.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            {(() => {
                              if (!admin.role)
                                return (
                                  <span className="text-slate-400 italic text-xs">
                                    Chưa phân quyền
                                  </span>
                                );

                              const roleName =
                                typeof admin.role === "object"
                                  ? admin.role.name
                                  : roles.find((r) => r._id === admin.role)
                                      ?.name || "Unknown Role";

                              return (
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 shadow-sm">
                                  <Shield size={12} /> {roleName}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-5 pr-8 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditStaff(admin)}
                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
                                title="Sửa"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(admin)}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                                title="Xóa"
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
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL ROLE EDITOR --- */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {editingRoleId ? (
                  <Edit className="text-blue-600" />
                ) : (
                  <Plus className="text-blue-600" />
                )}
                {editingRoleId ? "Chỉnh sửa Vai trò" : "Tạo Vai trò Mới"}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Tên vai trò
                    </label>
                    <input
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none font-bold text-slate-700 bg-white"
                      placeholder="VD: Quản lý khóa học"
                      value={roleForm.name}
                      onChange={(e) =>
                        setRoleForm({ ...roleForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Mô tả
                    </label>
                    <input
                      className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none text-slate-600 bg-white"
                      placeholder="Mô tả ngắn gọn..."
                      value={roleForm.description}
                      onChange={(e) =>
                        setRoleForm({
                          ...roleForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Permission Matrix */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
                    Phân quyền chức năng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PERMISSION_MODULES.map((mod) => (
                      <div
                        key={mod.module}
                        className={`rounded-xl border p-5 ${mod.color.replace("text-", "border-").replace("bg-", "bg-opacity-10 ")} bg-white`}
                      >
                        <h5
                          className={`font-bold text-base mb-4 flex items-center gap-2 ${mod.color.split(" ")[1]}`}
                        >
                          <Shield size={18} /> {mod.label}
                        </h5>
                        <div className="space-y-3">
                          {mod.actions.map((act) => {
                            const isChecked = roleForm.permissions.includes(
                              act.key,
                            );
                            return (
                              <label
                                key={act.key}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm cursor-pointer transition select-none group"
                              >
                                <div
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"}`}
                                >
                                  {isChecked && (
                                    <CheckCircle2
                                      size={14}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={() => togglePerm(act.key)}
                                />
                                <span
                                  className={`text-sm font-medium ${isChecked ? "text-slate-900" : "text-slate-500"}`}
                                >
                                  {act.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitRole}
                className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 flex items-center gap-2"
              >
                <Save size={18} /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      <StaffEditorModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSuccess={fetchData}
        initialData={editingStaff}
        roles={roles} // Truyền danh sách roles xuống để chọn
      />
    </div>
  );
}

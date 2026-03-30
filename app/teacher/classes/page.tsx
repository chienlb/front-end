"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  BookOpen,
  Filter,
  MonitorPlay,
  Loader2,
  LayoutGrid,
  List,
  GraduationCap,
  Calendar,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
  Image as ImageIcon,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { groupsService } from "@/services/groups.service";

// --- TYPES ---
interface TeacherClass {
  _id: string;
  name: string;
  username: string;
  joinCode: string;
  visibility: string;
  thumbnail?: string;
  description?: string;
  type: "class" | "subject" | "custom";
  isActive: boolean;
  students?: any[];
  baseCourseId?: { title: string };
  scheduleDescription?: string;
  startDate?: string;
  endDate?: string;
  tutorId?: { _id: string; fullName: string; avatar?: string };
}

type GroupFormData = {
  groupName: string;
  type: "class" | "subject" | "custom";
  visibility: "public" | "private" | "hidden";
  description: string;
  avatarFile: File | null;
  backgroundFile: File | null;
};

// --- MODAL TẠO/SỬA LỚP HỌC ---
const ClassModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GroupFormData) => Promise<void> | void;
  initialData?: TeacherClass | null;
}) => {
  const [formData, setFormData] = useState({
    groupName: "",
    type: "class" as "class" | "subject" | "custom",
    visibility: "private" as "public" | "private" | "hidden",
    description: "",
    avatarFile: null as File | null,
    backgroundFile: null as File | null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        groupName: initialData.name || "",
        type: (initialData.type || "class") as "class" | "subject" | "custom",
        visibility: (String(initialData.visibility || "private").toLowerCase() as "public" | "private" | "hidden"),
        description: initialData.description || "",
        avatarFile: null,
        backgroundFile: null,
      });
    } else {
      setFormData({
        groupName: "",
        type: "class",
        visibility: "private",
        description: "",
        avatarFile: null,
        backgroundFile: null,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditMode ? "Chỉnh Sửa Lớp Học" : "Tạo Lớp Học Mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Tên lớp học <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold focus:border-blue-500 outline-none transition"
                placeholder="VD: Tiếng Anh Giao Tiếp K12"
                value={formData.groupName}
                onChange={(e) =>
                  setFormData({ ...formData, groupName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Loại nhóm
              </label>
              <select
                className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold focus:border-blue-500 outline-none bg-white cursor-pointer"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "class" | "subject" | "custom" })
                }
              >
                <option value="class">Nhóm lớp học</option>
                <option value="subject">Nhóm môn học</option>
                <option value="custom">Nhóm tùy chỉnh</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Quyền riêng tư
            </label>
            <select
              className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold focus:border-blue-500 outline-none bg-white cursor-pointer"
              value={formData.visibility}
              onChange={(e) =>
                setFormData({ ...formData, visibility: e.target.value as "public" | "private" | "hidden" })
              }
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
              <option value="hidden">Ẩn hoàn toàn</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Ảnh đại diện
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })}
              />
              {formData.avatarFile ? (
                <p className="text-xs text-slate-500">Đã chọn: {formData.avatarFile.name}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Ảnh nền
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({ ...formData, backgroundFile: e.target.files?.[0] || null })}
              />
              {formData.backgroundFile ? (
                <p className="text-xs text-slate-500">Đã chọn: {formData.backgroundFile.name}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Mô tả lớp học
            </label>
            <textarea
              className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:border-blue-500 outline-none transition resize-none h-24"
              placeholder="Mô tả ngắn gọn về nội dung, mục tiêu..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              void onSubmit(formData);
            }}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-95 text-sm flex items-center gap-2"
          >
            {isEditMode ? <Edit size={16} /> : <Plus size={16} />}
            {isEditMode ? "Cập nhật" : "Tạo lớp ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TeacherClass | null>(null);

  // Filter & View State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await groupsService.getAllGroupsForTeacher();
      const payload = res?.data ?? res;

      const extractList = (source: any): any[] => {
        if (Array.isArray(source)) return source;
        if (!source || typeof source !== "object") return [];
        const keys = ["data", "items", "results", "docs", "groups", "rows"];
        for (const key of keys) {
          if (Array.isArray(source[key])) return source[key];
        }
        for (const key of ["data", "result", "payload"]) {
          const nested = source[key];
          if (!nested || typeof nested !== "object") continue;
          for (const k of keys) {
            if (Array.isArray(nested[k])) return nested[k];
          }
        }
        return [];
      };

      const list = extractList(payload);
      const mapped: TeacherClass[] = list.map((it: any, idx: number) => {
        const statusRaw = String(it?.status ?? it?.isActive ?? "").toLowerCase();
        const isActive =
          typeof it?.isActive === "boolean"
            ? it.isActive
            : !(statusRaw.includes("inactive") || statusRaw.includes("closed") || statusRaw === "false" || statusRaw === "0");

        const members = Array.isArray(it?.members) ? it.members : [];
        const ownerId = String(it?.owner ?? "");
        const ownerInMembers = ownerId
          ? members.some((m: any) => String(m) === ownerId)
          : false;
        const learnerCount = Math.max(0, members.length - (ownerInMembers ? 1 : 0));

        const studentCount = Number(
          it?.studentCount ??
            it?.learnerCount ??
            it?.totalMembers ??
            it?.memberCount,
        );

        return {
          _id: String(it?._id ?? it?.id ?? `group-${idx}`),
          name: String(it?.groupName ?? it?.name ?? it?.title ?? "Nhóm học"),
          username: String(
            it?.owner?.username ??
              it?.owner?.fullName ??
              it?.ownerUsername ??
              (it?.slug ? `@${it.slug}` : `@group_${idx + 1}`),
          ),
          joinCode: String(it?.joinCode ?? "---"),
          visibility: String(it?.visibility ?? "public").toLowerCase(),
          thumbnail: String(it?.thumbnail ?? it?.avatar ?? it?.background ?? it?.image ?? ""),
          description: String(it?.description ?? ""),
          type: (["class", "subject", "custom"].includes(String(it?.type || "").toLowerCase())
            ? String(it?.type).toLowerCase()
            : "class") as "class" | "subject" | "custom",
          isActive,
          students: Array(
            Math.max(
              0,
              Number.isFinite(studentCount) && studentCount > 0
                ? studentCount
                : learnerCount,
            ),
          ).fill(null),
          scheduleDescription: String(it?.scheduleDescription ?? it?.schedule ?? ""),
          startDate: it?.startDate,
          endDate: it?.endDate,
          tutorId: it?.tutorId
            ? {
                _id: String(it.tutorId?._id ?? ""),
                fullName: String(it.tutorId?.fullName ?? "Giảng viên"),
                avatar: it.tutorId?.avatar,
              }
            : undefined,
        };
      });

      setClasses(mapped);
    } catch (err) {
      console.error(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const openCreateModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, cls: TeacherClass) => {
    e.stopPropagation();
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleSubmitClass = async (formData: GroupFormData) => {
    if (!formData.groupName.trim()) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }

    try {
      if (editingClass) {
        await groupsService.updateGroup(editingClass._id, {
          groupName: formData.groupName.trim(),
          description: formData.description.trim(),
          type: formData.type,
          visibility: formData.visibility,
        });
        alert("Đã cập nhật nhóm thành công!");
      } else {
        await groupsService.createGroup(
          {
            groupName: formData.groupName.trim(),
            description: formData.description.trim(),
            type: formData.type,
            visibility: formData.visibility,
            members: [],
          },
          {
            avatar: formData.avatarFile,
            background: formData.backgroundFile,
          },
        );
        alert("Đã tạo nhóm mới thành công!");
      }

      setIsModalOpen(false);
      setEditingClass(null);
      await fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể lưu nhóm.");
    }
  };

  const handleDeleteClass = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("CẢNH BÁO: Xóa lớp học này?")) {
      setClasses(classes.filter((c) => c._id !== id));
    }
  };

  const handleToggleStatus = (
    e: React.MouseEvent,
    id: string,
    currentStatus: boolean,
  ) => {
    e.stopPropagation();
    setClasses(
      classes.map((c) =>
        c._id === id ? { ...c, isActive: !currentStatus } : c,
      ),
    );
  };

  // --- FILTERING ---
  const filteredClasses = classes.filter((cls) => {
    const matchSearch = cls.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "ACTIVE"
          ? cls.isActive
          : !cls.isActive;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: classes.length,
    active: classes.filter((c) => c.isActive).length,
    students: classes.reduce(
      (acc, curr) => acc + (curr.students?.length || 0),
      0,
    ),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6 md:p-8 font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Quản Lý Lớp Học
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl">
            Tạo và quản lý các lớp học trực tuyến. Theo dõi tiến độ giảng dạy và
            danh sách học viên.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Tạo Lớp Mới
        </button>
      </div>

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Tổng số lớp
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {stats.total}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Lớp đang hoạt động
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {stats.active}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Tổng học viên
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {stats.students}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR */}
      <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between mb-8">
        {/* Search */}
        <div className="relative w-full xl:w-96 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition"
            placeholder="Tìm kiếm lớp học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & View Mode */}
        <div className="flex gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status === "ALL"
                  ? "Tất cả"
                  : status === "ACTIVE"
                    ? "Đang mở"
                    : "Đã đóng"}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg transition ${viewMode === "GRID" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-2 rounded-lg transition ${viewMode === "TABLE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENT LISTING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MonitorPlay className="text-slate-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            Chưa có lớp học nào
          </h3>
          <button
            onClick={openCreateModal}
            className="text-blue-600 font-bold hover:underline mt-2"
          >
            Tạo lớp ngay
          </button>
        </div>
      ) : (
        <>
          {/* VIEW: GRID */}
          {viewMode === "GRID" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredClasses.map((cls) => (
                <div
                  key={cls._id}
                  onClick={() =>
                    router.push(
                      `/teacher/students?groupId=${encodeURIComponent(cls._id)}&groupName=${encodeURIComponent(cls.name)}`,
                    )
                  }
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative"
                >
                  {/* Image Section */}
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    {cls.thumbnail ? (
                      <img
                        src={cls.thumbnail}
                        alt={cls.name}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <GraduationCap className="text-white/20" size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border ${cls.isActive ? "bg-green-500/80 text-white border-green-400/50" : "bg-red-500/80 text-white border-red-400/50"}`}
                      >
                        {cls.isActive ? "Đang mở" : "Đã đóng"}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={(e) => openEditModal(e, cls)}
                        className="p-2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-full transition shadow-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) =>
                          handleToggleStatus(e, cls._id, cls.isActive)
                        }
                        className="p-2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-orange-600 rounded-full transition shadow-lg"
                      >
                        {cls.isActive ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClass(e, cls._id)}
                        className="p-2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-red-600 rounded-full transition shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-md line-clamp-2">
                        {cls.name}
                      </h3>
                      <p className="text-slate-300 text-xs font-medium flex items-center gap-1">
                        <BookOpen size={12} />{" "}
                        {cls.type === "class"
                          ? "Nhóm lớp học"
                          : cls.type === "subject"
                            ? "Nhóm môn học"
                            : "Nhóm tùy chỉnh"}
                      </p>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs">
                        @
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">
                          Username nhóm
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {cls.username}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Clock
                          size={16}
                          className="text-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="block font-medium text-slate-700">
                            Mã tham gia:
                          </span>{" "}
                          <span className="text-slate-500 text-xs">
                            {cls.joinCode}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Filter
                          size={16}
                          className="text-violet-500 flex-shrink-0"
                        />
                        <span className="font-medium">
                          Quyền riêng tư: {cls.visibility === "public" ? "Công khai" : "Riêng tư"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Users
                          size={16}
                          className="text-orange-500 flex-shrink-0"
                        />
                        <span className="font-medium">
                          {cls.students?.length || 0} học viên
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition">
                    <span className="text-xs text-slate-400 font-medium">
                      Cập nhật: hôm nay
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                      Xem học viên <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: TABLE */}
          {viewMode === "TABLE" && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-5 pl-8">Lớp học</th>
                      <th className="p-5">Username nhóm</th>
                      <th className="p-5">Mã tham gia</th>
                      <th className="p-5 text-center">Học viên</th>
                      <th className="p-5">Trạng thái</th>
                      <th className="p-5 pr-8 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredClasses.map((cls) => (
                      <tr
                        key={cls._id}
                        onClick={() =>
                          router.push(
                            `/teacher/students?groupId=${encodeURIComponent(cls._id)}&groupName=${encodeURIComponent(cls.name)}`,
                          )
                        }
                        className="hover:bg-slate-50 transition cursor-pointer group"
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              {cls.thumbnail ? (
                                <img
                                  src={cls.thumbnail}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <GraduationCap
                                    size={20}
                                    className="text-slate-300"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                                {cls.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {cls.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 font-medium text-slate-600">
                          {cls.username}
                        </td>
                        <td className="p-5 text-slate-500">
                          {cls.joinCode}
                        </td>
                        <td className="p-5 text-center font-bold text-slate-700">
                          {cls.students?.length || 0}
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cls.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
                          >
                            {cls.isActive ? "Đang mở" : "Đã đóng"}
                          </span>
                        </td>
                        <td className="p-5 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => openEditModal(e, cls)}
                              className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) =>
                                handleToggleStatus(e, cls._id, cls.isActive)
                              }
                              className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-lg transition"
                            >
                              {cls.isActive ? (
                                <Lock size={16} />
                              ) : (
                                <Unlock size={16} />
                              )}
                            </button>
                            <button
                              onClick={(e) => handleDeleteClass(e, cls._id)}
                              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                            >
                              <Trash2 size={16} />
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

      {/* MODAL LAYER */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitClass}
        initialData={editingClass}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCog,
  History,
  School,
  MonitorPlay,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { groupsService } from "@/services/groups.service";
import { showAlert, showConfirm } from "@/utils/dialog";

// --- TYPES ---
type ClassStatus = "ACTIVE" | "INACTIVE";

interface Teacher {
  id: string;
  name: string;
  avatar: string;
}

interface ClassSession {
  id: string;
  name: string; // VD: Tiếng Anh Giao Tiếp K12
  code: string; // Mã lớp
  teacher: Teacher;
  schedule: string;
  studentsCount: number;
  maxStudents: number;
  startDate: string;
  status: ClassStatus;
  type: "ONLINE" | "OFFLINE";
  issue?: string;
}

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | ClassStatus>("ALL");
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // ID lớp đang cần gán GV

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const keys = ["data", "items", "results", "docs", "rows", "classes", "groups"];
    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    for (const key of ["data", "result", "payload"]) {
      const nested = payload[key];
      if (!nested || typeof nested !== "object") continue;
      for (const k of keys) {
        if (Array.isArray(nested[k])) return nested[k];
      }
    }
    return [];
  };

  const mapStatus = (value: any): ClassStatus => {
    const raw = String(value ?? "").toUpperCase();
    if (["ACTIVE", "TRUE", "1"].includes(raw)) return "ACTIVE";
    if (["INACTIVE", "FALSE", "0", "DELETED", "ARCHIVED"].includes(raw)) return "INACTIVE";
    return "ACTIVE";
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res: any = await groupsService.getAllGroupsForAdminAll({ limit: 100, maxPages: 50 });
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped: ClassSession[] = list.map((it: any, idx: number) => {
        const teacherObj = it?.owner || it?.teacher || it?.tutor || it?.teacherId || {};
        const teacherName =
          teacherObj?.fullName || teacherObj?.name || it?.ownerName || it?.teacherName || "Chưa phân công";
        const teacherAvatar = String(teacherObj?.avatar || "");
        const hasTeacher = teacherName !== "Chưa phân công";

        const studentsCount = Number(
          it?.studentsCount ??
            it?.memberCount ??
            it?.totalStudents ??
            (Array.isArray(it?.members) ? it.members.length : 0) ??
            (Array.isArray(it?.students) ? it.students.length : 0),
        ) || 0;
        const maxStudents = Number(it?.maxMembers ?? it?.maxStudents ?? it?.capacity ?? 0) || 0;

        const startRaw = it?.createdAt || it?.startDate || it?.startAt || "";
        const startDate = startRaw
          ? new Date(startRaw).toLocaleDateString("vi-VN")
          : "—";

        return {
          id: String(it?._id ?? it?.id ?? `GRP-${idx}`),
          name: String(it?.groupName ?? it?.name ?? it?.title ?? "Nhóm chưa đặt tên"),
          code: String(it?.joinCode ?? it?.code ?? it?.slug ?? `GRP-${idx}`),
          teacher: {
            id: String(teacherObj?._id ?? teacherObj?.id ?? ""),
            name: String(teacherName),
            avatar: teacherAvatar,
          },
          schedule: String(it?.subject ?? it?.type ?? "Chưa có chủ đề"),
          studentsCount,
          maxStudents,
          startDate,
          status: mapStatus(it?.isActive ?? it?.status),
          type: "ONLINE",
          issue: hasTeacher ? undefined : "Thiếu giảng viên đứng lớp",
        };
      });

      setClasses(mapped);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setClasses([]);
      setLoadError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải danh sách nhóm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Filter Logic
  const filteredClasses = useMemo(
    () => classes.filter((c) => activeTab === "ALL" || c.status === activeTab),
    [classes, activeTab],
  );

  const activeCount = classes.filter((c) => c.status === "ACTIVE").length;
  const missingTeacherCount = classes.filter((c) => !c.teacher.avatar && c.teacher.name === "Chưa phân công").length;

  const getStatusBadge = (status: ClassStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />{" "}
            Hoạt động
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
            Ngừng hoạt động
          </span>
        );
    }
  };

  const handleLockGroup = async (groupId: string) => {
    const ok = await showConfirm("Bạn có chắc muốn khóa nhóm này?", "Khóa nhóm");
    if (!ok) return;

    try {
      await groupsService.lockGroup(groupId);
      await fetchClasses();
      await showAlert("Đã khóa nhóm thành công.", "Thành công");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      await showAlert(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không thể khóa nhóm.",
        "Khóa thất bại",
      );
    }
  };

  const handleUnlockGroup = async (groupId: string) => {
    const ok = await showConfirm("Bạn có chắc muốn mở khóa nhóm này?", "Mở khóa nhóm");
    if (!ok) return;

    try {
      await groupsService.unlockGroup(groupId);
      await fetchClasses();
      await showAlert("Đã mở khóa nhóm thành công.", "Thành công");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      await showAlert(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không thể mở khóa nhóm.",
        "Mở khóa thất bại",
      );
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Quản lý Nhóm học
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi danh sách nhóm, chủ sở hữu và thành viên.
          </p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition">
          <Plus size={20} /> Tạo nhóm mới
        </button>
      </div>

      {/* 2. STATS & ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <School size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{classes.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Tổng nhóm học
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <MonitorPlay size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{activeCount}</p>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Nhóm hoạt động
            </p>
          </div>
        </div>
        {/* Cảnh báo vận hành */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white text-red-600 rounded-lg shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-red-600">{missingTeacherCount}</p>
            <p className="text-xs text-red-800 font-bold uppercase">
              Nhóm thiếu chủ sở hữu
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["ALL", "ACTIVE", "INACTIVE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "ALL"
                  ? "Tất cả"
                  : tab === "ACTIVE"
                    ? "Hoạt động"
                    : "Ngừng hoạt động"}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              placeholder="Tìm tên nhóm, mã tham gia..."
            />
          </div>
        </div>

        {loadError && (
          <div className="px-4 py-2 text-sm text-red-600 border-b border-red-100 bg-red-50">
            {loadError}
          </div>
        )}

        {/* Table List */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Thông tin nhóm</th>
              <th className="p-4">Chủ sở hữu</th>
              <th className="p-4">Chủ đề</th>
              <th className="p-4">Sĩ số</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Đang tải danh sách nhóm...
                </td>
              </tr>
            )}
            {!loading && filteredClasses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Không có nhóm phù hợp.
                </td>
              </tr>
            )}
            {filteredClasses.map((cls) => (
              <tr
                key={cls.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer">
                      {cls.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {cls.code}
                    </p>
                    {cls.issue && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                        <AlertCircle size={10} /> {cls.issue}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {cls.teacher.avatar ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={cls.teacher.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {cls.teacher.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAssignModal(cls.id)}
                      className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 flex items-center gap-1 transition"
                    >
                      <UserCog size={14} /> Phân công ngay
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {cls.startDate}
                    </p>
                    <p className="flex items-center gap-1.5 font-bold">
                      <Clock size={14} className="text-slate-400" />{" "}
                      {cls.schedule}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${cls.maxStudents > 0 ? (cls.studentsCount / cls.maxStudents) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {cls.studentsCount}/{cls.maxStudents}
                    </span>
                  </div>
                </td>
                <td className="p-4">{getStatusBadge(cls.status)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {cls.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleLockGroup(cls.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 inline-flex items-center gap-1"
                      >
                        <Lock size={13} /> Khóa nhóm
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockGroup(cls.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 inline-flex items-center gap-1"
                      >
                        <Unlock size={13} /> Mở khóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. ASSIGN TEACHER MODAL (Nghiệp vụ Vận hành) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-slate-800">
                Gán chủ sở hữu nhóm
              </h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                  Lưu ý: Việc đổi chủ sở hữu nhóm sẽ ảnh hưởng quyền quản trị nhóm.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Chọn chủ sở hữu thay thế
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                    placeholder="Tìm tên người dùng..."
                  />
                </div>
              </div>

              {/* Danh sách gợi ý giảng viên */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {[
                  "Cô Minh Anh (IELTS)",
                  "Thầy David (Native)",
                  "Cô Lan Hương (Giao tiếp)",
                ].map((t, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  showAlert("Đã ghi nhận thao tác phân công.", "Thông báo");
                  setShowAssignModal(null);
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

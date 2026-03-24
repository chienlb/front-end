"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Layers3,
  RefreshCw,
  CheckCircle2,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { unitService } from "@/services/units.service";

type UnitStatus = "ACTIVE" | "INACTIVE";
type UnitRow = {
  id: string;
  name: string;
  topic?: string;
  thumbnail?: string;
  description?: string;
  totalLessons: number;
  difficulty: string;
  status: UnitStatus;
  orderIndex: number;
  updatedAt: string;
};

export default function AdminUnitsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | UnitStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    topic: "",
    difficulty: "easy",
    totalLessons: "1",
    orderIndex: "1",
    estimatedDuration: "45",
    isActive: "active",
    objectivesText: "",
    tagsText: "",
  });
  const [editRow, setEditRow] = useState<UnitRow | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [materialFiles, setMaterialFiles] = useState<{
    textLessons: File[];
    videos: File[];
    audios: File[];
    exercises: File[];
  }>({
    textLessons: [],
    videos: [],
    audios: [],
    exercises: [],
  });

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res: any = await unitService.getAllUnits({ page: 1, limit: 500 });
      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const mapped: UnitRow[] = list.map((u) => {
        const statusRaw = String(u?.isActive ?? "").toLowerCase();
        const unitStatus: UnitStatus = statusRaw === "active" ? "ACTIVE" : "INACTIVE";
        const updatedIso = u?.updatedAt || u?.createdAt || "";
        return {
          id: String(u?._id || u?.id || ""),
          name: String(u?.name || u?.title || "Unit chưa đặt tên"),
          topic: String(u?.topic || ""),
          thumbnail: String(u?.thumbnail || u?.image || u?.cover || ""),
          description: u?.description || "",
          totalLessons: Number(u?.totalLessons || 0),
          difficulty: String(u?.difficulty || "N/A"),
          status: unitStatus,
          orderIndex: Number(u?.orderIndex || 0),
          updatedAt: updatedIso
            ? new Date(updatedIso).toLocaleDateString("vi-VN")
            : "—",
        };
      });
      setUnits(mapped.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error) {
      console.error("Lỗi lấy danh sách unit:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const resetCreateForm = () => {
    setForm({
      name: "",
      description: "",
      topic: "",
      difficulty: "easy",
      totalLessons: "1",
      orderIndex: "1",
      estimatedDuration: "45",
      isActive: "active",
      objectivesText: "",
      tagsText: "",
    });
    setThumbnailFile(null);
    setMaterialFiles({
      textLessons: [],
      videos: [],
      audios: [],
      exercises: [],
    });
    setCreateError("");
    setCreateSuccess("");
  };

  const onPickFiles = (
    type: "textLessons" | "videos" | "audios" | "exercises",
    files: FileList | null,
  ) => {
    setMaterialFiles((prev) => ({
      ...prev,
      [type]: files ? Array.from(files) : [],
    }));
  };

  const handleCreateUnit = async () => {
    if (!form.name.trim()) {
      setCreateError("Vui lòng nhập tên chủ đề.");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("topic", form.topic.trim());
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
      fd.append("difficulty", form.difficulty);
      fd.append("totalLessons", form.totalLessons || "0");
      fd.append("orderIndex", form.orderIndex || "0");
      fd.append("estimatedDuration", form.estimatedDuration || "0");
      fd.append("isActive", form.isActive);

      const objectives = form.objectivesText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      objectives.forEach((value, idx) => fd.append(`objectives[${idx}]`, value));

      const tags = form.tagsText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      tags.forEach((value, idx) => fd.append(`tags[${idx}]`, value));

      materialFiles.textLessons.forEach((file, idx) => {
        fd.append(`materials[textLessons][${idx}]`, file);
      });
      materialFiles.videos.forEach((file, idx) => {
        fd.append(`materials[videos][${idx}]`, file);
      });
      materialFiles.audios.forEach((file, idx) => {
        fd.append(`materials[audios][${idx}]`, file);
      });
      materialFiles.exercises.forEach((file, idx) => {
        fd.append(`materials[exercises][${idx}]`, file);
      });

      await unitService.createUnit(fd);
      setCreateSuccess("Tạo chủ đề bài học thành công.");
      await fetchUnits();
      setTimeout(() => {
        setOpenCreate(false);
        resetCreateForm();
      }, 600);
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo chủ đề bài học.",
      );
    } finally {
      setCreating(false);
    }
  };

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const okText =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.description?.toLowerCase().includes(search.toLowerCase());
      const okStatus = status === "ALL" || u.status === status;
      return okText && okStatus;
    });
  }, [search, status, units]);

  const handleDeleteUnit = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa chủ đề này?");
    if (!ok) return;
    try {
      await unitService.deleteUnit(id);
      await fetchUnits();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Không thể xóa chủ đề.");
    }
  };

  const handleOpenEdit = (row: UnitRow) => {
    setEditRow(row);
    setEditThumbnailFile(null);
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    try {
      setSavingEdit(true);
      const fd = new FormData();
      fd.append("name", editRow.name || "");
      fd.append("topic", editRow.topic || "");
      fd.append("description", editRow.description || "");
      if (editThumbnailFile) fd.append("thumbnail", editThumbnailFile);
      await unitService.updateUnit(editRow.id, fd);
      setOpenEdit(false);
      setEditRow(null);
      setEditThumbnailFile(null);
      await fetchUnits();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Không thể cập nhật chủ đề.");
    } finally {
      setSavingEdit(false);
    }
  };

  const activeCount = units.filter((x) => x.status === "ACTIVE").length;
  const inactiveCount = units.filter((x) => x.status === "INACTIVE").length;

  const statusBadge = (s: UnitStatus) =>
    s === "ACTIVE" ? (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        Hoạt động
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Ngừng hoạt động
      </span>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Chủ đề bài học (Units)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách unit đồng bộ từ API `GET /units`.
            </p>
          </div>
          <button
            onClick={fetchUnits}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            onClick={() => {
              resetCreateForm();
              setOpenCreate(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2"
          >
            <Plus size={16} /> Tạo chủ đề bài học
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Tổng Unit</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{units.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Đang active</p>
            <p className="text-2xl font-black text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Inactive</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{inactiveCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên chủ đề..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-slate-500" />
            {([
              { value: "ALL", label: "Tất cả" },
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "INACTIVE", label: "Ngừng hoạt động" },
            ] as const).map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  status === s.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Tên chủ đề</th>
                <th className="p-4 text-center">Thumbnail</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Độ khó</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-center">Số bài</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {u.id}</p>
                  </td>
                  <td className="p-4 text-center">
                    {u.thumbnail ? (
                      <img
                        src={u.thumbnail}
                        alt={u.name}
                        className="w-14 h-10 rounded-lg object-cover border border-slate-200 inline-block"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 max-w-md">
                    <span className="line-clamp-2">{u.description || "—"}</span>
                  </td>
                  <td className="p-4 text-slate-600">{u.difficulty}</td>
                  <td className="p-4 text-center text-slate-600">{u.orderIndex}</td>
                  <td className="p-4 text-center text-slate-600">{u.totalLessons}</td>
                  <td className="p-4 text-center">{statusBadge(u.status)}</td>
                  <td className="p-4 text-slate-500">{u.updatedAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(u.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-10 text-center text-slate-500">Đang tải dữ liệu unit...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={24} />
              Không có unit phù hợp bộ lọc.
            </div>
          ) : null}
        </div>
      </div>

      {openCreate && (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(920px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-lg font-black text-slate-800">Tạo chủ đề bài học</h2>
              <button
                onClick={() => setOpenCreate(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Tên chủ đề"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  placeholder="Chủ đề"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs font-semibold text-slate-600">Thumbnail (tải ảnh)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-sm"
                  />
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
                <input
                  type="number"
                  value={form.totalLessons}
                  onChange={(e) => setForm((p) => ({ ...p, totalLessons: e.target.value }))}
                  placeholder="Tổng số bài"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={(e) => setForm((p) => ({ ...p, orderIndex: e.target.value }))}
                  placeholder="Order index"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  type="number"
                  value={form.estimatedDuration}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, estimatedDuration: e.target.value }))
                  }
                  placeholder="Thời lượng ước tính (phút)"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <select
                  value={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>

              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả chủ đề"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  value={form.objectivesText}
                  onChange={(e) => setForm((p) => ({ ...p, objectivesText: e.target.value }))}
                  placeholder="Mục tiêu học tập (phân tách bằng dấu phẩy)"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  value={form.tagsText}
                  onChange={(e) => setForm((p) => ({ ...p, tagsText: e.target.value }))}
                  placeholder="Thẻ (phân tách bằng dấu phẩy)"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <label className="text-sm text-slate-600 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <span className="font-semibold">Tài liệu văn bản</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles("textLessons", e.target.files)}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <label className="text-sm text-slate-600 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <span className="font-semibold">Video</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles("videos", e.target.files)}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <label className="text-sm text-slate-600 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <span className="font-semibold">Âm thanh</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles("audios", e.target.files)}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <label className="text-sm text-slate-600 rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <span className="font-semibold">Bài tập</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles("exercises", e.target.files)}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
              </div>

              {createError ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {createError}
                </div>
              ) : null}
              {createSuccess ? (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  {createSuccess}
                </div>
              ) : null}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-white sticky bottom-0">
              <button
                onClick={() => setOpenCreate(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateUnit}
                disabled={creating}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? "Đang tạo..." : "Tạo chủ đề bài học"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {openEdit && editRow && (
        <div className="fixed inset-0 z-[130] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(760px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-black text-slate-800">Chỉnh sửa chủ đề</h2>
                <button
                  onClick={() => setOpenEdit(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
                <input
                  value={editRow.name}
                  onChange={(e) => setEditRow((p) => (p ? { ...p, name: e.target.value } : p))}
                  placeholder="Tên chủ đề"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  value={editRow.topic || ""}
                  onChange={(e) => setEditRow((p) => (p ? { ...p, topic: e.target.value } : p))}
                  placeholder="Chủ đề"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  value={editRow.thumbnail || ""}
                  readOnly
                  placeholder="Thumbnail hiện tại"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 md:col-span-2"
                />
                <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white md:col-span-2">
                  <span className="text-xs font-semibold text-slate-600">Cập nhật thumbnail (tải ảnh)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditThumbnailFile(e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-sm"
                  />
                </label>
                <textarea
                  value={editRow.description || ""}
                  onChange={(e) =>
                    setEditRow((p) => (p ? { ...p, description: e.target.value } : p))
                  }
                  placeholder="Mô tả chủ đề"
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24 md:col-span-2"
                />
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-white">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


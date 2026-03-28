"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Layers3,
  RefreshCw,
  CheckCircle2,
  Clock3,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { lessonService } from "@/services/lessons.service";
import { unitService } from "@/services/units.service";

type LessonStatus = "ACTIVE" | "INACTIVE";
type LessonRow = {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  unitName: string;
  type: string;
  status: LessonStatus;
  orderIndex: number;
  duration: number;
  updatedAt: string;
};

type UnitOption = { id: string; name: string };

type VocabWord = { word: string; definition: string; ipa?: string };
type VocabularyContent = {
  type: "vocabulary";
  description: string;
  words: VocabWord[];
  tags?: string[];
};

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | LessonStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonRow[]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    unitId: "",
    title: "",
    description: "",
    type: "vocabulary",
    level: "A1",
    skillFocus: "vocabulary",
    orderIndex: "1",
    duration: "30",
    isActive: "active",
  });
  const [lessonForm, setLessonForm] = useState({
    unitId: "",
    title: "",
    description: "",
    type: "vocabulary",
    level: "A1",
    skillFocus: "vocabulary",
    orderIndex: "1",
    duration: "30",
    isActive: "active",
  });

  const defaultVocabularyContent = (): VocabularyContent => ({
    type: "vocabulary",
    description: "",
    words: [{ word: "", definition: "", ipa: "" }],
    tags: [],
  });

  const [createContent, setCreateContent] = useState<VocabularyContent>(defaultVocabularyContent());
  const [editContent, setEditContent] = useState<VocabularyContent>(defaultVocabularyContent());

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res: any = await lessonService.getAllLessons({ page: 1, limit: 500 });
      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const mapped: LessonRow[] = list.map((l) => {
        // Backend có thể trả `isActive` kiểu enum string ("active"/"inactive")
        // hoặc trả ở field `status`. Ưu tiên lấy đúng dữ liệu thay vì default "" -> active.
        const statusRaw = String(l?.isActive ?? l?.status ?? "").toLowerCase();
        const lessonStatus: LessonStatus =
          statusRaw === "inactive" ||
          statusRaw === "blocked" ||
          statusRaw === "deleted" ||
          statusRaw === "false" ||
          statusRaw === "0"
            ? "INACTIVE"
            : "ACTIVE";
        const updatedIso = l?.updatedAt || l?.createdAt || "";
        const unitId = String(
          l?.unitId?._id || l?.unitId?.id || l?.unit?._id || l?.unit?.id || l?.unitId || "",
        );
        return {
          id: String(l?._id || l?.id || ""),
          unitId,
          name: String(l?.title || l?.name || "Bài học chưa đặt tên"),
          description: l?.description || "",
          unitName: String(
            l?.unitId?.name || l?.unit?.name || l?.unitName || "Không rõ unit",
          ),
          type: String(l?.type || "N/A"),
          status: lessonStatus,
          orderIndex: Number(l?.orderIndex || 0),
          duration: Number(l?.duration || l?.timeLimit || 0),
          updatedAt: updatedIso
            ? new Date(updatedIso).toLocaleDateString("vi-VN")
            : "—",
        };
      });
      setLessons(mapped.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error) {
      console.error("Lỗi lấy danh sách bài học:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsForSelect = async () => {
    try {
      const res: any = await unitService.getAllUnits({ page: 1, limit: 500 });
      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setUnitOptions(
        list.map((u) => ({
          id: String(u?._id || u?.id || ""),
          name: String(u?.name || u?.title || "Unit"),
        })),
      );
    } catch {
      setUnitOptions([]);
    }
  };

  useEffect(() => {
    fetchLessons();
    fetchUnitsForSelect();
  }, []);

  useEffect(() => {
    // ensure defaults for create form content
    setCreateContent(defaultVocabularyContent());
  }, []);

  const resetLessonForm = () => {
    setLessonForm({
      unitId: "",
      title: "",
      description: "",
      type: "vocabulary",
      level: "A1",
      skillFocus: "vocabulary",
      orderIndex: "1",
      duration: "30",
      isActive: "active",
    });
    setCreateContent(defaultVocabularyContent());
    setThumbnailFile(null);
    setCreateError("");
    setCreateSuccess("");
  };

  const resetEditForm = () => {
    setEditForm({
      id: "",
      unitId: "",
      title: "",
      description: "",
      type: "vocabulary",
      level: "A1",
      skillFocus: "vocabulary",
      orderIndex: "1",
      duration: "30",
      isActive: "active",
    });
    setEditContent(defaultVocabularyContent());
    setEditThumbnailFile(null);
    setEditError("");
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.unitId.trim()) {
      setCreateError("Vui lòng chọn chủ đề (unit).");
      return;
    }
    if (!lessonForm.title.trim()) {
      setCreateError("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    if (lessonForm.type !== "vocabulary") {
      setCreateError("Hiện tại form chỉ hỗ trợ content dạng Từ vựng (vocabulary).");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      const contentObj: VocabularyContent = {
        ...createContent,
        type: "vocabulary",
        words: (createContent.words || []).filter(
          (w) => String(w.word || "").trim() && String(w.definition || "").trim(),
        ),
      };
      if (!contentObj.words.length) {
        setCreateError("Vui lòng nhập ít nhất 1 từ vựng (word + definition).");
        return;
      }

      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("unit", lessonForm.unitId.trim());
        fd.append("title", lessonForm.title.trim());
        fd.append("description", lessonForm.description.trim());
        fd.append("type", "vocabulary");
        fd.append("level", lessonForm.level);
        fd.append("orderIndex", lessonForm.orderIndex || "0");
        fd.append("estimatedDuration", lessonForm.duration || "0");
        fd.append("skillFocus", "vocabulary");
        fd.append("isActive", lessonForm.isActive);
        fd.append("thumbnail", thumbnailFile);
        fd.append("content", JSON.stringify(contentObj));
        await lessonService.createLesson(fd);
      } else {
        await lessonService.createLesson({
          unit: lessonForm.unitId.trim(),
          title: lessonForm.title.trim(),
          description: lessonForm.description.trim(),
          type: "vocabulary",
          level: lessonForm.level,
          orderIndex: Number(lessonForm.orderIndex || 0),
          estimatedDuration: Number(lessonForm.duration || 0),
          skillFocus: "vocabulary",
          isActive: lessonForm.isActive,
          content: contentObj,
        } as any);
      }
      setCreateSuccess("Tạo bài học thành công.");
      await fetchLessons();
      setTimeout(() => {
        setOpenCreate(false);
        resetLessonForm();
      }, 600);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setCreateError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tạo bài học.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa bài học này?");
    if (!ok) return;
    const prevLessons = lessons;
    setLessons((prev) => prev.filter((l) => l.id !== id));
    try {
      await lessonService.deleteLesson(id);
    } catch (error: any) {
      setLessons(prevLessons);
      alert(error?.response?.data?.message || "Không thể xóa bài học.");
    }
  };

  const handleOpenEdit = async (row: LessonRow) => {
    setEditError("");
    setEditThumbnailFile(null);
    try {
      const res: any = await lessonService.getLessonById(row.id);
      const detail = res?.data ?? res;

      const rawContent = detail?.content && typeof detail.content === "object" ? detail.content : null;
      const rawWords = Array.isArray(rawContent?.words) ? rawContent.words : [];
      const mappedWords: VocabWord[] = rawWords
        .map((w: any) => ({
          word: String(w?.word || ""),
          definition: String(w?.definition || ""),
          ipa: String(w?.ipa || ""),
        }))
        .filter((w: VocabWord) => w.word || w.definition || w.ipa);

      setEditForm({
        id: row.id,
        unitId: String(
          detail?.unit?._id ||
            detail?.unit?.id ||
            detail?.unitId?._id ||
            detail?.unitId?.id ||
            detail?.unit ||
            detail?.unitId ||
            row.unitId ||
            "",
        ),
        title: String(detail?.title || detail?.name || row.name || ""),
        description: String(detail?.description || row.description || ""),
        type: String(detail?.type || row.type || "vocabulary"),
        level: String(detail?.level || "A1"),
        skillFocus: String(detail?.skillFocus || "vocabulary"),
        orderIndex: String(detail?.orderIndex ?? row.orderIndex ?? 0),
        duration: String(detail?.estimatedDuration ?? detail?.duration ?? row.duration ?? 0),
        isActive: String(detail?.isActive || (row.status === "ACTIVE" ? "active" : "inactive")).toLowerCase(),
      });

      setEditContent({
        type: "vocabulary",
        description: String(rawContent?.description || detail?.description || ""),
        words: mappedWords.length ? mappedWords : [{ word: "", definition: "", ipa: "" }],
        tags: Array.isArray(rawContent?.tags) ? rawContent.tags : [],
      });
      setOpenEdit(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Không tải được chi tiết bài học.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    if (!editForm.unitId.trim()) {
      setEditError("Vui lòng chọn chủ đề (unit).");
      return;
    }
    if (!editForm.title.trim()) {
      setEditError("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    if (editForm.type !== "vocabulary") {
      setEditError("Hiện tại form chỉ hỗ trợ content dạng Từ vựng (vocabulary).");
      return;
    }
    try {
      setSavingEdit(true);
      setEditError("");

      const contentObj: VocabularyContent = {
        ...editContent,
        type: "vocabulary",
        words: (editContent.words || []).filter(
          (w) => String(w.word || "").trim() && String(w.definition || "").trim(),
        ),
      };
      if (!contentObj.words.length) {
        setEditError("Vui lòng nhập ít nhất 1 từ vựng (word + definition).");
        return;
      }

      if (editThumbnailFile) {
        const fd = new FormData();
        fd.append("unit", editForm.unitId.trim());
        fd.append("title", editForm.title.trim());
        fd.append("description", editForm.description.trim());
        fd.append("type", "vocabulary");
        fd.append("level", editForm.level);
        fd.append("orderIndex", editForm.orderIndex || "0");
        fd.append("estimatedDuration", editForm.duration || "0");
        fd.append("skillFocus", "vocabulary");
        fd.append("isActive", editForm.isActive);
        fd.append("thumbnail", editThumbnailFile);
        fd.append("content", JSON.stringify(contentObj));
        await lessonService.updateLesson(editForm.id, fd);
      } else {
        await lessonService.updateLesson(editForm.id, {
          unit: editForm.unitId.trim(),
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          type: "vocabulary",
          level: editForm.level,
          orderIndex: Number(editForm.orderIndex || 0),
          estimatedDuration: Number(editForm.duration || 0),
          skillFocus: "vocabulary",
          isActive: editForm.isActive,
          content: contentObj,
        });
      }
      setOpenEdit(false);
      resetEditForm();
      await fetchLessons();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setEditError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật bài học.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const okText =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.unitName.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase());
      const okStatus = status === "ALL" || l.status === status;
      return okText && okStatus;
    });
  }, [search, status, lessons]);

  const activeCount = lessons.filter((x) => x.status === "ACTIVE").length;
  const inactiveCount = lessons.filter((x) => x.status === "INACTIVE").length;

  const statusBadge = (s: LessonStatus) => {
    if (s === "ACTIVE") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Quản lý bài học
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dữ liệu đồng bộ từ API `GET /lessons`.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLessons}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
            <button
              type="button"
              onClick={() => {
                resetLessonForm();
                setOpenCreate(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus size={18} /> Tạo lesson
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Tổng bài học</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{lessons.length}</p>
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
              placeholder="Tìm theo tên bài học / unit..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-slate-500" />
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  status === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Bài học</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Unit</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-center">Thời lượng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{l.name}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {l.id}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-md">
                    <span className="line-clamp-2">{l.description || "—"}</span>
                  </td>
                  <td className="p-4 text-slate-600">{l.unitName}</td>
                  <td className="p-4 text-center text-slate-600">{l.orderIndex}</td>
                  <td className="p-4 text-center text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} /> {l.duration || 0}m
                    </span>
                  </td>
                  <td className="p-4 text-center">{statusBadge(l.status)}</td>
                  <td className="p-4 text-slate-500">{l.updatedAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(l.id)}
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
            <div className="p-10 text-center text-slate-500">Đang tải dữ liệu bài học...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={24} />
              Không có bài học phù hợp bộ lọc.
            </div>
          ) : null}
        </div>
      </div>

      {openCreate && (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(720px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">Tạo bài học mới</h2>
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {createError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 font-semibold">
                    {createSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-bold text-slate-600">
                    Chủ đề (Unit) *
                    <select
                      value={lessonForm.unitId}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, unitId: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white"
                    >
                      <option value="">— Chọn unit —</option>
                      {unitOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề bài học *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Mô tả ngắn"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={lessonForm.type}
                      onChange={(e) =>
                        setLessonForm((p) => ({
                          ...p,
                          type: e.target.value,
                          skillFocus: e.target.value,
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="vocabulary">Từ vựng</option>
                      <option value="grammar">Ngữ pháp</option>
                      <option value="reading">Đọc hiểu</option>
                      <option value="listening">Nghe</option>
                      <option value="speaking">Nói</option>
                      <option value="writing">Viết</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="quiz">Quiz</option>
                      <option value="review">Ôn tập</option>
                    </select>
                    <select
                      value={lessonForm.level}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          Level {lv}
                        </option>
                      ))}
                    </select>
                    <select
                      value={lessonForm.isActive}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, isActive: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                    <input
                      type="number"
                      value={lessonForm.orderIndex}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, orderIndex: e.target.value }))
                      }
                      placeholder="Thứ tự (order)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      placeholder="Thời lượng (phút)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-bold text-slate-600 mb-2">
                      Content (Từ vựng)
                    </div>
                    <textarea
                      value={createContent.description}
                      onChange={(e) =>
                        setCreateContent((c) => ({ ...c, description: e.target.value }))
                      }
                      placeholder="Mô tả (tuỳ chọn)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-20"
                    />
                    <div className="mt-3 space-y-2">
                      {createContent.words.map((w, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                          <input
                            value={w.word}
                            onChange={(e) =>
                              setCreateContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, word: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="word"
                            className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <input
                            value={w.definition}
                            onChange={(e) =>
                              setCreateContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, definition: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="definition"
                            className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <input
                            value={w.ipa || ""}
                            onChange={(e) =>
                              setCreateContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, ipa: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="ipa"
                            className="sm:col-span-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <div className="sm:col-span-6 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setCreateContent((c) => ({
                                  ...c,
                                  words:
                                    c.words.length <= 1
                                      ? c.words
                                      : c.words.filter((_, i) => i !== idx),
                                }))
                              }
                              className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Xóa dòng
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setCreateContent((c) => ({
                            ...c,
                            words: [...c.words, { word: "", definition: "", ipa: "" }],
                          }))
                        }
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        + Thêm từ
                      </button>
                    </div>
                  </div>
                  <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                    <span className="text-xs font-semibold text-slate-600">
                      Ảnh đại diện (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreateLesson}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo bài học"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openEdit && (
        <div className="fixed inset-0 z-[130] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(720px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">Chỉnh sửa bài học</h2>
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                    resetEditForm();
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {editError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-bold text-slate-600">
                    Chủ đề (Unit) *
                    <select
                      value={editForm.unitId}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, unitId: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white"
                    >
                      <option value="">— Chọn unit —</option>
                      {unitOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề bài học *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Mô tả ngắn"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          type: e.target.value,
                          skillFocus: e.target.value,
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="vocabulary">Từ vựng</option>
                      <option value="grammar">Ngữ pháp</option>
                      <option value="reading">Đọc hiểu</option>
                      <option value="listening">Nghe</option>
                      <option value="speaking">Nói</option>
                      <option value="writing">Viết</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="quiz">Quiz</option>
                      <option value="review">Ôn tập</option>
                    </select>
                    <select
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          Level {lv}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.isActive}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, isActive: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                    <input
                      type="number"
                      value={editForm.orderIndex}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, orderIndex: e.target.value }))
                      }
                      placeholder="Thứ tự (order)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      placeholder="Thời lượng (phút)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-bold text-slate-600 mb-2">
                      Content (Từ vựng)
                    </div>
                    <textarea
                      value={editContent.description}
                      onChange={(e) =>
                        setEditContent((c) => ({ ...c, description: e.target.value }))
                      }
                      placeholder="Mô tả (tuỳ chọn)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-20"
                    />
                    <div className="mt-3 space-y-2">
                      {editContent.words.map((w, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                          <input
                            value={w.word}
                            onChange={(e) =>
                              setEditContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, word: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="word"
                            className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <input
                            value={w.definition}
                            onChange={(e) =>
                              setEditContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, definition: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="definition"
                            className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <input
                            value={w.ipa || ""}
                            onChange={(e) =>
                              setEditContent((c) => ({
                                ...c,
                                words: c.words.map((x, i) =>
                                  i === idx ? { ...x, ipa: e.target.value } : x,
                                ),
                              }))
                            }
                            placeholder="ipa"
                            className="sm:col-span-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                          />
                          <div className="sm:col-span-6 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setEditContent((c) => ({
                                  ...c,
                                  words:
                                    c.words.length <= 1
                                      ? c.words
                                      : c.words.filter((_, i) => i !== idx),
                                }))
                              }
                              className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Xóa dòng
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setEditContent((c) => ({
                            ...c,
                            words: [...c.words, { word: "", definition: "", ipa: "" }],
                          }))
                        }
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        + Thêm từ
                      </button>
                    </div>
                  </div>
                  <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                    <span className="text-xs font-semibold text-slate-600">
                      Cập nhật ảnh đại diện (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditThumbnailFile(e.target.files?.[0] || null)
                      }
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                    resetEditForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
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


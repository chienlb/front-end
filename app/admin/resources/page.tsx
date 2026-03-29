"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookText,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  Plus,
  X,
  Pencil,
  Eye,
} from "lucide-react";
import { literatureService } from "@/services/literatures.service";
import { showAlert, showConfirm } from "@/utils/dialog";

type LiteratureRow = {
  id: string;
  title: string;
  type: string;
  level: string;
  isPublished: boolean;
  imageUrl?: string;
  updatedAt: string;
};

function getTypeLabelVi(type: string): string {
  const t = String(type || "").toLowerCase();
  if (t === "poem") return "Thơ";
  if (t === "story") return "Truyện";
  if (t === "article") return "Bài viết";
  if (t === "dialogue") return "Hội thoại";
  if (t === "comic") return "Truyện tranh";
  if (t === "song") return "Bài hát";
  if (!t || t === "n/a") return "—";
  return type;
}

function getLevelLabelVi(level: string): string {
  const l = String(level || "").toLowerCase();
  if (l === "starter") return "Starter";
  if (l === "beginner") return "Beginner";
  if (l === "elementary") return "Elementary";
  if (l === "pre-intermediate") return "Pre-Intermediate";
  if (l === "intermediate") return "Intermediate";
  return level || "—";
}

function pickLiteratureImageUrl(it: any): string {
  const candidates = [
    it?.imageUrl,
    it?.image,
    it?.thumbnail,
    it?.thumbnailUrl,
    it?.cover,
    it?.coverUrl,
    it?.banner,
    it?.bannerUrl,
    it?.imageURL,
  ];
  const raw = candidates.find((x) => typeof x === "string" && x.trim().length > 0);
  return typeof raw === "string" ? raw : "";
}

function extractLiteratureList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const directKeys = [
    "data",
    "items",
    "results",
    "docs",
    "literatures",
    "rows",
  ];

  for (const key of directKeys) {
    const v = payload[key];
    if (Array.isArray(v)) return v;
  }

  // Hỗ trợ dạng lồng: { data: { data: [...] } } hoặc { result: { items: [...] } }
  for (const key of ["data", "result", "payload"]) {
    const nested = payload[key];
    if (nested && typeof nested === "object") {
      for (const k of directKeys) {
        const v = nested[k];
        if (Array.isArray(v)) return v;
      }
    }
  }

  return [];
}

export default function ResourceLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<LiteratureRow[]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>("");
  const [comicFiles, setComicFiles] = useState<(File | null)[]>([]);
  const [comicPreviewUrls, setComicPreviewUrls] = useState<string[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreviewUrl, setEditCoverPreviewUrl] = useState<string>("");
  const [editComicFiles, setEditComicFiles] = useState<(File | null)[]>([]);
  const [editComicPreviewUrls, setEditComicPreviewUrls] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    type: "poem",
    level: "starter",
    topic: "",
    contentEnglish: "",
    contentVietnamese: "",
    audioUrl: "",
    videoUrl: "",
    isPublished: "false",
  });
  const [litForm, setLitForm] = useState({
    title: "",
    type: "poem",
    level: "starter",
    topic: "",
    contentEnglish: "",
    contentVietnamese: "",
    audioUrl: "",
    videoUrl: "",
    isPublished: "false",
  });

  const fetchLiteratures = async () => {
    try {
      setLoading(true);
      const res: any = await literatureService.getAllLiteratures({
        page: 1,
        limit: 200,
        type: selectedType,
      });
      const payload = res?.data ?? res;
      const list: any[] = extractLiteratureList(payload);

      const mapped: LiteratureRow[] = list.map((it) => {
        const updatedIso = it?.updatedAt || it?.createdAt || "";
        const imageUrl = pickLiteratureImageUrl(it);
        return {
          id: String(it?._id || it?.id || ""),
          title: String(it?.title || it?.name || "Văn bản chưa đặt tên"),
          type: String(it?.type || "N/A"),
          level: String(it?.level || "—"),
          isPublished: Boolean(it?.isPublished ?? it?.status === "published"),
          imageUrl,
          updatedAt: updatedIso
            ? new Date(updatedIso).toLocaleDateString("vi-VN")
            : "—",
        };
      });
      setRows(mapped.filter((x) => x.id || x.title));
    } catch (error) {
      console.error("Lỗi lấy danh sách văn/thơ:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiteratures();
  }, [selectedType]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    // revoke old urls
    comicPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    if (!comicFiles.length) {
      setComicPreviewUrls([]);
      return;
    }
    const urls = comicFiles.map((f) => (f ? URL.createObjectURL(f) : ""));
    setComicPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicFiles]);

  useEffect(() => {
    if (!editCoverFile) {
      setEditCoverPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(editCoverFile);
    setEditCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [editCoverFile]);

  useEffect(() => {
    editComicPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    if (!editComicFiles.length) {
      setEditComicPreviewUrls([]);
      return;
    }
    const urls = editComicFiles.map((f) => (f ? URL.createObjectURL(f) : ""));
    setEditComicPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editComicFiles]);

  const resetLitForm = () => {
    setLitForm({
      title: "",
      type: "poem",
      level: "starter",
      topic: "",
      contentEnglish: "",
      contentVietnamese: "",
      audioUrl: "",
      videoUrl: "",
      isPublished: "false",
    });
    setCoverFile(null);
    setCoverPreviewUrl("");
    setComicFiles([]);
    setComicPreviewUrls([]);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreateLiterature = async () => {
    if (!litForm.title.trim()) {
      setCreateError("Vui lòng nhập tiêu đề bài thơ / văn.");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      const fd = new FormData();
      fd.append("title", litForm.title.trim());
      fd.append("type", litForm.type);
      fd.append("level", litForm.level);
      fd.append("topic", litForm.topic.trim());
      fd.append("contentEnglish", litForm.contentEnglish);
      fd.append("contentVietnamese", litForm.contentVietnamese);
      if (litForm.audioUrl.trim()) fd.append("audioUrl", litForm.audioUrl.trim());
      if (litForm.videoUrl.trim()) fd.append("videoUrl", litForm.videoUrl.trim());
      fd.append("isPublished", litForm.isPublished);
      if (coverFile) fd.append("image", coverFile);
      if (litForm.type === "comic" && comicFiles.length > 0) {
        // Upload multiple comic pages. Backend should map them to `images[]`.
        comicFiles.filter(Boolean).forEach((file) => fd.append("images", file as File));
      }

      await literatureService.createLiterature(fd);
      setCreateSuccess("Tạo tác phẩm thành công.");
      await fetchLiteratures();
      setTimeout(() => {
        setOpenCreate(false);
        resetLitForm();
      }, 600);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setCreateError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tạo tác phẩm.",
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDeleteLiterature = async (id: string) => {
    const ok = await showConfirm("Bạn có chắc muốn xóa tác phẩm này?", "Xóa tác phẩm");
    if (!ok) return;
    try {
      await literatureService.deleteLiterature(id);
      await fetchLiteratures();
      await showAlert("Đã xóa tác phẩm thành công.", "Thành công");
    } catch (error: any) {
      await showAlert(
        error?.response?.data?.message || "Không thể xóa tác phẩm.",
        "Xóa thất bại",
      );
    }
  };

  const handleOpenEdit = async (row: LiteratureRow) => {
    try {
      setEditError("");
      setEditSuccess("");
      setSavingEdit(false);
      setEditCoverFile(null);
      setEditCoverPreviewUrl("");
      setEditComicFiles([]);
      setEditComicPreviewUrls([]);

      const res: any = await literatureService.getLiteratureById(row.id);
      const detail = res?.data ?? res;
      setEditForm({
        id: row.id,
        title: String(detail?.title || ""),
        type: String(detail?.type || "poem"),
        level: String(detail?.level || "starter"),
        topic: String(detail?.topic || ""),
        contentEnglish: String(detail?.contentEnglish || ""),
        contentVietnamese: String(detail?.contentVietnamese || ""),
        audioUrl: String(detail?.audioUrl || ""),
        videoUrl: String((detail as any)?.videoUrl || ""),
        isPublished: String(Boolean(detail?.isPublished) ? "true" : "false"),
      });
      setOpenEdit(true);
    } catch (error: any) {
      await showAlert(
        error?.response?.data?.message || "Không thể mở dữ liệu chỉnh sửa.",
        "Không thể mở chỉnh sửa",
      );
    }
  };

  const resetEdit = () => {
    setOpenEdit(false);
    setSavingEdit(false);
    setEditError("");
    setEditSuccess("");
    setEditCoverFile(null);
    setEditCoverPreviewUrl("");
    setEditComicFiles([]);
    setEditComicPreviewUrls([]);
    setEditForm({
      id: "",
      title: "",
      type: "poem",
      level: "starter",
      topic: "",
      contentEnglish: "",
      contentVietnamese: "",
      audioUrl: "",
      videoUrl: "",
      isPublished: "false",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    if (!editForm.title.trim()) {
      setEditError("Vui lòng nhập tiêu đề bài thơ / văn.");
      return;
    }
    try {
      setSavingEdit(true);
      setEditError("");
      setEditSuccess("");

      const fd = new FormData();
      fd.append("title", editForm.title.trim());
      fd.append("type", editForm.type);
      fd.append("level", editForm.level);
      fd.append("topic", editForm.topic.trim());
      fd.append("contentEnglish", editForm.contentEnglish);
      fd.append("contentVietnamese", editForm.contentVietnamese);
      if (editForm.audioUrl.trim()) fd.append("audioUrl", editForm.audioUrl.trim());
      if (editForm.videoUrl.trim()) fd.append("videoUrl", editForm.videoUrl.trim());
      fd.append("isPublished", editForm.isPublished);
      if (editCoverFile) fd.append("image", editCoverFile);
      if (editForm.type === "comic" && editComicFiles.length > 0) {
        editComicFiles.filter(Boolean).forEach((file) => fd.append("images", file as File));
      }

      await literatureService.updateLiterature(editForm.id, fd);
      setEditSuccess("Cập nhật tác phẩm thành công.");
      await fetchLiteratures();
      setTimeout(() => resetEdit(), 500);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setEditError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật tác phẩm.");
    } finally {
      setSavingEdit(false);
    }
  };

  const publishedCount = rows.filter((x) => x.isPublished).length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookText size={24} className="text-indigo-600" />
              Thư viện văn học
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách văn/thơ đồng bộ từ API thư viện văn học.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiteratures}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
            <button
              type="button"
              onClick={() => {
                resetLitForm();
                setOpenCreate(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus size={18} /> Thêm thơ / văn
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Tổng tác phẩm</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{rows.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Đã xuất bản</p>
            <p className="text-2xl font-black text-green-600 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Nháp/chưa xuất bản</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {Math.max(0, rows.length - publishedCount)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, tác giả, thể loại..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Filter size={16} className="text-slate-500 mt-2" />
            {[
              { id: "all", label: "Tất cả" },
              { id: "poem", label: "Thơ" },
              { id: "story", label: "Truyện" },
              { id: "dialogue", label: "Hội thoại" },
              { id: "song", label: "Bài hát" },
              { id: "comic", label: "Truyện tranh" },
              { id: "article", label: "Bài viết" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition whitespace-nowrap ${
                  selectedType === type.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Tác phẩm</th>
                <th className="p-4 text-center">Ảnh</th>
                <th className="p-4">Thể loại</th>
                <th className="p-4">Cấp độ</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {r.id}</p>
                  </td>
                  <td className="p-4 text-center">
                    {r.imageUrl ? (
                      <img
                        src={encodeURI(r.imageUrl)}
                        alt={r.title}
                        className="w-14 h-10 rounded-lg object-cover border border-slate-200 inline-block bg-slate-50"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{getTypeLabelVi(r.type)}</td>
                  <td className="p-4 text-slate-600">{getLevelLabelVi(r.level)}</td>
                  <td className="p-4 text-center">
                    {r.isPublished ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        Bản nháp
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{r.updatedAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/literatures/${r.id}`}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition inline-flex items-center gap-1"
                        title="Xem"
                      >
                        <Eye size={13} /> Xem
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                        title="Sửa"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLiterature(r.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-10 text-center text-slate-500">Đang tải danh sách văn/thơ...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={24} />
              Không có dữ liệu phù hợp.
            </div>
          ) : null}

          {!loading && filteredRows.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Trang {currentPage}/{totalPages} • Tổng {filteredRows.length} tác phẩm
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {openCreate && (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(720px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">Thêm thơ / văn</h2>
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
                  <input
                    value={litForm.title}
                    onChange={(e) =>
                      setLitForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={litForm.type}
                      onChange={(e) =>
                        setLitForm((p) => ({ ...p, type: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="poem">Thơ</option>
                      <option value="story">Truyện</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="comic">Truyện tranh</option>
                      <option value="song">Bài hát</option>
                      <option value="article">Bài viết</option>
                    </select>
                    <select
                      value={litForm.level}
                      onChange={(e) =>
                        setLitForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="starter">Starter</option>
                      <option value="beginner">Beginner</option>
                      <option value="elementary">Elementary</option>
                      <option value="pre-intermediate">Pre-Intermediate</option>
                      <option value="intermediate">Intermediate</option>
                    </select>
                  </div>
                  <input
                    value={litForm.topic}
                    onChange={(e) =>
                      setLitForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    placeholder="Chủ đề (VD: animals, friendship, school...)"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={litForm.contentEnglish}
                    onChange={(e) =>
                      setLitForm((p) => ({ ...p, contentEnglish: e.target.value }))
                    }
                    placeholder="Nội dung tiếng Anh"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-28"
                  />
                  <textarea
                    value={litForm.contentVietnamese}
                    onChange={(e) =>
                      setLitForm((p) => ({
                        ...p,
                        contentVietnamese: e.target.value,
                      }))
                    }
                    placeholder="Nội dung tiếng Việt (bản dịch / ghi chú)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-28"
                  />
                  <input
                    value={litForm.audioUrl}
                    onChange={(e) =>
                      setLitForm((p) => ({ ...p, audioUrl: e.target.value }))
                    }
                    placeholder="Audio URL (tuỳ chọn)"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  {litForm.type === "song" ? (
                    <input
                      value={litForm.videoUrl}
                      onChange={(e) =>
                        setLitForm((p) => ({ ...p, videoUrl: e.target.value }))
                      }
                      placeholder="Video URL (YouTube) (tuỳ chọn)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  ) : null}
                  <select
                    value={litForm.isPublished}
                    onChange={(e) =>
                      setLitForm((p) => ({ ...p, isPublished: e.target.value }))
                    }
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="false">Lưu nháp</option>
                    <option value="true">Xuất bản</option>
                  </select>
                  <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                    <span className="text-xs font-semibold text-slate-600">
                      Ảnh bìa (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCoverFile(e.target.files?.[0] || null)
                      }
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                  {litForm.type === "comic" ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Ảnh truyện tranh (từng trang)
                        </span>
                        <button
                          type="button"
                          onClick={() => setComicFiles((p) => [...(p.length ? p : [null]), null])}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        >
                          + Thêm tranh
                        </button>
                      </div>

                      {(comicFiles.length ? comicFiles : [null]).map((file, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-slate-600">
                              Trang {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setComicFiles((p) =>
                                  p.length <= 1
                                    ? [null]
                                    : p.filter((_, i) => i !== idx),
                                )
                              }
                              className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Xóa trang
                            </button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setComicFiles((p) => {
                                const base = p.length ? [...p] : [null];
                                base[idx] = f;
                                return base;
                              });
                            }}
                            className="block w-full text-sm"
                          />
                          {comicPreviewUrls[idx] ? (
                            <img
                              src={comicPreviewUrls[idx]}
                              alt={`comic-${idx + 1}`}
                              className="mt-3 h-32 w-full object-cover rounded-lg border border-slate-200 bg-white"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {coverPreviewUrl ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-bold text-slate-600 mb-2">
                        Xem trước ảnh bìa
                      </div>
                      <img
                        src={coverPreviewUrl}
                        alt="cover preview"
                        className="w-full max-h-64 object-contain rounded-lg bg-slate-50 border border-slate-100"
                      />
                    </div>
                  ) : null}
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
                  onClick={handleCreateLiterature}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo tác phẩm"}
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
                <h2 className="text-lg font-black text-slate-800">Chỉnh sửa thơ / văn</h2>
                <button
                  type="button"
                  onClick={resetEdit}
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
                {editSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 font-semibold">
                    {editSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, type: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="poem">Thơ</option>
                      <option value="story">Truyện</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="comic">Truyện tranh</option>
                      <option value="song">Bài hát</option>
                      <option value="article">Bài viết</option>
                    </select>
                    <select
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="starter">Starter</option>
                      <option value="beginner">Beginner</option>
                      <option value="elementary">Elementary</option>
                      <option value="pre-intermediate">Pre-Intermediate</option>
                      <option value="intermediate">Intermediate</option>
                    </select>
                    <select
                      value={editForm.isPublished}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, isPublished: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="false">Lưu nháp</option>
                      <option value="true">Xuất bản</option>
                    </select>
                  </div>
                  <input
                    value={editForm.topic}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    placeholder="Chủ đề (VD: animals, friendship, school...)"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={editForm.contentEnglish}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, contentEnglish: e.target.value }))
                    }
                    placeholder="Nội dung tiếng Anh"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-28"
                  />
                  <textarea
                    value={editForm.contentVietnamese}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, contentVietnamese: e.target.value }))
                    }
                    placeholder="Nội dung tiếng Việt (bản dịch / ghi chú)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-28"
                  />
                  <input
                    value={editForm.audioUrl}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, audioUrl: e.target.value }))
                    }
                    placeholder="Audio URL (tuỳ chọn)"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  {editForm.type === "song" ? (
                    <input
                      value={editForm.videoUrl}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, videoUrl: e.target.value }))
                      }
                      placeholder="Video URL (YouTube) (tuỳ chọn)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  ) : null}
                  <label className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                    <span className="text-xs font-semibold text-slate-600">
                      Ảnh bìa (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditCoverFile(e.target.files?.[0] || null)
                      }
                      className="mt-1 block w-full text-sm"
                    />
                  </label>
                  {editForm.type === "comic" ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Ảnh truyện tranh (từng trang)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditComicFiles((p) => [...(p.length ? p : [null]), null])
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        >
                          + Thêm tranh
                        </button>
                      </div>

                      {(editComicFiles.length ? editComicFiles : [null]).map((file, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-slate-600">
                              Trang {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setEditComicFiles((p) =>
                                  p.length <= 1
                                    ? [null]
                                    : p.filter((_, i) => i !== idx),
                                )
                              }
                              className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Xóa trang
                            </button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setEditComicFiles((p) => {
                                const base = p.length ? [...p] : [null];
                                base[idx] = f;
                                return base;
                              });
                            }}
                            className="block w-full text-sm"
                          />
                          {editComicPreviewUrls[idx] ? (
                            <img
                              src={editComicPreviewUrls[idx]}
                              alt={`comic-${idx + 1}`}
                              className="mt-3 h-32 w-full object-cover rounded-lg border border-slate-200 bg-white"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {editCoverPreviewUrl ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-bold text-slate-600 mb-2">
                        Xem trước ảnh bìa
                      </div>
                      <img
                        src={editCoverPreviewUrl}
                        alt="cover preview"
                        className="w-full max-h-64 object-contain rounded-lg bg-slate-50 border border-slate-100"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={resetEdit}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Search, RefreshCw, CheckCircle2, Plus, Pencil, Trash2, X } from "lucide-react";
import { competitionService } from "@/services/competition.service";

type CompetitionRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  participants: number;
};

type CompetitionQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  score: number;
  type: string;
  explanation?: string;
};

type CompetitionForm = {
  name: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  totalParticipants: number;
  status: string;
  isPublished: boolean;
  visibility: string;
  listQuestion: CompetitionQuestion[];
};

function toDateText(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("vi-VN");
}

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export default function AdminCompetitionsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CompetitionRow[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string>("");
  const [form, setForm] = useState<CompetitionForm>({
    name: "",
    description: "",
    type: "rank",
    startTime: "",
    endTime: "",
    totalParticipants: 0,
    status: "upcoming",
    isPublished: true,
    visibility: "public",
    listQuestion: [
      {
        question: "",
        options: [""],
        correctAnswer: "",
        score: 10,
        type: "multiple_choice",
        explanation: "",
      },
    ],
  });

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const res: any = await competitionService.getAllCompetitions();
      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.competitions)
            ? payload.competitions
            : [];

      const mapped: CompetitionRow[] = list.map((c) => ({
        id: String(c?._id || c?.id || ""),
        title: String(c?.title || c?.name || "Cuộc thi chưa đặt tên"),
        type: String(c?.type || c?.category || "N/A"),
        status: String(c?.status || "unknown").toUpperCase(),
        startDate: toDateText(c?.startDate || c?.startTime || c?.startAt || c?.start),
        endDate: toDateText(c?.endDate || c?.endTime || c?.endAt || c?.end),
        participants: Number(c?.participantsCount || c?.participants || c?.participantCount || c?.totalParticipants || 0),
      }));
      setRows(mapped);
    } catch (error) {
      console.error("Lỗi lấy danh sách cuộc thi:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const resetForm = () => {
    setEditingId("");
    setFormError("");
    setForm({
      name: "",
      description: "",
      type: "rank",
      startTime: "",
      endTime: "",
      totalParticipants: 0,
      status: "upcoming",
      isPublished: true,
      visibility: "public",
      listQuestion: [
        {
          question: "",
          options: [""],
          correctAnswer: "",
          score: 10,
          type: "multiple_choice",
          explanation: "",
        },
      ],
    });
  };

  const openCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = async (id: string) => {
    try {
      setFormError("");
      setEditingId(id);
      const res: any = await competitionService.getCompetitionById(id);
      const data = res?.data ?? res;

      const listQuestion = Array.isArray(data?.listQuestion) ? data.listQuestion : [];
      setForm({
        name: String(data?.name || data?.title || ""),
        description: String(data?.description || ""),
        type: String(data?.type || "rank"),
        startTime: toDatetimeLocalValue(String(data?.startTime || data?.startDate || data?.startAt || data?.start || "")),
        endTime: toDatetimeLocalValue(String(data?.endTime || data?.endDate || data?.endAt || data?.end || "")),
        totalParticipants: Number(data?.totalParticipants || 0),
        status: String(data?.status || "upcoming"),
        isPublished: Boolean(data?.isPublished ?? true),
        visibility: String(data?.visibility || "public"),
        listQuestion:
          listQuestion.length > 0
            ? listQuestion
            : [
                {
                  question: "",
                  options: [""],
                  correctAnswer: "",
                  score: 10,
                  type: "multiple_choice",
                  explanation: "",
                },
              ],
      });
      setOpenForm(true);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Không thể mở dữ liệu cuộc thi.");
    }
  };

  const getCurrentUserId = (): string => {
    if (typeof window === "undefined") return "";
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return "";
      const user = JSON.parse(raw);
      return String(user?._id || user?.id || "");
    } catch {
      return "";
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên cuộc thi.");
      return;
    }
    const questions = form.listQuestion;
    if (!Array.isArray(questions) || questions.length === 0) {
      setFormError("Vui lòng thêm ít nhất 1 câu hỏi.");
      return;
    }
    const hasInvalidQuestion = questions.some(
      (q) => !q.question?.trim() || !q.correctAnswer?.trim() || !Array.isArray(q.options) || q.options.length === 0,
    );
    if (hasInvalidQuestion) {
      setFormError("Mỗi câu hỏi cần có đề bài, đáp án đúng và ít nhất 1 lựa chọn.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      setFormError("Vui lòng chọn thời gian bắt đầu/kết thúc.");
      return;
    }
    const createdBy = getCurrentUserId();
    if (!createdBy) {
      setFormError("Không lấy được userId từ currentUser. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        startTime: datetimeLocalToIso(form.startTime),
        endTime: datetimeLocalToIso(form.endTime),
        createdBy,
        totalParticipants: Number(form.totalParticipants || 0),
        status: form.status,
        isPublished: Boolean(form.isPublished),
        visibility: form.visibility,
        listQuestion: questions,
      };

      if (editingId) {
        await competitionService.updateCompetition(editingId, payload);
      } else {
        await competitionService.createCompetition(payload);
      }
      setOpenForm(false);
      resetForm();
      await fetchCompetitions();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể lưu cuộc thi.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa cuộc thi này?");
    if (!ok) return;
    try {
      await competitionService.deleteCompetition(id);
      await fetchCompetitions();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Không thể xóa cuộc thi.");
    }
  };

  const addQuestion = () => {
    setForm((p) => ({
      ...p,
      listQuestion: [
        ...p.listQuestion,
        {
          question: "",
          options: [""],
          correctAnswer: "",
          score: 10,
          type: "multiple_choice",
          explanation: "",
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((p) => ({
      ...p,
      listQuestion: p.listQuestion.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, patch: Partial<CompetitionQuestion>) => {
    setForm((p) => ({
      ...p,
      listQuestion: p.listQuestion.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  };

  const addOption = (qIndex: number) => {
    setForm((p) => ({
      ...p,
      listQuestion: p.listQuestion.map((q, i) =>
        i === qIndex ? { ...q, options: [...(q.options || []), ""] } : q,
      ),
    }));
  };

  const updateOption = (qIndex: number, optionIndex: number, value: string) => {
    setForm((p) => ({
      ...p,
      listQuestion: p.listQuestion.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOptions = [...(q.options || [])];
        nextOptions[optionIndex] = value;
        return { ...q, options: nextOptions };
      }),
    }));
  };

  const removeOption = (qIndex: number, optionIndex: number) => {
    setForm((p) => ({
      ...p,
      listQuestion: p.listQuestion.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOptions = (q.options || []).filter((_, idx) => idx !== optionIndex);
        return { ...q, options: nextOptions.length > 0 ? nextOptions : [""] };
      }),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              Quản lý cuộc thi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách cuộc thi đồng bộ từ API `GET /competitions`.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCompetitions}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition inline-flex items-center gap-2"
            >
              <Plus size={16} /> Tạo cuộc thi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Tổng cuộc thi</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{rows.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Đang mở</p>
            <p className="text-2xl font-black text-green-600 mt-1">
              {rows.filter((x) => x.status.includes("OPEN") || x.status.includes("ACTIVE")).length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Đã kết thúc</p>
            <p className="text-2xl font-black text-slate-600 mt-1">
              {rows.filter((x) => x.status.includes("ENDED") || x.status.includes("CLOSED")).length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên cuộc thi..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Cuộc thi</th>
                <th className="p-4">Loại</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Bắt đầu</th>
                <th className="p-4">Kết thúc</th>
                <th className="p-4 text-center">Tham gia</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {r.id}</p>
                  </td>
                  <td className="p-4 text-slate-600">{r.type}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{r.startDate}</td>
                  <td className="p-4 text-slate-600">{r.endDate}</td>
                  <td className="p-4 text-center text-slate-600">{r.participants}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
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
            <div className="p-10 text-center text-slate-500">Đang tải danh sách cuộc thi...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={24} />
              Không có cuộc thi phù hợp.
            </div>
          ) : null}
        </div>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-[130] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(980px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">
                  {editingId ? "Chỉnh sửa cuộc thi" : "Tạo cuộc thi"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setOpenForm(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Tên cuộc thi *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                  />
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="rank">Rank</option>
                    <option value="practice">Practice</option>
                    <option value="tournament">Tournament</option>
                  </select>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả"
                    className="lg:col-span-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 min-h-20"
                  />
                  <label className="text-xs font-bold text-slate-600">
                    Bắt đầu *
                    <input
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Kết thúc *
                    <input
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                    />
                  </label>
                  <input
                    type="number"
                    value={form.totalParticipants}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, totalParticipants: Number(e.target.value || 0) }))
                    }
                    placeholder="Tổng người tham gia"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="ended">Ended</option>
                  </select>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                      className="w-5 h-5 accent-amber-600"
                    />
                    Xuất bản
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-600">Danh sách câu hỏi *</div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>
                  {form.listQuestion.map((q, qIndex) => (
                    <div key={qIndex} className="rounded-xl border border-slate-200 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-700">Câu hỏi {qIndex + 1}</div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        >
                          Xóa câu
                        </button>
                      </div>
                      <input
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                        placeholder="Nội dung câu hỏi"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                          placeholder="Đáp án đúng"
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                        />
                        <input
                          type="number"
                          value={q.score}
                          onChange={(e) => updateQuestion(qIndex, { score: Number(e.target.value || 0) })}
                          placeholder="Điểm"
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                        />
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(qIndex, { type: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 bg-white"
                        >
                          <option value="multiple_choice">Trắc nghiệm (multiple_choice)</option>
                          <option value="true_false">Đúng / Sai (true_false)</option>
                          <option value="short_answer">Trả lời ngắn (short_answer)</option>
                        </select>
                      </div>
                      <textarea
                        value={q.explanation || ""}
                        onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                        placeholder="Giải thích (tuỳ chọn)"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 min-h-16"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-600">Lựa chọn</div>
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="px-2 py-1 rounded text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                          >
                            + Thêm lựa chọn
                          </button>
                        </div>
                        {(q.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              value={opt}
                              onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`Lựa chọn ${optIndex + 1}`}
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setOpenForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


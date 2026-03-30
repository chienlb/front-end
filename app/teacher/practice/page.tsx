"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CircleAlert,
  Dumbbell,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import { practiceService } from "@/services/practice.service";
import { groupsService } from "@/services/groups.service";

export default function QuestionManager() {
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      groupName: string;
    }>
  >([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const keys = ["items", "data", "results", "docs", "rows", "members", "users"];
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

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const res: any = await groupsService.getAllMembersInTeacherGroups();
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped = list.map((it: any, idx: number) => {
        const profile = it?.user ?? it?.student ?? it?.member ?? it;
        return {
          id: String(it?._id ?? it?.id ?? profile?._id ?? profile?.id ?? `student-${idx}`),
          name: String(profile?.fullName ?? profile?.name ?? it?.fullName ?? it?.name ?? "Học viên"),
          email: String(profile?.email ?? it?.email ?? ""),
          groupName: String(it?.group?.groupName ?? it?.groupName ?? ""),
        };
      });

      const deduped = new Map<string, (typeof mapped)[number]>();
      mapped.forEach((st) => {
        if (!deduped.has(st.id)) deduped.set(st.id, st);
      });

      const uniqStudents = Array.from(deduped.values());
      setStudents(uniqStudents);
      if (uniqStudents.length > 0) {
        setSelectedStudentId((prev) => prev || uniqStudents[0].id);
      }
    } catch (e) {
      console.error("Lỗi tải học viên:", e);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStudents();
  }, []);

  const fetchHistory = async (studentId: string) => {
    if (!studentId.trim()) {
      setHistoryItems([]);
      return;
    }

    try {
      setHistoryLoading(true);
      setErrorMessage("");
      const res: any = await practiceService.getAllPracticesByStudentId(studentId.trim());
      const payload = res?.data ?? res;
      const list = extractList(payload);
      setHistoryItems(list);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setErrorMessage(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Không thể tải lịch sử luyện tập của học viên.",
      );
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedStudentId) return;
    void fetchHistory(selectedStudentId);
  }, [selectedStudentId]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        st.groupName.toLowerCase().includes(q),
    );
  }, [students, searchTerm]);

  const selectedStudent = useMemo(
    () => students.find((st) => st.id === selectedStudentId) || null,
    [students, selectedStudentId],
  );

  const formatDate = (value: any) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("vi-VN");
  };

  const displayScore = (item: any) => {
    const aiScore = item?.AIFeedback?.score;
    if (typeof aiScore === "number") return aiScore;
    if (typeof item?.score === "number") return item.score;
    return null;
  };

  const displayStatus = (item: any) => {
    const raw = String(item?.status ?? item?.state ?? "").toLowerCase();
    if (!raw) return "Chưa rõ";
    if (raw === "submitted") return "Đã nộp";
    if (raw === "draft") return "Bản nháp";
    if (raw === "graded") return "Đã chấm";
    return raw;
  };

  const displayType = (item: any) => {
    const raw = String(item?.type ?? item?.exerciseType ?? "").toLowerCase();
    if (!raw) return "-";
    if (raw === "sentence") return "Viết câu";
    if (raw === "essay") return "Viết luận";
    if (raw === "letter") return "Viết thư";
    return raw;
  };

  const totalScore = historyItems.reduce((sum, item) => {
    const score = displayScore(item);
    return sum + (typeof score === "number" ? score : 0);
  }, 0);
  const avgScore = historyItems.length > 0 ? Math.round(totalScore / historyItems.length) : 0;

  const handleManualRefresh = () => {
    if (!selectedStudentId) return;
    void fetchHistory(selectedStudentId);
  };

  return (
    <div className="min-h-screen rounded-[2rem] bg-transparent p-4 font-sans md:p-6">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black text-slate-800">
              <Dumbbell className="text-blue-600" /> Lịch sử luyện tập học sinh
            </h1>
            <p className="ml-1 mt-1 font-medium text-slate-500">
              Theo dõi lịch sử luyện tập theo từng học viên từ endpoint student/:studentId.
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={!selectedStudentId || historyLoading}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
          >
            Làm mới lịch sử
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm học viên..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white"
              />
            </div>

            <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {studentsLoading ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Đang tải học viên...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                  Không có học viên phù hợp.
                </div>
              ) : (
                filteredStudents.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      st.id === selectedStudentId
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-800">{st.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{st.email || "Không có email"}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{st.groupName || "Chưa rõ nhóm"}</p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-bold uppercase text-blue-700">Học viên đang xem</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                  <UserRound size={16} className="text-blue-600" /> {selectedStudent?.name || "Chưa chọn"}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs font-bold uppercase text-indigo-700">Số bài luyện</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                  <BookOpen size={16} className="text-indigo-600" /> {historyItems.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase text-emerald-700">Điểm trung bình</p>
                <p className="mt-1 text-sm font-black text-slate-800">{historyItems.length ? `${avgScore}/100` : "-"}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <CircleAlert size={16} className="mt-0.5 shrink-0" /> {errorMessage}
              </div>
            )}

            {historyLoading ? (
              <div className="flex h-64 items-center justify-center gap-2 text-slate-500">
                <Loader2 className="animate-spin" size={20} /> Đang tải lịch sử luyện tập...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Chưa có dữ liệu luyện tập cho học viên này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3">Loại bài</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Điểm</th>
                      <th className="p-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyItems.map((item: any, idx: number) => {
                      const score = displayScore(item);
                      return (
                        <tr key={String(item?._id ?? item?.id ?? idx)} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-700">{displayType(item)}</td>
                          <td className="p-3 text-slate-600">{displayStatus(item)}</td>
                          <td className="p-3 font-bold text-slate-800">
                            {typeof score === "number" ? `${Math.round(score)}/100` : "-"}
                          </td>
                          <td className="p-3 text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={14} />
                              {formatDate(item?.submittedAt ?? item?.updatedAt ?? item?.createdAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

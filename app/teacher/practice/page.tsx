"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, FileQuestion } from "lucide-react";
import { practiceService } from "@/services/practice.service";
import { groupsService } from "@/services/groups.service";

type StudentOption = {
  id: string;
  name: string;
  email: string;
};

export default function TeacherPracticeHistoryPage() {
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [practices, setPractices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const toArray = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
  };

  const getScore = (item: any): number | null => {
    if (typeof item?.AIFeedback?.score === "number") return item.AIFeedback.score;
    if (typeof item?.score === "number") return item.score;
    return null;
  };

  const getTypeLabel = (type?: string) => {
    if (type === "sentence") return "Viết câu";
    if (type === "essay") return "Viết luận";
    if (type === "letter") return "Viết thư";
    if (type === "quiz") return "Quiz";
    return type || "Không xác định";
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN");
  };

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const directKeys = ["data", "items", "results", "docs", "members", "users", "rows"];
    for (const key of directKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    for (const key of ["data", "result", "payload"]) {
      const nested = payload[key];
      if (!nested || typeof nested !== "object") continue;
      for (const k of directKeys) {
        if (Array.isArray(nested[k])) return nested[k];
      }
    }

    return [];
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res: any = await groupsService.getAllMembersInTeacherGroups();
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped: StudentOption[] = list.map((it: any, idx: number) => {
        const profile = it?.user ?? it?.student ?? it?.member ?? it;
        const id = String(
          it?._id ?? it?.id ?? profile?._id ?? profile?.id ?? `student-${idx}`,
        );
        const name = String(
          profile?.fullName ?? profile?.name ?? it?.fullName ?? it?.name ?? "Học viên",
        );
        const email = String(profile?.email ?? it?.email ?? "");
        return { id, name, email };
      });

      const dedup = new Map<string, StudentOption>();
      mapped.forEach((st) => {
        if (!dedup.has(st.id)) dedup.set(st.id, st);
      });

      const normalized = Array.from(dedup.values());
      setStudents(normalized);

      if (normalized.length > 0) {
        setStudentId(normalized[0].id);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách học viên:", e);
      setStudents([]);
      setError("Không tải được danh sách học viên của giáo viên.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchPractices = async (id: string) => {
    const normalizedId = id.trim();

    if (!normalizedId) {
      setPractices([]);
      setError("Vui lòng chọn học viên để xem lịch sử luyện tập.");
      setLoading(false);
      return;
    }

    if (!students.some((st) => st.id === normalizedId)) {
      setPractices([]);
      setError("Học viên không thuộc danh sách học viên của giáo viên.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const res: any = await practiceService.getAllByStudentId(normalizedId);
      setPractices(toArray(res));
    } catch (e) {
      setPractices([]);
      setError("Không tải được lịch sử luyện tập của học sinh.");
      console.error("Lỗi tải lịch sử luyện tập:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStudents();
  }, []);

  useEffect(() => {
    if (loadingStudents) return;
    if (!studentId) {
      setLoading(false);
      return;
    }

    void fetchPractices(studentId);
  }, [loadingStudents, studentId]);

  const filteredPractices = practices.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const content = String(item?.studentWriting || item?.exercise?.items?.[0]?.instruction || "")
      .toLowerCase();
    const type = String(item?.type || "").toLowerCase();
    return content.includes(q) || type.includes(q);
  });

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 font-sans rounded-[2rem]">
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              Lịch sử luyện tập học sinh
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-1">
              Dữ liệu được lấy từ API `GET /practices/student/:studentId`.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md shadow-slate-200/70 border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-[460px] flex items-center gap-2">
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={loadingStudents || students.length === 0}
            >
              {students.length === 0 ? (
                <option value="">Không có học viên</option>
              ) : (
                students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.email || st.id})
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => void fetchPractices(studentId)}
              disabled={loadingStudents || students.length === 0 || !studentId}
              className="inline-flex items-center justify-center gap-2 min-w-[132px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-blue-300/40 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Search size={16} />
              {loadingStudents ? "Đang tải..." : "Tra cứu"}
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm theo nội dung hoặc loại luyện tập..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/70 border border-slate-200 overflow-hidden">
          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-5 pl-6">Thời gian</th>
                    <th className="p-5">Loại luyện tập</th>
                    <th className="p-5 min-w-[360px]">Bài làm học sinh</th>
                    <th className="p-5">Điểm AI</th>
                    <th className="p-5">Nhận xét AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPractices.map((item: any) => (
                    <tr
                      key={item._id || `${item?.studentId}-${item?.createdAt}`}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="p-5 pl-6 align-top">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatTime(item?.createdAt)}
                        </span>
                      </td>

                      <td className="p-5 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-200">
                          {getTypeLabel(item?.type)}
                        </span>
                      </td>

                      <td className="p-5 align-top text-slate-700">
                        <p className="font-medium whitespace-pre-wrap line-clamp-4">
                          {item?.studentWriting || "(Chưa có bài làm)"}
                        </p>
                      </td>

                      <td className="p-5 align-top text-slate-700 font-bold">
                        {getScore(item) ?? "-"}
                      </td>

                      <td className="p-5 align-top text-slate-600 max-w-[360px]">
                        {item?.AIFeedback?.comments || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredPractices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileQuestion size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-bold text-slate-600">
                Chưa có dữ liệu luyện tập
              </p>
              <p className="text-sm">
                Thử nhập Student ID khác hoặc kiểm tra dữ liệu backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

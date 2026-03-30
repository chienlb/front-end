// app/teacher/students/page.tsx
"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Mail, Phone, Eye, X, Loader2 } from "lucide-react";
import { groupsService } from "@/services/groups.service";
import { assignmentsService } from "@/services/assignments.service";

function TeacherStudentsContent() {
  const searchParams = useSearchParams();
  const selectedGroupId = searchParams.get("groupId") || "";
  const selectedGroupName = searchParams.get("groupName") || "";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<
    {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      accountStatus: "Active" | "Inactive";
      groupId: string;
      groupName: string;
    }[]
  >([]);
  const [scoreModalStudent, setScoreModalStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [studentSubmissions, setStudentSubmissions] = useState<
    Array<{
      id: string;
      assignmentTitle: string;
      score?: number;
      status: string;
      submittedAt: string;
    }>
  >([]);

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const directKeys = [
      "data",
      "items",
      "results",
      "docs",
      "members",
      "users",
      "rows",
    ];
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

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res: any = selectedGroupId
        ? await groupsService.getAllMembersInGroupForTeacher(selectedGroupId)
        : await groupsService.getAllMembersInTeacherGroups();
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped = list.map((it: any, idx: number) => {
        const profile = it?.user ?? it?.student ?? it?.member ?? it;
        const id = String(
          it?._id ?? it?.id ?? profile?._id ?? profile?.id ?? `student-${idx}`,
        );
        const firstName = String(profile?.firstName ?? it?.firstName ?? "").trim();
        const lastName = String(profile?.lastName ?? it?.lastName ?? "").trim();
        const mergedName = `${firstName} ${lastName}`.trim();
        const email = String(profile?.email ?? it?.email ?? "").trim();
        const phone = String(
          profile?.phone ?? profile?.phoneNumber ?? it?.phone ?? it?.phoneNumber ?? "",
        ).trim();
        const primaryName =
          profile?.fullName ??
          profile?.fullname ??
          profile?.name ??
          profile?.displayName ??
          it?.fullName ??
          it?.fullname ??
          it?.name ??
          it?.displayName;
        const name = String(
          (typeof primaryName === "string" ? primaryName.trim() : "") ||
            mergedName ||
            profile?.username ||
            it?.username ||
            email ||
            `ID: ${id}`,
        );
        const groupId = String(
          it?.group?._id ?? it?.groupId ?? it?.group ?? "",
        );
        const groupName = String(
          it?.group?.groupName ??
            it?.group?.name ??
            it?.groupName ??
            "",
        );
        const role = String(
          profile?.role?.name ?? profile?.role ?? it?.role?.name ?? it?.role ?? "STUDENT",
        ).toUpperCase();
        const activeRaw = String(
          profile?.isActive ?? it?.isActive ?? profile?.status ?? it?.status ?? "",
        ).toLowerCase();
        const accountStatus: "Active" | "Inactive" =
          activeRaw === "true" ||
          activeRaw === "1" ||
          activeRaw === "active" ||
          activeRaw === "enabled"
            ? "Active"
            : "Inactive";

        return { id, name, email, phone, role, accountStatus, groupId, groupName };
      });

      const scoped = mapped;

      // Một học viên có thể xuất hiện ở nhiều nhóm, nên gộp theo id.
      const deduped = new Map<string, (typeof scoped)[number]>();
      scoped.forEach((student) => {
        if (!deduped.has(student.id)) {
          deduped.set(student.id, student);
        }
      });

      setStudents(Array.from(deduped.values()));
    } catch (error) {
      console.error("Lỗi lấy danh sách học viên:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const extractSubmissionList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const keys = ["data", "items", "results", "docs", "submissions", "rows"];
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

  const handleViewScores = async (student: { id: string; name: string }) => {
    try {
      setScoreModalStudent(student);
      setScoreLoading(true);
      setScoreError("");
      setStudentSubmissions([]);

      const res: any =
        await assignmentsService.getAllSubmissionsByStudentIdForTeacher(student.id);
      const payload = res?.data ?? res;
      const list = extractSubmissionList(payload);

      const mapped = list.map((item: any, idx: number) => ({
        id: String(item?._id ?? item?.id ?? `${student.id}-${idx}`),
        assignmentTitle: String(
          item?.assignmentId?.title ??
            item?.assignment?.title ??
            item?.assignmentTitle ??
            "Bài tập",
        ),
        score: typeof item?.score === "number" ? item.score : undefined,
        status: String(item?.status ?? "submitted"),
        submittedAt: item?.submittedAt
          ? new Date(item.submittedAt).toLocaleString("vi-VN")
          : "—",
      }));

      setStudentSubmissions(mapped);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setScoreError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Không thể tải danh sách điểm của học viên.",
      );
    } finally {
      setScoreLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedGroupId]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        st.phone.toLowerCase().includes(q) ||
        st.role.toLowerCase().includes(q) ||
        st.groupName.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">
          {selectedGroupId
            ? `Học viên nhóm: ${selectedGroupName || "Đã chọn"}`
            : "Danh sách Học sinh"}
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:bg-white focus:border-blue-200 transition"
              placeholder="Tìm học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="p-6">Học sinh</th>
            <th className="p-6">Vai trò</th>
            <th className="p-6">Trạng thái tài khoản</th>
            <th className="p-6 text-right">Liên hệ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredStudents.map((st) => (
            <tr key={st.id} className="hover:bg-blue-50/50 transition group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">
                      {st.name}
                    </p>
                    <p className="text-xs text-slate-400">ID: {st.id}</p>
                  </div>
                </div>
              </td>
              <td className="p-6">
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">
                  {st.role}
                </span>
              </td>
              <td className="p-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${st.accountStatus === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${st.accountStatus === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                  ></div>
                  {st.accountStatus}
                </span>
              </td>
              <td className="p-6 text-right">
                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                  <a
                    href={st.email ? `mailto:${st.email}` : undefined}
                    aria-label="Email học viên"
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg"
                  >
                    <Mail size={16} />
                  </a>
                  <a
                    href={st.phone ? `tel:${st.phone}` : undefined}
                    aria-label="Gọi học viên"
                    className="p-2 hover:bg-green-100 text-green-600 rounded-lg"
                  >
                    <Phone size={16} />
                  </a>
                  <button
                    onClick={() => handleViewScores({ id: st.id, name: st.name })}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    <Eye size={14} /> Xem điểm
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!loading && filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                {selectedGroupId
                  ? "Nhóm này chưa có học viên phù hợp."
                  : "Không có học viên phù hợp."}
              </td>
            </tr>
          ) : null}
          {loading ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                Đang tải danh sách học viên...
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {scoreModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Bảng điểm học viên</h3>
                <p className="text-sm text-slate-500">{scoreModalStudent.name}</p>
              </div>
              <button
                onClick={() => setScoreModalStudent(null)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-6">
              {scoreLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Đang tải điểm...
                </div>
              ) : scoreError ? (
                <div className="text-sm text-red-600">{scoreError}</div>
              ) : studentSubmissions.length === 0 ? (
                <div className="text-sm text-slate-500">Học viên chưa có bài nộp.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Bài tập</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Điểm</th>
                      <th className="px-4 py-3">Nộp lúc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-4 py-3 font-medium text-slate-700">{sub.assignmentTitle}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.status}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {typeof sub.score === "number" ? sub.score : "Chưa chấm"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{sub.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 text-sm text-slate-500">
          Đang tải danh sách học viên...
        </div>
      }
    >
      <TeacherStudentsContent />
    </Suspense>
  );
}

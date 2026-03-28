// app/teacher/students/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { groupsService } from "@/services/groups.service";

export default function TeacherStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<
    {
      id: string;
      name: string;
      className: string;
      progress: number;
      status: "Online" | "Offline";
      email: string;
      phone: string;
    }[]
  >([]);

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const directKeys = ["data", "items", "results", "docs", "members", "rows"];
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
      const res: any = await groupsService.getMyGroupMembers({ page: 1, limit: 200 });
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped = list.map((it: any, idx: number) => {
        const profile = it?.user ?? it?.student ?? it?.member ?? it;
        const id = String(
          it?._id ?? it?.id ?? profile?._id ?? profile?.id ?? `student-${idx}`,
        );
        const name = String(
          profile?.fullName ?? profile?.name ?? it?.fullName ?? it?.name ?? "Học viên",
        );
        const className = String(
          it?.groupName ?? it?.group?.name ?? it?.className ?? it?.class ?? "—",
        );
        const progressRaw = Number(it?.progress ?? profile?.progress ?? 0);
        const progress = Number.isFinite(progressRaw)
          ? Math.max(0, Math.min(100, progressRaw))
          : 0;
        const statusRaw = String(
          it?.status ?? profile?.status ?? it?.isOnline ?? profile?.isOnline ?? "",
        ).toLowerCase();
        const status: "Online" | "Offline" =
          statusRaw.includes("online") || statusRaw === "true" || statusRaw === "1"
            ? "Online"
            : "Offline";
        const email = String(profile?.email ?? it?.email ?? "");
        const phone = String(profile?.phone ?? it?.phone ?? "");

        return { id, name, className, progress, status, email, phone };
      });

      setStudents(mapped);
    } catch (error) {
      console.error("Lỗi lấy danh sách học viên:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        st.phone.toLowerCase().includes(q) ||
        st.className.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800">
          Danh sách Học sinh
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
            <th className="p-6">Lớp đang học</th>
            <th className="p-6">Tiến độ</th>
            <th className="p-6">Trạng thái</th>
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
              <td className="p-6 text-sm font-medium text-slate-600">
                {st.className}
              </td>
              <td className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.progress > 80 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${st.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {st.progress}%
                  </span>
                </div>
              </td>
              <td className="p-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${st.status === "Online" ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${st.status === "Online" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
                  ></div>
                  {st.status}
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
                  <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!loading && filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                Không có học viên phù hợp.
              </td>
            </tr>
          ) : null}
          {loading ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                Đang tải danh sách học viên...
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

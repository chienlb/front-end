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
} from "lucide-react";
import { lessonService } from "@/services/lessons.service";

type LessonStatus = "ACTIVE" | "INACTIVE";
type LessonRow = {
  id: string;
  name: string;
  description?: string;
  unitName: string;
  type: string;
  status: LessonStatus;
  orderIndex: number;
  duration: number;
  updatedAt: string;
};

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | LessonStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonRow[]>([]);

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
        const statusRaw = String(l?.isActive ?? "").toLowerCase();
        const lessonStatus: LessonStatus =
          statusRaw === "active" || statusRaw === ""
            ? "ACTIVE"
            : "INACTIVE";
        const updatedIso = l?.updatedAt || l?.createdAt || "";
        return {
          id: String(l?._id || l?.id || ""),
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

  useEffect(() => {
    fetchLessons();
  }, []);

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
            <button className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2">
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
    </div>
  );
}


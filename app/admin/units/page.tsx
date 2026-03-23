"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Layers3, RefreshCw, CheckCircle2 } from "lucide-react";
import { unitService } from "@/services/units.service";

type UnitStatus = "ACTIVE" | "INACTIVE";
type UnitRow = {
  id: string;
  name: string;
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

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const okText =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.description?.toLowerCase().includes(search.toLowerCase());
      const okStatus = status === "ALL" || u.status === status;
      return okText && okStatus;
    });
  }, [search, status, units]);

  const activeCount = units.filter((x) => x.status === "ACTIVE").length;
  const inactiveCount = units.filter((x) => x.status === "INACTIVE").length;

  const statusBadge = (s: UnitStatus) =>
    s === "ACTIVE" ? (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Inactive
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
                <th className="p-4 pl-6">Tên chủ đề</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Độ khó</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-center">Số bài</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {u.id}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-md">
                    <span className="line-clamp-2">{u.description || "—"}</span>
                  </td>
                  <td className="p-4 text-slate-600">{u.difficulty}</td>
                  <td className="p-4 text-center text-slate-600">{u.orderIndex}</td>
                  <td className="p-4 text-center text-slate-600">{u.totalLessons}</td>
                  <td className="p-4 text-center">{statusBadge(u.status)}</td>
                  <td className="p-4 text-slate-500">{u.updatedAt}</td>
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
    </div>
  );
}


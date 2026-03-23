"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Search, RefreshCw, CheckCircle2 } from "lucide-react";
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

function toDateText(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("vi-VN");
}

export default function AdminCompetitionsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CompetitionRow[]>([]);

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
        startDate: toDateText(c?.startDate || c?.startAt),
        endDate: toDateText(c?.endDate || c?.endAt),
        participants: Number(c?.participantsCount || c?.participants || 0),
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
          <button
            onClick={fetchCompetitions}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
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
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { BookText, Search, RefreshCw, Filter, CheckCircle2 } from "lucide-react";
import { literatureService } from "@/services/literatures.service";

type LiteratureRow = {
  id: string;
  title: string;
  type: string;
  grade: string;
  author: string;
  isPublished: boolean;
  updatedAt: string;
};

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
  const [rows, setRows] = useState<LiteratureRow[]>([]);

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
        return {
          id: String(it?._id || it?.id || ""),
          title: String(it?.title || it?.name || "Văn bản chưa đặt tên"),
          type: String(it?.type || "N/A"),
          grade: String(it?.grade || "N/A"),
          author: String(
            it?.author ||
              it?.createdBy?.fullName ||
              it?.createBy?.fullName ||
              "—",
          ),
          isPublished: Boolean(it?.isPublished ?? it?.status === "published"),
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

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

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
              Danh sách văn/thơ đồng bộ từ API `GET /literatures`.
            </p>
          </div>
          <button
            onClick={fetchLiteratures}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
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
              { id: "essay", label: "Văn xuôi" },
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
                <th className="p-4">Thể loại</th>
                <th className="p-4">Khối lớp</th>
                <th className="p-4">Tác giả</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {r.id}</p>
                  </td>
                  <td className="p-4 text-slate-600">{r.type}</td>
                  <td className="p-4 text-slate-600">{r.grade}</td>
                  <td className="p-4 text-slate-600">{r.author}</td>
                  <td className="p-4 text-center">
                    {r.isPublished ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{r.updatedAt}</td>
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
        </div>
      </div>
    </div>
  );
}

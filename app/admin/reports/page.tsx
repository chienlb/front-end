"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, CheckCircle, Search, AlertTriangle } from "lucide-react";
import { feedbackService, type FeedbackItem } from "@/services/feedback.service";

type UiFeedback = {
  id: string;
  reporter: string;
  type: string;
  title: string;
  content: string;
  rating: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "RESOLVED";
  createdAt: string;
};

export default function ReportsPage() {
  const [filter, setFilter] = useState<"OPEN" | "RESOLVED">("OPEN");
  const [search, setSearch] = useState("");
  const [feedbacks, setFeedbacks] = useState<UiFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapTypeLabel = (type: string): string => {
    if (type === "bug") return "Lỗi hệ thống";
    if (type === "feature") return "Đề xuất tính năng";
    if (type === "lesson") return "Nội dung bài học";
    return "Góp ý chung";
  };

  const mapSeverity = (rating?: number): UiFeedback["severity"] => {
    if ((rating ?? 0) <= 2) return "HIGH";
    if ((rating ?? 0) === 3) return "MEDIUM";
    return "LOW";
  };

  const formatTime = (iso?: string): string => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN");
  };

  const mapFeedback = (fb: FeedbackItem): UiFeedback => ({
    id: fb._id,
    reporter: `Người dùng ${String(fb.userId || "").slice(-6) || "Ẩn danh"}`,
    type: fb.type ?? "general",
    title: fb.title || "Không có tiêu đề",
    content: fb.content || "(Không có nội dung)",
    rating: Number(fb.rating ?? 0),
    severity: mapSeverity(fb.rating),
    status: fb.isResolved ? "RESOLVED" : "OPEN",
    createdAt: formatTime(fb.createdAt),
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const pageSize = 50;
      let currentPage = 1;
      let totalPages = 1;
      const rows: FeedbackItem[] = [];

      while (currentPage <= totalPages) {
        const res = await feedbackService.getAll(currentPage, pageSize);
        const data = Array.isArray(res?.data) ? res.data : [];
        rows.push(...data);
        totalPages = Math.max(1, Number(res?.totalPages || 1));
        currentPage += 1;
      }

      setFeedbacks(rows.map(mapFeedback));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách nhận xét từ API feedback.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFeedbacks();
  }, []);

  // Helper: Badge mức độ nghiêm trọng
  const getSeverityBadge = (level: string) => {
    if (level === "HIGH")
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200 flex items-center gap-1">
          <AlertTriangle size={10} /> ƯU TIÊN CAO
        </span>
      );
    if (level === "MEDIUM")
      return (
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold border border-orange-200">
          ƯU TIÊN TRUNG BÌNH
        </span>
      );
    return (
      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold border border-gray-200">
        ƯU TIÊN THẤP
      </span>
    );
  };

  const filteredFeedbacks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return feedbacks.filter((item) => {
      if (item.status !== filter) return false;
      if (!q) return true;

      const text = [item.reporter, item.type, item.title, item.content, item.id]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [feedbacks, filter, search]);

  const openCount = useMemo(
    () => feedbacks.filter((item) => item.status === "OPEN").length,
    [feedbacks],
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nhận xét người dùng</h1>
          <p className="text-gray-500 text-sm">
            Theo dõi review và góp ý từ người dùng trong hệ thống.
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <ShieldAlert size={18} /> {openCount} review chưa phản hồi
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex gap-2">
          {["OPEN", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as "OPEN" | "RESOLVED")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${
                filter === status
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {status === "OPEN" ? "Chưa phản hồi" : "Đã phản hồi"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung, người gửi..."
            className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
          />
        </div>
      </div>

      {/* 3. FEEDBACK TABLE */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0">
              <tr>
                <th className="p-4">Mức độ / Thời gian</th>
                <th className="p-4">Người gửi</th>
                <th className="p-4">Nội dung nhận xét</th>
                <th className="p-4">Loại phản hồi</th>
                <th className="p-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFeedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getSeverityBadge(item.severity)}
                        <span className="text-xs text-slate-500 font-bold">
                          Đánh giá: {item.rating || 0}/5
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.createdAt}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {item.reporter}
                      <div className="text-[10px] text-gray-400 font-normal mt-1">
                        ID: {item.id}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-md">
                        <div className="mb-1 text-sm font-black text-slate-800">
                          {item.title}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-blue-700 font-bold text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        {mapTypeLabel(item.type)}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {item.status === "OPEN" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Chưa phản hồi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã phản hồi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-10 text-center text-gray-400">
              <p>Đang tải dữ liệu nhận xét...</p>
            </div>
          )}

          {!!error && (
            <div className="p-10 text-center text-red-500 font-semibold">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredFeedbacks.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              <CheckCircle size={48} className="mx-auto mb-2 text-green-100" />
              <p>Không có nhận xét nào ở mục này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

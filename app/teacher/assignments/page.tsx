"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  FileText,
  Eye,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { assignmentsService } from "@/services/assignments.service";

// --- TYPES ---
interface AssignmentTemplate {
  id: string;
  title: string;
  type: string;
  questionCount: number | null;
  maxScore: number;
  createdAt: string;
  tags: string[];
  usageCount: number;
}

export default function AssignmentLibraryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);

  const getCurrentUserId = (): string => {
    try {
      const raw = window.localStorage.getItem("currentUser");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return String(parsed?._id || parsed?.id || parsed?.data?._id || "");
    } catch {
      return "";
    }
  };

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const keys = ["data", "items", "results", "docs", "assignments", "groups", "rows"];
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const userId = getCurrentUserId();
        if (!userId) {
          setTemplates([]);
          return;
        }

        const assignmentRes = await assignmentsService.getAssignmentsByUserId(
          userId,
          1,
          200,
        );

        const assignmentPayload = assignmentRes?.data ?? assignmentRes;
        const assignmentList = extractList(assignmentPayload);
        const mappedTemplates: AssignmentTemplate[] = assignmentList.map((it: any) => ({
          id: String(it?._id ?? it?.id ?? ""),
          title: String(it?.title ?? it?.name ?? "Bài tập chưa đặt tên"),
          type: String(it?.type || "quiz"),
          questionCount: Array.isArray(it?.questions) ? it.questions.length : null,
          maxScore: Number(it?.maxScore ?? 10) || 10,
          createdAt: it?.createdAt
            ? new Date(it.createdAt).toLocaleDateString("vi-VN")
            : "—",
          tags: Array.isArray(it?.tags) ? it.tags : [],
          usageCount: Number(it?.totalSubmissions ?? it?.submissionCount ?? 0) || 0,
        }));
        setTemplates(mappedTemplates.filter((t) => t.id));
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message;
        setLoadError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải dữ liệu.");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.title.toLowerCase().includes(q));
  }, [templates, searchTerm]);

  return (
    <div className="p-8 min-h-screen bg-transparent font-sans rounded-[2rem]">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Thư viện Đề & Bài tập
          </h1>
          <p className="text-slate-500 mt-1">
            Soạn thảo đề gốc, xem bài nộp và chấm điểm tập trung.
          </p>
        </div>

        <button
          onClick={() => router.push("/teacher/assignments/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition"
        >
          <Plus size={20} /> Soạn đề mới
        </button>
      </div>

      {/* 2. LIBRARY LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/70 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Tìm tên bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Lọc
          </button>
        </div>

        {/* List */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Tên đề / Bài tập</th>
              <th className="p-4">Cấu trúc</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Đã sử dụng</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTemplates.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText
                        size={16}
                        className={
                          item.type === "QUIZ"
                            ? "text-blue-500"
                            : "text-orange-500"
                        }
                      />
                      {item.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <p className="capitalize font-semibold">{item.type}</p>
                  <p className="text-xs text-slate-400">Điểm tối đa: {item.maxScore}</p>
                </td>
                <td className="p-4 text-sm text-slate-500">{item.createdAt}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${item.usageCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item.usageCount} lớp
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/teacher/assignments/${item.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>

                    <button
                      onClick={() => router.push(`/teacher/assignments/${item.id}/submissions`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <ClipboardCheck size={14} /> Học viên đã nộp
                    </button>

                    <button
                      onClick={() => router.push(`/teacher/grading/${item.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                    >
                      <GraduationCap size={14} /> Chấm điểm
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Đang tải danh sách bài tập...</div>
        ) : null}
        {!loading && loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : null}
        {!loading && !loadError && filteredTemplates.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Không có bài tập nào.</div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Filter,
  Search,
  FileText,
  ArrowRight,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import GradingDashboard from "@/components/teacher/grading/GradingDashboard";
import { assignmentsService } from "@/services/assignments.service";

// --- TYPES ---
export type Status = "PENDING" | "GRADED" | "LATE";

export interface SubmissionContent {
  type: "ESSAY" | "VIDEO";
  fileUrl: string;
  text?: string;
  preview?: string;
}

export interface Submission {
  id: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  assignmentTitle: string;
  submittedAt: string;
  status: Status;
  score?: number;
  maxScore: number;
  content?: SubmissionContent;
  feedback?: string;
}

export default function GradingCenterPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("PENDING");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // State for Modal
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null,
  );

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
    const keys = ["data", "items", "results", "docs", "assignments", "submissions", "rows"];
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
          setSubmissions([]);
          return;
        }

        const assignmentsRes: any = await assignmentsService.getAssignmentsByUserId(
          userId,
          1,
          50,
        );
        const assignmentPayload = assignmentsRes?.data ?? assignmentsRes;
        const assignments = extractList(assignmentPayload);

        const submissionResponses = await Promise.all(
          assignments.map((a: any) =>
            assignmentsService
              .getSubmissionsByAssignmentId(String(a?._id || a?.id || ""))
              .catch(() => null),
          ),
        );

        const merged: Submission[] = [];
        submissionResponses.forEach((res, idx) => {
          if (!res) return;
          const assignment = assignments[idx];
          const payload = (res as any)?.data ?? res;
          const list = extractList(payload);
          list.forEach((s: any, sIdx: number) => {
            const student = s?.studentId ?? s?.student ?? {};
            const statusRaw = String(s?.status || "").toUpperCase();
            const status: Status =
              statusRaw.includes("GRADED")
                ? "GRADED"
                : statusRaw.includes("LATE")
                  ? "LATE"
                  : "PENDING";
            merged.push({
              id: String(s?._id ?? s?.id ?? `${idx}-${sIdx}`),
              studentName: String(student?.fullName ?? student?.name ?? "Học sinh"),
              studentAvatar: String(student?.avatar ?? "https://i.pravatar.cc/150?img=11"),
              className: String(
                assignment?.classId?.name ?? assignment?.classId?.title ?? "Lớp học",
              ),
              assignmentTitle: String(assignment?.title ?? "Bài tập"),
              submittedAt: s?.submittedAt
                ? new Date(s.submittedAt).toLocaleString("vi-VN")
                : "—",
              status,
              score: typeof s?.score === "number" ? s.score : undefined,
              maxScore: Number(assignment?.maxScore ?? 10) || 10,
              feedback: s?.feedback,
            });
          });
        });

        setSubmissions(merged);
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message;
        setLoadError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải dữ liệu chấm điểm.");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredList = submissions.filter((item) => {
    const matchStatus =
      filterStatus === "ALL" ? true : item.status === filterStatus;
    const matchClass =
      selectedClass === "ALL" ? true : item.className === selectedClass;
    const matchSearch =
      !searchTerm.trim() ||
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchClass && matchSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
  const averageScore = useMemo(() => {
    const graded = submissions.filter((s) => typeof s.score === "number");
    if (!graded.length) return "0.0";
    const avg = graded.reduce((sum, s) => sum + Number(s.score || 0), 0) / graded.length;
    return avg.toFixed(1);
  }, [submissions]);
  const classOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.className).filter(Boolean))),
    [submissions],
  );

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER & STATS */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-2">
          Trung Tâm Chấm Điểm
        </h1>
        <p className="text-slate-500">
          Quản lý và chấm bài tập trung cho tất cả các lớp học.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase mb-1">
                Cần chấm ngay
              </p>
              <p className="text-3xl font-black text-slate-800">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <Clock size={24} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase mb-1">
                Đã chấm xong (Tuần này)
              </p>
              <p className="text-3xl font-black text-slate-800">{gradedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                Điểm trung bình
              </p>
              <p className="text-3xl font-black text-slate-800">{averageScore}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {["PENDING", "LATE", "GRADED", "ALL"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status === "PENDING"
                ? "Chưa chấm"
                : status === "LATE"
                  ? "Nộp muộn"
                  : status === "GRADED"
                    ? "Đã chấm"
                    : "Tất cả"}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="ALL">Tất cả lớp học</option>
              {classOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>

          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
              placeholder="Tìm tên HS, bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. SUBMISSION LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải dữ liệu chấm điểm...</div>
          ) : null}
          {!loading && loadError ? (
            <div className="p-6 text-sm text-red-600">{loadError}</div>
          ) : null}
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50/50 transition group"
            >
              {/* Student Info */}
              <div className="flex items-center gap-4 w-full md:w-1/4">
                <img
                  src={item.studentAvatar}
                  className="w-12 h-12 rounded-full border border-slate-200 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {item.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.className}
                  </p>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="flex-1 w-full">
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition">
                  {item.assignmentTitle}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Nộp lúc: {item.submittedAt}</span>
                  {item.status === "LATE" && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <AlertCircle size={10} /> Muộn
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between w-full md:w-auto gap-6">
                {item.status === "GRADED" ? (
                  <div className="text-right">
                    <span className="block text-2xl font-black text-blue-600">
                      {item.score}
                      <span className="text-sm text-slate-400 font-medium">
                        /{item.maxScore}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Đã chấm
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-slate-400">
                      Chưa có điểm
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Chờ chấm
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setCurrentSubmission(item)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
                    item.status === "GRADED"
                      ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                  }`}
                >
                  {item.status === "GRADED" ? "Xem lại" : "Chấm bài"}{" "}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredList.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="opacity-50" />
              </div>
              <p>Không tìm thấy bài tập nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- GRADING DASHBOARD MODAL --- */}
      <AnimatePresence>
        {currentSubmission && (
          <GradingDashboard
            submission={currentSubmission}
            onClose={() => setCurrentSubmission(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

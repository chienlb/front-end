"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import AssignmentEditor from "@/components/teacher/assignments/AssignmentEditor";
import { Question } from "@/components/teacher/assignments/types";
import { assignmentsService } from "@/services/assignments.service";
export default function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const extractList = (payload: any): any[] => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res: any = await assignmentsService.getAssignmentById(id);
        const raw = res?.data ?? res;
        if (!raw) {
          setError("Không tìm thấy bài tập này.");
        } else {
          const questionsRaw = Array.isArray(raw?.questions) ? raw.questions : [];
          const questions: Question[] = questionsRaw.map((q: any, idx: number) => ({
            id: Number(q?.id ?? idx + 1),
            type:
              String(q?.type || "MULTIPLE_CHOICE").toUpperCase() === "ESSAY"
                ? "ESSAY"
                : String(q?.type || "").toUpperCase() === "MATCHING"
                  ? "MATCHING"
                  : String(q?.type || "").toUpperCase() === "SPEAKING"
                    ? "SPEAKING"
                    : "MULTIPLE_CHOICE",
            text: String(q?.text ?? q?.question ?? ""),
            points: Number(q?.points ?? q?.score ?? 1) || 1,
            options: Array.isArray(q?.options)
              ? q.options.map((o: any, oIdx: number) => ({
                  id: Number(o?.id ?? oIdx + 1),
                  text: String(o?.text ?? o?.label ?? ""),
                  isCorrect: Boolean(o?.isCorrect ?? false),
                }))
              : undefined,
            pairs: Array.isArray(q?.pairs)
              ? q.pairs.map((p: any, pIdx: number) => ({
                  id: Number(p?.id ?? pIdx + 1),
                  left: String(p?.left ?? ""),
                  right: String(p?.right ?? ""),
                }))
              : undefined,
          }));

          setData({
            info: {
              title: String(raw?.title ?? raw?.name ?? "Bài tập"),
              description: String(raw?.description ?? ""),
              duration: Number(raw?.duration ?? raw?.estimatedDuration ?? 45) || 45,
            },
            questions,
          });
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoadingSubmissions(true);
        setSubmissionError("");
        const res: any = await assignmentsService.getSubmissionsByAssignmentId(id);
        const payload = res?.data ?? res;
        setSubmissions(extractList(payload));
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message;
        setSubmissionError(
          Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải danh sách bài nộp.",
        );
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  // --- TRƯỜNG HỢP 1: ĐANG TẢI ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium">Đang tải dữ liệu bài tập...</p>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: LỖI ---
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-700 mb-1">Lỗi tải trang</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Quay về thư viện
          </button>
        </div>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 3: TẢI XONG -> HIỂN THỊ EDITOR ---
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-800">
              Danh sách học sinh đã nộp bài
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Assignment ID: {id}
            </p>
          </div>

          {loadingSubmissions ? (
            <div className="p-5 text-sm text-slate-500">Đang tải danh sách nộp bài...</div>
          ) : submissionError ? (
            <div className="p-5 text-sm text-red-600">{submissionError}</div>
          ) : submissions.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">Chưa có học sinh nộp bài.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Điểm</th>
                    <th className="px-5 py-3">Thời gian nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((s, idx) => {
                    const student = s?.studentId ?? s?.student ?? {};
                    const studentName = String(
                      student?.fullName ?? student?.name ?? s?.studentName ?? "Học sinh",
                    );
                    const status = String(s?.status ?? "submitted");
                    const score = s?.score;
                    const submittedAt = s?.submittedAt
                      ? new Date(s.submittedAt).toLocaleString("vi-VN")
                      : "—";
                    return (
                      <tr key={String(s?._id ?? s?.id ?? idx)}>
                        <td className="px-5 py-3">{studentName}</td>
                        <td className="px-5 py-3">{status}</td>
                        <td className="px-5 py-3">
                          {typeof score === "number" ? score : "Chưa chấm"}
                        </td>
                        <td className="px-5 py-3">{submittedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AssignmentEditor
        mode="edit"
        initialData={data}
      />
    </div>
  );
}

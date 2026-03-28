"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Loader2, X } from "lucide-react";
import { assignmentsService } from "@/services/assignments.service";

export default function AssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("Bài tập");
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

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

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return String(parsed?._id ?? parsed?.id ?? parsed?.data?._id ?? "");
    } catch {
      return "";
    }
  };

  const getSubmissionFiles = (submission: any): string[] => {
    const out: string[] = [];
    if (Array.isArray(submission?.attachments)) {
      submission.attachments.forEach((url: any) => {
        if (typeof url === "string" && url.trim()) out.push(url.trim());
      });
    }
    if (Array.isArray(submission?.files)) {
      submission.files.forEach((file: any) => {
        const url = file?.url ?? file?.fileUrl ?? file?.path ?? file;
        if (typeof url === "string" && url.trim()) out.push(url.trim());
      });
    }
    if (typeof submission?.fileUrl === "string" && submission.fileUrl.trim()) {
      out.push(submission.fileUrl.trim());
    }
    return Array.from(new Set(out));
  };

  const getSubmissionText = (submission: any): string => {
    if (!submission) return "";

    const formatStudentAnswers = (answers: any): string => {
      if (!answers) return "";

      if (typeof answers === "string") return answers.trim();

      if (Array.isArray(answers)) {
        if (!answers.length) return "";
        const lines = answers.map((it, idx) => {
          if (typeof it === "string") return `Câu ${idx + 1}: ${it}`;
          const q = it?.question ?? it?.questionText ?? it?.id ?? `Câu ${idx + 1}`;
          const a =
            it?.answer ??
            it?.value ??
            it?.studentAnswer ??
            JSON.stringify(it);
          return `${q}: ${a}`;
        });
        return lines.join("\n");
      }

      if (typeof answers === "object") {
        const entries = Object.entries(answers);
        if (!entries.length) return "";
        return entries
          .map(([k, v]) => {
            if (typeof v === "string") return `${k}: ${v}`;
            try {
              return `${k}: ${JSON.stringify(v)}`;
            } catch {
              return `${k}: ${String(v)}`;
            }
          })
          .join("\n");
      }

      return "";
    };

    if (typeof submission?.answer === "string" && submission.answer.trim()) {
      return submission.answer.trim();
    }

    if (typeof submission?.text === "string" && submission.text.trim()) {
      return submission.text.trim();
    }

    if (typeof submission?.content === "string" && submission.content.trim()) {
      return submission.content.trim();
    }

    if (
      submission?.content &&
      typeof submission.content === "object" &&
      !Array.isArray(submission.content)
    ) {
      const maybeText =
        submission.content?.text ??
        submission.content?.answer ??
        submission.content?.value;
      if (typeof maybeText === "string" && maybeText.trim()) {
        return maybeText.trim();
      }
      try {
        return JSON.stringify(submission.content, null, 2);
      } catch {
        return String(submission.content);
      }
    }

    if (Array.isArray(submission?.content) && submission.content.length > 0) {
      try {
        return JSON.stringify(submission.content, null, 2);
      } catch {
        return String(submission.content);
      }
    }

    if (typeof submission?.studentAnswer === "string" && submission.studentAnswer.trim()) {
      return submission.studentAnswer.trim();
    }
    if (submission?.studentAnswers) {
      const formatted = formatStudentAnswers(submission.studentAnswers);
      if (formatted) return formatted;
    }
    return "";
  };

  const refreshSubmissions = async () => {
    const res: any = await assignmentsService.getAllSubmissionsByAssignmentIdForTeacher(id);
    const payload = res?.data ?? res;
    setSubmissions(extractList(payload));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [assignmentRes] = await Promise.all([
          assignmentsService.getAssignmentById(id).catch(() => null),
          refreshSubmissions(),
        ]);

        const assignmentPayload = assignmentRes?.data ?? assignmentRes;
        const title = String(
          assignmentPayload?.title ?? assignmentPayload?.name ?? "Bài tập",
        );
        setAssignmentTitle(title);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(", ")
            : msg || "Không thể tải danh sách bài nộp.",
        );
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const openSubmissionModal = async (submission: any) => {
    setDetailLoading(true);
    setDetailError("");
    setSelectedSubmission(submission);
    const scoreVal =
      typeof submission?.score === "number" ? String(submission.score) : "";
    setScoreInput(scoreVal);
    setFeedbackInput(String(submission?.feedback ?? ""));

    try {
      const submissionId = String(submission?._id ?? submission?.id ?? "");
      if (!submissionId) return;
      const res: any = await assignmentsService.getSubmissionById(submissionId);
      const detail = res?.data ?? res;
      if (detail && typeof detail === "object") {
        setSelectedSubmission((prev: any) => ({ ...(prev || {}), ...detail }));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message;
      setDetailError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Không thể tải chi tiết bài nộp.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeSubmissionModal = () => {
    setSelectedSubmission(null);
    setDetailError("");
    setScoreInput("");
    setFeedbackInput("");
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    const score = Number(scoreInput);
    if (!Number.isFinite(score) || score < 0) {
      alert("Điểm không hợp lệ.");
      return;
    }

    const graderId = getCurrentUserId();
    if (!graderId) {
      alert("Không xác định được người chấm.");
      return;
    }

    try {
      setSavingGrade(true);
      await assignmentsService.updateSubmission(
        String(selectedSubmission?._id ?? selectedSubmission?.id),
        {
          score,
          feedback: feedbackInput.trim() || undefined,
          gradedBy: graderId,
          status: "graded",
        },
      );

      setSubmissions((prev) =>
        prev.map((s) => {
          const sid = String(s?._id ?? s?.id);
          const currentId = String(selectedSubmission?._id ?? selectedSubmission?.id);
          if (sid !== currentId) return s;
          return {
            ...s,
            score,
            feedback: feedbackInput.trim(),
            status: "graded",
          };
        }),
      );

      closeSubmissionModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể lưu điểm.");
    } finally {
      setSavingGrade(false);
    }
  };

  const gradedCount = useMemo(
    () => submissions.filter((s) => typeof s?.score === "number").length,
    [submissions],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Danh sách học viên đã nộp</h1>
            <p className="mt-1 text-sm text-slate-500">{assignmentTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/assignments/${id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} /> Chi tiết bài tập
            </Link>
            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              Đã chấm: {gradedCount}/{submissions.length}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải danh sách nộp bài...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Chưa có học viên nộp bài.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học viên</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Điểm</th>
                    <th className="px-5 py-3">Thời gian nộp</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
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
                        <td className="px-5 py-3 font-medium text-slate-700">{studentName}</td>
                        <td className="px-5 py-3 text-slate-600">{status}</td>
                        <td className="px-5 py-3 text-slate-700">
                          {typeof score === "number" ? score : "Chưa chấm"}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{submittedAt}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => openSubmissionModal(s)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            <Eye size={14} /> Xem & chấm
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Chi tiết bài nộp</h3>
                <p className="text-sm text-slate-500">
                  {String(
                    selectedSubmission?.studentId?.fullName ??
                      selectedSubmission?.student?.fullName ??
                      selectedSubmission?.studentName ??
                      "Học sinh",
                  )}
                </p>
              </div>
              <button
                onClick={closeSubmissionModal}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase text-slate-500">Nội dung bài làm</p>
                  <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {detailLoading
                      ? "Đang tải nội dung bài nộp..."
                      : getSubmissionText(selectedSubmission) ||
                        "Học viên nộp file đính kèm, không có văn bản trực tiếp."}
                  </div>
                  {detailError ? (
                    <p className="mt-2 text-xs text-amber-700">
                      Không tải được bản chi tiết, đang hiển thị dữ liệu có sẵn từ danh sách nộp bài.
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase text-slate-500">File đã nộp</p>
                  <div className="space-y-2">
                    {getSubmissionFiles(selectedSubmission).length === 0 ? (
                      <p className="text-sm text-slate-500">Không có file đính kèm.</p>
                    ) : (
                      getSubmissionFiles(selectedSubmission).map((fileUrl, idx) => (
                        <a
                          key={`${fileUrl}-${idx}`}
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          {fileUrl}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    placeholder="Nhập điểm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Nhận xét
                  </label>
                  <textarea
                    rows={7}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Nhập nhận xét cho học viên"
                  />
                </div>

                <button
                  onClick={handleGradeSubmission}
                  disabled={savingGrade}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingGrade ? "Đang lưu..." : "Lưu điểm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

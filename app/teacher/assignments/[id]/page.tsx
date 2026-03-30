"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft, Eye, X } from "lucide-react";
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
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res: any = await assignmentsService.getAssignmentById(id);
        const payload = res?.data ?? res;
        const raw =
          payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)
            ? payload.data
            : payload?.result && typeof payload.result === "object"
              ? payload.result
              : payload?.payload && typeof payload.payload === "object"
                ? payload.payload
                : payload;

        if (!raw || typeof raw !== "object") {
          setError("Không tìm thấy bài tập này.");
        } else {
          const questionsRaw = Array.isArray(raw?.questions) ? raw.questions : [];
          const attachmentsRaw = Array.isArray(raw?.attachments) ? raw.attachments : [];
          const attachments = attachmentsRaw
            .map((a: any) => {
              if (typeof a === "string") {
                return { url: a, name: "File đính kèm" };
              }
              const url = String(a?.url ?? a?.fileUrl ?? a?.path ?? "").trim();
              const name = String(a?.name ?? a?.fileName ?? a?.originalName ?? "").trim();
              return url ? { url, name: name || undefined } : null;
            })
            .filter(Boolean) as Array<{ url: string; name?: string }>;

          const firstAttachment = attachments[0];
          const fileUrl = String(
            raw?.fileUrl ??
              raw?.file?.url ??
              raw?.file?.fileUrl ??
              (Array.isArray(raw?.files) ? raw.files?.[0]?.url ?? raw.files?.[0]?.fileUrl : "") ??
              firstAttachment?.url ??
              "",
          ).trim();
          const fileName = String(
            raw?.fileName ??
              raw?.file?.name ??
              raw?.file?.originalName ??
              (Array.isArray(raw?.files) ? raw.files?.[0]?.name ?? raw.files?.[0]?.originalName : "") ??
              firstAttachment?.name ??
              "",
          ).trim();

          const assignmentMode: "file" | "question" =
            questionsRaw.length > 0 ? "question" : fileUrl || attachments.length ? "file" : "question";

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
              maxScore: Number(raw?.maxScore ?? raw?.totalScore ?? 0) || 0,
              fileUrl,
              fileName,
              assignmentMode,
              assignmentType: String(raw?.type ?? ""),
              classId: String(raw?.classId ?? raw?.class?._id ?? ""),
              dueDate: String(raw?.dueDate ?? ""),
              isPublished: Boolean(raw?.isPublished),
              createdAt: String(raw?.createdAt ?? ""),
              updatedAt: String(raw?.updatedAt ?? ""),
              attachments,
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
        const res: any = await assignmentsService.getAllSubmissionsByAssignmentIdForTeacher(id);
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

  const openSubmissionModal = (submission: any) => {
    setSelectedSubmission(submission);
    const scoreVal =
      typeof submission?.score === "number"
        ? String(submission.score)
        : "";
    setScoreInput(scoreVal);
    setFeedbackInput(String(submission?.feedback ?? ""));
  };

  const closeSubmissionModal = () => {
    setSelectedSubmission(null);
    setScoreInput("");
    setFeedbackInput("");
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
    if (typeof submission?.text === "string" && submission.text.trim()) {
      return submission.text.trim();
    }
    if (typeof submission?.content === "string" && submission.content.trim()) {
      return submission.content.trim();
    }
    if (typeof submission?.studentAnswer === "string" && submission.studentAnswer.trim()) {
      return submission.studentAnswer.trim();
    }
    if (submission?.studentAnswers) {
      try {
        return JSON.stringify(submission.studentAnswers, null, 2);
      } catch {
        return String(submission.studentAnswers);
      }
    }
    return "";
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
      <AssignmentEditor
        mode="edit"
        initialData={data}
      />

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
                  <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {getSubmissionText(selectedSubmission) || "Học viên nộp file đính kèm, không có văn bản trực tiếp."}
                  </div>
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

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Send, CheckCircle2, ExternalLink } from "lucide-react";
import { assignmentsService } from "@/services/assignments.service";

export default function AssignmentFileSubmitPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assignmentId = params?.id ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!file || !assignmentId) {
      setError("Vui lòng chọn file trước khi nộp.");
      return;
    }

    // Lấy studentId từ localStorage.currentUser
    let studentId = "";
    try {
      const raw = window.localStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        studentId = parsed?._id || parsed?.id || parsed?.data?._id || "";
      }
    } catch {
      studentId = "";
    }

    if (!studentId) {
      setError("Không tìm thấy studentId trong tài khoản hiện tại.");
      return;
    }

    try {
      setSubmitting(true);
      setDone(false);
      setError(null);

      // Nộp bài theo SubmissionsController (POST /submissions)
      // Backend sẽ nhận file trực tiếp qua multipart field: "files"
      const submissionRes: any = await assignmentsService.submitWithSubmissions(
        assignmentId,
        studentId,
        file,
        note,
      );

      // Nếu backend trả lại URL cho file/attachments thì hiển thị lại.
      const fileUrl =
        submissionRes?.fileUrl ||
        submissionRes?.url ||
        submissionRes?.attachmentUrl ||
        submissionRes?.file?.url ||
        submissionRes?.attachment?.url ||
        (Array.isArray(submissionRes?.attachments) &&
        typeof submissionRes.attachments?.[0] === "string"
          ? submissionRes.attachments[0]
          : undefined) ||
        (Array.isArray(submissionRes?.attachments) &&
        submissionRes.attachments?.[0]?.url
          ? submissionRes.attachments[0].url
          : undefined) ||
        undefined;

      setUploadedFileUrl(fileUrl ?? null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `assignment-submission-${assignmentId}`,
          JSON.stringify({
            fileUrl: fileUrl ?? undefined,
            fileName: file.name,
            submittedAt: new Date().toISOString(),
          }),
        );
      }
      setDone(true);
      setFile(null);
      setNote("");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Nộp bài thất bại. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-primary-card p-6 md:p-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-5"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Nộp bài tập (File)
          </h1>
          <p className="text-slate-500 mt-1">
            Trang này chỉ hỗ trợ nộp bài bằng file.
          </p>

          <div className="mt-6 space-y-4">
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Chọn file bài làm
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">
                Gợi ý: pdf, doc/docx, zip, ảnh chụp bài làm...
              </p>
              {file && (
                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Đã chọn: {file.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Ghi chú (tuỳ chọn)
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho giáo viên..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-400 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {done && (
            <div className="mt-5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              Nộp file thành công.
            </div>
          )}

          {uploadedFileUrl && (
            <div className="mt-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-900 text-sm">
              <div className="font-bold mb-1">File đã tải lên</div>
              <a
                href={uploadedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-4"
              >
                Xem file đã nộp
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onSubmit}
              disabled={submitting || !file}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold disabled:opacity-60"
            >
              {submitting ? <FileUp size={18} /> : <Send size={18} />}
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


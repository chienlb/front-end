"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, FileText, User, BookOpen, ArrowUpRight, Paperclip, ExternalLink } from "lucide-react";
import { ASSIGNMENTS } from "../data";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [submittedFile, setSubmittedFile] = useState<{
    fileUrl?: string;
    fileName?: string;
    submittedAt?: string;
  } | null>(null);

  const assignment = ASSIGNMENTS.find((a) => a.id === id);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`assignment-submission-${id}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setSubmittedFile(parsed);
    } catch {
      setSubmittedFile(null);
    }
  }, [id]);

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-primary-card p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900">Không tìm thấy bài tập</h1>
            <p className="text-slate-500 mt-2">Bài tập có thể đã bị xóa hoặc chưa được đồng bộ.</p>
            <button
              onClick={() => router.push("/assignments")}
              className="mt-6 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold"
            >
              Quay về danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-primary-card p-6 md:p-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-5"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
              {assignment.subject}
            </span>
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
              {assignment.source}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900">{assignment.title}</h1>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs text-slate-500 font-bold uppercase">Hạn nộp</p>
              <p className="text-sm text-slate-800 font-semibold mt-1 flex items-center gap-2">
                <Clock size={14} />
                {assignment.deadline}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs text-slate-500 font-bold uppercase">Giáo viên</p>
              <p className="text-sm text-slate-800 font-semibold mt-1 flex items-center gap-2">
                <User size={14} />
                {assignment.teacher ?? "Hệ thống"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs text-slate-500 font-bold uppercase">Thời lượng</p>
              <p className="text-sm text-slate-800 font-semibold mt-1 flex items-center gap-2">
                <BookOpen size={14} />
                {assignment.duration ?? "Không giới hạn"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
              <FileText size={16} />
              Nội dung bài tập
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {assignment.content ?? "Chưa có mô tả chi tiết."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-2">
              Yêu cầu nộp bài
            </h2>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
              {(assignment.requirements ?? ["Nộp bài bằng file."]).map((line, idx) => (
                <li key={`${assignment.id}-r-${idx}`}>{line}</li>
              ))}
            </ul>
          </div>

          {(assignment.attachmentUrl || submittedFile?.fileUrl) && (
            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Paperclip size={16} />
                File liên quan
              </h2>

              {assignment.attachmentUrl && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 font-bold uppercase">
                      File đề bài
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {assignment.attachmentName ?? "File đính kèm đề bài"}
                    </div>
                  </div>
                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Xem file
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {submittedFile?.fileUrl && (
                <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="min-w-0">
                    <div className="text-xs text-blue-600 font-bold uppercase">
                      File bạn đã nộp
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {submittedFile.fileName ?? "Bài nộp của bạn"}
                    </div>
                  </div>
                  <a
                    href={submittedFile.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100"
                  >
                    Xem file
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Link
              href={`/assignments/${assignment.id}/submit`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold"
            >
              Nộp file
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


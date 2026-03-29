"use client";

import { useMemo, useState } from "react";
import { Send, MessageSquareText, Star } from "lucide-react";
import { feedbackService, type FeedbackType } from "@/services/feedback.service";

const CATEGORIES: Array<{ value: FeedbackType; label: string; hint: string }> = [
  { value: "bug", label: "Báo lỗi", hint: "Có lỗi hiển thị, không bấm được, sai dữ liệu..." },
  { value: "general", label: "Góp ý chung", hint: "Gợi ý cải thiện trải nghiệm học tập, UI/UX..." },
  { value: "lesson", label: "Bài học", hint: "Vấn đề liên quan nội dung bài học hoặc tài liệu." },
  { value: "feature", label: "Tính năng", hint: "Đề xuất thêm hoặc chỉnh sửa tính năng." },
];

export default function StudentFeedbackPage() {
  const [category, setCategory] = useState<FeedbackType>("general");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryHint = useMemo(
    () => CATEGORIES.find((c) => c.value === category)?.hint ?? "",
    [category],
  );

  const submit = async () => {
    if (!title.trim()) {
      setError("Bạn hãy nhập tiêu đề phản hồi.");
      return;
    }

    if (!message.trim()) {
      setError("Bạn hãy nhập nội dung phản hồi trước khi gửi.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setDone(false);

      const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;

      await feedbackService.create({
        type: category,
        title: title.trim(),
        content: message.trim(),
        rating,
        relatedId: pageUrl,
        isResolved: false,
      });

      setDone(true);
      setTitle("");
      setMessage("");
      setRating(5);
      setCategory("general");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Gửi nhận xét thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquareText size={22} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                Nhận xét
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Góp ý để mình cải thiện bài học và trải nghiệm của bạn tốt hơn.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Loại phản hồi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackType)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold outline-none focus:border-blue-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">{categoryHint}</p>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Mức độ hài lòng
              </label>
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i + 1;
                    const active = v <= rating;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        className={`p-2 rounded-xl transition ${
                          active ? "text-yellow-500 bg-yellow-50" : "text-slate-300 hover:text-slate-400 hover:bg-slate-50"
                        }`}
                        aria-label={`rating-${v}`}
                      >
                        <Star size={18} className={active ? "fill-current" : ""} />
                      </button>
                    );
                  })}
                </div>
                <div className="ml-auto text-sm font-black text-slate-800">
                  {rating}/5
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Tiêu đề
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Không mở được bài luyện nghe Unit 3"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium outline-none focus:border-blue-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Nội dung
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                placeholder="Bạn gặp vấn đề gì? Bạn muốn cải thiện điều gì?"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium outline-none focus:border-blue-400 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-400">
                  Mẹo: nếu báo lỗi, hãy mô tả bước tái hiện + thiết bị/trình duyệt.
                </p>
                <p className="text-xs text-slate-400">{message.trim().length} ký tự</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-semibold text-sm">
              {error}
            </div>
          )}

          {done && (
            <div className="mt-5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold text-sm">
              Đã gửi nhận xét. Cảm ơn bạn!
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-200 transition disabled:opacity-60"
            >
              <Send size={18} />
              {submitting ? "Đang gửi..." : "Gửi nhận xét"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


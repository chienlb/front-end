"use client";

import { useEffect, useState } from "react";
import { Send, MessageSquareText, Star } from "lucide-react";
import {
  feedbackService,
  type FeedbackItem,
} from "@/services/feedback.service";

export default function StudentFeedbackPage() {
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 5;

  const typeLabel = (type?: string) => {
    if (type === "bug") return "Báo lỗi";
    if (type === "general") return "Góp ý chung";
    if (type === "lesson") return "Bài học";
    if (type === "feature") return "Tính năng";
    return "Phản hồi";
  };

  const getCurrentUserId = () => {
    if (typeof window === "undefined") return "";
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) return "";

    try {
      const parsed = JSON.parse(rawUser);
      return (
        parsed?._id ||
        parsed?.id ||
        parsed?.userId ||
        parsed?.user?._id ||
        ""
      );
    } catch {
      return "";
    }
  };

  const loadFeedbacks = async (page = 1) => {
    try {
      setLoadingFeedbacks(true);
      setFeedbackError(null);

      const res = await feedbackService.getAll(page, LIMIT);

      let rows = Array.isArray(res?.data) ? res.data : [];

      if (typeof window !== "undefined") {
        const rawUser = localStorage.getItem("currentUser");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          const currentUserId =
            parsed?._id || parsed?.id || parsed?.userId || parsed?.user?._id;
          if (currentUserId) {
            rows = rows.filter((item) => item.userId === currentUserId);
          }
        }
      }

      setFeedbacks(rows);
      setCurrentPage(page);
      setTotalPages(Math.max(1, Number(res?.totalPages || 1)));
    } catch (e: any) {
      setFeedbackError(
        e?.response?.data?.message || e?.message || "Không tải được danh sách nhận xét.",
      );
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    void loadFeedbacks(1);
  }, []);

  const submit = async () => {
    if (!message.trim()) {
      setError("Bạn hãy nhập nội dung phản hồi trước khi gửi.");
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setDone(false);

      await feedbackService.create({
        userId: String(userId),
        content: message.trim(),
        rating,
      });

      setDone(true);
      setMessage("");
      setRating(5);
      await loadFeedbacks(1);
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

          <div className="mt-8 grid grid-cols-1 gap-4">
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

        <div className="mt-6 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              Lịch sử nhận xét
            </h2>
            <button
              type="button"
              onClick={() => void loadFeedbacks(currentPage)}
              disabled={loadingFeedbacks}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingFeedbacks ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {feedbackError && (
            <div className="mt-4 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-semibold text-sm">
              {feedbackError}
            </div>
          )}

          {!feedbackError && loadingFeedbacks && (
            <div className="mt-4 text-sm font-semibold text-slate-500">
              Đang tải danh sách nhận xét...
            </div>
          )}

          {!feedbackError && !loadingFeedbacks && feedbacks.length === 0 && (
            <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-sm">
              Chưa có nhận xét nào.
            </div>
          )}

          {!feedbackError && !loadingFeedbacks && feedbacks.length > 0 && (
            <div className="mt-4 space-y-3">
              {feedbacks.map((item) => (
                <div key={item._id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {typeLabel(item.type)}
                    </span>
                    {item.isResolved ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        Đã xử lý
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        Chưa xử lý
                      </span>
                    )}
                    <span className="ml-auto text-xs text-slate-400 font-semibold">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-black text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 font-medium whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 font-semibold">
                    Đánh giá: {item.rating ?? "-"}/5
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void loadFeedbacks(currentPage - 1)}
                  disabled={currentPage <= 1 || loadingFeedbacks}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-sm font-bold text-slate-600 min-w-[110px] text-center">
                  Trang {currentPage}/{Math.max(1, totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => void loadFeedbacks(currentPage + 1)}
                  disabled={currentPage >= totalPages || loadingFeedbacks}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


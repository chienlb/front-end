"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Images,
  Music,
} from "lucide-react";
import { literatureService } from "@/services/literatures.service";

interface LiteratureDetail {
  _id: string;
  title: string;
  author?: string;
  level?: string;
  imageUrl?: string;
  contentVietnamese?: string;
  contentEnglish?: string;
  tags?: string[];
}

export default function LiteratureReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [data, setData] = useState<LiteratureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({});
  const [comicPage, setComicPage] = useState(0);

  const comicImages = useMemo(() => {
    const images = (data as any)?.images;
    if (!Array.isArray(images)) return [];
    return [...images]
      .filter((x) => x?.image)
      .sort((a, b) => (a?.pageIndex ?? 0) - (b?.pageIndex ?? 0));
  }, [data]);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await literatureService.getLiteratureById(id);
        const lit = res?.data ?? res;
        setData(lit);
      } catch (e: any) {
        console.error("Lỗi lấy chi tiết thơ văn:", e);
        setError("Không tải được nội dung. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    setComicPage(0);
    setOpenAnswers({});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">
            Đang mở bài thơ / đoạn văn...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <p className="text-4xl mb-3">📄</p>
          <h1 className="font-black text-lg text-slate-800 mb-2">
            Không tìm thấy bài thơ / bài văn
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Có thể bài đã bị xoá hoặc link không đúng. Bạn hãy quay lại thư viện để chọn bài khác nhé.
          </p>
          <button
            onClick={() => router.push("/literatures")}
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-bold shadow-xl shadow-violet-300/40 hover:shadow-2xl hover:shadow-violet-400/50 hover:from-violet-700 hover:to-violet-600 active:scale-[0.98] transition-all duration-300 border border-white/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </span>
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    author,
    level,
    imageUrl,
    contentVietnamese,
    contentEnglish,
    tags,
    type,
    vocabulary,
    grammarPoints,
    comprehensionQuestions,
    audioUrl,
    videoUrl,
  } = data as any;

  const hasVideo = typeof videoUrl === "string" && videoUrl.trim().length > 0;
  const hasAudio = typeof audioUrl === "string" && audioUrl.trim().length > 0;
  const isSong = type === "song" || hasVideo || hasAudio;

  const normalizeMultiline = (text?: string) =>
    typeof text === "string" ? text.replace(/\\n/g, "\n") : text;

  const safeRemoteSrc = (src?: string): string | undefined =>
    typeof src === "string" && src.length > 0 ? encodeURI(src) : undefined;

  const getYoutubeEmbedUrl = (url: string) => {
    const u = url.trim();
    const watchMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const id = watchMatch ? watchMatch[1] : null;
    if (id) return `https://www.youtube.com/embed/${id}?rel=0`;
    if (u.includes("youtube.com/embed/")) return u.split("?")[0] + "?rel=0";
    return null;
  };
  const youtubeEmbedUrl = hasVideo && videoUrl ? getYoutubeEmbedUrl(videoUrl.trim()) : null;

  const vnContent = normalizeMultiline(contentVietnamese);
  const enContent = normalizeMultiline(contentEnglish);

  const primaryContent = enContent || vnContent;
  const contentCardClass =
    "rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_18px_50px_rgba(148,163,184,0.14)] backdrop-blur";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#FFF8FC_0%,#F5FAFF_42%,#FFFDF4_100%)] pb-16 pt-24 font-sans">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(rgba(196,181,253,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(251,207,232,0.26),transparent_26%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.24),transparent_24%),radial-gradient(circle_at_bottom,rgba(253,230,138,0.18),transparent_28%)]" />
      <div className="pointer-events-none fixed left-[-60px] top-20 z-0 h-44 w-44 rounded-full bg-[#FBCFE8]/30 blur-3xl" />
      <div className="pointer-events-none fixed right-[-20px] top-32 z-0 h-52 w-52 rounded-full bg-[#BFDBFE]/28 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-3 md:px-6">
        {/* Back */}
        <button
          onClick={() => router.push("/literatures")}
          className="group mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-bold text-[#5b21b6] shadow-lg shadow-slate-200/50 backdrop-blur hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#ede9fe] hover:to-[#ddd6fe] hover:border-[#c4b5fd] hover:shadow-xl hover:shadow-violet-200/30 active:translate-y-0 active:scale-[0.99] transition-all duration-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed] group-hover:bg-[#ddd6fe] group-hover:scale-105 transition-all duration-300">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </span>
          <span className="tracking-wide">Quay lại thư viện</span>
        </button>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-[2.25rem] border-[3px] border-white/90 bg-[linear-gradient(135deg,#FFF7FB_0%,#F3F9FF_52%,#FFF9EE_100%)] shadow-[0_22px_60px_rgba(148,163,184,0.16)]">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                <Sparkles size={14} /> {type === "comic" ? "Truyện tranh" : isSong ? "Bài hát" : "Thơ văn thiếu nhi"}
              </div>
              <h1 className="mb-3 text-3xl font-black leading-snug text-slate-900 md:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm font-bold leading-6 text-slate-600 md:text-base">
                Cùng đọc, nghe và cảm nhận nội dung theo cách nhẹ nhàng hơn. Bé có
                thể xem tranh, nghe nhạc hoặc đọc từng đoạn thật chậm để hiểu bài.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {author && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 font-semibold shadow-sm">
                    ✍️ Tác giả: <span className="text-slate-800">{author}</span>
                  </span>
                )}
                {level && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 font-semibold shadow-sm">
                    <BookOpen size={14} /> Cấp độ: {level}
                  </span>
                )}
              </div>
              {tags && tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] bg-white/85 px-4 py-4 shadow-sm">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-500">
                    Hình thức
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {type === "comic" ? "Xem tranh" : isSong ? "Nghe và đọc" : "Đọc hiểu"}
                  </div>
                </div>
                <div className="rounded-[1.3rem] bg-white/85 px-4 py-4 shadow-sm">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-500">
                    Chế độ
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {enContent && vnContent ? "Song ngữ" : "Một ngôn ngữ"}
                  </div>
                </div>
                <div className="rounded-[1.3rem] bg-white/85 px-4 py-4 shadow-sm">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-500">
                    Hoạt động
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {Array.isArray(comprehensionQuestions) ? comprehensionQuestions.length : 0} câu hỏi
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-[260px] bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.12))] sm:min-h-[320px] md:min-h-[420px]">
              {(() => {
                const imageSrc = safeRemoteSrc(imageUrl);
                return imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-contain object-center p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-slate-400">
                    📚
                  </div>
                );
              })()}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_52%)]" />
            </div>
          </div>
        </div>

        {/* videoUrl = YouTube; audioUrl = audio */}
        {(youtubeEmbedUrl || hasAudio) && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Music size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-[0.18em]">
                {youtubeEmbedUrl ? "Xem / nghe" : "Nghe"}
              </h2>
            </div>
            <div className={`${contentCardClass} overflow-hidden`}>
              {youtubeEmbedUrl ? (
                <div className="aspect-video w-full bg-slate-900 relative">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : hasAudio && audioUrl ? (
                <div className="p-6 w-full">
                  <audio
                    key={audioUrl}
                    src={audioUrl.trim()}
                    controls
                    className="w-full"
                  />
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Comic viewer */}
        {type === "comic" && comicImages.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Images size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-[0.18em]">
                  Trang truyện
                </h2>
              </div>
              <div className="text-xs font-bold text-slate-500">
                Trang {comicPage + 1}/{comicImages.length}
              </div>
            </div>

            <div className={`${contentCardClass} overflow-hidden`}>
              <div className="relative bg-slate-900/95">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]">
                  {(() => {
                    const comicSrc = safeRemoteSrc(comicImages[comicPage]?.image);
                    return comicSrc ? (
                      <Image
                        src={comicSrc}
                        alt={`${title} - page ${comicPage + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 94vw, 900px"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/50">🖼️</div>
                    );
                  })()}
                </div>

                <div className="absolute inset-y-0 left-0 flex items-center px-2">
                  <button
                    type="button"
                    onClick={() => setComicPage((p) => Math.max(0, p - 1))}
                    disabled={comicPage === 0}
                    className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-800 shadow disabled:opacity-40 disabled:hover:bg-white/90"
                    aria-label="prev-page"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-2">
                  <button
                    type="button"
                    onClick={() =>
                      setComicPage((p) => Math.min(comicImages.length - 1, p + 1))
                    }
                    disabled={comicPage >= comicImages.length - 1}
                    className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-800 shadow disabled:opacity-40 disabled:hover:bg-white/90"
                    aria-label="next-page"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500 font-semibold">
                  Mẹo: kéo để zoom (trình duyệt) hoặc bấm mở ảnh trong tab mới.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComicPage(0)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Về trang 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setComicPage(comicImages.length - 1)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Trang cuối
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reading area */}
        <div className={`${contentCardClass} mb-10 p-5 md:p-8`}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-600">
                Trang đọc
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                Đọc và cảm nhận nội dung
              </div>
            </div>
            <div className="rounded-full bg-[linear-gradient(135deg,#FFF7FB_0%,#F4F9FF_100%)] px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-100">
              {enContent && vnContent ? "Đang hiển thị song ngữ" : "Đang hiển thị nội dung chính"}
            </div>
          </div>
          {enContent && vnContent ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-8 lg:gap-10">
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  English Version
                </h2>
                <div className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFCFF_100%)] p-5 text-[15px] leading-8 text-slate-800 whitespace-pre-line md:p-6 md:text-base">
                  {enContent}
                </div>
              </section>
              <section className="lg:border-l lg:border-dashed lg:border-slate-100 lg:pl-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                  Bản dịch tiếng Việt
                </h2>
                <div className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,#FFFDFC_0%,#FFFAF2_100%)] p-5 text-[14px] leading-8 text-slate-700 whitespace-pre-line md:p-6 md:text-[15px]">
                  {vnContent}
                </div>
              </section>
            </div>
          ) : (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                Nội dung bài đọc
              </h2>
              <div className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFCFF_100%)] p-5 text-[15px] leading-8 text-slate-800 whitespace-pre-line md:p-6 md:text-base">
                {primaryContent || "Bài viết đang được cập nhật."}
              </div>
            </section>
          )}
        </div>

        {/* Vocabulary */}
        {Array.isArray(vocabulary) && vocabulary.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-[0.18em]">
                Từ vựng quan trọng
              </h2>
            </div>
            <div className={`${contentCardClass} overflow-hidden`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100/60">
                {vocabulary.map((v: any, idx: number) => (
                  <div
                    key={`${v.word}-${idx}`}
                    className="flex flex-col gap-1 bg-white px-4 py-3 md:px-5 md:py-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          {v.word}
                        </span>
                        {v.partOfSpeech && (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {v.partOfSpeech}
                          </span>
                        )}
                      </div>
                      {v.ipa && (
                        <span className="text-xs font-mono text-slate-500">
                          {v.ipa}
                        </span>
                      )}
                    </div>
                    {v.meaning && (
                      <p className="text-sm text-slate-600">
                        {v.meaning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Grammar points */}
        {Array.isArray(grammarPoints) && grammarPoints.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Sparkles size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-[0.18em]">
                Ngữ pháp nổi bật
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grammarPoints.map((g: any, idx: number) => (
                <div
                  key={`${g.point}-${idx}`}
                  className={`${contentCardClass} p-4 md:p-5`}
                >
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                    {g.point}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {g.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comprehension questions */}
        {Array.isArray(comprehensionQuestions) &&
          comprehensionQuestions.length > 0 && (
            <section className="mb-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HelpCircle size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-[0.18em]">
                  Câu hỏi hiểu bài
                </h2>
              </div>
              <div className="space-y-4">
                {comprehensionQuestions.map((q: any, idx: number) => (
                  <div
                    key={`${q.question}-${idx}`}
                    className={`${contentCardClass} p-4 md:p-5`}
                  >
                    <p className="text-sm font-semibold text-slate-800 mb-2">
                      {idx + 1}. {q.question}
                    </p>
                    {q.answer && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenAnswers((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                        >
                          {openAnswers[idx] ? "Ẩn gợi ý" : "Xem gợi ý"}
                        </button>
                        {openAnswers[idx] && (
                          <p className="text-sm text-slate-600 mt-2">
                            <span className="font-semibold text-emerald-600">
                              Gợi ý:
                            </span>{" "}
                            {q.answer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}


"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { literatureService } from "@/services/literatures.service";
import { BookOpen, ArrowRight, Sparkles, Images, Music, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
const TYPE_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "story", label: "Truyện" },
  { key: "comic", label: "Truyện tranh" },
  { key: "song", label: "Bài hát" },
];
const GRADE_TABS = [
  { key: "all", label: "Mọi cấp" },
  { key: "starter", label: "Khởi động" },
  { key: "beginner", label: "Cơ bản" },
  { key: "intermediate", label: "Trung bình" },
  { key: "advanced", label: "Nâng cao" },
];
const CARD_THEMES = [
  { bg: "#FCEFF4", color: "#C86B90", shadow: "shadow-rose-100" },
  { bg: "#EEF8F5", color: "#5C9F92", shadow: "shadow-teal-100" },
  { bg: "#FFF7E9", color: "#C79048", shadow: "shadow-amber-100" },
  { bg: "#F4F1FF", color: "#7B6ED6", shadow: "shadow-violet-100" },
  { bg: "#EDF5FF", color: "#5E8FC0", shadow: "shadow-sky-100" },
];

function getGradeLabel(grade: string) {
  if (grade === "starter") return "Khởi động";
  if (grade === "beginner") return "Cơ bản";
  if (grade === "intermediate") return "Trung bình";
  if (grade === "advanced") return "Nâng cao";
  return grade || "Mọi cấp";
}

function getTypeLabel(type: string, hasAudio?: boolean) {
  if (type === "comic") return "Truyện tranh";
  if (hasAudio || type === "song") return "Bài hát";
  return "Truyện";
}

function pickLiteratureImageUrl(l: any): string {
  const candidates = [
    l?.imageUrl,
    l?.image,
    l?.thumbnail,
    l?.thumbnailUrl,
    l?.cover,
    l?.coverUrl,
    l?.banner,
    l?.bannerUrl,
    l?.imageURL,
  ];
  const raw = candidates.find((x) => typeof x === "string" && x.trim().length > 0);
  return typeof raw === "string" ? raw : "";
}

function LiteraturesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromQuery = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const typeFromQuery = (searchParams.get("type") || "all") as "all" | "story" | "comic" | "song";
  const gradeFromQuery = searchParams.get("grade") || "all";

  const [activeTab, setActiveTab] = useState<"all" | "story" | "comic" | "song">(typeFromQuery);
  const [gradeFilter, setGradeFilter] = useState(gradeFromQuery);
  const [literatures, setLiteratures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [useClientPagination, setUseClientPagination] = useState(false);

  const updateQuery = useCallback((updates: { page?: number; type?: string; grade?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.page !== undefined) params.set("page", String(updates.page));
    if (updates.type !== undefined) params.set("type", updates.type);
    if (updates.grade !== undefined) params.set("grade", updates.grade);
    router.replace(`/literatures?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const fetchLiteratures = async () => {
      if (useClientPagination) return;
      try {
        setLoading(true);
        let response: any;
        try {
          response = await literatureService.getAllLiteratures({
            page: pageFromQuery,
            limit: PAGE_SIZE,
            type: activeTab,
            grade: gradeFilter,
          });
        } catch (e: any) {
          if (e?.response?.status === 400) {
            response = await literatureService.getAllLiteratures();
            setUseClientPagination(true);
          } else throw e;
        }
        const raw =
          Array.isArray(response) ? response
          : Array.isArray(response?.data) ? response.data
          : Array.isArray(response?.literatures) ? response.literatures
          : Array.isArray(response?.items) ? response.items
          : Array.isArray((response as any)?.results) ? (response as any).results
          : Array.isArray((response as any)?.docs) ? (response as any).docs
          : Array.isArray((response as any)?.list) ? (response as any).list
          : Array.isArray((response as any)?.result) ? (response as any).result
          : (() => {
              const o = response && typeof response === "object" ? response : {};
              const key = Object.keys(o).find((k) => Array.isArray((o as any)[k]));
              return key ? (o as any)[key] : [];
            })();
        const published = raw.filter((l: any) => l.isPublished !== false);
        const mappedData = published.map((l: any, idx: number) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const type = (l.type || "story").toLowerCase();
          const desc = l.contentVietnamese || l.contentEnglish || "";
          const shortDesc = typeof desc === "string" ? desc.slice(0, 120) + (desc.length > 120 ? "…" : "") : "";
          return {
            id: l._id,
            title: l.title,
            description: shortDesc,
            thumbnail: pickLiteratureImageUrl(l),
            grade: l.level || "starter",
            type,
            hasAudio: !!(l.audioUrl && String(l.audioUrl).trim()),
            pageCount: Array.isArray(l.images) ? l.images.length : 0,
            theme,
          };
        });
        setLiteratures(mappedData);
        const totalCount = typeof response?.total === "number" ? response.total : response?.meta?.total;
        const pages = typeof response?.totalPages === "number" ? response.totalPages : response?.meta?.totalPages;
        if (totalCount != null) setTotal(totalCount);
        if (pages != null) setTotalPages(pages);
        if (totalCount == null && pages == null) {
          setTotal(mappedData.length);
          setTotalPages(Math.max(1, Math.ceil(mappedData.length / PAGE_SIZE)));
        }
      } catch (err) {
        console.error("Lỗi tải literatures:", err);
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    };
    fetchLiteratures();
  }, [pageFromQuery, activeTab, gradeFilter, useClientPagination]);

  useEffect(() => {
    setActiveTab(typeFromQuery);
    setGradeFilter(gradeFromQuery);
  }, [typeFromQuery, gradeFromQuery]);

  const filteredLiteratures = useClientPagination
    ? literatures.filter((literature) => {
        if (activeTab === "comic" && literature.type !== "comic") return false;
        if (activeTab === "song" && !literature.hasAudio && literature.type !== "song") return false;
        if (activeTab === "story" && (literature.type !== "story" || literature.hasAudio)) return false;
        if (gradeFilter !== "all" && literature.grade !== gradeFilter) return false;
        return true;
      })
    : literatures;

  const totalDisplay = useClientPagination ? filteredLiteratures.length : total;
  const totalPagesDisplay = useClientPagination
    ? Math.max(1, Math.ceil(filteredLiteratures.length / PAGE_SIZE))
    : totalPages;
  const currentPage = Math.max(1, Math.min(pageFromQuery, totalPagesDisplay));
  const displayedLiteratures = useClientPagination
    ? filteredLiteratures.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredLiteratures;

  useEffect(() => {
    // Nếu page trên URL vượt quá tổng trang sau khi lọc, kéo về trang hợp lệ.
    // Tránh trạng thái "rỗng giả" do còn giữ page cũ.
    if (loading) return;
    if (pageFromQuery !== currentPage) {
      updateQuery({ page: currentPage });
    }
  }, [loading, pageFromQuery, currentPage, updateQuery]);

  // --- 3. LOADING STATE ---
  if (loading && !hasLoadedOnce)
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-white">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#e9e5ff] border-t-[#7c3aed] animate-spin" />
          <p className="text-[#5b4b8a] font-semibold text-sm">Đang tải thư viện...</p>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white pb-24 font-sans text-slate-800">
      <style jsx global>{`
        .literature-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #8b80d8 rgba(255, 255, 255, 0.55);
        }

        .literature-sidebar-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .literature-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.45);
          border-radius: 0;
        }

        .literature-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #8b80d8;
          border-radius: 0;
          border: 2px solid rgba(255, 255, 255, 0.7);
        }

        .literature-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #786cc6;
        }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 bg-white pointer-events-none" aria-hidden />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 md:px-6">
        {/* 1. HEADER SECTION */}
        <motion.div
          className="pt-28 pb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2.25rem] border border-[#ECE7F6] bg-[#F8F3FF] p-6 shadow-primary-card md:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/80 px-4 py-1.5 text-sm font-black text-fuchsia-600 shadow-[0_4px_0_rgba(200,107,144,0.12),0_10px_24px_rgba(200,107,144,0.10)]">
                  <Sparkles size={16} /> Góc thơ văn thiếu nhi
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
                  Thư viện văn thơ
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-600 md:text-base">
                  Cùng đọc truyện, xem tranh, nghe bài hát và khám phá những nội
                  dung ngôn ngữ thật vui dành cho học sinh nhỏ.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FAF3F7] px-3 py-1.5 text-sm font-black text-[#C86B90] shadow-[0_4px_0_rgba(200,107,144,0.10),0_8px_18px_rgba(200,107,144,0.08)]">
                    Đọc vui
                  </span>
                  <span className="rounded-full bg-[#F1F6FC] px-3 py-1.5 text-sm font-black text-[#5E8FC0] shadow-[0_4px_0_rgba(94,143,192,0.10),0_8px_18px_rgba(94,143,192,0.08)]">
                    Dễ chọn
                  </span>
                  <span className="rounded-full bg-[#FFF6EA] px-3 py-1.5 text-sm font-black text-[#C79048] shadow-[0_4px_0_rgba(199,144,72,0.10),0_8px_18px_rgba(199,144,72,0.08)]">
                    Nhiều thể loại
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
                <div className="rounded-[1.5rem] bg-white/85 px-4 py-4 text-center shadow-[0_6px_0_rgba(200,107,144,0.10),0_14px_30px_rgba(148,163,184,0.08)] ring-1 ring-white/70">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-fuchsia-500">
                    Hiển thị
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {displayedLiteratures.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/85 px-4 py-4 text-center shadow-[0_6px_0_rgba(94,143,192,0.10),0_14px_30px_rgba(148,163,184,0.08)] ring-1 ring-white/70">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-500">
                    Tổng bài
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {totalDisplay}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/85 px-4 py-4 text-center shadow-[0_6px_0_rgba(199,144,72,0.10),0_14px_30px_rgba(148,163,184,0.08)] ring-1 ring-white/70">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-500">
                    Trang
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {currentPage}/{totalPagesDisplay}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/85 px-4 py-4 text-center shadow-[0_6px_0_rgba(123,110,214,0.10),0_14px_30px_rgba(148,163,184,0.08)] ring-1 ring-white/70">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500">
                    Đang chọn
                  </div>
                  <div className="mt-1 text-base font-black text-slate-900">
                    {TYPE_TABS.find((tab) => tab.key === activeTab)?.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-[1280px] gap-6 xl:grid-cols-[300px_1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="self-start"
          >
            <div className="literature-sidebar-scroll overflow-hidden rounded-[2rem] border border-[#ECE7F6] bg-white shadow-[0_8px_0_rgba(123,110,214,0.08),0_22px_56px_rgba(148,163,184,0.14)] xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
              <div className="border-b border-slate-100 bg-[#FAF8FF] p-5">
                <div className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-600">
                  Bộ lọc văn thơ
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  Chọn nhanh nội dung
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    Thể loại
                  </div>
                  <div className="space-y-2">
                    {TYPE_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => updateQuery({ type: tab.key, page: 1 })}
                        className={`flex w-full items-center justify-between rounded-[1.2rem] px-4 py-3 text-left text-sm font-black transition ${
                          activeTab === tab.key
                            ? "bg-[#7B6ED6] text-white shadow-[0_4px_0_rgba(91,80,176,0.18),0_10px_24px_rgba(123,110,214,0.18)]"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    Cấp độ
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GRADE_TABS.map((grade) => (
                      <button
                        key={grade.key}
                        onClick={() => updateQuery({ grade: grade.key, page: 1 })}
                        className={`rounded-full px-3.5 py-2 text-xs font-black transition ${
                          gradeFilter === grade.key
                            ? "bg-[#F4F1FF] text-[#7B6ED6] ring-2 ring-[#D8D1F8]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {grade.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.3rem] bg-[#FAF3F7] px-4 py-4 text-center">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-500">
                      Đang xem
                    </div>
                    <div className="mt-1 text-2xl font-black text-slate-900">
                      {displayedLiteratures.length}
                    </div>
                  </div>
                  <div className="rounded-[1.3rem] bg-[#F1F6FC] px-4 py-4 text-center">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-500">
                      Tổng bài
                    </div>
                    <div className="mt-1 text-2xl font-black text-slate-900">
                      {totalDisplay}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          <div className={`${loading ? "opacity-70 transition-opacity" : ""}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-600">
                  Kệ sách nhỏ
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  Các nội dung bé có thể xem
                </div>
              </div>
              <div className="hidden rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700 shadow-sm md:block">
                {displayedLiteratures.length} bài hiện có
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#ECE7F6] bg-white shadow-[0_8px_0_rgba(123,110,214,0.08),0_22px_56px_rgba(148,163,184,0.14)]">
              <AnimatePresence mode="popLayout">
                {displayedLiteratures.map((literature, index) => (
                  <motion.div
                    key={literature.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.28 }}
                    className={`group grid grid-cols-1 gap-4 p-5 md:grid-cols-[72px_180px_1fr_auto] md:items-center md:p-6 ${
                      index !== displayedLiteratures.length - 1
                        ? "border-b border-dashed border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-lg font-black text-slate-700 md:flex">
                      {index + 1}
                    </div>

                    <div
                      className="relative min-h-[150px] overflow-hidden rounded-[1.4rem] md:min-h-[120px]"
                      style={{ backgroundColor: literature.theme.bg }}
                    >
                      {literature.thumbnail ? (
                        <Image
                          src={
                            typeof literature.thumbnail === "string"
                              ? literature.thumbnail.replace(/ /g, "%20")
                              : literature.thumbnail
                          }
                          alt={literature.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 180px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          {literature.type === "comic"
                            ? "🖼️"
                            : literature.hasAudio || literature.type === "song"
                              ? "🎵"
                              : "📖"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700">
                          {getTypeLabel(literature.type, literature.hasAudio)}
                        </span>
                        <span className="rounded-full bg-[#F8EEF4] px-3 py-1 text-[11px] font-black text-[#C86B90]">
                          {getGradeLabel(literature.grade)}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900 transition-colors group-hover:text-[#7B6ED6]">
                        {literature.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {literature.description || "Cùng khám phá nội dung này nhé."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {literature.type === "comic" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                            <Images size={14} />
                            {literature.pageCount > 0 ? `${literature.pageCount} trang` : "Truyện tranh"}
                          </span>
                        )}
                        {literature.hasAudio && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600">
                            <Music size={14} />
                            Có nhạc
                          </span>
                        )}
                        {(literature.type === "story" ||
                          (!literature.type?.includes("comic") && !literature.hasAudio)) && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-600">
                            <BookOpen size={14} />
                            Truyện chữ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:justify-self-end">
                      <Link
                        href={`/literatures/${literature.id}/`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B6ED6] px-5 py-3 text-sm font-black text-white shadow-[0_4px_0_rgba(91,80,176,0.22),0_12px_28px_rgba(123,110,214,0.16)] transition-all duration-150 hover:bg-[#6E62C9] active:translate-y-[4px] active:shadow-none"
                      >
                        {literature.hasAudio ? "Nghe & đọc" : "Bắt đầu đọc"}
                        <ArrowRight size={18} strokeWidth={3} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Phân trang — nền trong suốt, không viền */}
        {totalPagesDisplay >= 1 && (
          <div className="mx-auto mt-10 mb-6 flex max-w-[1280px] flex-wrap items-center justify-center gap-2 py-4">
            <button
              onClick={() => updateQuery({ page: 1 })}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/90 border border-[#e9e5ff] text-[#5b21b6] font-bold text-sm hover:bg-[#ede9fe] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Trang đầu"
            >
              «
            </button>
            <button
              onClick={() => updateQuery({ page: Math.max(1, currentPage - 1) })}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/90 border border-[#e9e5ff] text-[#5b21b6] font-bold text-sm hover:bg-[#ede9fe] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={18} /> Trước
            </button>
            {Array.from({ length: totalPagesDisplay }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPagesDisplay || (p >= currentPage - 2 && p <= currentPage + 2))
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-[#5b4b8a]">…</span>}
                  <button
                    onClick={() => updateQuery({ page: p })}
                    className={`min-w-[2.25rem] px-3 py-2 rounded-xl text-sm font-bold ${
                      p === currentPage
                        ? "bg-[#7c3aed] text-white border border-[#7c3aed]"
                        : "bg-white/90 border border-[#e9e5ff] text-[#5b21b6] hover:bg-[#ede9fe]"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => updateQuery({ page: Math.min(totalPagesDisplay, currentPage + 1) })}
              disabled={currentPage >= totalPagesDisplay}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/90 border border-[#e9e5ff] text-[#5b21b6] font-bold text-sm hover:bg-[#ede9fe] disabled:opacity-40 disabled:pointer-events-none"
            >
              Sau <ChevronRight size={18} />
            </button>
            <button
              onClick={() => updateQuery({ page: totalPagesDisplay })}
              disabled={currentPage >= totalPagesDisplay}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/90 border border-[#e9e5ff] text-[#5b21b6] font-bold text-sm hover:bg-[#ede9fe] disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Trang cuối"
            >
              »
            </button>
            <span className="px-3 py-2 text-sm font-bold text-[#5b4b8a]">
              Trang {currentPage} / {totalPagesDisplay}
              {totalDisplay > 0 && <span className="font-normal ml-1 text-[#5b4b8a]/80">({totalDisplay} bài)</span>}
            </span>
          </div>
        )}

        {/* 4. EMPTY STATE */}
        {filteredLiteratures.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-[#e9e5ff] mt-8">
            <p className="text-6xl mb-4 grayscale opacity-50">📭</p>
            <p className="text-[#5b4b8a] font-bold text-lg">
              Chưa có bản ghi nào cho mục này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiteraturesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LiteraturesPageContent />
    </Suspense>
  );
}

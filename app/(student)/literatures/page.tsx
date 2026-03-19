"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { literatureService } from "@/services/literatures.service";
import { BookOpen, ArrowRight, Sparkles, Images, Music, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

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

  const CARD_THEMES = [
    { bg: "#FFF0F0", color: "#FF6B6B", shadow: "shadow-red-200" },
    { bg: "#E0F9F6", color: "#4ECDC4", shadow: "shadow-teal-200" },
    { bg: "#FFFBE6", color: "#F6E05E", shadow: "shadow-yellow-200" },
    { bg: "#F3E8FF", color: "#9F7AEA", shadow: "shadow-purple-200" },
    { bg: "#E8F4FD", color: "#3B82F6", shadow: "shadow-blue-200" },
  ];

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
            thumbnail: l.imageUrl,
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
      }
    };
    fetchLiteratures();
  }, [pageFromQuery, activeTab, gradeFilter]);

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

  // --- 3. LOADING STATE ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center relative">
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/images/cartoon-children-playing-together-outdoors.jpg)" }} />
        <div className="fixed inset-0 z-0 bg-white/30" aria-hidden />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#e9e5ff] border-t-[#7c3aed] animate-spin" />
          <p className="text-[#5b4b8a] font-semibold text-sm">Đang tải thư viện...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen relative font-sans text-slate-800 pb-24 overflow-x-hidden">
      {/* --- BACKGROUND LAYER --- */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/cartoon-children-playing-together-outdoors.jpg)" }}
      />
      <div className="fixed inset-0 z-0 bg-white/30" aria-hidden />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 container mx-auto px-4">
        {/* 1. HEADER SECTION */}
        <motion.div
          className="text-center pt-28 pb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 bg-[#ede9fe] text-[#5b21b6] px-4 py-1.5 rounded-full font-bold text-sm mb-4 border border-[#e9e5ff]">
            <Sparkles size={16} /> Cùng bé chinh phục tri thức
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3730a3] mb-4 drop-shadow-sm tracking-tight">
            THƠ VĂN
          </h1>
        </motion.div>

        {/* Tabs: loại */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: "all", label: "Tất cả" },
            { key: "story", label: "Truyện" },
            { key: "comic", label: "Truyện tranh" },
            { key: "song", label: "Bài hát" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => updateQuery({ type: tab.key, page: 1 })}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                activeTab === tab.key
                  ? "bg-[#7c3aed] text-white border border-[#7c3aed] shadow-md"
                  : "bg-white/90 text-[#5b4b8a] border border-[#e9e5ff] hover:bg-[#ede9fe]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lọc cấp độ */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["all", "starter", "beginner", "intermediate", "advanced"].map((g) => (
            <button
              key={g}
              onClick={() => updateQuery({ grade: g, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                gradeFilter === g ? "bg-[#7c3aed] text-white border border-[#7c3aed]" : "bg-white/80 text-[#5b4b8a] border border-[#e9e5ff] hover:bg-[#ede9fe]"
              }`}
            >
              {g === "all" ? "Mọi cấp" : g === "starter" ? "Khởi động" : g === "beginner" ? "Cơ bản" : g === "intermediate" ? "Trung bình" : "Nâng cao"}
            </button>
          ))}
        </div>

        {/* 3. UNITS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          <AnimatePresence mode="popLayout">
            {displayedLiteratures.map((literature) => (
              <motion.div
                key={literature.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="w-full max-w-[400px] mx-auto flex flex-col h-full bg-white/90 backdrop-blur-xl rounded-[2rem] border-[3px] border-white shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
              >
                {/* A. Card Image Area */}
                <div
                  className="h-48 relative flex items-center justify-center overflow-hidden rounded-t-[1.8rem]"
                  style={{ backgroundColor: literature.theme.bg }}
                >
                  {/* Bong bóng trang trí */}
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute top-5 right-5 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>

                  {literature.thumbnail ? (
                    <motion.img
                      src={typeof literature.thumbnail === "string" ? literature.thumbnail.replace(/ /g, "%20") : literature.thumbnail}
                      alt={literature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <motion.span
                      className="text-6xl filter drop-shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                    >
                      {literature.type === "comic" ? "🖼️" : literature.hasAudio ? "🎵" : "📖"}
                    </motion.span>
                  )}

                  {/* Badge loại + cấp độ */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-700">
                      {literature.type === "comic" ? "Truyện tranh" : literature.hasAudio || literature.type === "song" ? "Bài hát" : "Truyện"}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/20 text-white backdrop-blur-sm">
                      {literature.grade === "starter" && "Khởi động"}
                      {literature.grade === "beginner" && "Cơ bản"}
                      {literature.grade === "intermediate" && "Trung bình"}
                      {literature.grade === "advanced" && "Nâng cao"}
                      {!["starter","beginner","intermediate","advanced"].includes(literature.grade) && (literature.grade || "—")}
                    </span>
                  </div>
                </div>

                {/* B. Card Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {literature.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-1">
                    {literature.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-dashed border-slate-100 pt-4 mb-6">
                    {literature.type === "comic" && (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <Images size={16} className="text-amber-500" />
                        {literature.pageCount > 0 ? `${literature.pageCount} trang` : "Truyện tranh"}
                      </div>
                    )}
                    {literature.hasAudio && (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <Music size={16} className="text-rose-500" />
                        Có nhạc
                      </div>
                    )}
                    {(literature.type === "story" || (!literature.type?.includes("comic") && !literature.hasAudio)) && (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <BookOpen size={16} className="text-blue-400" />
                        Truyện chữ
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/literatures/${literature.id}/`}
                    className="block w-full py-3.5 rounded-2xl font-black text-white text-center shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px] transition-all duration-150 group-hover:brightness-110"
                    style={{ backgroundColor: literature.theme.color }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {literature.hasAudio ? "Nghe & đọc" : "Bắt đầu đọc"} <ArrowRight size={20} strokeWidth={3} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Phân trang — nền trong suốt, không viền */}
        {totalPagesDisplay >= 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10 mb-6 py-4 bg-transparent">
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

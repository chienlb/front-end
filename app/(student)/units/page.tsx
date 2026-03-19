"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { unitService } from "@/services/units.service";
import { BookOpen, Users, ArrowRight, Star, Sparkles } from "lucide-react";

const CARD_THEMES = [
  { bg: "#FFEFF5", color: "#F472B6", shadow: "shadow-pink-200" },
  { bg: "#EAF8FF", color: "#38BDF8", shadow: "shadow-sky-200" },
  { bg: "#FFF7E8", color: "#F59E0B", shadow: "shadow-amber-200" },
  { bg: "#F2EEFF", color: "#8B5CF6", shadow: "shadow-violet-200" },
];

type UnitTheme = (typeof CARD_THEMES)[number];

type UnitApi = {
  _id: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  difficulty?: string;
  totalLessons?: number;
  isActive?: string;
};

type UnitCard = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  grade: string;
  lessons: number;
  students: number;
  icon: string;
  theme: UnitTheme;
};

function getDifficultyMeta(grade: string) {
  if (grade === "medium") {
    return {
      label: "Trung bình",
      emoji: "🚀",
      desc: "Có thêm thử thách vui",
    };
  }

  if (grade === "hard") {
    return {
      label: "Nâng cao",
      emoji: "🏆",
      desc: "Dành cho bé muốn chinh phục nhiều hơn",
    };
  }

  return {
    label: "Cơ bản",
    emoji: "🌟",
    desc: "Phù hợp để bắt đầu thật nhẹ nhàng",
  };
}

export default function UnitsPage() {
  // --- 1. STATE & CONFIG ---
  const [activeTab, setActiveTab] = useState("all");
  const [units, setUnits] = useState<UnitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "easy", label: "Cơ bản" },
    { id: "medium", label: "Trung bình" },
    { id: "hard", label: "Nâng cao" },
  ];

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);

        const response = await unitService.getAllUnits();
        console.log("RAW RESPONSE:", response);
        const units = ((response as { data?: UnitApi[] })?.data ?? []) as UnitApi[];

        const filtered = units.filter(
          (u) => u.isActive === "active"
        );

        const mappedData = filtered.map((u, idx): UnitCard => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];

          return {
            id: u._id,
            title: u.name || `Chương ${idx + 1}`,
            description: u.description,
            thumbnail: u.thumbnail,
            grade: u.difficulty || "easy",
            lessons: u.totalLessons || 0,
            students: 100 + idx * 50,
            icon: ["🐶", "🚀", "🎨", "🐸", "🦁", "🤖"][idx % 6],
            theme,
          };
        });

        setUnits(mappedData);
      } catch (err) {
        console.error("Lỗi tải chương:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  // Lọc chương theo Tab
  const filteredUnits =
    activeTab === "all"
      ? units
      : units.filter((unit) => unit.grade === activeTab);
  const totalLessons = units.reduce(
    (sum, unit) => sum + Number(unit.lessons || 0),
    0,
  );

  // --- 3. LOADING STATE ---
  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,#FDF7FF_0%,#F0F9FF_50%,#FFFDEA_100%)]">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-blue-500"></div>
        <p className="animate-pulse text-xl font-bold text-blue-500">
          Đang tải thư viện...
        </p>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-24 font-sans text-slate-800">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-course.png"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          className="opacity-100 saturate-[1.08] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,251,0.68),rgba(241,248,255,0.72)_45%,rgba(255,250,237,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(196,181,253,0.22)_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute left-[-40px] top-20 h-40 w-40 rounded-full bg-[#FCE7F3]/40 blur-3xl" />
        <div className="absolute right-[-30px] top-40 h-44 w-44 rounded-full bg-[#DBEAFE]/38 blur-3xl" />
        <div className="absolute left-[8%] top-[18%] text-5xl opacity-65">☁️</div>
        <div className="absolute right-[9%] top-[22%] text-4xl opacity-60">⭐</div>
        <div className="absolute left-[12%] bottom-[18%] text-4xl opacity-60">🌈</div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 md:px-6">
        {/* 1. HEADER SECTION */}
        <motion.div
          className="pt-28 pb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[2.25rem] border-4 border-white bg-[linear-gradient(135deg,#FFF5FA_0%,#F4F9FF_55%,#FFF8EA_100%)] p-6 shadow-[0_24px_60px_rgba(148,163,184,0.16)] md:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
            <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-full bg-yellow-200/30 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-40 rounded-full bg-white/20 blur-2xl" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl text-left text-slate-900">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/75 px-4 py-1.5 text-sm font-black text-fuchsia-600 shadow-sm">
                  <Sparkles size={16} /> Cùng bé chinh phục tri thức
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
                  Chương học tập
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-700 md:text-base">
                  Mỗi chương là một chặng đường nhỏ. Bé có thể chọn chương yêu
                  thích, học từng bài và nhận thêm thật nhiều ngôi sao.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-pink-600 shadow-sm">
                    Dễ nhìn
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-sky-600 shadow-sm">
                    Dễ bấm
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-amber-600 shadow-sm">
                    Có sao thưởng
                  </span>
                </div>
                <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-[1.5rem] bg-white/75 px-4 py-4 shadow-sm ring-1 ring-white/60">
                  <div className="text-3xl">🧸</div>
                  <div className="text-sm font-bold leading-6 text-slate-700">
                    Gợi ý nhỏ: Bé nên bắt đầu từ các chương <span className="text-pink-600">Cơ bản</span>
                    trước, sau đó mở dần các chương khó hơn để học thật vui và không bị ngợp.
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                  <span>🎯</span>
                  Nhiệm vụ hôm nay: chọn 1 chương và bắt đầu học
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[360px] lg:min-w-[420px]">
                <div className="rounded-[1.5rem] bg-white/85 px-4 py-4 text-center shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-500">
                    Số chương
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {units.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-[#FFF6FB]/85 px-4 py-4 text-center shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-pink-500">
                    Tổng bài
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {totalLessons}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-[#FFFBEF]/85 px-4 py-4 text-center shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-500">
                    Đang xem
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {filteredUnits.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-[#F7F3FF]/85 px-4 py-4 text-center shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500">
                    Ngôi sao
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-3xl font-black text-slate-900">
                    <Star size={20} className="fill-[#FACC15] text-[#FACC15]" />
                    {units.length * 3}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mb-8 max-w-[1320px] rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_18px_50px_rgba(148,163,184,0.12)] backdrop-blur lg:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45 }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-600">
                Danh sách chương
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                Bé chọn một chương để bắt đầu nhé
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-[1.5rem] border border-white/80 bg-[linear-gradient(135deg,#FFF5FA_0%,#F4F9FF_55%,#FFF8EA_100%)] p-2 shadow-[0_12px_35px_rgba(148,163,184,0.12)] md:w-auto md:justify-end">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-600 shadow-sm">
                  <Sparkles size={14} className="text-amber-400" />
                  Bộ lọc
                </div>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                      activeTab === tab.id
                        ? "bg-[linear-gradient(135deg,#F472B6_0%,#60A5FA_100%)] text-white shadow-[0_10px_24px_rgba(244,114,182,0.28)]"
                        : "bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <span className="rounded-full bg-[#FCE7F3] px-4 py-2 text-sm font-black text-[#DB2777] shadow-sm">
                  Đang chọn: {tabs.find((tab) => tab.id === activeTab)?.label}
                </span>
                <span className="rounded-full bg-[#FFF6DD] px-4 py-2 text-sm font-black text-[#B7791F] shadow-sm">
                  {filteredUnits.length} chương phù hợp
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. UNITS GRID (Danh sách chương) */}
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredUnits.map((unit, index) => (
              <motion.div
                key={unit.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="group flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] border-[3px] border-white bg-white/90 shadow-[0_16px_40px_rgba(148,163,184,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(148,163,184,0.18)]"
              >
                {/* A. Card Image Area */}
                <div
                  className="relative flex h-44 items-center justify-center overflow-hidden rounded-t-[1.6rem]"
                  style={{ backgroundColor: unit.theme.bg }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_55%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"></div>
                  <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/30 blur-xl"></div>
                  <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                    Chương {index + 1}
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                    {unit.lessons} bài học
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-[#FFF7DB] px-3 py-1 text-[11px] font-black text-[#B7791F] shadow-sm">
                    {index % 3 === 0 ? "Nổi bật" : index % 2 === 0 ? "Phổ biến" : "Mới"}
                  </div>

                  {unit.thumbnail ? (
                    <Image
                      src={unit.thumbnail}
                      alt={unit.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <motion.span
                      className="text-7xl filter drop-shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                    >
                      {unit.icon}
                    </motion.span>
                  )}

                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                      {unit.grade === "easy" && "Cơ bản"}
                      {unit.grade === "medium" && "Trung bình"}
                      {unit.grade === "hard" && "Nâng cao"}
                    </span>
                  </div>
                </div>

                {/* B. Card Body */}
                <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5">
                  <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                    <Sparkles size={12} />
                    Học thật vui
                  </div>
                  <h3 className="mb-2 text-[1.35rem] font-black leading-tight text-slate-800 transition-colors group-hover:text-blue-600">
                    {unit.title}
                  </h3>
                  <p className="mb-5 flex-1 line-clamp-3 text-sm font-medium leading-6 text-slate-500">
                    {unit.description || "Cùng khám phá chương học thú vị này nhé."}
                  </p>

                  <div className="mb-4 flex items-center gap-2 rounded-[1.1rem] bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                    <span className="text-2xl">{getDifficultyMeta(unit.grade).emoji}</span>
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        {getDifficultyMeta(unit.grade).label}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {getDifficultyMeta(unit.grade).desc}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        size={16}
                        className={`${
                          starIdx <
                          (unit.grade === "hard"
                            ? 3
                            : unit.grade === "medium"
                              ? 2
                              : 1)
                            ? "fill-[#FACC15] text-[#FACC15]"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-black text-slate-500">
                      Mức độ phù hợp
                    </span>
                  </div>

                  {/* Stats Divider */}
                  <div className="mb-5 flex items-center justify-between border-t-2 border-dashed border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <BookOpen size={16} className="text-blue-400" />
                      {unit.lessons} bài
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <Users size={16} className="text-green-400" />
                      {unit.students} bạn
                    </div>
                  </div>

                  <div className="mb-5 flex items-center justify-between rounded-[1.1rem] bg-[linear-gradient(135deg,#FFF7FB_0%,#F4F9FF_100%)] px-3.5 py-3 ring-1 ring-slate-100">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                        Gợi ý
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-800">
                        {unit.grade === "easy"
                          ? "Bắt đầu nhẹ nhàng"
                          : unit.grade === "medium"
                            ? "Luyện thêm mỗi ngày"
                            : "Chinh phục thử thách"}
                      </div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
                      {unit.grade === "easy"
                        ? "Phù hợp hôm nay"
                        : unit.grade === "medium"
                          ? "Rất thú vị"
                          : "Cố lên nhé"}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/units/${unit.id}/lessons/`}
                    className="block w-full rounded-2xl bg-[linear-gradient(135deg,#F472B6_0%,#60A5FA_100%)] py-3 text-center text-sm font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all duration-150 active:translate-y-[4px] active:shadow-none group-hover:brightness-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Vào chương học <ArrowRight size={20} strokeWidth={3} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 4. EMPTY STATE */}
        {filteredUnits.length === 0 && (
          <div className="mt-8 rounded-3xl border-4 border-dashed border-slate-200 bg-white/50 py-20 text-center backdrop-blur-sm">
            <p className="text-6xl mb-4 grayscale opacity-50">📭</p>
            <p className="text-slate-500 font-bold text-lg">
              Chưa có chương nào cho mục này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

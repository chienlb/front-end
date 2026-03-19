"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { unitService } from "@/services/units.service";
import { BookOpen, Users, ArrowRight, Star, Sparkles } from "lucide-react";

const CARD_THEMES = [
  { bg: "#FCEFF4", color: "#C86B90", shadow: "shadow-rose-100" },
  { bg: "#EEF5FF", color: "#5E8FC0", shadow: "shadow-sky-100" },
  { bg: "#FFF6E9", color: "#C79048", shadow: "shadow-amber-100" },
  { bg: "#F4F1FF", color: "#7B6ED6", shadow: "shadow-violet-100" },
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
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-blue-500"></div>
        <p className="animate-pulse text-xl font-bold text-blue-500">
          Đang tải thư viện...
        </p>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white pb-24 font-sans text-slate-800">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 bg-white" />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 md:px-6">
        {/* 1. HEADER SECTION */}
        <motion.div
          className="pt-28 pb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[2.25rem] border border-[#DCCFF5] bg-[#F2EAFE] p-6 shadow-[0_10px_0_rgba(123,110,214,0.22),0_32px_80px_rgba(124,111,214,0.20)] md:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/45 blur-2xl" />
            <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-full bg-[#DDD0F8]/70 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-40 rounded-full bg-white/35 blur-2xl" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl text-left text-slate-900">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E7D9F8] bg-white px-4 py-1.5 text-sm font-black text-[#7B6ED6] shadow-[0_4px_0_rgba(123,110,214,0.12),0_10px_24px_rgba(123,110,214,0.10)]">
                  <Sparkles size={16} /> Cùng bé chinh phục tri thức
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
                  Chương học tập
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-extrabold leading-6 text-slate-700 md:text-base">
                  Mỗi chương là một chặng đường nhỏ. Bé có thể chọn chương yêu
                  thích, học từng bài và nhận thêm thật nhiều ngôi sao.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FAF3F7] px-3 py-1.5 text-sm font-black text-[#C86B90] shadow-sm">
                    Dễ nhìn
                  </span>
                  <span className="rounded-full bg-[#F1F6FC] px-3 py-1.5 text-sm font-black text-[#5E8FC0] shadow-sm">
                    Dễ bấm
                  </span>
                  <span className="rounded-full bg-[#FFF6EA] px-3 py-1.5 text-sm font-black text-[#C79048] shadow-sm">
                    Có sao thưởng
                  </span>
                </div>
                <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-[1.5rem] border border-[#E7D9F8] bg-white px-4 py-4 shadow-[0_6px_0_rgba(123,110,214,0.10),0_14px_30px_rgba(123,110,214,0.08)]">
                  <div className="text-3xl">🧸</div>
                  <div className="text-sm font-bold leading-6 text-slate-700">
                    Gợi ý nhỏ: Bé nên bắt đầu từ các chương <span className="text-[#C86B90]">Cơ bản</span>
                    trước, sau đó mở dần các chương khó hơn để học thật vui và không bị ngợp.
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-[0_4px_0_rgba(15,23,42,0.08),0_10px_24px_rgba(15,23,42,0.05)]">
                  <span>🎯</span>
                  Nhiệm vụ hôm nay: chọn 1 chương và bắt đầu học
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[360px] lg:min-w-[420px]">
                <div className="rounded-[1.5rem] border border-[#DCEAFB] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(94,143,192,0.12),0_14px_30px_rgba(94,143,192,0.08)]">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5E8FC0]">
                    Số chương
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {units.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[#F3D8E4] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(200,107,144,0.12),0_14px_30px_rgba(200,107,144,0.08)]">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C86B90]">
                    Tổng bài
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {totalLessons}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[#F6E3BC] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(199,144,72,0.12),0_14px_30px_rgba(199,144,72,0.08)]">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C79048]">
                    Đang xem
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {filteredUnits.length}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[#E2D9FA] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(123,110,214,0.12),0_14px_30px_rgba(123,110,214,0.08)]">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7B6ED6]">
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
          className="mx-auto mb-8 max-w-[1320px] rounded-[2rem] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_0_rgba(15,23,42,0.08),0_24px_60px_rgba(15,23,42,0.07)] lg:p-5"
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
              <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-[1.5rem] border border-[#E5E7EB] bg-[#F8FAFC] p-2 shadow-[0_6px_0_rgba(15,23,42,0.07),0_12px_30px_rgba(15,23,42,0.05)] md:w-auto md:justify-end">
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
                        ? "bg-[#7B6ED6] text-white shadow-[0_10px_24px_rgba(123,110,214,0.22)]"
                        : "bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <span className="rounded-full border border-[#F3D8E4] bg-[#FCF5F8] px-4 py-2 text-sm font-black text-[#C86B90] shadow-sm">
                  Đang chọn: {tabs.find((tab) => tab.id === activeTab)?.label}
                </span>
                <span className="rounded-full border border-[#F6E3BC] bg-[#FFF8EF] px-4 py-2 text-sm font-black text-[#C79048] shadow-sm">
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
                className="group flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] border border-[#E5E7EB] bg-white shadow-[0_8px_0_rgba(15,23,42,0.08),0_24px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(15,23,42,0.10),0_28px_68px_rgba(15,23,42,0.12)]"
              >
                {/* A. Card Image Area */}
                <div
                  className="relative flex h-44 items-center justify-center overflow-hidden rounded-t-[1.6rem]"
                  style={{ backgroundColor: unit.theme.bg }}
                >
                  <div className="absolute inset-0 bg-white/6" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-slate-900/12" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"></div>
                  <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/30 blur-xl"></div>
                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800 shadow-[0_4px_0_rgba(15,23,42,0.08),0_8px_18px_rgba(15,23,42,0.08)]">
                    Chương {index + 1}
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 shadow-[0_4px_0_rgba(15,23,42,0.08),0_8px_18px_rgba(15,23,42,0.08)]">
                    {unit.lessons} bài học
                  </div>
                  <div className="absolute right-4 top-4 rounded-full border border-[#F6E3BC] bg-[#FFF8EF] px-3 py-1 text-[11px] font-black text-[#B7791F] shadow-[0_4px_0_rgba(199,144,72,0.10),0_8px_18px_rgba(199,144,72,0.08)]">
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
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 shadow-[0_4px_0_rgba(15,23,42,0.08),0_8px_18px_rgba(15,23,42,0.08)]">
                      {unit.grade === "easy" && "Cơ bản"}
                      {unit.grade === "medium" && "Trung bình"}
                      {unit.grade === "hard" && "Nâng cao"}
                    </span>
                  </div>
                </div>

                {/* B. Card Body */}
                <div className="flex flex-1 flex-col bg-white p-5">
                  <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                    <Sparkles size={12} />
                    Học thật vui
                  </div>
                  <h3 className="mb-2 text-[1.35rem] font-black leading-tight text-slate-800 transition-colors group-hover:text-[#7B6ED6]">
                    {unit.title}
                  </h3>
                  <p className="mb-5 flex-1 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                    {unit.description || "Cùng khám phá chương học thú vị này nhé."}
                  </p>

                  <div className="mb-4 flex items-center gap-2 rounded-[1.1rem] border border-[#EDE9F7] bg-[#FBFAFD] px-3 py-3 shadow-[0_5px_0_rgba(123,110,214,0.08),0_10px_24px_rgba(123,110,214,0.05)]">
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

                  <div className="mb-5 flex items-center justify-between rounded-[1.1rem] border border-[#EDE9F7] bg-[#FAF8FF] px-3.5 py-3 shadow-[0_5px_0_rgba(123,110,214,0.08),0_10px_24px_rgba(123,110,214,0.05)]">
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
                    <div className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
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
                    className="block w-full rounded-2xl bg-[#7B6ED6] py-3 text-center text-sm font-black text-white shadow-[0_4px_0_rgba(91,80,176,0.22)] transition-all duration-150 hover:bg-[#6E62C9] active:translate-y-[4px] active:shadow-none"
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

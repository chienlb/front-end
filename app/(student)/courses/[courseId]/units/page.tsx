"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { userService } from "@/services/user.service";
import { Star, Trophy, Lock, Play, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import LottiePet from "@/components/student/ui/LottiePet";

const DEFAULT_BG = "linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)";
const UNIT_THEMES = [
  {
    shell: "from-[#67C7FF] via-[#7ED7FF] to-[#A6F0D0]",
    badge: "bg-[#E9F7FF] text-[#1879B8]",
    panel: "bg-[#F5FBFF]",
    lesson: "from-[#EAF7FF] to-[#F9FDFF] border-[#CBEAFF]",
    chip: "bg-[#DFF3FF] text-[#1879B8]",
  },
  {
    shell: "from-[#FF9CC2] via-[#FFB2D0] to-[#FFDFA2]",
    badge: "bg-[#FFF0F6] text-[#D64B82]",
    panel: "bg-[#FFF8FB]",
    lesson: "from-[#FFF1F7] to-[#FFFDFC] border-[#FFD6E6]",
    chip: "bg-[#FFE5F0] text-[#D64B82]",
  },
  {
    shell: "from-[#7BCF7A] via-[#9ADF7C] to-[#FFE28A]",
    badge: "bg-[#EEFFE8] text-[#368B35]",
    panel: "bg-[#FAFFF5]",
    lesson: "from-[#F2FFE9] to-[#FFFDF5] border-[#DCF4C9]",
    chip: "bg-[#E5F8D8] text-[#368B35]",
  },
];

function getUnitTheme(index: number) {
  return UNIT_THEMES[index % UNIT_THEMES.length];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const router = useRouter();

  // --- STATE ---
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [currentPetPosition, setCurrentPetPosition] = useState<string | null>(
    null,
  );
  const [equippedPetData, setEquippedPetData] = useState<any>(null);
  const [activeBg, setActiveBg] = useState<string>(DEFAULT_BG);
  const unitRefs = useRef<(HTMLElement | null)[]>([]);

  // 1. FETCH DATA & MAP
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. GET USER (PET)
        try {
          const user = await userService.getProfile();
          setEquippedPetData(
            user?.data?.equippedPet || user?.equippedPet || null,
          );
        } catch {}

        // B. GET TREE
        const treeData = await courseService.getTree(courseId);

        // 1. Sort Units
        const sortedUnits = (treeData?.units || []).sort(
          (a: any, b: any) => (a.order || 0) - (b.order || 0),
        );

        let foundActiveLesson = false;
        let petLocationId: string | null = null;
        let lastCompletedLessonId: string | null = null;

        // 2. Map Data
        const mappedZones = sortedUnits.map((unit: any, uIndex: number) => {
          const sortedLessons = (unit.lessons || []).sort(
            (a: any, b: any) => (a.order || 0) - (b.order || 0),
          );

          const mappedLessons = sortedLessons.map((lesson: any) => {
            const rawStatus = lesson.status
              ? String(lesson.status).toLowerCase().trim()
              : "locked";

            let status = "locked";
            if (["completed", "finished", "passed"].includes(rawStatus)) {
              status = "completed";
            } else if (
              ["unlocked", "active", "in_progress"].includes(rawStatus)
            ) {
              status = "unlocked";
            }

            if (status === "completed") {
              lastCompletedLessonId = lesson._id;
            }

            if (status === "unlocked" && !foundActiveLesson) {
              petLocationId = lesson._id;
              foundActiveLesson = true;
            }

            return {
              id: lesson._id,
              originalId: lesson._id,
              title: lesson.title,
              status: status,
            };
          });

          return {
            id: unit._id || `unit_${uIndex}`,
            title: unit.title,
            bgImage: unit.backgroundImage,
            lessons: mappedLessons,
          };
        });

        if (!petLocationId && lastCompletedLessonId) {
          petLocationId = lastCompletedLessonId;
        }

        setZones(mappedZones);
        setCurrentPetPosition(petLocationId);

        if (mappedZones.length > 0 && mappedZones[0].bgImage) {
          const bg = mappedZones[0].bgImage;
          setActiveBg(bg.startsWith("http") ? `url("${bg}")` : bg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // 2. AUTO SCROLL
  useEffect(() => {
    if (!loading && currentPetPosition) {
      const el = document.getElementById(`lesson-${currentPetPosition}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, currentPetPosition]);

  // 3. OBSERVER BACKGROUND
  useEffect(() => {
    if (!zones.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bg = entry.target.getAttribute("data-bg");
            if (bg) setActiveBg(bg.includes("gradient") ? bg : `url("${bg}")`);
          }
        });
      },
      { threshold: 0.3 },
    );

    unitRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [zones]);

  const handleStartLearning = () => {
    if (selectedLesson) {
      router.push(
        `/courses/${courseId}/units/lessons/${selectedLesson.originalId}`,
      );
    }
  };

  const totalLessons = zones.reduce(
    (total, zone) => total + zone.lessons.length,
    0,
  );
  const completedLessons = zones.reduce(
    (total, zone) =>
      total +
      zone.lessons.filter((lesson: any) => lesson.status === "completed").length,
    0,
  );
  const unlockedLessons = zones.reduce(
    (total, zone) =>
      total +
      zone.lessons.filter((lesson: any) => lesson.status === "unlocked").length,
    0,
  );
  const progressPercent = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#eff6ff_45%,_#f8fafc)] text-blue-600">
        <div className="rounded-full bg-white px-6 py-3 text-xl font-black shadow-lg shadow-blue-100">
          Đang tải hành trình...
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#eef8ff] pb-32 font-sans">
      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-wiggle {
          animation: wiggle 3s infinite;
        }
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      <div
        className="fixed inset-0 z-0 transition-[background-image] duration-500 ease-in-out"
        style={{
          backgroundImage: activeBg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,250,253,0.9),rgba(239,248,255,0.92))]" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      <div className="pointer-events-none fixed left-[-40px] top-24 z-0 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none fixed right-[-30px] top-52 z-0 h-44 w-44 rounded-full bg-[#FFE8A3]/45 blur-3xl" />
      <div className="pointer-events-none fixed left-[8%] top-[18%] z-0 text-5xl opacity-80">☁️</div>
      <div className="pointer-events-none fixed right-[9%] top-[22%] z-0 text-4xl opacity-75">⭐</div>
      <div className="pointer-events-none fixed left-[12%] bottom-[18%] z-0 text-4xl opacity-75">🌈</div>

      <div className="relative z-10">
        <div className="fixed left-0 right-0 top-0 z-50 flex h-[78px] items-center justify-between border-b border-white/70 bg-white/80 px-5 backdrop-blur-xl shadow-sm">
          <Link
            href="/courses"
            className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-700 transition hover:scale-105 hover:bg-sky-200"
          >
            ← Quay lại
          </Link>
          <div className="text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.35em] text-sky-500">
              SmartKids
            </div>
            <div className="text-lg font-black tracking-wide text-slate-800">
              Danh sách chương học
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-700">
            <Trophy size={16} className="fill-amber-500 text-amber-500" /> VIP
          </div>
        </div>

        <div className="mx-auto mt-[106px] w-full max-w-6xl px-4 md:px-6">
          <div className="mb-8 overflow-hidden rounded-[2.25rem] border-4 border-white bg-[linear-gradient(135deg,#7DD3FC_0%,#A5F3FC_35%,#FDE68A_100%)] p-6 shadow-[0_24px_60px_rgba(59,130,246,0.18)] md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_70%)]" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl text-slate-900">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-sky-700">
                  <Sparkles size={14} className="text-yellow-500" />
                  Hành trình học tập
                </div>
                <h1 className="text-3xl font-black leading-tight md:text-5xl">
                  Chọn chương học thật vui, thật dễ nhìn
                </h1>
                <p className="mt-3 text-sm font-bold text-slate-700 md:text-base">
                  Mỗi chương là một chặng đường. Mỗi bài học là một bước nhỏ để bé
                  khám phá, luyện tập và nhận thêm sao thưởng.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-sky-700 shadow-sm">
                    Dễ nhìn
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-emerald-700 shadow-sm">
                    Dễ bấm
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-amber-700 shadow-sm">
                    Có sao thưởng
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                <div className="rounded-[1.5rem] bg-white/80 px-4 py-4 text-center shadow-sm ring-1 ring-white/60">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-500">
                    Hoàn thành
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {progressPercent}%
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 px-4 py-4 text-center shadow-sm ring-1 ring-white/60">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500">
                    Đã xong
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {completedLessons}/{totalLessons}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 px-4 py-4 text-center shadow-sm ring-1 ring-white/60">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-500">
                    Sẵn sàng
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {unlockedLessons}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 px-4 py-4 text-center shadow-sm ring-1 ring-white/60">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500">
                    Tổng số chương
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {zones.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-slate-700/70">
              <span>Đi từ chương đầu tiên</span>
              <span>Đến đích thật giỏi</span>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-sky-600">
                Danh sách chương
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                Bé chọn một chương để bắt đầu nhé
              </div>
            </div>
            <div className="hidden rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700 shadow-sm md:block">
              {zones.length} chương học
            </div>
          </div>

          <div className="space-y-8">
            {zones.map((zone, index) => {
              const theme = getUnitTheme(index);
              const completedInZone = zone.lessons.filter(
                (lesson: any) => lesson.status === "completed",
              ).length;
              const zoneProgress = zone.lessons.length
                ? Math.round((completedInZone / zone.lessons.length) * 100)
                : 0;

              return (
                <section
                  key={zone.id}
                  ref={(el) => {
                    unitRefs.current[index] = el;
                  }}
                  data-bg={zone.bgImage || DEFAULT_BG}
                  className="overflow-hidden rounded-[2.25rem] border-4 border-white bg-white/82 shadow-[0_20px_55px_rgba(59,130,246,0.12)] backdrop-blur-xl"
                >
                  <div className={`bg-gradient-to-r ${theme.shell} p-5 text-white md:p-6`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-white text-2xl font-black text-slate-800 shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/80">
                            Chương học
                          </p>
                          <h2 className="mt-2 text-2xl font-black leading-tight">
                            {zone.title}
                          </h2>
                          <p className="mt-2 text-sm font-bold text-white/90">
                            {completedInZone}/{zone.lessons.length} bài học đã hoàn thành
                          </p>
                          <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                            Chặng {index + 1}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 md:min-w-[280px]">
                        <div className="rounded-[1.25rem] bg-white/20 px-3 py-3 text-center backdrop-blur-sm">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                            Bài học
                          </div>
                          <div className="mt-1 text-2xl font-black">
                            {zone.lessons.length}
                          </div>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/20 px-3 py-3 text-center backdrop-blur-sm">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                            Đã xong
                          </div>
                          <div className="mt-1 text-2xl font-black">
                            {completedInZone}
                          </div>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/20 px-3 py-3 text-center backdrop-blur-sm">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                            Tiến độ
                          </div>
                          <div className="mt-1 text-2xl font-black">
                            {zoneProgress}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-emerald-300 to-cyan-200 transition-all duration-700"
                        style={{ width: `${zoneProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className={`grid gap-4 p-5 md:grid-cols-2 md:p-6 xl:grid-cols-3 ${theme.panel}`}>
                    {zone.lessons.map((lesson: any, lIdx: number) => {
                      const isPetHere = currentPetPosition === lesson.id;
                      const isLocked = lesson.status === "locked";
                      const isCompleted = lesson.status === "completed";
                      const isUnlocked = lesson.status === "unlocked";

                      let cardStyle =
                        "from-slate-100 to-slate-200 border-slate-200 text-slate-500";
                      let label = "Chưa mở khóa";
                      let icon = <Lock size={24} className="text-slate-500" />;

                      if (isCompleted) {
                        cardStyle =
                          "from-amber-100 to-yellow-50 border-amber-200 text-amber-700";
                        label = "Đã xong";
                        icon = (
                          <CheckCircle2
                            size={24}
                            className="text-amber-600"
                          />
                        );
                      } else if (isUnlocked) {
                        cardStyle =
                          "from-sky-100 to-cyan-50 border-sky-200 text-sky-700";
                        label = "Học ngay";
                        icon = <Play size={24} className="text-sky-600" />;
                      }

                      return (
                        <button
                          key={lesson.id}
                          id={`lesson-${lesson.id}`}
                          onClick={() => {
                            if (!isLocked) {
                              setSelectedLesson(lesson);
                              setCurrentPetPosition(lesson.id);
                            }
                          }}
                          disabled={isLocked}
                          className={`group relative overflow-hidden rounded-[1.9rem] border-2 bg-gradient-to-br p-5 text-left shadow-sm transition-all duration-300 ${
                            isLocked
                              ? "cursor-not-allowed opacity-85"
                              : "hover:-translate-y-1 hover:shadow-xl"
                          } ${cardStyle} ${!isCompleted && !isUnlocked ? theme.lesson : ""}`}
                        >
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_70%)]" />
                          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
                          <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm">
                            Bài {lIdx + 1}
                          </div>

                          {isPetHere && (
                            <div className="absolute -right-1 -top-7 z-20">
                              <div className="relative h-20 w-20">
                                {equippedPetData?.lottieUrl ? (
                                  <LottiePet
                                    src={equippedPetData.lottieUrl}
                                    className="h-full w-full drop-shadow-md"
                                  />
                                ) : (
                                  <span className="block text-5xl drop-shadow-md">
                                    🐶
                                  </span>
                                )}
                              </div>
                              <div className="animate-wiggle absolute -left-4 top-12 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-700 shadow-md">
                                Đến lượt mình!
                              </div>
                            </div>
                          )}

                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/80 shadow-sm">
                            {icon}
                          </div>

                          <h3 className="pr-12 text-lg font-black leading-snug text-slate-800">
                            {lesson.title}
                          </h3>
                          <p className="mt-2 text-sm font-bold text-slate-500">
                            {isUnlocked &&
                              "Nhấn vào để bắt đầu bài học và nhận sao thưởng."}
                            {isCompleted &&
                              "Tuyệt lắm! Con đã hoàn thành bài học này rồi."}
                            {isLocked &&
                              "Hãy học xong bài trước để mở khóa bài này nhé."}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${isLocked ? "bg-white/80 text-slate-700" : theme.chip}`}>
                              {label}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-black text-slate-500">
                              <Star
                                size={14}
                                className={`${
                                  isCompleted
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                                }`}
                              />
                              {isCompleted ? "3 sao" : isUnlocked ? "Có quà" : "---"}
                            </div>
                          </div>

                          {!isLocked && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
                              {isCompleted ? "Xem lại bài học" : "Vào học ngay"}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {selectedLesson && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-md"
          onClick={() => setSelectedLesson(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_0_rgba(59,130,246,0.18)] animate-popIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-cyan-300 to-emerald-200 p-8 text-center text-slate-900">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_70%)]" />
              <button
                onClick={() => setSelectedLesson(null)}
                className="absolute right-4 top-4 z-20 text-2xl font-bold text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
              <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-white/75 shadow-lg">
                {equippedPetData?.lottieUrl ? (
                  <LottiePet
                    src={equippedPetData.lottieUrl}
                    className="h-24 w-24"
                  />
                ) : (
                  <span className="block text-6xl">🐶</span>
                )}
              </div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-sky-700">
                <BookOpen size={14} />
                Bài học sẵn sàng
              </div>
              <h2 className="text-2xl font-black leading-tight">
                {selectedLesson.title}
              </h2>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Sẵn sàng cùng thú cưng bước vào bài học mới chưa?
              </p>
            </div>
            <div className="bg-white p-6">
              <div className="mb-5 rounded-[1.5rem] bg-sky-50 p-4 text-sm font-bold text-slate-600">
                Bấm vào nút bên dưới để vào bài học. Hoàn thành xong con sẽ được mở
                bài tiếp theo.
              </div>
              <button
                onClick={handleStartLearning}
                className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-500 py-4 text-xl font-black text-white shadow-lg shadow-emerald-300 transition active:scale-95"
              >
                <Play fill="white" /> BẮT ĐẦU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

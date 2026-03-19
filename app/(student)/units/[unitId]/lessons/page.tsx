"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { lessonService } from "@/services/lessons.service";
import { unitService } from "@/services/units.service";
import {
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Info,
  Lock,
  CheckCircle,
  Star,
} from "lucide-react";

type Lesson = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  orderIndex?: number;
};

type Unit = {
  _id: string;
  name?: string;
  thumbnail?: string;
};

type RouteParams = {
  unitId?: string | string[];
};

type ApiListResponse<T> = {
  data?: T[];
  items?: T[];
  results?: T[];
};

type ProgressDoc = {
  status?: string;
  progress?: number;
};

const LESSON_THEMES = [
  {
    card: "border-[#FFD7E5] bg-[#FFF7FB]",
    bubble: "bg-[#FF8DB3] text-white shadow-[0_10px_24px_rgba(255,141,179,0.35)]",
    tag: "bg-[#FFE4EF] text-[#D9487D]",
    button: "bg-[#FF8A65] text-white hover:bg-[#F9734E]",
    glow: "bg-[#FFD7E5]/70",
  },
  {
    card: "border-[#CDEBFF] bg-[#F4FBFF]",
    bubble: "bg-[#62B6FF] text-white shadow-[0_10px_24px_rgba(98,182,255,0.35)]",
    tag: "bg-[#DDF2FF] text-[#2F7CC0]",
    button: "bg-[#4F7CFF] text-white hover:bg-[#426BEB]",
    glow: "bg-[#CDEBFF]/70",
  },
  {
    card: "border-[#D9F5C8] bg-[#F8FFF2]",
    bubble: "bg-[#7CCF63] text-white shadow-[0_10px_24px_rgba(124,207,99,0.35)]",
    tag: "bg-[#E6F8D9] text-[#4C9440]",
    button: "bg-[#FFB84D] text-[#7A4600] hover:bg-[#FFAC2E]",
    glow: "bg-[#D9F5C8]/70",
  },
];

function getLessonTheme(index: number, locked: boolean, completed: boolean) {
  if (locked) {
    return {
      card: "border-slate-200 bg-slate-50",
      bubble: "bg-slate-300 text-white shadow-[0_10px_24px_rgba(148,163,184,0.28)]",
      tag: "bg-slate-200 text-slate-600",
      button: "bg-slate-300 text-slate-500",
      glow: "bg-slate-200/80",
    };
  }

  if (completed) {
    return {
      card: "border-emerald-200 bg-emerald-50",
      bubble:
        "bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.32)]",
      tag: "bg-emerald-100 text-emerald-700",
      button: "bg-emerald-500 text-white hover:bg-emerald-600",
      glow: "bg-emerald-200/80",
    };
  }

  return LESSON_THEMES[index % LESSON_THEMES.length];
}

function getLessonStatusLabel(locked: boolean, completed: boolean) {
  if (completed) return "Đã hoàn thành";
  if (locked) return "Chưa mở khóa";
  return "Sẵn sàng học";
}

function getLessonHint(locked: boolean, completed: boolean) {
  if (completed) return "Tuyệt vời! Bạn đã học xong bài này.";
  if (locked) return "Hoàn thành bài trước để mở khóa bài này.";
  return "Nhấn vào để bắt đầu bài học ngay.";
}

function extractLessonList(payload: Lesson[] | ApiListResponse<Lesson> | unknown) {
  if (Array.isArray(payload)) return payload as Lesson[];
  if (payload && typeof payload === "object") {
    const candidate = payload as ApiListResponse<Lesson>;
    if (Array.isArray(candidate.data)) return candidate.data;
    if (Array.isArray(candidate.items)) return candidate.items;
    if (Array.isArray(candidate.results)) return candidate.results;
  }
  return [];
}

function isUnit(payload: unknown): payload is Unit {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "_id" in payload &&
      typeof (payload as { _id?: unknown })._id === "string"
  );
}

function extractUnit(payload: Unit | { data?: Unit } | null): Unit | null {
  if (!payload) return null;
  if ("data" in payload && isUnit(payload.data)) return payload.data;
  return isUnit(payload) ? payload : null;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FDF7FF_0%,#F3FAFF_45%,#FFFDF3_100%)]">
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-32 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-10 w-72 rounded-3xl bg-slate-200 animate-pulse" />
              <div className="h-4 w-80 rounded-lg bg-slate-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 w-28 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-20 w-28 rounded-3xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="relative mt-12 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)] backdrop-blur"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="mt-3 h-7 w-3/4 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="h-11 w-32 rounded-2xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonsByUnitPage() {
  const params = useParams<RouteParams>();
  const unitIdRaw = params?.unitId;
  const unitId = Array.isArray(unitIdRaw) ? unitIdRaw[0] : unitIdRaw;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setLoading(false);
      setError("Không tìm thấy unitId trên URL.");
      return;
    }

    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        const [lessonsRes, unitRes] = await Promise.all([
          lessonService.getLessonsByUnitId(unitId),
          unitService.getUnitById(unitId).catch(() => null),
        ]);

        const lessonList = extractLessonList(lessonsRes);
        setLessons(lessonList);

        const unitPayload = extractUnit(unitRes as Unit | { data?: Unit } | null);
        if (unitPayload) setUnit(unitPayload);

        // Lấy tiến độ user cho từng lesson: GET /lesson-progress/user/:lessonId (user từ JWT)
        if (lessonList.length > 0) {
          const progressResults = await Promise.all(
            lessonList.map((lesson) =>
              lessonService.getProgressByUserAndLessonId(lesson._id).catch(() => null)
            )
          );
          const completed: string[] = [];
          progressResults.forEach((progressDoc: ProgressDoc | null, idx) => {
            if (!progressDoc) return;
            const status = String(progressDoc?.status ?? "").toLowerCase();
            const progress = Number(progressDoc?.progress ?? 0);
            if (status === "completed" || progress >= 100) {
              completed.push(lessonList[idx]._id);
            }
          });
          setCompletedLessonIds(completed);
        } else {
          setCompletedLessonIds([]);
        }
      } catch (err) {
        console.error("Lỗi tải bài học:", err);
        setError("Không thể tải danh sách bài học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [unitId]);

  // Sắp xếp theo orderIndex, rồi xác định lesson nào bị khóa (lesson trước chưa hoàn thành)
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );
  const isLessonLocked = (index: number) => {
    if (index === 0) return false;
    const prevLesson = sortedLessons[index - 1];
    return prevLesson && !completedLessonIds.includes(prevLesson._id);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const completedCount = sortedLessons.filter((lesson) =>
    completedLessonIds.includes(lesson._id)
  ).length;
  const progressPercent = sortedLessons.length
    ? Math.round((completedCount / sortedLessons.length) * 100)
    : 0;

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FDF7FF_0%,#F3FAFF_42%,#FFFBEF_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(255,181,214,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.35),transparent_28%),radial-gradient(circle_at_center,rgba(253,224,71,0.18),transparent_30%)]" />
      <div className="pointer-events-none absolute left-[-60px] top-32 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
      <div className="pointer-events-none absolute right-[-30px] top-52 h-44 w-44 rounded-full bg-[#FFE7A3]/50 blur-2xl" />

      <div className="container relative mx-auto px-4 pt-24 pb-20">
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF1F6] px-3 py-1 font-bold text-[#D9487D]">
                  <Sparkles size={16} />
                  Chương học
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-[#53629E]">
                  {unit?.name || `#${unitId}`}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
                Con đường bài học
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                Mỗi bài học là một bước nhỏ. Bé chỉ cần học từng bài theo thứ tự
                là sẽ tiến bộ mỗi ngày.
              </p>

              {!error && lessons.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF6FF] px-3.5 py-2 text-sm font-bold text-[#2F7CC0]">
                    <BookOpen size={16} />
                    {lessons.length} bài học
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF6DD] px-3.5 py-2 text-sm font-bold text-[#B7791F]">
                    <Star size={16} />
                    {completedCount} bài đã xong
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
              <div className="rounded-[1.5rem] bg-[#FDF1F7] px-4 py-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#D9487D]">
                  Tiến độ
                </div>
                <div className="mt-2 text-3xl font-black text-slate-800">
                  {progressPercent}%
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-[#EEF8FF] px-4 py-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2F7CC0]">
                  Đang mở
                </div>
                <div className="mt-2 text-3xl font-black text-slate-800">
                  {Math.max(sortedLessons.length - completedCount, 0)}
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-[#FFF6E6] px-4 py-4">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#C0841A]">
                  Ngôi sao
                </div>
                <div className="mt-2 text-3xl font-black text-slate-800">
                  {completedCount}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
                <span>Bé đang đi đến đâu rồi?</span>
                <span>{completedCount}/{sortedLessons.length} bài</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#FF97B7_0%,#7CCF63_45%,#62B6FF_100%)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <Link
              href="/units"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-[#53629E] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <ChevronLeft size={18} />
              Về danh sách chương
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5" size={18} />
              <div className="text-sm">
                <div className="font-bold">Có lỗi xảy ra</div>
                <div className="mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!error && lessons.length === 0 && (
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)]">
            <div className="h-2 bg-[linear-gradient(90deg,#FF8DB3_0%,#62B6FF_50%,#7CCF63_100%)]" />
            <div className="p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#62B6FF] p-3 text-white shadow-sm">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-slate-900">
                      Chưa có bài học
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Chương này hiện chưa có nội dung. Bạn có thể quay lại để
                      chọn chương khác.
                    </div>
                  </div>
                </div>
                <Link
                  href="/units"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF8A65] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#F9734E] focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  Xem danh sách chương <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {!error && lessons.length > 0 && (
          <div className="relative mt-12">
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-3 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#FFD7E5_0%,#CDEBFF_48%,#D9F5C8_100%)] md:block" />
            {sortedLessons.map((lesson, idx) => {
              const order = lesson.orderIndex ?? idx + 1;
              const locked = isLessonLocked(idx);
              const completed = completedLessonIds.includes(lesson._id);
              const theme = getLessonTheme(idx, locked, completed);
              const alignment =
                idx % 2 === 0
                  ? "md:pr-[calc(50%+1.75rem)]"
                  : "md:pl-[calc(50%+1.75rem)]";
              const icon = completed ? (
                <CheckCircle size={24} />
              ) : locked ? (
                <Lock size={24} />
              ) : (
                <BookOpen size={24} />
              );

              const cardContent = (
                <div
                  className={`group relative rounded-[2rem] border p-5 shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)] transition md:p-6 ${
                    locked
                      ? "cursor-not-allowed opacity-90"
                      : "hover:-translate-y-1"
                  } ${theme.card}`}
                >
                  <div
                    aria-hidden
                    className={`absolute -top-4 ${
                      idx % 2 === 0 ? "right-6" : "left-6"
                    } h-14 w-14 rounded-full blur-xl ${theme.glow}`}
                  />

                  <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`grid h-16 w-16 shrink-0 place-items-center rounded-[1.5rem] text-white ${theme.bubble}`}
                      >
                        {icon}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                          Bước {order}
                        </div>
                        <div
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${theme.tag}`}
                        >
                          {getLessonStatusLabel(locked, completed)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-black leading-snug text-slate-800">
                        {lesson.title || lesson.name || `Bài ${order}`}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {lesson.description ||
                          "Cùng học từng bước nhỏ để khám phá bài học thật vui."}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-500">
                        <Star size={14} className="text-[#F5B83D]" />
                        {getLessonHint(locked, completed)}
                      </div>
                    </div>

                    <div className="md:text-right">
                      {locked ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-300 px-4 py-3 text-sm font-extrabold text-slate-500">
                          <Lock size={16} />
                          Đang khóa
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold shadow-sm transition ${theme.button}`}
                        >
                          {completed ? "Học lại" : "Vào học"}
                          <ArrowRight
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`pointer-events-none absolute -top-3 hidden h-10 w-10 rounded-full border-[6px] border-white md:block ${
                      idx % 2 === 0 ? "-right-[4.4rem]" : "-left-[4.4rem]"
                    } ${theme.bubble}`}
                  >
                    <div className="grid h-full w-full place-items-center text-sm font-black">
                      {order}
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={lesson._id} className={`relative pb-6 ${alignment}`}>
                  <div className="md:hidden">
                    {locked ? (
                      <div className="block h-full focus:outline-none">
                        {cardContent}
                      </div>
                    ) : (
                      <Link
                        href={`/units/${unitId}/lessons/${lesson._id}`}
                        className="block h-full focus:outline-none"
                      >
                        {cardContent}
                      </Link>
                    )}
                  </div>

                  <div className="hidden md:block">
                    {locked ? (
                      <div className="block h-full focus:outline-none">
                        {cardContent}
                      </div>
                    ) : (
                      <Link
                        href={`/units/${unitId}/lessons/${lesson._id}`}
                        className="block h-full focus:outline-none"
                      >
                        {cardContent}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
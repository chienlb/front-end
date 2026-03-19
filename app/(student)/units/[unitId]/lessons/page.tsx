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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-72 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-80 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-slate-200 animate-pulse" />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              </div>
              <div className="mt-3 h-6 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="mt-5 h-10 w-28 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonsByUnitPage() {
  const params = useParams();
  const unitIdRaw = (params as any)?.unitId as string | string[] | undefined;
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

        const list = Array.isArray(lessonsRes)
          ? lessonsRes
          : (lessonsRes as any)?.data ??
            (lessonsRes as any)?.items ??
            (lessonsRes as any)?.results ??
            [];
        const lessonList = Array.isArray(list) ? (list as Lesson[]) : [];
        setLessons(lessonList);

        const unitPayload = unitRes
          ? ((unitRes as any)?.data ?? unitRes)
          : null;
        if (unitPayload) setUnit(unitPayload as Unit);

        // Lấy tiến độ user cho từng lesson: GET /lesson-progress/user/:lessonId (user từ JWT)
        if (lessonList.length > 0) {
          const progressResults = await Promise.all(
            lessonList.map((lesson) =>
              lessonService.getProgressByUserAndLessonId(lesson._id).catch(() => null)
            )
          );
          const completed: string[] = [];
          progressResults.forEach((progressDoc: any, idx) => {
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles size={16} />
                <span>Chương</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-semibold text-[#53629E]">
                  {unit?.name || `#${unitId}`}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800">
                Danh sách{" "}
                <span className="text-slate-800">bài học</span>
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Chọn một bài để bắt đầu học. Tiến độ sẽ được lưu tự động.
              </p>

            {!error && lessons.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#53629E]" />
                  {lessons.length} bài học
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EB4C4C]" />
                  Chọn bài để bắt đầu
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/units"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#53629E] shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <ChevronLeft size={18} />
              Quay lại
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
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-[#53629E]" />
            <div className="p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[#53629E] p-3 text-white shadow-sm">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">
                    Chưa có bài học
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Chương này hiện chưa có nội dung. Bạn có thể quay lại chọn
                    chương khác.
                  </div>
                </div>
              </div>
              <Link
                href="/units"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#EB4C4C] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#D94444] focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                Xem danh sách chương <ArrowRight size={18} />
              </Link>
            </div>
            </div>
          </div>
        )}

        {!error && lessons.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sortedLessons.map((lesson, idx) => {
              const order = lesson.orderIndex ?? idx + 1;
              const locked = isLessonLocked(idx);
              const completed = completedLessonIds.includes(lesson._id);
              const sharedBg =
                "/images/3d-illustration-world-book-day-celebration/10444286.jpg";

              const cardContent = (
                <div
                  className={`relative rounded-3xl border shadow-sm transition ${
                    locked
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-80"
                      : "border-slate-200 bg-white group-hover:-translate-y-1 group-hover:shadow-lg"
                  }`}
                >
                  <div className="relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-3xl p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-35"
                      style={{
                        backgroundImage: `url(${sharedBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute inset-0 ${
                        locked ? "bg-slate-100/90" : "bg-white/80"
                      }`}
                    />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-11 w-11 place-items-center rounded-2xl shadow-sm ${
                            completed
                              ? "bg-emerald-500 text-white"
                              : locked
                                ? "bg-slate-400 text-white"
                                : "bg-[#53629E] text-white"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle size={18} />
                          ) : locked ? (
                            <Lock size={18} />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="font-bold text-slate-700">
                            Bài {order}
                          </div>
                          <div className="text-xs text-slate-500">
                            {completed
                              ? "Đã hoàn thành"
                              : locked
                                ? "Khóa – hoàn thành bài trước"
                                : "Sẵn sàng để học"}
                          </div>
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        Lesson
                      </span>
                    </div>

                    <h3 className="relative mt-4 line-clamp-2 text-lg font-black leading-snug text-slate-800">
                      {lesson.title || lesson.name || `Bài ${order}`}
                    </h3>

                    <p className="relative mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
                      {lesson.description ||
                        "Bắt đầu học ngay để khám phá nội dung."}
                    </p>

                    <div className="relative mt-5 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        {locked
                          ? "Hoàn thành bài trước để mở khóa"
                          : "Nhấn để vào học"}
                      </span>

                      {locked ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-300 px-3.5 py-2 text-sm font-extrabold text-slate-500">
                          <Lock size={16} />
                          Đang khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-[#EB4C4C] px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition group-hover:bg-[#D94444]">
                          Vào học
                          <ArrowRight
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </span>
                      )}
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-transparent transition group-focus-visible:ring-slate-300" />
                  </div>
                </div>
              );

              if (locked) {
                return (
                  <div key={lesson._id} className="block h-full focus:outline-none">
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={lesson._id}
                  href={`/units/${unitId}/lessons/${lesson._id}`}
                  className="group block h-full focus:outline-none"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
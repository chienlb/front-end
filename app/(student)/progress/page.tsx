"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Clock,
  BookOpen,
  ChevronRight,
  BarChart2,
  CheckCircle2,
  Medal,
  Zap,
  MonitorPlay,
  Video,
} from "lucide-react";
import { lessonService } from "@/services/lessons.service";

// --- TYPES ---
type CourseType = "PAID_LIVE" | "PAID_VIDEO" | "FREE_PRACTICE";

interface CourseProgress {
  id: string;
  name: string;
  type: CourseType;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  lastAccess: string;
  image: string;
}

interface GradeRecord {
  id: string;
  title: string;
  type: "HOMEWORK" | "QUIZ" | "EXAM";
  score: number;
  maxScore: number;
  date: string;
  subject: string;
  feedback?: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string; // Emoji or icon url
  desc: string;
  unlockedAt?: string;
  isLocked: boolean;
}

interface RoadmapStep {
  id: string;
  title: string;
  goal: string;
  lessons: number;
  completedLessons: number;
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED";
}

interface LearnedLessonItem {
  id: string;
  title: string;
  unitName?: string;
  progress: number;
  status: string;
  updatedAt?: string;
}

// --- MOCK DATA ---
const COURSES: CourseProgress[] = [
  {
    id: "C1",
    name: "Tiếng Anh Lớp 1 - Căn bản",
    type: "PAID_LIVE",
    totalLessons: 24,
    completedLessons: 9,
    averageScore: 8.8,
    lastAccess: "Hôm nay",
    image:
      "https://img.freepik.com/free-vector/english-book-illustration_1284-39828.jpg",
  },
];

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: "R1",
    title: "Chặng 1: Làm quen chữ cái",
    goal: "Nhận biết 26 chữ cái và phát âm cơ bản.",
    lessons: 8,
    completedLessons: 8,
    status: "COMPLETED",
  },
  {
    id: "R2",
    title: "Chặng 2: Từ vựng chủ đề gia đình",
    goal: "Nắm từ vựng Family, Colors, Numbers.",
    lessons: 8,
    completedLessons: 1,
    status: "IN_PROGRESS",
  },
  {
    id: "R3",
    title: "Chặng 3: Mẫu câu đơn giản",
    goal: "Sử dụng được mẫu câu giới thiệu bản thân.",
    lessons: 8,
    completedLessons: 0,
    status: "LOCKED",
  },
];

const GRADES: GradeRecord[] = [
  {
    id: "G1",
    title: "Kiểm tra Unit 5",
    type: "QUIZ",
    score: 10,
    maxScore: 10,
    date: "20/11",
    subject: "Từ vựng",
    feedback: "Xuất sắc! Con nhớ từ rất tốt.",
  },
  {
    id: "G2",
    title: "Bài tập về nhà: Family",
    type: "HOMEWORK",
    score: 8.5,
    maxScore: 10,
    date: "18/11",
    subject: "Ngữ pháp",
    feedback: "Chú ý lỗi chia động từ con nhé.",
  },
  {
    id: "G3",
    title: "Thi giữa kỳ I",
    type: "EXAM",
    score: 9.0,
    maxScore: 10,
    date: "10/11",
    subject: "Tổng hợp",
  },
  {
    id: "G4",
    title: "Luyện nghe Part 1",
    type: "HOMEWORK",
    score: 7.5,
    maxScore: 10,
    date: "05/11",
    subject: "Nghe hiểu",
    feedback: "Cần luyện nghe nhiều hơn.",
  },
];

const BADGES: Badge[] = [
  {
    id: "B1",
    name: "Ong chăm chỉ",
    icon: "🐝",
    desc: "Học liên tiếp 7 ngày",
    unlockedAt: "10/11/2023",
    isLocked: false,
  },
  {
    id: "B2",
    name: "Thần đồng",
    icon: "🧠",
    desc: "Đạt 5 điểm 10 liên tiếp",
    unlockedAt: "15/11/2023",
    isLocked: false,
  },
  {
    id: "B3",
    name: "Vua tốc độ",
    icon: "⚡",
    desc: "Hoàn thành bài thi dưới 5 phút",
    isLocked: true,
  },
  {
    id: "B4",
    name: "Nhà thám hiểm",
    icon: "🧭",
    desc: "Hoàn thành khóa học đầu tiên",
    isLocked: true,
  },
];

// Helper to get Badge based on Course Type
const getTypeBadge = (type: CourseType) => {
  switch (type) {
    case "PAID_LIVE":
      return (
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase backdrop-blur-md bg-opacity-90">
          <MonitorPlay size={10} /> Lớp Live
        </span>
      );
    case "PAID_VIDEO":
      return (
        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase backdrop-blur-md bg-opacity-90">
          <Video size={10} /> Khóa Video
        </span>
      );
    case "FREE_PRACTICE":
      return (
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase backdrop-blur-md bg-opacity-90">
          <Zap size={10} /> Tự luyện
        </span>
      );
  }
};

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "GRADES">("OVERVIEW");
  const [learnedLessons, setLearnedLessons] = useState<LearnedLessonItem[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  useEffect(() => {
    const fetchLearnedLessons = async () => {
      try {
        setLessonsLoading(true);

        const rawUser =
          typeof window !== "undefined"
            ? window.localStorage.getItem("currentUser")
            : null;

        let userId = "";
        if (rawUser) {
          try {
            const t = rawUser.trim();
            if (t) {
              const parsed = JSON.parse(t);
              userId =
                parsed?._id ||
                parsed?.id ||
                parsed?.data?._id ||
                "";
            }
          } catch {
            userId = "";
          }
        }

        if (!userId) {
          setLearnedLessons([]);
          return;
        }

        const allRows: any[] = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage && page <= 20) {
          const res: any = await lessonService.getLessonProgressByUserId(userId, {
            page,
            limit: 100,
          });
          const payload = res?.data ?? res;
          const rows: any[] = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
          allRows.push(...rows);

          /**
           * Một số backend trả metadata chưa chuẩn (vd: total=0,totalPages=0 nhưng data vẫn có).
           * Ưu tiên hasNextPage nếu tin cậy; fallback theo kích thước trang.
           */
          const hasNextFromApi =
            typeof payload?.hasNextPage === "boolean"
              ? payload.hasNextPage
              : null;
          const totalPages = Number(payload?.totalPages || 0);
          const byTotalPages = totalPages > 0 ? page < totalPages : null;
          const pageLimit = Number(payload?.limit || 100);
          const byRowsLength =
            rows.length > 0 && rows.length >= Math.max(1, pageLimit);

          if (hasNextFromApi !== null) {
            hasNextPage =
              hasNextFromApi || (hasNextFromApi === false && byRowsLength);
          } else if (byTotalPages !== null) {
            hasNextPage = byTotalPages || byRowsLength;
          } else {
            hasNextPage = byRowsLength;
          }
          page += 1;
        }

        const mapped = allRows
          .map((row) => {
            const progressNum = Number(row?.progress ?? 0);
            const status = String(row?.status ?? "").toLowerCase();
            const isLearned =
              status === "completed" ||
              status === "complete" ||
              status === "in_progress" ||
              progressNum > 0;
            if (!isLearned) return null;

            const lessonRef = row?.lessonId;
            const lid = String(
              lessonRef?._id || lessonRef?.id || row?.lessonId || "",
            );
            if (!lid) return null;

            const title =
              lessonRef?.title ||
              lessonRef?.name ||
              row?.title ||
              `Bài học ${lid.slice(-6)}`;

            const unitName =
              lessonRef?.unitId?.name ||
              lessonRef?.unit?.name ||
              row?.unitName ||
              undefined;

            const updatedAt =
              row?.updatedAt || row?.lastActivityAt || row?.createdAt || undefined;

            return {
              id: lid,
              title: String(title),
              unitName,
              progress: Number.isFinite(progressNum) ? progressNum : 0,
              status: String(row?.status || ""),
              updatedAt,
            } as LearnedLessonItem;
          })
          .filter(Boolean) as LearnedLessonItem[];

        const unique = new Map<string, LearnedLessonItem>();
        for (const item of mapped) {
          if (!unique.has(item.id)) unique.set(item.id, item);
        }

        setLearnedLessons(Array.from(unique.values()));
      } catch (error) {
        console.error("Lỗi tải danh sách bài học đã học:", error);
        setLearnedLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLearnedLessons();
  }, []);

  // Dữ liệu thật tổng hợp từ lesson-progress
  const completedLessons = useMemo(
    () =>
      learnedLessons.filter((x) => {
        const st = String(x.status || "").toLowerCase();
        return st === "completed" || st === "complete" || x.progress >= 100;
      }).length,
    [learnedLessons],
  );

  const averageProgress = useMemo(() => {
    if (learnedLessons.length === 0) return 0;
    const total = learnedLessons.reduce((sum, x) => sum + Number(x.progress || 0), 0);
    return Math.round((total / learnedLessons.length) * 10) / 10;
  }, [learnedLessons]);

  const filteredCourses: CourseProgress[] =
    learnedLessons.length > 0
      ? [
          {
            id: "SELF-PRACTICE",
            name: "Tiến độ học tập của bạn",
            type: "FREE_PRACTICE",
            totalLessons: learnedLessons.length,
            completedLessons,
            averageScore: averageProgress,
            lastAccess: learnedLessons[0]?.updatedAt
              ? new Date(learnedLessons[0].updatedAt as string).toLocaleDateString("vi-VN")
              : "—",
            image:
              "https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg",
          },
        ]
      : [];

  // Helper: Calculate % completion
  const getProgress = (done: number, total: number) =>
    Math.round((done / total) * 100);

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* 1. HEADER HERO */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 pt-10 pb-20 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart2 size={24} className="text-yellow-300" />
              </div>
              <h1 className="text-3xl font-black">Hồ sơ học tập</h1>
            </div>
            <p className="text-indigo-100 font-medium max-w-md">
              Tổng hợp kết quả từ lớp học chính thức và quá trình tự luyện tập
              của bạn.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex gap-4">
            <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <p className="text-2xl font-black text-yellow-300">{completedLessons}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Bài hoàn thành
              </p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <p className="text-2xl font-black text-green-300">{averageProgress}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Tiến độ TB (%)
              </p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <p className="text-2xl font-black text-pink-300">{learnedLessons.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Đã học
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        {/* 2. TABS & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 flex w-fit">
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "OVERVIEW" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Target size={16} /> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("GRADES")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "GRADES" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Award size={16} /> Bảng điểm
            </button>
          </div>

          {activeTab === "OVERVIEW" && (
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold">
              Dữ liệu đồng bộ từ lesson-progress
            </div>
          )}
        </div>

        {/* === TAB 1: OVERVIEW === */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-500" /> Bài học đã học
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {learnedLessons.length} bài
                </span>
              </div>

              {lessonsLoading ? (
                <p className="text-sm text-slate-500">Đang tải danh sách bài học...</p>
              ) : learnedLessons.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có bài học nào trong lịch sử học tập.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learnedLessons.slice(0, 12).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-slate-200 p-3 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                    >
                      <p className="font-bold text-slate-800 line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {lesson.unitName || "Không rõ chương"}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-600">
                          Tiến độ: {Math.max(0, Math.min(100, Math.round(lesson.progress)))}%
                        </span>
                        <span className="text-slate-400">
                          {lesson.updatedAt
                            ? new Date(lesson.updatedAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Course Progress */}
            <div className="lg:col-span-2 space-y-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const percent = getProgress(
                    course.completedLessons,
                    course.totalLessons,
                  );
                  return (
                    <div
                      key={course.id}
                      className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-lg transition group"
                    >
                      {/* Image Container with Badge */}
                      <div className="relative w-full md:w-32 h-32 shrink-0">
                        <img
                          src={course.image}
                          className="w-full h-full object-cover rounded-2xl shadow-sm"
                        />
                        <div className="absolute top-2 left-2 shadow-sm">
                          {getTypeBadge(course.type)}
                        </div>
                      </div>

                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-black text-slate-800 line-clamp-1">
                            {course.name}
                          </h3>
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 whitespace-nowrap">
                            TB: {course.averageScore}đ
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                            <span>
                              Tiến độ: {course.completedLessons}/
                              {course.totalLessons} bài
                            </span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${percent === 100 ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={12} /> Truy cập: {course.lastAccess}
                          </p>
                          {/* Action Button based on type */}
                          <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            {course.type === "FREE_PRACTICE"
                              ? "Luyện tiếp"
                              : "Vào học"}{" "}
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">
                    Không tìm thấy khóa học nào theo bộ lọc.
                  </p>
                </div>
              )}

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 mb-4">
                  Bài học gần đây
                </h3>
                {learnedLessons.length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có dữ liệu bài học.</p>
                ) : (
                  <div className="space-y-2">
                    {learnedLessons.slice(0, 8).map((lesson) => (
                      <div
                        key={`recent-${lesson.id}`}
                        className="rounded-2xl border border-slate-200 p-3 bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">
                            {lesson.title}
                          </p>
                          <span className="text-xs font-black text-indigo-600">
                            {Math.round(lesson.progress)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {lesson.unitName || "Không rõ chương"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Badges */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
                <Medal className="text-orange-500" size={24} /> Thành tích
              </h3>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 font-bold">Bài hoàn thành</p>
                  <p className="text-xl font-black text-green-600">{completedLessons}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 font-bold">Đang học</p>
                  <p className="text-xl font-black text-blue-600">
                    {
                      learnedLessons.filter((x) => {
                        const st = String(x.status || "").toLowerCase();
                        return st === "in_progress" || (x.progress > 0 && x.progress < 100);
                      }).length
                    }
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 font-bold">Tổng bài đã ghi nhận</p>
                  <p className="text-xl font-black text-indigo-600">{learnedLessons.length}</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* === TAB 2: GRADES === */}
        {activeTab === "GRADES" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-800">
                Lịch sử bài học
              </h3>
              <p className="text-sm text-slate-500">
                Dữ liệu thật từ lesson-progress.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                  <tr>
                    <th className="p-5 pl-8">Tên bài học</th>
                    <th className="p-5">Chương</th>
                    <th className="p-5 text-center">Trạng thái</th>
                    <th className="p-5 text-center">Tiến độ</th>
                    <th className="p-5">Ngày cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {learnedLessons.map((lesson) => (
                    <tr
                      key={`history-${lesson.id}`}
                      className="hover:bg-slate-50 transition group"
                    >
                      <td className="p-5 pl-8">
                        <p className="font-bold text-slate-800">
                          {lesson.title}
                        </p>
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                          {lesson.unitName || "Không rõ chương"}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded uppercase">
                          {lesson.status || "unknown"}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border-4 font-black text-sm ${
                            lesson.progress >= 100
                              ? "border-green-100 text-green-600 bg-green-50"
                              : lesson.progress >= 50
                                ? "border-blue-100 text-blue-600 bg-blue-50"
                                : "border-orange-100 text-orange-600 bg-orange-50"
                          }`}
                        >
                          {Math.round(lesson.progress)}%
                        </div>
                      </td>
                      <td className="p-5 max-w-xs">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {lesson.updatedAt
                            ? new Date(lesson.updatedAt).toLocaleDateString("vi-VN")
                            : "—"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation"; // 1. Import useParams
import { format, isPast, isWithinInterval, addMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Play,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  ArrowLeft,
  ChevronDown,
  MonitorPlay,
  Gamepad2,
  ExternalLink,
  RefreshCw,
  Loader2,
  Layers,
  FileQuestion,
  PlayCircle,
  Check,
  Download,
  Youtube,
  Lock,
} from "lucide-react";
import { liveClassService } from "@/services/live-class.service";
import ExamRoom from "@/components/student/course/lesson/ExamRoom";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

const accordionVariants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: { opacity: 1, height: "auto" },
};

// --- DEFINITIONS ---
interface LessonData {
  _id: string;
  title: string;
  type: "GAME" | "LIVE_SESSION" | "EXAM" | "VIDEO";
  description?: string;
  materials?: string[];
  thumbnail?: string;
  videoUrl?: string;
  unitId?: { _id: string; title: string; order?: number };
}

interface ScheduleItem {
  _id: string;
  lessonId: LessonData;
  startTime?: string;
  recordingUrl?: string;
  isCompleted?: boolean;
}

export default function ClassDetailPage() {
  // 2. Use the hook instead of props
  const params = useParams();
  const classId = params?.id as string; // Safely get ID

  const router = useRouter();

  // State
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(
    {},
  );
  const [activeExam, setActiveExam] = useState<any>(null);
  const [loadingExam, setLoadingExam] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!classId) return; // Guard clause

    try {
      const res: any = await liveClassService.getClassDetail(classId);
      const data = res.data || res;
      setClassData(data);

      if (
        Object.keys(expandedUnits).length === 0 &&
        data.schedule?.length > 0
      ) {
        const firstUnitId = data.schedule[0].lessonId?.unitId?._id || "general";
        setExpandedUnits({ [firstUnitId]: true });
      }
    } catch (error) {
      console.error("Lỗi tải lớp học", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  // --- HANDLERS ---
  const handleSyncContent = async () => {
    if (
      !confirm(
        "Hành động này sẽ tải các Lesson mới nhất. Dữ liệu cũ vẫn giữ nguyên. Tiếp tục?",
      )
    )
      return;
    setIsSyncing(true);
    try {
      await liveClassService.syncContent(classId);
      alert("Đã cập nhật nội dung thành công!");
      fetchData();
    } catch (error) {
      alert("Lỗi khi cập nhật nội dung.");
    } finally {
      setIsSyncing(false);
    }
  };

  const groupedSchedule = useMemo(() => {
    if (!classData?.schedule) return [];
    const groups: Record<
      string,
      { id: string; title: string; order: number; lessons: ScheduleItem[] }
    > = {};

    classData.schedule.forEach((item: ScheduleItem) => {
      const u = item.lessonId.unitId;
      const unitId = u?._id || "general";
      const unitTitle = u?.title || "Nội dung chung";
      const unitOrder = u?.order ?? 9999;

      if (!groups[unitId]) {
        groups[unitId] = {
          id: unitId,
          title: unitTitle,
          order: unitOrder,
          lessons: [],
        };
      }
      groups[unitId].lessons.push(item);
    });

    return Object.values(groups).sort((a, b) => a.order - b.order);
  }, [classData]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleAction = async (session: ScheduleItem) => {
    const { type, _id } = session.lessonId;

    if (type === "LIVE_SESSION") {
      if (session.recordingUrl) window.open(session.recordingUrl, "_blank");
      else router.push(`/live-room/${classId}`);
      return;
    }

    if (type === "EXAM") {
      try {
        setLoadingExam(true);
        const res: any = await liveClassService.getLessonDetail(_id);
        const fullLesson = res.data || res;

        if (
          fullLesson.examConfig &&
          fullLesson.examConfig.questions?.length > 0
        ) {
          setActiveExam({
            _id: fullLesson._id,
            title: fullLesson.title,
            ...fullLesson.examConfig,
          });
        } else {
          alert("Bài kiểm tra này chưa có câu hỏi nào.");
        }
      } catch (error) {
        console.error(error);
        alert("Không thể tải đề thi.");
      } finally {
        setLoadingExam(false);
      }
      return;
    }

    router.push(`/learn/${_id}?classId=${classId}`);
  };

  // --- RENDER LOADING ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            repeatType: "reverse",
          }}
          className="text-slate-500 font-medium"
        >
          Đang tải nội dung lớp học...
        </motion.p>
      </div>
    );

  if (!classData)
    return (
      <div className="p-20 text-center text-slate-500">
        Không tìm thấy lớp học.
      </div>
    );

  const totalLessons = classData.schedule?.length || 0;
  const completedCount =
    classData.schedule?.filter((s: any) => s.isCompleted || s.recordingUrl)
      .length || 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // --- RENDER EXAM ROOM ---
  if (activeExam) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-white overflow-y-auto"
      >
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => {
              if (confirm("Bạn muốn thoát bài thi?")) setActiveExam(null);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition"
          >
            Thoát
          </button>
        </div>
        <div className="pt-12 pb-20 px-4">
          <ExamRoom
            examData={activeExam}
            onComplete={async (score) => {
              alert(`Bạn đã hoàn thành bài thi với số điểm: ${score}`);
              setActiveExam(null);
            }}
          />
        </div>
      </motion.div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Loading Exam Overlay */}
      <AnimatePresence>
        {loadingExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
              <p className="font-bold text-slate-700">Đang tải đề thi...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER HERO */}

      {/* 2. SYLLABUS CONTENT */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6"
      >
        {groupedSchedule.map((group) => {
          const isExpanded = expandedUnits[group.id] ?? false;

          return (
            <motion.div
              variants={itemVariants}
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* UNIT HEADER */}
              <div
                onClick={() => toggleUnit(group.id)}
                className={`px-6 py-5 flex justify-between items-center cursor-pointer select-none border-b transition-colors ${
                  isExpanded
                    ? "bg-slate-50 border-slate-200"
                    : "bg-white border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isExpanded ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400"}`}
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg ${isExpanded ? "text-blue-700" : "text-slate-700"}`}
                    >
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {group.lessons.length} bài học
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-slate-400 ${isExpanded ? "text-blue-600" : ""}`}
                >
                  <ChevronDown size={24} />
                </motion.div>
              </div>

              {/* LESSON LIST (ACCORDION) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={accordionVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-slate-50">
                      {group.lessons.map((session, idx) => (
                        <LessonRow
                          key={idx}
                          session={session}
                          onAction={() => handleAction(session)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {groupedSchedule.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
          >
            <div className="text-4xl mb-3 grayscale opacity-50">📭</div>
            <p className="text-slate-500 font-medium">
              Lớp học chưa có nội dung nào.
            </p>
            <button
              onClick={handleSyncContent}
              className="text-blue-600 font-bold hover:underline text-sm mt-2 flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw size={12} /> Thử cập nhật nội dung
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}


// --- COMPONENT: LESSON ROW ---
function LessonRow({
  session,
  onAction,
}: {
  session: ScheduleItem;
  onAction: () => void;
}) {
  const { lessonId, startTime, recordingUrl, isCompleted } = session;
  const { type, title, materials, videoUrl } = lessonId;

  // 1. TÍNH TOÁN TRẠNG THÁI THỜI GIAN (Cho Live Class)
  const now = new Date();
  let liveStatus: "UPCOMING" | "LIVE" | "ENDED" = "UPCOMING";
  let timeLabel = "";

  if (startTime) {
    const start = new Date(startTime);
    const end = addMinutes(start, 90); // Giả sử 90p

    if (isWithinInterval(now, { start, end })) {
      liveStatus = "LIVE";
      timeLabel = "Đang diễn ra";
    } else if (isPast(end)) {
      liveStatus = "ENDED";
      timeLabel = format(start, "dd/MM/yyyy");
    } else {
      liveStatus = "UPCOMING";
      timeLabel = format(start, "HH:mm - dd/MM");
    }
  }

  // 2. CẤU HÌNH GIAO DIỆN THEO TYPE
  const config = {
    LIVE_SESSION: {
      icon: Video,
      color:
        liveStatus === "LIVE"
          ? "text-red-600 bg-red-100"
          : "text-blue-600 bg-blue-100",
      label: "Lớp Trực Tuyến",
    },
    VIDEO: {
      icon: MonitorPlay,
      color: "text-purple-600 bg-purple-100",
      label: "Video Bài Giảng",
    },
    EXAM: {
      icon: FileQuestion,
      color: "text-orange-600 bg-orange-100",
      label: "Bài Kiểm Tra",
    },
    GAME: {
      icon: Gamepad2,
      color: "text-green-600 bg-green-100",
      label: "Game Ôn Tập",
    },
  }[type] || {
    icon: FileText,
    color: "text-slate-600 bg-slate-100",
    label: "Bài Học",
  };

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group p-5 border-l-4 transition-all hover:shadow-md bg-white
        ${isCompleted ? "border-green-500 bg-green-50/30" : "border-transparent hover:border-blue-400"}
      `}
    >
      <div className="flex flex-col md:flex-row gap-5">
        {/* --- LEFT: ICON & STATUS --- */}
        <div className="flex flex-col items-center gap-2 min-w-[60px]">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${config.color}`}
          >
            <Icon size={28} strokeWidth={2} />
          </div>
          {/* Status Line for Live */}
          {type === "LIVE_SESSION" && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                liveStatus === "LIVE"
                  ? "bg-red-600 text-white border-red-600 animate-pulse"
                  : liveStatus === "ENDED"
                    ? "bg-slate-100 text-slate-500 border-slate-200"
                    : "bg-blue-50 text-blue-600 border-blue-100"
              }`}
            >
              {liveStatus === "LIVE"
                ? "LIVE"
                : liveStatus === "ENDED"
                  ? "Đã xong"
                  : "Sắp tới"}
            </span>
          )}
        </div>

        {/* --- MIDDLE: CONTENT INFO --- */}
        <div className="flex-1 space-y-3">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {config.label}
              </span>
              {startTime && (
                <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                  <Clock size={12} /> {timeLabel}
                </span>
              )}
            </div>
            <h3
              onClick={onAction}
              className="text-lg font-bold text-slate-800 hover:text-blue-700 cursor-pointer transition line-clamp-2"
            >
              {title}
            </h3>
          </div>

          {/* Additional Content (Video/Exam Info) */}
          <div className="space-y-2">
            {videoUrl && (
              <div
                onClick={() => window.open(videoUrl, "_blank")}
                className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 border border-purple-100 cursor-pointer hover:bg-purple-100 transition w-fit"
              >
                <div className="bg-purple-200 p-1.5 rounded-full">
                  <Youtube size={16} className="text-purple-700" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-purple-900">
                    Video bổ trợ bài học
                  </p>
                  <p className="text-purple-600">Nhấn để xem ngay</p>
                </div>
              </div>
            )}

            {/* Tài liệu đính kèm (Grid Layout) */}
            {materials && materials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {materials.map((mat, idx) => (
                  <a
                    key={idx}
                    href={mat}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition"
                  >
                    <FileText size={14} className="text-slate-400" />
                    <span className="truncate max-w-[150px]">
                      Tài liệu {idx + 1}
                    </span>
                    <Download size={12} className="opacity-50" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: PRIMARY ACTION --- */}
        <div className="flex flex-col justify-center items-end gap-2 min-w-[140px]">
          {/* Action Button Logic */}
          <ActionButton
            type={type}
            liveStatus={liveStatus}
            recordingUrl={recordingUrl}
            isCompleted={isCompleted}
            onAction={onAction}
          />

          {/* Secondary Info */}
          {isCompleted && (
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 mt-1">
              <Check size={14} strokeWidth={3} /> Hoàn thành
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENT: NÚT HÀNH ĐỘNG THÔNG MINH ---
const ActionButton = ({
  type,
  liveStatus,
  recordingUrl,
  isCompleted,
  onAction,
}: {
  type: string;
  liveStatus: string;
  recordingUrl?: string;
  isCompleted?: boolean;
  onAction: () => void;
}) => {
  // 1. LIVE CLASS
  if (type === "LIVE_SESSION") {
    if (liveStatus === "LIVE") {
      return (
        <button
          onClick={onAction}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 animate-pulse flex items-center justify-center gap-2"
        >
          <Video size={18} /> Vào lớp ngay
        </button>
      );
    }
    if (liveStatus === "ENDED" && recordingUrl) {
      return (
        <button
          onClick={onAction}
          className="w-full py-2.5 bg-white border-2 border-purple-100 text-purple-600 hover:bg-purple-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
        >
          <PlayCircle size={18} /> Xem Record
        </button>
      );
    }
    if (liveStatus === "UPCOMING") {
      return (
        <button
          disabled
          className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock size={16} /> Chưa bắt đầu
        </button>
      );
    }
    return (
      <button
        disabled
        className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed"
      >
        Đã kết thúc
      </button>
    );
  }

  // 2. EXAM
  if (type === "EXAM") {
    if (isCompleted) {
      return (
        <button
          onClick={onAction}
          className="w-full py-2.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          <FileText size={18} /> Xem kết quả
        </button>
      );
    }
    return (
      <button
        onClick={onAction}
        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition transform active:scale-95"
      >
        <FileQuestion size={18} /> Làm bài thi
      </button>
    );
  }

  // 3. DEFAULT (Video, Game, Materials)
  return (
    <button
      onClick={onAction}
      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition transform active:scale-95"
    >
      {type === "GAME" ? <Gamepad2 size={18} /> : <Play size={18} />}
      {type === "GAME" ? "Chơi Game" : "Bắt đầu học"}
    </button>
  );
};

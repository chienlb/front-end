"use client";
import { useState } from "react";
import {
  Video,
  PlayCircle,
  BookOpen,
  Clock,
  ChevronDown,
  Link as LinkIcon,
  Users,
  FileText,
  CheckSquare,
  Gamepad2,
  Mic,
  FileQuestion,
  Download,
  ExternalLink,
  Plus,
  Upload,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Save,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

// --- Types ---
type MaterialType = "PDF" | "VIDEO" | "LINK" | "DOC";
type ExerciseType = "QUIZ" | "GAME" | "SPEAKING";

interface Material {
  id: string;
  name: string;
  type: MaterialType;
  url: string;
  size?: string;
}

interface Exercise {
  id: string;
  title: string;
  type: ExerciseType;
  questionsCount: number;
  completedCount: number;
  totalStudents: number;
}

interface Lesson {
  id: string;
  title: string;
  type: "LIVE" | "VIDEO" | "EXAM";
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  startTime?: string;
  duration?: string;
  meetingLink?: string;
  recordingUrl?: string;
  materials: Material[];
  exercises: Exercise[];
}

interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

// --- MOCK DATA ---
const MOCK_UNITS: Unit[] = [
  {
    id: "U1",
    title: "Unit 1: Hello World & Greetings",
    lessons: [
      {
        id: "L1",
        title: "Lesson 1: Live Class - Introduction",
        type: "LIVE",
        status: "COMPLETED",
        startTime: new Date().toISOString(),
        duration: "90 phút",
        recordingUrl: "https://youtube.com/demo",
        materials: [
          {
            id: "m1",
            name: "Slide_Unit1.pdf",
            type: "PDF",
            url: "#",
            size: "2.5MB",
          },
        ],
        exercises: [],
      },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT: TAB CLASSWORK
// ============================================================================
export default function TabClasswork({
  units = MOCK_UNITS,
}: {
  units?: Unit[];
}) {
  const [data, setData] = useState<Unit[]>(units || MOCK_UNITS);

  // States cho Modal (Unit/Lesson)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // --- Handlers ---
  const handleAddUnit = (title: string) => {
    const newUnit: Unit = {
      id: `U${Date.now()}`,
      title: title,
      lessons: [],
    };
    setData([...data, newUnit]);
    setIsUnitModalOpen(false);
  };

  const handleAddLesson = (title: string, type: "LIVE" | "VIDEO" | "EXAM") => {
    if (!activeUnitId) return;
    const newLesson: Lesson = {
      id: `L${Date.now()}`,
      title: title,
      type: type,
      status: "UPCOMING",
      startTime: new Date().toISOString(), // Default now
      materials: [],
      exercises: [],
    };
    setData(
      data.map((u) =>
        u.id === activeUnitId
          ? { ...u, lessons: [...u.lessons, newLesson] }
          : u,
      ),
    );
    setIsLessonModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER TOOLBAR */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsUnitModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-blue-200 transition transform active:scale-95"
        >
          <Plus size={18} /> Tạo Unit Mới
        </button>
      </div>

      {/* UNIT LIST */}
      {data.map((unit) => (
        <div key={unit.id} className="relative group/unit">
          {/* Connector Line */}
          <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200 -z-10"></div>

          {/* Unit Header */}
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm z-10 relative">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200 shrink-0">
              {unit.id.substring(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">{unit.title}</h2>
              <p className="text-slate-500 text-sm font-medium">
                {unit.lessons.length} bài học
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveUnitId(unit.id);
                  setIsLessonModalOpen(true);
                }}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus size={16} /> Thêm bài học
              </button>
              <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Lesson List */}
          <div className="space-y-4 pl-4 md:pl-0">
            {unit.lessons.map((lesson) => (
              <LessonItem key={lesson.id} lesson={lesson} />
            ))}
            {unit.lessons.length === 0 && (
              <div className="ml-8 p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm italic">
                Chưa có bài học nào trong Unit này.
              </div>
            )}
          </div>
        </div>
      ))}

      {/* --- MODALS --- */}
      <CreateUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSubmit={handleAddUnit}
      />
      <CreateLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSubmit={handleAddLesson}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: LESSON ITEM (Hiển thị chi tiết 1 bài học)
// ============================================================================
function LessonItem({ lesson }: { lesson: Lesson }) {
  const [isOpen, setIsOpen] = useState(false);

  // State quản lý Modals con của Lesson
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Helper chọn icon & màu sắc
  const getConfig = () => {
    switch (lesson.type) {
      case "LIVE":
        return { icon: Video, color: "bg-red-500", text: "Lớp Trực Tuyến" };
      case "VIDEO":
        return {
          icon: PlayCircle,
          color: "bg-blue-500",
          text: "Bài Giảng Video",
        };
      case "EXAM":
        return { icon: CheckSquare, color: "bg-orange-500", text: "Kiểm Tra" };
      default:
        return { icon: BookOpen, color: "bg-slate-500", text: "Tài Liệu" };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <>
      <div
        className={`ml-0 md:ml-8 bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${
          isOpen
            ? "shadow-xl border-blue-200 ring-1 ring-blue-100 transform -translate-y-1"
            : "shadow-sm border-slate-200 hover:shadow-md hover:border-blue-200"
        }`}
      >
        {/* 1. HEADER BÀI HỌC (Luôn hiển thị) */}
        <div
          className="p-5 flex items-center gap-5 cursor-pointer relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${lesson.status === "COMPLETED" ? "bg-green-500" : lesson.status === "LIVE" ? "bg-red-500" : "bg-slate-300"}`}
          ></div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${config.color}`}
          >
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider text-white ${config.color} opacity-80`}
              >
                {config.text}
              </span>
              {lesson.status === "LIVE" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>{" "}
                  ĐANG DIỄN RA
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
              {lesson.startTime && (
                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                  <Clock size={14} className="text-slate-400" />{" "}
                  {format(new Date(lesson.startTime), "HH:mm - dd/MM/yyyy")}
                </span>
              )}
              {lesson.duration && <span>Thời lượng: {lesson.duration}</span>}
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`}
          />
        </div>

        {/* 2. NỘI DUNG CHI TIẾT (Expandable) */}
        {isOpen && (
          <div className="px-5 pb-6 pt-0 border-t border-slate-100 bg-slate-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* CỘT TRÁI: TÀI LIỆU */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                    <FileText size={14} /> Tài liệu (
                    {lesson.materials?.length || 0})
                  </h4>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-[10px] bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition shadow-sm"
                  >
                    <Plus size={12} /> Thêm
                  </button>
                </div>

                {lesson.materials && lesson.materials.length > 0 ? (
                  <div className="space-y-2">
                    {lesson.materials.map((mat) => (
                      <a
                        href={mat.url}
                        key={mat.id}
                        target="_blank"
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition group/file"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mat.type === "PDF" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                          >
                            {mat.type === "PDF" ? (
                              <FileText size={16} />
                            ) : (
                              <LinkIcon size={16} />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover/file:text-blue-700">
                              {mat.name}
                            </p>
                            {mat.size && (
                              <p className="text-[10px] text-slate-400">
                                {mat.size}
                              </p>
                            )}
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-red-500 p-1">
                          <Trash2 size={14} />
                        </button>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                    Chưa có tài liệu đính kèm.
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: HOẠT ĐỘNG & BÀI TẬP */}
              <div className="space-y-6">
                {/* Live Class Actions */}
                {lesson.type === "LIVE" && (
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase mb-3 flex items-center gap-2">
                      <Users size={14} /> Lớp học trực tuyến
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex flex-col items-center justify-center p-3 bg-white border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white transition group/btn shadow-sm">
                        <Video
                          size={24}
                          className="mb-2 text-blue-600 group-hover/btn:text-white"
                        />
                        <span className="text-xs font-bold">Vào Lớp</span>
                      </button>
                      <button
                        onClick={() => setIsAttendanceModalOpen(true)}
                        className="flex flex-col items-center justify-center p-3 bg-white border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white transition group/btn shadow-sm"
                      >
                        <Users
                          size={24}
                          className="mb-2 text-blue-600 group-hover/btn:text-white"
                        />
                        <span className="text-xs font-bold">Điểm Danh</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Exercises Header & List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                      <CheckSquare size={14} /> Bài tập (
                      {lesson.exercises?.length || 0})
                    </h4>
                    <button
                      onClick={() => setIsExerciseModalOpen(true)}
                      className="text-[10px] bg-white border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition shadow-sm"
                    >
                      <Plus size={12} /> Tạo bài tập
                    </button>
                  </div>

                  {lesson.exercises && lesson.exercises.length > 0 ? (
                    <div className="space-y-3">
                      {lesson.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="bg-white border border-slate-200 p-4 rounded-xl hover:border-orange-300 transition shadow-sm group/ex"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ex.type === "GAME" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}
                              >
                                {ex.type === "GAME" ? (
                                  <Gamepad2 size={20} />
                                ) : (
                                  <FileQuestion size={20} />
                                )}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800 text-sm group-hover/ex:text-orange-600 transition">
                                  {ex.title}
                                </h5>
                                <p className="text-xs text-slate-500 font-medium">
                                  {ex.type} • {ex.questionsCount} câu
                                </p>
                              </div>
                            </div>
                            <ExternalLink
                              size={16}
                              className="text-slate-400 hover:text-orange-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                      Chưa có bài tập.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- INJECT MODALS --- */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <CreateExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
      />
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        lessonTitle={lesson.title}
      />
    </>
  );
}

// ============================================================================
// MODAL COMPONENTS 
// ============================================================================

function CreateUnitModal({ isOpen, onClose, onSubmit }: any) {
  const [title, setTitle] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Tạo Unit Mới</h3>
        <input
          className="w-full border p-3 rounded-xl mb-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          placeholder="Nhập tên Unit (VD: Unit 1: Introduction)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(title)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
          >
            Tạo Unit
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateLessonModal({ isOpen, onClose, onSubmit }: any) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"LIVE" | "VIDEO" | "EXAM">("LIVE");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-slate-800">
          Thêm Bài Học Mới
        </h3>
        <div className="space-y-4">
          <input
            className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
            placeholder="Tên bài học..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "LIVE", icon: Video, label: "Live" },
              { id: "VIDEO", icon: PlayCircle, label: "Video" },
              { id: "EXAM", icon: CheckSquare, label: "Kiểm tra" },
            ].map((t: any) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition ${type === t.id ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-200" : "hover:bg-slate-50"}`}
              >
                <t.icon size={20} className="mb-1" />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(title, type)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadMaterialModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">Thêm Tài Liệu</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-600">
              Kéo thả file hoặc click để upload
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOCX, MP4 (Max 50MB)
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Hoặc nhập Link
            </label>
            <input
              className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-700 shadow-lg">
            Lưu Tài Liệu
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateExerciseModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">Tạo Bài Tập Mới</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {["Trắc nghiệm", "Ghép chữ", "Phát âm"].map((type, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-orange-50 hover:border-orange-200 transition focus:ring-2 ring-orange-500"
            >
              {idx === 0 ? (
                <FileQuestion className="text-orange-500 mb-2" />
              ) : idx === 1 ? (
                <Gamepad2 className="text-purple-500 mb-2" />
              ) : (
                <Mic className="text-pink-500 mb-2" />
              )}
              <span className="text-xs font-bold">{type}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            className="w-full border p-3 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
            placeholder="Tên bài tập (VD: Quiz Unit 1)"
          />
          <div className="flex gap-3">
            <input
              className="flex-1 border p-3 rounded-xl text-sm outline-none focus:border-orange-500"
              placeholder="Số câu hỏi"
              type="number"
            />
            <input
              className="flex-1 border p-3 rounded-xl text-sm outline-none focus:border-orange-500"
              placeholder="Thời gian (phút)"
              type="number"
            />
          </div>
        </div>

        <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-6 hover:bg-orange-600 shadow-lg shadow-orange-200">
          Tạo & Soạn Câu Hỏi
        </button>
      </div>
    </div>
  );
}

function AttendanceModal({ isOpen, onClose, lessonTitle }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="font-bold text-lg text-slate-800">
            Điểm danh: {lessonTitle}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase sticky top-0">
              <tr>
                <th className="p-3">Học sinh</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-700">
                    Nguyễn Văn Học Sinh {i}
                  </td>
                  <td className="p-3 flex justify-center gap-1">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 border border-green-200">
                      Có mặt
                    </button>
                    <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-red-100 hover:text-red-600 border border-slate-200">
                      Vắng
                    </button>
                  </td>
                  <td className="p-3">
                    <input
                      className="border-b w-full outline-none text-xs bg-transparent focus:border-blue-500"
                      placeholder="..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700">
            Lưu Điểm Danh
          </button>
        </div>
      </div>
    </div>
  );
}

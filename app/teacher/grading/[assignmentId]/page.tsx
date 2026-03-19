"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  FileText,
  Mic,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Star,
} from "lucide-react";

// --- TYPES ---
type SubmissionType = "FILE" | "TEXT" | "AUDIO";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  submittedAt: string;
  status: "LATE" | "ON_TIME";
  type: SubmissionType;
  content: string;
  grade?: number;
  feedback?: string;
}

// --- MOCK DATA ---
const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub1",
    studentId: "s1",
    studentName: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=11",
    submittedAt: "10:30 - 20/10/2023",
    status: "ON_TIME",
    type: "TEXT",
    content:
      "My hobby is playing football. I usually play with my friends on weekends. It helps me stay healthy and make new friends. I also like watching football matches on TV.",
    grade: 8.5,
    feedback: "Good vocabulary, but check your grammar.",
  },
  {
    id: "sub2",
    studentId: "s2",
    studentName: "Trần Thị Bình",
    avatar: "https://i.pravatar.cc/150?img=5",
    submittedAt: "23:59 - 20/10/2023",
    status: "LATE",
    type: "FILE",
    content: "https://example.com/essay.pdf",
  },
  {
    id: "sub3",
    studentId: "s3",
    studentName: "Lê Văn Cường",
    avatar: "https://i.pravatar.cc/150?img=3",
    submittedAt: "09:15 - 21/10/2023",
    status: "ON_TIME",
    type: "AUDIO",
    content: "audio_sample.mp3",
  },
];

export default function GradingInterface() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGrade, setCurrentGrade] = useState<string>("");
  const [currentFeedback, setCurrentFeedback] = useState("");

  const student = MOCK_SUBMISSIONS[currentIndex];
  const totalStudents = MOCK_SUBMISSIONS.length;

  // Load data khi chuyển học sinh
  useEffect(() => {
    setCurrentGrade(student.grade ? student.grade.toString() : "");
    setCurrentFeedback(student.feedback || "");
  }, [currentIndex, student]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (currentIndex < totalStudents - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSave = () => {
    // Logic gọi API lưu điểm
    alert(`Đã lưu điểm cho ${student.studentName}: ${currentGrade}`);
  };

  // --- RENDER CONTENT VIEWER ---
  const renderContent = () => {
    switch (student.type) {
      case "TEXT":
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[500px] font-serif text-lg leading-relaxed text-slate-700">
            {student.content}
          </div>
        );
      case "FILE":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 min-h-[500px]">
            <FileText size={64} className="text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium mb-4">
              Bài tập dạng File (PDF/Word)
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Download size={18} /> Tải xuống để xem
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Preview đang được cập nhật...
            </p>
          </div>
        );
      case "AUDIO":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-xl min-h-[500px] text-white">
            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-8 animate-pulse">
              <Mic size={48} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-6">Bài luyện nói: Unit 1</h3>
            <div className="flex items-center gap-6">
              <button className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition">
                <RotateCcw size={24} />
              </button>
              <button className="p-6 bg-blue-500 text-white rounded-full hover:scale-110 transition shadow-lg shadow-blue-500/50">
                <Play size={32} fill="white" />
              </button>
              <button className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition">
                <Pause size={24} />
              </button>
            </div>
            <div className="w-96 h-1 bg-slate-700 rounded-full mt-8 overflow-hidden">
              <div className="w-1/3 h-full bg-blue-500"></div>
            </div>
            <p className="mt-2 text-slate-400 text-sm">00:45 / 02:30</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* --- HEADER: NAVIGATION --- */}
      <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">
              Bài tập về nhà: Viết lại câu (Unit 1)
            </h1>
            <p className="text-xs text-slate-500">
              {student.type === "TEXT"
                ? "Tự luận"
                : student.type === "AUDIO"
                  ? "Phát âm"
                  : "File đính kèm"}
            </p>
          </div>
        </div>

        {/* Student Switcher */}
        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1.5 hover:bg-white rounded-md text-slate-500 disabled:opacity-30 transition shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3 px-2 min-w-[200px]">
            <img
              src={student.avatar}
              className="w-8 h-8 rounded-full border border-slate-200"
              alt="avatar"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700 truncate">
                {student.studentName}
              </p>
              <p className="text-[10px] text-slate-400">
                Học sinh {currentIndex + 1} trên {totalStudents}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalStudents - 1}
            className="p-1.5 hover:bg-white rounded-md text-slate-500 disabled:opacity-30 transition shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            Đã chấm: 1/20
          </span>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-[5%] h-full bg-green-500"></div>
          </div>
        </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: SUBMISSION VIEWER */}
        <div className="flex-1 bg-slate-100 p-6 overflow-y-auto relative">
          {/* Submission Info Overlay */}
          <div className="absolute top-6 right-8 flex gap-2 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${student.status === "ON_TIME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {student.status === "ON_TIME" ? "Nộp đúng hạn" : "Nộp muộn"}
            </span>
            <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
              {student.submittedAt}
            </span>
          </div>

          {/* Render Content */}
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
            {renderContent()}
          </div>
        </div>

        {/* RIGHT PANEL: GRADING TOOLS */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl z-10">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Điểm số (Thang 10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 text-3xl font-black text-blue-600 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 bg-transparent text-center placeholder:text-slate-200"
                  placeholder="0.0"
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(e.target.value)}
                  max={10}
                  min={0}
                />
                <span className="text-xl font-bold text-slate-400">/ 10</span>
              </div>
            </div>

            {/* Quick Feedback Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Nhận xét nhanh
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Làm tốt lắm! 👏",
                  "Cần cố gắng hơn",
                  "Ngữ pháp tốt",
                  "Phát âm chuẩn",
                  "Lạc đề",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setCurrentFeedback(
                        (prev) => prev + (prev ? "\n" : "") + tag,
                      )
                    }
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <MessageSquare size={14} /> Nhận xét chi tiết
              </label>
              <textarea
                className="w-full flex-1 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none bg-slate-50"
                placeholder="Nhập nhận xét cho học sinh..."
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                rows={8}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
            <button className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition text-sm">
              Lưu nháp
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
            >
              <CheckCircle2 size={18} /> Lưu & Trả bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

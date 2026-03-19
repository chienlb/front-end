"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  FileText,
  Video,
  Download,
  Maximize2,
  Star,
  MessageCircle,
  Sticker,
  Send,
  MoreHorizontal,
  LayoutList,
  Check,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// --- TYPES ---
export interface QuizResult {
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number; // Index học sinh chọn
}

export interface SubmissionContent {
  type: "ESSAY" | "VIDEO" | "QUIZ";
  fileUrl?: string; // Cho Essay/Video
  text?: string;
  preview?: string; // Cho Image/Video thumbnail
  quizData?: QuizResult[]; // [NEW] Dữ liệu bài làm trắc nghiệm
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  status: "PENDING" | "GRADED" | "LATE";
  score?: number;
  maxScore: number;
  content: SubmissionContent;
  feedback?: string;
}

interface GradingDashboardProps {
  submission: any;
  onClose: () => void;
}

// --- MOCK DATA ---
const CLASS_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "S01",
    studentName: "Nguyễn Văn An",
    studentAvatar: "https://i.pravatar.cc/150?img=11",
    submittedAt: "10:30 AM, 20/11",
    status: "PENDING",
    maxScore: 10,
    content: {
      type: "ESSAY",
      fileUrl: "writing_task.pdf",
      text: "Em gửi thầy bài làm ạ.",
      preview: "https://via.placeholder.com/600x800?text=PDF+Preview+Page+1",
    },
  },
  {
    id: "S02",
    studentName: "Trần Thị B",
    studentAvatar: "https://i.pravatar.cc/150?img=5",
    submittedAt: "09:15 AM, 20/11",
    status: "GRADED",
    score: 9.0,
    maxScore: 10,
    feedback: "Phát âm rất tốt, ngữ điệu tự nhiên.",
    content: {
      type: "VIDEO",
      fileUrl: "intro_video.mp4",
      text: "Video bài tập nói về sở thích.",
      preview: "https://via.placeholder.com/600x400?text=Video+Thumbnail",
    },
  },
  // [NEW] Mock bài làm Quiz
  {
    id: "S03",
    studentName: "Lê Văn C",
    studentAvatar: "https://i.pravatar.cc/150?img=3",
    submittedAt: "2 ngày trước",
    status: "PENDING",
    maxScore: 10,
    content: {
      type: "QUIZ",
      quizData: [
        {
          question: "Thì hiện tại đơn dùng để diễn tả?",
          options: [
            "Sự thật hiển nhiên",
            "Hành động đang xảy ra",
            "Hành động trong quá khứ",
            "Tương lai gần",
          ],
          correctIndex: 0,
          selectedIndex: 0, // Đúng
        },
        {
          question: "He ____ to school every day.",
          options: ["go", "goes", "going", "went"],
          correctIndex: 1,
          selectedIndex: 2, // Sai (chọn going)
        },
        {
          question: "Từ nào là động từ tobe?",
          options: ["Do", "Does", "Am", "Have"],
          correctIndex: 2,
          selectedIndex: 2, // Đúng
        },
      ],
    },
  },
];

const QUICK_COMMENTS = [
  "Làm tốt lắm! 🌟",
  "Cần cố gắng hơn 💪",
  "Chữ viết rất đẹp ✍️",
  "Phát âm chuẩn 🗣️",
  "Ý tưởng sáng tạo 🚀",
  "Chú ý lỗi ngữ pháp 📚",
];

export default function GradingDashboard({
  submission,
  onClose,
}: GradingDashboardProps) {
  const initialId = submission?.id || CLASS_SUBMISSIONS[0].id;
  const [currentId, setCurrentId] = useState<string>(initialId);
  const currentSub =
    CLASS_SUBMISSIONS.find((s) => s.id === currentId) || CLASS_SUBMISSIONS[0];

  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    // Nếu là Quiz chưa chấm -> Tự động tính điểm gợi ý
    if (
      currentSub.content.type === "QUIZ" &&
      currentSub.status === "PENDING" &&
      currentSub.content.quizData
    ) {
      const correctCount = currentSub.content.quizData.filter(
        (q) => q.selectedIndex === q.correctIndex,
      ).length;
      const totalQ = currentSub.content.quizData.length;
      const autoScore = (correctCount / totalQ) * currentSub.maxScore;
      setScore(autoScore.toFixed(1)); // Làm tròn 1 số thập phân
    } else {
      setScore(currentSub.score ? currentSub.score.toString() : "");
    }
    setFeedback(currentSub.feedback || "");
  }, [currentId]);

  const handleQuickComment = (comment: string) => {
    setFeedback((prev) => (prev ? `${prev} ${comment}` : comment));
  };

  const handleSubmit = () => {
    alert(
      `Đã lưu điểm cho ${currentSub.studentName}: ${score}/${currentSub.maxScore}`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col font-sans"
    >
      {/* 1. HEADER TOOLBAR */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
          >
            <X size={24} />
          </button>
          <div className="border-l border-slate-200 pl-4">
            <h1 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Đang chấm bài
            </h1>
            <p className="text-lg font-black text-slate-800 line-clamp-1">
              {submission?.assignmentTitle || "Bài tập về nhà Unit 5"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft size={16} />{" "}
            <span className="hidden md:inline">Trước</span>
          </button>
          <span className="text-xs font-bold text-slate-400">
            {CLASS_SUBMISSIONS.findIndex((s) => s.id === currentId) + 1} /{" "}
            {CLASS_SUBMISSIONS.length}
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            <span className="hidden md:inline">Sau</span>{" "}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: STUDENT LIST (20%) */}
        <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto hidden lg:block flex-shrink-0">
          <div className="p-4 sticky top-0 bg-white z-10 border-b border-slate-50">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                placeholder="Tìm học sinh..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          <div className="p-2 space-y-1">
            {CLASS_SUBMISSIONS.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setCurrentId(sub.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${currentId === sub.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"}`}
              >
                <div className="relative">
                  <img
                    src={sub.studentAvatar}
                    className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-100"
                  />
                  {sub.status === "GRADED" && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle2
                        size={14}
                        className="text-green-500 fill-green-100"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${currentId === sub.id ? "text-indigo-700" : "text-slate-700"}`}
                  >
                    {sub.studentName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {sub.submittedAt}
                  </p>
                </div>
                {currentId === sub.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: CONTENT VIEWER (55%) */}
        <div className="flex-1 bg-slate-100 p-4 md:p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header Info */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start gap-4">
              <img
                src={currentSub.studentAvatar}
                className="w-10 h-10 rounded-full border border-white shadow-sm"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-800">
                    {currentSub.studentName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentSub.status === "LATE" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
                  >
                    {currentSub.status === "LATE" ? "Nộp muộn" : "Đúng hạn"}
                  </span>
                </div>
                {currentSub.content.text && (
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                    <span className="absolute -left-2 top-3 w-2 h-2 bg-white border-l border-b border-slate-200 rotate-45"></span>
                    "{currentSub.content.text}"
                  </p>
                )}
              </div>
            </div>

            {/* --- VIEWER CONTENT SWITCHER --- */}
            <div className="flex-1 bg-slate-50 relative overflow-y-auto">
              {/* 1. QUIZ VIEWER */}
              {currentSub.content.type === "QUIZ" &&
                currentSub.content.quizData && (
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                        <LayoutList className="text-indigo-600" /> Kết quả bài
                        làm
                      </h3>
                      <div className="text-sm font-bold text-slate-500">
                        Đúng:{" "}
                        <span className="text-green-600">
                          {
                            currentSub.content.quizData.filter(
                              (q) => q.selectedIndex === q.correctIndex,
                            ).length
                          }
                        </span>{" "}
                        / {currentSub.content.quizData.length} câu
                      </div>
                    </div>

                    {currentSub.content.quizData.map((q, idx) => {
                      const isCorrect = q.selectedIndex === q.correctIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-6 rounded-2xl border-2 ${isCorrect ? "border-slate-200 bg-white" : "border-red-100 bg-red-50/30"}`}
                        >
                          <div className="flex gap-3 mb-4">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isCorrect ? "bg-slate-400" : "bg-red-500"}`}
                            >
                              {idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 text-lg">
                              {q.question}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-9">
                            {q.options.map((opt, oIdx) => {
                              let optionClass =
                                "border-slate-200 bg-white text-slate-600";
                              let icon = null;

                              if (oIdx === q.correctIndex) {
                                optionClass =
                                  "border-green-500 bg-green-50 text-green-700 font-bold"; // Đáp án đúng
                                icon = (
                                  <CheckCircle2
                                    size={16}
                                    className="text-green-600"
                                  />
                                );
                              } else if (
                                oIdx === q.selectedIndex &&
                                !isCorrect
                              ) {
                                optionClass =
                                  "border-red-500 bg-red-50 text-red-700 font-bold"; // Học sinh chọn sai
                                icon = (
                                  <XCircle size={16} className="text-red-600" />
                                );
                              } else if (
                                oIdx === q.selectedIndex &&
                                isCorrect
                              ) {
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-3 rounded-xl border flex items-center justify-between ${optionClass}`}
                                >
                                  <span className="text-sm">{opt}</span>
                                  {icon}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* 2. VIDEO VIEWER */}
              {currentSub.content.type === "VIDEO" && (
                <div className="h-full flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm cursor-pointer hover:scale-110 transition">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                    <p className="text-white/70 font-medium">
                      Video Player Preview
                    </p>
                  </div>
                </div>
              )}

              {/* 3. FILE/ESSAY VIEWER */}
              {currentSub.content.type === "ESSAY" && (
                <div className="w-full h-full relative bg-slate-200 flex items-center justify-center">
                  <img
                    src={currentSub.content.preview}
                    className="max-w-full max-h-full shadow-lg"
                    alt="Preview"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80">
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {currentSub.content.fileUrl && (
              <div className="p-3 border-t border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  {currentSub.content.type === "VIDEO" ? (
                    <Video size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                  <span className="truncate max-w-[200px]">
                    {currentSub.content.fileUrl}
                  </span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-600 text-xs font-bold transition">
                  <Download size={14} /> Tải xuống
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: GRADING PANEL (25%) */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-xl z-30 flex-shrink-0">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={18} />{" "}
                Chấm điểm
              </h3>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="flex items-end gap-2 mb-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Điểm số
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val <= currentSub.maxScore) setScore(e.target.value);
                  }}
                  className="w-full text-4xl font-black text-indigo-600 bg-transparent outline-none placeholder:text-slate-200"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="text-right pb-2">
                <span className="text-xl font-bold text-slate-400">
                  / {currentSub.maxScore}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <MessageCircle size={14} /> Nhận xét & Động viên
            </label>
            <textarea
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition resize-none mb-4"
              placeholder="Nhập nhận xét chi tiết cho học sinh..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>

            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                Mẫu câu nhanh
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_COMMENTS.map((cmt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickComment(cmt)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                  >
                    {cmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                <Sticker size={12} /> Sticker động viên
              </p>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-xl overflow-x-auto no-scrollbar">
                {["🏆", "🔥", "💯", "🌟", "🚀", "🌈", "👍"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickComment(emoji)}
                    className="text-2xl hover:scale-125 transition p-1 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-white">
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Send size={18} /> Hoàn tất & Gửi
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

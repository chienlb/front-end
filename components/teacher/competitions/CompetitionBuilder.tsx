"use client";

import { useState } from "react";
import {
  X,
  Save,
  Trophy,
  Calendar,
  Users,
  Image as ImageIcon,
  Gift,
  Settings,
  Zap,
  Mic,
  LayoutList,
  Plus,
  Trash2,
  Check,
  CreditCard,
  AlertCircle,
  UploadCloud,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

// --- TYPES ---
export type CompType = "QUIZ" | "SPEAKING";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Reward {
  rank: "TOP1" | "TOP2" | "TOP3" | "PARTICIPATION";
  name: string;
  xp: number;
}

export interface CompetitionData {
  title: string;
  description: string;
  bannerUrl: string;
  type: CompType;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  entryFee: number; // 0 = Free
  rewards: Reward[];
  questions: Question[]; // Only for QUIZ
  speakingTopic?: string; // Only for SPEAKING
}

interface CompetitionBuilderProps {
  onClose: () => void;
  onSave: (data: CompetitionData) => void;
}

// --- DEFAULTS ---
const DEFAULT_QUESTION: Question = {
  id: "q_1",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

const DEFAULT_REWARDS: Reward[] = [
  { rank: "TOP1", name: "Huy hiệu Vàng", xp: 500 },
  { rank: "TOP2", name: "Huy hiệu Bạc", xp: 300 },
  { rank: "TOP3", name: "Huy hiệu Đồng", xp: 100 },
];

export default function CompetitionBuilder({
  onClose,
  onSave,
}: CompetitionBuilderProps) {
  // --- STATE ---
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Info, Step 2: Content
  const [data, setData] = useState<CompetitionData>({
    title: "",
    description: "",
    bannerUrl: "",
    type: "QUIZ",
    startTime: "",
    endTime: "",
    maxParticipants: 100,
    entryFee: 0,
    rewards: DEFAULT_REWARDS,
    questions: [{ ...DEFAULT_QUESTION, id: `q_${Date.now()}` }],
    speakingTopic: "",
  });

  // --- HANDLERS: QUIZ CONTENT ---
  const addQuestion = () => {
    setData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { ...DEFAULT_QUESTION, id: `q_${Date.now()}` },
      ],
    }));
  };

  const updateQuestion = (qId: string, field: keyof Question, value: any) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const updateOption = (qId: string, idx: number, val: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[idx] = val;
        return { ...q, options: newOpts };
      }),
    }));
  };

  // --- SUBMIT ---
  const handleSave = () => {
    if (!data.title || !data.startTime || !data.endTime)
      return alert("Vui lòng điền đầy đủ thông tin cơ bản!");

    if (data.type === "QUIZ" && data.questions.some((q) => !q.text))
      return alert("Vui lòng hoàn thiện nội dung câu hỏi!");

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl relative z-10 flex overflow-hidden border border-slate-200"
      >
        {/* SIDEBAR NAVIGATION */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-black text-xl text-slate-800 flex items-center gap-2">
              <Trophy className="text-yellow-500 fill-yellow-500" /> Tạo Cuộc
              Thi
            </h2>
          </div>

          <div className="p-4 space-y-2 flex-1">
            <button
              onClick={() => setStep(1)}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition ${step === 1 ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                1
              </div>
              Thông tin chung
            </button>
            <button
              onClick={() => setStep(2)}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition ${step === 2 ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                2
              </div>
              Nội dung thi đấu
            </button>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl mb-2 transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
            >
              <Save size={18} /> Xuất bản
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* === STEP 1: GENERAL INFO === */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setData((prev) => ({ ...prev, type: "QUIZ" }))}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center gap-3 text-center ${data.type === "QUIZ" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${data.type === "QUIZ" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}
                  >
                    <LayoutList size={28} />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg ${data.type === "QUIZ" ? "text-indigo-900" : "text-slate-700"}`}
                    >
                      Đấu trường Quiz
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Trắc nghiệm tính điểm & thời gian
                    </p>
                  </div>
                </div>

                <div
                  onClick={() =>
                    setData((prev) => ({ ...prev, type: "SPEAKING" }))
                  }
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center gap-3 text-center ${data.type === "SPEAKING" ? "border-pink-500 bg-pink-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${data.type === "SPEAKING" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Mic size={28} />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-lg ${data.type === "SPEAKING" ? "text-pink-900" : "text-slate-700"}`}
                    >
                      Thử thách Speaking
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Thu âm & Chấm điểm AI
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={20} /> Thiết lập cơ bản
                </h3>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tên cuộc thi
                  </label>
                  <input
                    value={data.title}
                    onChange={(e) =>
                      setData({ ...data, title: e.target.value })
                    }
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold outline-none focus:border-indigo-500"
                    placeholder="VD: Rung chuông vàng - Tháng 11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={data.startTime}
                      onChange={(e) =>
                        setData({ ...data, startTime: e.target.value })
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      value={data.endTime}
                      onChange={(e) =>
                        setData({ ...data, endTime: e.target.value })
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Users size={16} /> Giới hạn tham gia
                    </label>
                    <input
                      type="number"
                      value={data.maxParticipants}
                      onChange={(e) =>
                        setData({
                          ...data,
                          maxParticipants: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <CreditCard size={16} /> Phí tham gia (Xu)
                    </label>
                    <input
                      type="number"
                      value={data.entryFee}
                      onChange={(e) =>
                        setData({ ...data, entryFee: parseInt(e.target.value) })
                      }
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                      placeholder="0 = Miễn phí"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Ảnh bìa (Banner)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition">
                    <UploadCloud size={32} className="mb-2" />
                    <span className="text-sm font-bold">
                      Tải ảnh lên (16:9)
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards Config */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Gift size={20} /> Giải thưởng & Quà tặng
                </h3>
                <div className="space-y-3">
                  {data.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl bg-slate-50"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-sm ${
                          reward.rank === "TOP1"
                            ? "bg-yellow-400"
                            : reward.rank === "TOP2"
                              ? "bg-slate-400"
                              : "bg-orange-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          value={reward.name}
                          onChange={(e) => {
                            const newRewards = [...data.rewards];
                            newRewards[index].name = e.target.value;
                            setData({ ...data, rewards: newRewards });
                          }}
                          className="bg-white border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none"
                          placeholder="Tên phần thưởng"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            XP
                          </span>
                          <input
                            type="number"
                            value={reward.xp}
                            onChange={(e) => {
                              const newRewards = [...data.rewards];
                              newRewards[index].xp = parseInt(e.target.value);
                              setData({ ...data, rewards: newRewards });
                            }}
                            className="w-full bg-white border border-slate-200 p-2 pl-8 rounded-lg text-sm font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2: CONTENT === */}
          {step === 2 && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              {data.type === "QUIZ" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Bộ câu hỏi trắc nghiệm
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Soạn thảo các câu hỏi cho cuộc thi.
                      </p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm">
                      {data.questions.length} câu hỏi
                    </span>
                  </div>

                  {data.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group"
                    >
                      <div className="absolute -left-4 top-6 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-black shadow-lg z-10 border-4 border-slate-50">
                        {idx + 1}
                      </div>

                      <div className="ml-2">
                        <textarea
                          rows={2}
                          value={q.text}
                          onChange={(e) =>
                            updateQuestion(q.id, "text", e.target.value)
                          }
                          className="w-full text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none resize-none bg-transparent mb-4"
                          placeholder="Nhập nội dung câu hỏi..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${q.correctIndex === oIdx ? "border-green-500 bg-green-50" : "border-slate-100 bg-slate-50"}`}
                            >
                              <button
                                onClick={() =>
                                  updateQuestion(q.id, "correctIndex", oIdx)
                                }
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctIndex === oIdx ? "border-green-500 bg-green-500 text-white" : "border-slate-300"}`}
                              >
                                {q.correctIndex === oIdx && (
                                  <Check size={14} strokeWidth={4} />
                                )}
                              </button>
                              <input
                                value={opt}
                                onChange={(e) =>
                                  updateOption(q.id, oIdx, e.target.value)
                                }
                                className="flex-1 bg-transparent outline-none text-sm font-medium"
                                placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const newQs = data.questions.filter(
                            (item) => item.id !== q.id,
                          );
                          setData({ ...data, questions: newQs });
                        }}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Thêm câu hỏi mới
                  </button>
                </div>
              )}

              {data.type === "SPEAKING" && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-6">
                  <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Mic size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">
                    Chủ đề Hùng biện
                  </h3>
                  <div className="max-w-2xl mx-auto text-left">
                    <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">
                      Chủ đề / Đề bài
                    </label>
                    <textarea
                      rows={6}
                      value={data.speakingTopic}
                      onChange={(e) =>
                        setData({ ...data, speakingTopic: e.target.value })
                      }
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-lg outline-none focus:border-pink-500 transition"
                      placeholder="VD: Talk about your favorite holiday..."
                    />
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Zap size={14} className="text-yellow-500" /> Chấm điểm AI
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Tối đa 3 phút
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

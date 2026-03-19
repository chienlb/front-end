import {
  Gamepad2,
  Type,
  Image as ImageIcon,
  Coins,
  Star,
  Music,
  LayoutTemplate,
  CheckCircle2,
  Puzzle,
  Mic,
  PenTool,
  BrainCircuit,
  Headphones,
} from "lucide-react";
import { SubFormProps } from "../types";
import MediaUploader from "./MediaUploader";

const GAME_OPTIONS = [
  {
    value: "quiz",
    label: "Trắc nghiệm",
    icon: <CheckCircle2 size={32} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    value: "listening",
    label: "Luyện nghe",
    icon: <Headphones size={32} />,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    value: "spelling",
    label: "Chính tả",
    icon: <PenTool size={32} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    value: "speaking",
    label: "Luyện nói",
    icon: <Mic size={32} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    value: "matching",
    label: "Nối hình",
    icon: <Puzzle size={32} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    value: "flashcard",
    label: "Lật thẻ",
    icon: <BrainCircuit size={32} />,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
];

export default function CommonFields({ form, setForm }: SubFormProps) {
  const needsMedia = ["listening", "speaking", "quiz"].includes(form.type);
  const mediaType =
    form.type === "listening" || form.type === "speaking" ? "audio" : "image";

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* === CỘT TRÁI (CHÍNH - CHIẾM 8/12) === */}
      <div className="col-span-12 xl:col-span-8 space-y-8">
        {/* SECTION 1: CHỌN LOẠI GAME */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Gamepad2 size={24} />
              </span>
              Bước 1: Chọn loại trò chơi
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {GAME_OPTIONS.map((opt) => {
              const isActive = form.type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`
                    group relative flex flex-col items-center justify-center py-8 px-4 rounded-2xl border-2 transition-all duration-300
                    ${
                      isActive
                        ? `${opt.border} ${opt.bg} ring-4 ring-offset-2 ring-blue-100 scale-[1.02] shadow-lg`
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1"
                    }
                  `}
                >
                  <div
                    className={`mb-4 p-4 rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 ${opt.color}`}
                  >
                    {opt.icon}
                  </div>
                  <span
                    className={`text-lg font-bold ${isActive ? "text-slate-800" : "text-slate-500"}`}
                  >
                    {opt.label}
                  </span>

                  {/* Checkmark active */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-white text-green-500 rounded-full p-1 shadow-sm">
                      <CheckCircle2
                        size={20}
                        fill="currentColor"
                        className="text-green-500"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: CHI TIẾT CÂU HỎI */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-8">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-6">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Type size={24} />
            </span>
            Bước 2: Nội dung câu hỏi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Chủ đề */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-500 uppercase mb-3 block tracking-wide">
                Chủ đề (Topic)
              </label>
              <div className="relative group">
                <LayoutTemplate
                  className="absolute left-5 top-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={24}
                />
                <input
                  type="text"
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-lg font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="VD: Animals, Tet Holiday..."
                />
              </div>
            </div>

            {/* Input Level */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-500 uppercase mb-3 block tracking-wide">
                Độ khó
              </label>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl h-[72px]">
                {[1, 2, 3].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setForm({ ...form, level: lv })}
                    className={`
                      flex-1 rounded-xl text-lg font-bold transition-all flex flex-col items-center justify-center
                      ${
                        form.level === lv
                          ? "bg-white text-blue-600 shadow-md transform scale-[0.96]"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      }
                    `}
                  >
                    Level {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Nội dung */}
            <div className="col-span-2">
              <label className="text-sm font-bold text-slate-500 uppercase mb-3 block tracking-wide">
                Câu hỏi / Đề bài
              </label>
              <textarea
                className="w-full h-48 p-6 bg-slate-50 border-2 border-transparent rounded-3xl text-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none resize-none transition-all shadow-inner leading-relaxed"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Nhập nội dung câu hỏi to và rõ ràng..."
              />
            </div>
          </div>
        </section>
      </div>

      {/* CỘT PHẢI (SIDEBAR - CHIẾM 4/12) */}
      <div className="col-span-12 xl:col-span-4 space-y-8">
        {/* SECTION 3: THƯỞNG */}
        <section className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-[2rem] border border-orange-100 shadow-sm">
          <h3 className="text-lg font-black text-orange-800 uppercase mb-6 flex items-center gap-2">
            🎁 Phần thưởng
          </h3>
          <div className="space-y-5">
            {/* Vàng */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-inner">
                  <Coins size={24} />
                </div>
                <span className="text-lg font-bold text-slate-600">Vàng</span>
              </div>
              <input
                type="number"
                className="w-24 text-right text-2xl font-black text-orange-500 outline-none border-b-4 border-transparent focus:border-orange-300 bg-transparent transition-all"
                value={form.rewardGold}
                onChange={(e) =>
                  setForm({ ...form, rewardGold: Number(e.target.value) })
                }
              />
            </div>

            {/* XP */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
                  <Star size={24} />
                </div>
                <span className="text-lg font-bold text-slate-600">XP</span>
              </div>
              <input
                type="number"
                className="w-24 text-right text-2xl font-black text-purple-500 outline-none border-b-4 border-transparent focus:border-purple-300 bg-transparent transition-all"
                value={form.rewardXP}
                onChange={(e) =>
                  setForm({ ...form, rewardXP: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: MEDIA */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 uppercase mb-6 flex items-center gap-2">
            <ImageIcon className="text-rose-500" size={24} />
            Media & Hình ảnh
          </h3>

          <div className="space-y-8">
            {/* Ảnh chủ đề */}
            <div>
              <label className="text-sm font-bold text-slate-400 mb-3 block uppercase tracking-wide">
                Ảnh nền chủ đề
              </label>
              <div className="h-48 w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50 group">
                <MediaUploader
                  type="image"
                  value={form.topicImage}
                  onChange={(url) => setForm({ ...form, topicImage: url })}
                />
              </div>
            </div>

            {needsMedia && (
              <div>
                <label className="text-sm font-bold text-slate-400 mb-3 flex items-center justify-between uppercase tracking-wide">
                  <span>File câu hỏi ({mediaType})</span>
                  {mediaType === "audio" ? (
                    <Music size={18} className="text-slate-400" />
                  ) : null}
                </label>
                <div className="h-48 w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50">
                  <MediaUploader
                    type={mediaType}
                    value={form.mediaUrl}
                    onChange={(url) => setForm({ ...form, mediaUrl: url })}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { Question, QuestionType } from "./types";
import { TYPE_CONFIG } from "./constants";
import { GripVertical, Trash2, Plus, ImageIcon } from "lucide-react";

interface QuestionItemProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

export default function QuestionItem({
  question: q,
  index,
  onUpdate,
  onDelete,
}: QuestionItemProps) {
  // Lấy cấu hình màu sắc và icon dựa trên loại câu hỏi
  const Config = TYPE_CONFIG[q.type];
  const Icon = Config.icon;

  // --- SUB-RENDERER: Nội dung riêng cho từng loại câu hỏi ---
  const renderEditorBody = () => {
    switch (q.type) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-2 mt-4">
            {q.options?.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-3 group">
                {/* Radio chọn đáp án đúng */}
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={opt.isCorrect}
                  onChange={() => {
                    const newOpts = q.options?.map((o) => ({
                      ...o,
                      isCorrect: o.id === opt.id,
                    }));
                    onUpdate({ options: newOpts });
                  }}
                  className="w-5 h-5 cursor-pointer accent-orange-600"
                  title="Chọn làm đáp án đúng"
                />

                {/* Input nội dung đáp án */}
                <input
                  className="flex-1 border-b border-slate-200 focus:border-orange-500 outline-none py-2 text-sm bg-transparent transition placeholder:text-slate-300"
                  placeholder={`Nhập đáp án ${idx + 1}...`}
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = q.options?.map((o) =>
                      o.id === opt.id ? { ...o, text: e.target.value } : o,
                    );
                    onUpdate({ options: newOpts });
                  }}
                />

                {/* Nút xóa đáp án */}
                <button
                  onClick={() => {
                    const newOpts = q.options?.filter((o) => o.id !== opt.id);
                    onUpdate({ options: newOpts });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition"
                  title="Xóa đáp án này"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Nút thêm đáp án */}
            <button
              onClick={() => {
                const newOpts = [
                  ...(q.options || []),
                  { id: Date.now(), text: "", isCorrect: false },
                ];
                onUpdate({ options: newOpts });
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline mt-2 flex items-center gap-1 transition"
            >
              <Plus size={14} /> Thêm đáp án
            </button>
          </div>
        );

      case "ESSAY":
        return (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm italic">
            Học sinh sẽ nhập câu trả lời tự luận tại đây. Giáo viên sẽ chấm điểm
            thủ công sau khi học sinh nộp bài.
          </div>
        );

      case "MATCHING":
        return (
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 uppercase">
              <div>Cột A (Câu hỏi)</div>
              <div>Cột B (Đáp án khớp)</div>
            </div>
            {q.pairs?.map((pair) => (
              <div key={pair.id} className="grid grid-cols-2 gap-4 group">
                <input
                  className="border border-slate-200 p-2 rounded-lg text-sm focus:border-purple-500 outline-none transition"
                  placeholder="Nhập vế trái..."
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = q.pairs?.map((p) =>
                      p.id === pair.id ? { ...p, left: e.target.value } : p,
                    );
                    onUpdate({ pairs: newPairs });
                  }}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-200 p-2 rounded-lg text-sm focus:border-purple-500 outline-none transition"
                    placeholder="Nhập vế phải..."
                    value={pair.right}
                    onChange={(e) => {
                      const newPairs = q.pairs?.map((p) =>
                        p.id === pair.id ? { ...p, right: e.target.value } : p,
                      );
                      onUpdate({ pairs: newPairs });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newPairs = q.pairs?.filter((p) => p.id !== pair.id);
                      onUpdate({ pairs: newPairs });
                    }}
                    className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newPairs = [
                  ...(q.pairs || []),
                  { id: Date.now(), left: "", right: "" },
                ];
                onUpdate({ pairs: newPairs });
              }}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline mt-2 flex items-center gap-1 transition"
            >
              <Plus size={14} /> Thêm cặp ghép
            </button>
          </div>
        );

      case "SPEAKING":
        return (
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-500 mb-2">
              Đoạn văn mẫu (Học sinh sẽ đọc theo):
            </label>
            <textarea
              className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-200 outline-none transition resize-none"
              rows={3}
              placeholder="Nhập câu hoặc đoạn văn cần luyện phát âm..."
              value={q.audioText}
              onChange={(e) => onUpdate({ audioText: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // --- MAIN RENDER ---
  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group relative border-l-4 transition-all hover:shadow-md ${Config.color}`}
    >
      {/* Drag & Delete Handle */}
      <div className="absolute top-6 -left-12 opacity-0 group-hover:opacity-100 transition flex flex-col gap-2">
        <button
          className="p-2 bg-white rounded-full shadow-md text-slate-400 cursor-move hover:text-blue-600 transition"
          title="Kéo thả để sắp xếp"
        >
          <GripVertical size={20} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-white rounded-full shadow-md text-red-400 hover:text-red-600 transition"
          title="Xóa câu hỏi này"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Header Area */}
      <div className="flex gap-4 mb-4 items-start">
        <span className="font-black text-slate-300 text-xl select-none pt-2 w-8 text-center">
          {index + 1}.
        </span>

        <div className="flex-1 space-y-4">
          <div className="flex gap-4">
            {/* Input tiêu đề câu hỏi */}
            <input
              className="flex-1 bg-slate-50 p-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-100 transition border border-transparent focus:border-blue-300 placeholder:text-slate-400"
              placeholder="Nhập nội dung câu hỏi..."
              value={q.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />

            {/* Selector Loại câu hỏi */}
            <div className="relative">
              <select
                className={`appearance-none h-full pl-9 pr-8 border rounded-xl text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition ${Config.bg} ${Config.text} ${Config.color}`}
                value={q.type}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  onUpdate({
                    type: newType,
                    // Reset dữ liệu đặc thù khi đổi loại để tránh lỗi
                    options:
                      newType === "MULTIPLE_CHOICE"
                        ? [{ id: Date.now(), text: "", isCorrect: false }]
                        : undefined,
                    pairs:
                      newType === "MATCHING"
                        ? [{ id: Date.now(), left: "", right: "" }]
                        : undefined,
                    audioText: newType === "SPEAKING" ? "" : undefined,
                  });
                }}
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="ESSAY">Tự luận</option>
                <option value="MATCHING">Ghép nối</option>
                <option value="SPEAKING">Phát âm</option>
              </select>
              <Icon
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${Config.text}`}
              />
            </div>

            {/* Input Điểm số */}
            <div className="relative group/points" title="Điểm số">
              <input
                type="number"
                min="0"
                className="w-20 border border-slate-200 rounded-xl text-center font-bold text-sm outline-none focus:border-blue-500 h-full py-0"
                value={q.points}
                onChange={(e) =>
                  onUpdate({ points: parseInt(e.target.value) || 0 })
                }
              />
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/points:opacity-100 transition whitespace-nowrap pointer-events-none">
                Điểm
              </span>
            </div>
          </div>

          {/* Render Body (Dynamic Content) */}
          <div className="pl-1 animate-in fade-in duration-300">
            {renderEditorBody()}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-100 pt-3 mt-2 flex justify-end gap-4 items-center">
        <button
          className="text-slate-400 hover:text-blue-600 transition flex items-center gap-1 text-xs font-bold"
          title="Thêm hình ảnh minh họa (Tính năng sắp ra mắt)"
        >
          <ImageIcon size={16} /> Thêm ảnh
        </button>
        <div className="h-4 w-px bg-slate-200"></div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-700 select-none transition">
          <input
            type="checkbox"
            className="accent-blue-600 w-4 h-4 rounded"
            defaultChecked
          />{" "}
          Bắt buộc
        </label>
      </div>
    </div>
  );
}

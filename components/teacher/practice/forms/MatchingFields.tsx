import {
  Trash2,
  Plus,
  ArrowRight,
  ImageIcon,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import { SubFormProps } from "../types";
import MediaUploader from "./MediaUploader";
import { useState } from "react";

export default function MatchingFields({ form, setForm }: SubFormProps) {
  const [modes, setModes] = useState<Record<number, "text" | "image">>({});

  const toggleMode = (index: number) => {
    setModes((prev) => ({
      ...prev,
      [index]: prev[index] === "image" ? "text" : "image",
    }));
  };

  const addPair = () => {
    setForm({ ...form, pairs: [...form.pairs, { left: "", right: "" }] });
  };

  const removePair = (index: number) => {
    const newPairs = form.pairs.filter((_, i) => i !== index);
    setForm({ ...form, pairs: newPairs });
  };

  const updatePair = (
    index: number,
    field: "left" | "right",
    value: string,
  ) => {
    const newPairs = [...form.pairs];
    newPairs[index][field] = value;
    setForm({ ...form, pairs: newPairs });
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <LinkIcon size={18} />
            </span>
            Cấu hình cặp nối
          </h3>
        </div>
        <button
          onClick={addPair}
          type="button"
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-bold shadow-md transition-all active:scale-95"
        >
          <Plus size={18} /> Thêm cặp
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {form.pairs.map((pair, idx) => {
          const isImageMode =
            modes[idx] === "image" ||
            pair.right.startsWith("http") ||
            pair.right.startsWith("blob");

          return (
            <div
              key={idx}
              className="relative bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              {/* Badge số thứ tự */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white text-emerald-600 font-black rounded-full shadow-sm border flex items-center justify-center z-10">
                {idx + 1}
              </div>

              <div className="flex items-center gap-3 pl-4">
                {/* VẾ TRÁI */}
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Vế Trái
                  </div>
                  <input
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-emerald-500 outline-none"
                    placeholder="Text..."
                    value={pair.left}
                    onChange={(e) => updatePair(idx, "left", e.target.value)}
                  />
                </div>

                {/* ICON */}
                <div className="text-slate-300">
                  <ArrowRight size={24} />
                </div>

                {/* VẾ PHẢI */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Vế Phải
                    </span>
                    <button
                      onClick={() => toggleMode(idx)}
                      className="text-[10px] bg-white border px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                    >
                      {isImageMode ? (
                        <Type size={10} />
                      ) : (
                        <ImageIcon size={10} />
                      )}
                    </button>
                  </div>

                  {isImageMode ? (
                    <div className="h-[46px] w-full">
                      <MediaUploader
                        type="image"
                        value={pair.right}
                        onChange={(url) => updatePair(idx, "right", url)}
                      />
                    </div>
                  ) : (
                    <input
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:border-emerald-500 outline-none"
                      placeholder="Đáp án..."
                      value={pair.right}
                      onChange={(e) => updatePair(idx, "right", e.target.value)}
                    />
                  )}
                </div>

                {/* XÓA */}
                <button
                  onClick={() => removePair(idx)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition self-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

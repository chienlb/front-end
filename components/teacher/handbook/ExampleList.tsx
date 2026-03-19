import { Plus, Trash2, Quote, AlignLeft } from "lucide-react";

interface ExampleListProps {
  examples: string[];
  onChange: (newExamples: string[]) => void;
}

export default function ExampleList({ examples, onChange }: ExampleListProps) {
  const addExample = () => onChange([...examples, ""]);

  const updateExample = (index: number, val: string) => {
    const newArr = [...examples];
    newArr[index] = val;
    onChange(newArr);
  };

  const removeExample = (index: number) => {
    onChange(examples.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-1.5 rounded-md text-amber-600">
            <Quote size={14} />
          </div>
          <label className="text-sm font-bold text-slate-700">
            Ví dụ minh họa
          </label>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {examples.length}
          </span>
        </div>

        <button
          type="button"
          onClick={addExample}
          className="group flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-600 text-slate-500 px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
        >
          <Plus
            size={14}
            className="group-hover:text-amber-500 transition-colors"
          />
          Thêm câu
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {examples.map((ex, idx) => (
          <div
            key={idx}
            className="group flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Index Badge */}
            <div className="mt-2.5 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 group-focus-within:bg-amber-500 group-focus-within:text-white transition-colors">
              {idx + 1}
            </div>

            {/* Input Wrapper */}
            <div className="flex-1 relative">
              <textarea
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none placeholder:text-slate-300 text-slate-700 leading-relaxed shadow-sm"
                placeholder={`Nhập câu ví dụ số ${idx + 1}...`}
                value={ex}
                onChange={(e) => updateExample(idx, e.target.value)}
              />
              <div className="absolute right-2 bottom-2">
                <span className="text-[10px] text-slate-300 font-medium">
                  {ex.length} ký tự
                </span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => removeExample(idx)}
              className="mt-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Xóa ví dụ này"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* EMPTY STATE */}
        {examples.length === 0 && (
          <div
            onClick={addExample}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <AlignLeft
                size={20}
                className="group-hover:text-amber-500 transition-colors"
              />
            </div>
            <p className="text-sm font-medium">Chưa có ví dụ nào</p>
            <span className="text-xs text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              + Bấm để thêm ngay
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

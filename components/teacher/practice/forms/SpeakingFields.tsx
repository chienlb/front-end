import { Mic } from "lucide-react";
import { SubFormProps } from "../types";

export default function SpeakingFields({ form, setForm }: SubFormProps) {
  return (
    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
      <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase flex items-center gap-1">
        <Mic size={14} /> Văn bản cần đọc (AI Reference)
      </label>
      <textarea
        className="w-full border-2 border-indigo-200 p-3 rounded-lg font-bold text-slate-700 text-lg focus:border-indigo-500 outline-none h-24 resize-none"
        value={form.correctAnswer}
        onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
        placeholder="VD: Hello, my name is Lion."
      />
      <p className="text-xs text-indigo-500 mt-2">
        * AI sẽ dùng văn bản này để so sánh với giọng đọc của bé và chấm điểm độ
        chính xác.
      </p>
    </div>
  );
}

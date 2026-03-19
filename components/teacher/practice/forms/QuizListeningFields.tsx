import { SubFormProps } from "../types";
import { CheckCircle2 } from "lucide-react";

export default function QuizListeningFields({ form, setForm }: SubFormProps) {
  const handleChangeOption = (idx: number, val: string) => {
    const newOptions = [...form.options];
    newOptions[idx] = val;
    if (form.options[idx] === form.correctAnswer) {
      setForm({ ...form, options: newOptions, correctAnswer: val });
    } else {
      setForm({ ...form, options: newOptions });
    }
  };

  const handleSelectCorrect = (val: string) => {
    setForm({ ...form, correctAnswer: val });
  };

  const getLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
            ?
          </span>
          Thiết lập đáp án
        </label>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
          <span className="text-xs font-bold uppercase">Đáp án đúng:</span>
          <span className="font-black truncate max-w-[150px]">
            {form.correctAnswer || "---"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {form.options.map((opt, idx) => {
          const isCorrect = form.correctAnswer === opt && opt !== "";

          return (
            <div
              key={idx}
              onClick={() => handleSelectCorrect(opt)} // Click cả khung để chọn đúng
              className={`
                group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer
                ${
                  isCorrect
                    ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200 ring-offset-2"
                    : "border-slate-100 bg-slate-50 hover:border-blue-300 hover:bg-white"
                }
              `}
            >
              {/* Badge A, B, C, D */}
              <div
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors
                ${isCorrect ? "bg-green-500 text-white" : "bg-white text-slate-400 border border-slate-200 group-hover:border-blue-300 group-hover:text-blue-500"}
              `}
              >
                {isCorrect ? <CheckCircle2 size={24} /> : getLabel(idx)}
              </div>

              {/* Input */}
              <div className="flex-1">
                <input
                  className={`w-full bg-transparent border-none outline-none text-base font-bold transition-colors
                     ${isCorrect ? "text-green-800 placeholder:text-green-600" : "text-slate-700 placeholder:text-slate-400"}
                  `}
                  placeholder={`Nhập đáp án ${getLabel(idx)}...`}
                  value={opt}
                  onChange={(e) => handleChangeOption(idx, e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Ngăn click input kích hoạt chọn đúng
                />
                <div className="h-0.5 w-full bg-current opacity-10 mt-1"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

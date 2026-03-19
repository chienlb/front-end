"use client";
import { useState } from "react";
import { Volume2 } from "lucide-react";

export default function QuizGame({ data, onFinish }: any) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleSelect = (optId: string, isCorrect: boolean) => {
    if (isChecked) return; // Không cho chọn lại khi đã check

    setSelectedId(optId);
    setIsChecked(true);

    if (isCorrect) {
      setTimeout(() => onFinish(true), 1000); // Delay 1s rồi báo xong
    } else {
      // Nếu sai, cho phép chọn lại sau 1s (hoặc giữ nguyên tùy logic của bạn)
      setTimeout(() => {
        setIsChecked(false);
        setSelectedId(null);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {data.audio && (
          <button
            onClick={() => new Audio(data.audio).play()}
            className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 inline-block hover:scale-110 transition"
          >
            <Volume2 size={32} />
          </button>
        )}
        {data.image && (
          <img
            src={data.image}
            alt="Quiz"
            className="h-48 mx-auto object-contain rounded-lg mb-4"
          />
        )}
        <h3 className="text-xl font-bold text-slate-700">{data.question}</h3>
      </div>

      <div className="grid gap-3">
        {data.options.map((opt: any) => {
          const isSelected = selectedId === opt.id;
          let style = "bg-white border-slate-200 hover:bg-slate-50";

          if (isChecked) {
            if (opt.isCorrect)
              style = "bg-green-100 border-green-500 text-green-800"; // Hiện đáp án đúng
            else if (isSelected)
              style = "bg-red-100 border-red-500 text-red-800"; // Hiện đáp án sai đã chọn
            else style = "opacity-50";
          } else if (isSelected) {
            style = "bg-blue-50 border-blue-500";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id, opt.isCorrect)}
              className={`w-full p-4 rounded-2xl border-2 font-bold text-lg text-left transition-all ${style}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

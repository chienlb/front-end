"use client";
import { Volume2 } from "lucide-react";
import { useEffect } from "react";

export default function VocabCard({ data, onFinish }: any) {
  // Vocab vào là coi như xong luôn để hiện nút Tiếp tục
  useEffect(() => {
    onFinish(true);
  }, []);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-b-8 border-slate-200 animate-in zoom-in">
      {data.image && (
        <img
          src={data.image}
          className="w-64 h-64 object-contain mx-auto mb-6 rounded-lg"
          alt={data.word}
        />
      )}
      <h3 className="text-4xl font-bold text-blue-600 mb-2">{data.word}</h3>
      <p className="text-2xl text-slate-500 mb-6 font-medium">{data.meaning}</p>

      {data.audio && (
        <button
          onClick={() => new Audio(data.audio).play()}
          className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto hover:bg-blue-200 transition animate-bounce"
        >
          <Volume2 size={40} />
        </button>
      )}
    </div>
  );
}

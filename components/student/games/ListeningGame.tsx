"use client";
import { useState, useRef, useEffect } from "react";
import { Volume2, CheckCircle2, XCircle } from "lucide-react";

export default function ListeningGame({ data, onFinish }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    playAudio();
  }, [data]);

  const playAudio = () => {
    if (data.audio && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log("Autoplay blocked:", e));
      return;
    }
    const textToRead =
      data.question && data.question.length < 100
        ? data.question
        : "Listen and choose the correct answer";

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (id: string) => {
    if (selected) return; // Chặn click nhiều lần
    setSelected(id);

    const isCorrect = data.options.find((o: any) => o.id === id)?.isCorrect;

    // Đợi 1.5s để bé nhìn thấy kết quả (màu đỏ/xanh) rồi mới báo xong
    setTimeout(() => {
      onFinish(isCorrect);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* LOA */}
      <button
        onClick={playAudio}
        className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-600 active:scale-95 animate-bounce group transition-all"
      >
        <Volume2
          size={48}
          className="group-hover:scale-110 transition-transform"
        />
        {data.audio && <audio ref={audioRef} src={data.audio} />}
      </button>

      <div className="text-center">
        <p className="text-slate-500 font-medium">
          Nghe và chọn đáp án đúng 🎧
        </p>
      </div>

      {/* OPTIONS */}
      <div className="w-full grid gap-3">
        {data.options.map((opt: any) => {
          const isSelected = selected === opt.id;
          const isCorrectAnswer = opt.isCorrect; // Đây là đáp án đúng của hệ thống

          let style = "bg-white border-slate-200 hover:border-blue-400";
          let icon = null;

          // Logic hiển thị màu sắc khi đã chọn
          if (selected) {
            if (isCorrectAnswer) {
              // Luôn hiện màu xanh cho đáp án đúng (để bé biết câu nào đúng nếu lỡ chọn sai)
              style =
                "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-200";
              icon = <CheckCircle2 size={20} className="text-green-600" />;
            } else if (isSelected && !isCorrectAnswer) {
              // Hiện màu đỏ nếu chọn sai
              style = "bg-red-100 border-red-500 text-red-700";
              icon = <XCircle size={20} className="text-red-600" />;
            } else {
              // Làm mờ các câu sai khác
              style = "opacity-40 grayscale";
            }
          }

          return (
            <button
              key={opt.id}
              disabled={!!selected}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-4 rounded-xl border-2 font-bold text-lg text-left transition-all flex justify-between items-center ${style}`}
            >
              <span>{opt.text}</span>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

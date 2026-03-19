"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, RefreshCw, CheckCircle } from "lucide-react";
import Confetti from "react-confetti";

interface Props {
  data: {
    question: string;
    correctAnswers: string[];
    image?: string;
    audio?: string;
    hint?: string;
  };
  onFinish: (isCorrect: boolean) => void;
}

type CharObj = {
  id: string;
  char: string;
  isUsed: boolean;
};

export default function SpellingGame({ data, onFinish }: Props) {
  const targetWord = (data.correctAnswers?.[0] || "").toUpperCase().trim();
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. HÀM TẠO DỮ LIỆU (Tách ra để dùng lại)
  const generateGameData = (word: string) => {
    if (!word) return { shuffled: [], selected: [] };

    const chars: CharObj[] = word.split("").map((char, index) => ({
      id: `${char}-${index}-${Math.random()}`,
      char: char,
      isUsed: false,
    }));

    // Shuffle
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    const selected = new Array(word.length).fill(null);

    return { shuffled, selected };
  };

  // 2. KHỞI TẠO STATE NGAY LẬP TỨC (Lazy Init)
  // Giúp render đúng ngay lần đầu, không bị nháy
  const [shuffledChars, setShuffledChars] = useState<CharObj[]>(
    () => generateGameData(targetWord).shuffled,
  );
  const [selectedChars, setSelectedChars] = useState<(CharObj | null)[]>(
    () => generateGameData(targetWord).selected,
  );
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">(
    "playing",
  );

  // Ref để theo dõi từ khóa cũ
  const prevWordRef = useRef(targetWord);

  // 3. CHỈ RESET KHI TỪ KHÓA THAY ĐỔI THỰC SỰ
  useEffect(() => {
    if (targetWord !== prevWordRef.current) {
      handleReset(); // Gọi hàm reset nếu sang bài mới
      prevWordRef.current = targetWord;
    }
  }, [targetWord]);

  // 4. AUTO PLAY AUDIO (Chạy 1 lần khi mount hoặc đổi bài)
  useEffect(() => {
    if (data.audio) {
      const timer = setTimeout(
        () => audioRef.current?.play().catch(() => {}),
        500,
      );
      return () => clearTimeout(timer);
    }
  }, [data.audio, targetWord]); // Thêm targetWord để phát lại khi đổi bài

  // Hàm Reset (Chơi lại hoặc đổi bài)
  const handleReset = useCallback(() => {
    const { shuffled, selected } = generateGameData(targetWord);
    setShuffledChars(shuffled);
    setSelectedChars(selected);
    setStatus("playing");
  }, [targetWord]);

  const handleSelectChar = (charObj: CharObj) => {
    if (status !== "playing" || charObj.isUsed) return;
    const firstEmptyIndex = selectedChars.findIndex((c) => c === null);
    if (firstEmptyIndex !== -1) {
      const newSelected = [...selectedChars];
      newSelected[firstEmptyIndex] = charObj;
      setSelectedChars(newSelected);
      const newShuffled = shuffledChars.map((c) =>
        c.id === charObj.id ? { ...c, isUsed: true } : c,
      );
      setShuffledChars(newShuffled);
    }
  };

  const handleDeselectChar = (index: number) => {
    if (status !== "playing") return;
    const charToRemove = selectedChars[index];
    if (!charToRemove) return;
    const newSelected = [...selectedChars];
    newSelected[index] = null;
    setSelectedChars(newSelected);
    const newShuffled = shuffledChars.map((c) =>
      c.id === charToRemove.id ? { ...c, isUsed: false } : c,
    );
    setShuffledChars(newShuffled);
  };

  // CHECK KẾT QUẢ
  useEffect(() => {
    // Chỉ check khi user đã điền đủ (tránh check lúc mới init rỗng)
    const isFull = selectedChars.every((c) => c !== null);
    if (!isFull) return;

    const userAnswer = selectedChars.map((c) => c?.char).join("");
    if (userAnswer === targetWord) {
      setStatus("correct");
      setTimeout(() => onFinish(true), 1500);
    } else {
      setStatus("wrong");
      setTimeout(() => {
        // Reset nhẹ (giữ vị trí shuffle cũ)
        setShuffledChars((prev) => prev.map((c) => ({ ...c, isUsed: false })));
        setSelectedChars(new Array(targetWord.length).fill(null));
        setStatus("playing");
      }, 1000);
    }
  }, [selectedChars, targetWord]); // Thêm targetWord vào dependency

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-4">
      {/* MEDIA */}
      <div className="mb-6 flex flex-col items-center">
        {data.image && (
          <img
            src={data.image}
            alt="Quiz"
            className="h-40 w-full object-contain rounded-xl shadow-sm border bg-white mb-4 animate-in zoom-in"
          />
        )}
        {data.audio ? (
          <button
            onClick={() => audioRef.current?.play()}
            className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-200 transition font-bold"
          >
            <Volume2 size={20} /> Nghe phát âm
            <audio ref={audioRef} src={data.audio} />
          </button>
        ) : (
          <div className="text-gray-400 text-sm font-medium">
            Sắp xếp các ký tự đúng thứ tự
          </div>
        )}
      </div>

      {/* SLOTS */}
      <div className="flex gap-2 flex-wrap justify-center mb-8 min-h-[64px]">
        {selectedChars.map((item, index) => (
          <button
            key={index}
            onClick={() => handleDeselectChar(index)}
            disabled={status !== "playing"}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-b-4 text-2xl font-bold flex items-center justify-center transition-all transform duration-300
              ${item ? "bg-white border-blue-500 text-slate-700 shadow-md translate-y-0" : "bg-slate-100 border-slate-300 border-dashed"}
              ${status === "correct" && item ? "!bg-green-500 !border-green-600 !text-white" : ""}
              ${status === "wrong" && item ? "!bg-red-500 !border-red-600 !text-white animate-shake" : ""}
            `}
          >
            {item ? item.char : ""}
          </button>
        ))}
      </div>

      {/* SOURCE */}
      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {shuffledChars.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectChar(item)}
            disabled={item.isUsed || status !== "playing"}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-xl shadow-sm border-b-4 transition-all active:scale-95
               ${item.isUsed ? "bg-slate-100 border-transparent text-transparent cursor-default" : "bg-orange-500 border-orange-700 text-white hover:bg-orange-600"}
            `}
          >
            {item.char}
          </button>
        ))}
      </div>

      {/* RESET */}
      <button
        onClick={handleReset}
        className="mt-8 flex items-center gap-2 text-gray-400 hover:text-blue-500 transition text-sm font-bold"
      >
        <RefreshCw size={16} /> Làm mới
      </button>

      {/* WIN */}
      {status === "correct" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <Confetti recycle={false} numberOfPieces={200} />
          <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-full shadow-xl border-2 border-green-500 text-green-600 font-bold text-xl animate-in zoom-in flex items-center gap-2">
            <CheckCircle /> Chính xác!
          </div>
        </div>
      )}
    </div>
  );
}

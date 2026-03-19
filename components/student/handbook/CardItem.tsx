"use client";
import { useState, useRef } from "react";
import {
  Lock,
  Volume2,
  PlayCircle,
  X,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface CardItemProps {
  item: any;
  isOwned: boolean;
}

export default function CardItem({ item, isOwned }: CardItemProps) {
  const [showDetail, setShowDetail] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = (e: any) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // 1. Cấu hình giao diện KHI CHƯA SỞ HỮU
  const getLockedConfig = () => {
    switch (item.rarity) {
      case "COMMON":
        return {
          bg: "bg-white border-gray-200",
          imgFilter: "grayscale opacity-60 blur-[2px]",
          textBlur: "blur-[2px]",
          iconColor: "text-gray-300",
        };
      case "RARE":
        return {
          bg: "bg-gray-50 border-gray-200",
          imgFilter: "grayscale opacity-50 blur-[4px]",
          textBlur: "blur-[3px]",
          iconColor: "text-gray-400",
        };
      case "EPIC":
        return {
          bg: "bg-gray-100 border-gray-300",
          imgFilter: "grayscale opacity-40 blur-[8px]",
          textBlur: "blur-[4px]",
          iconColor: "text-slate-400",
        };
      case "LEGENDARY":
        return {
          bg: "bg-gradient-to-br from-gray-100 to-white border-yellow-200", // Viền hơi vàng nhẹ gợi ý
          imgFilter: "grayscale opacity-30 blur-[12px] brightness-125", // Sáng lóa và mờ tịt
          textBlur: "blur-[5px]",
          iconColor: "text-yellow-400",
        };
      default:
        return {
          bg: "bg-gray-50",
          imgFilter: "grayscale blur-sm",
          textBlur: "blur-sm",
          iconColor: "text-gray-300",
        };
    }
  };

  // 2. Cấu hình giao diện KHI ĐÃ SỞ HỮU (Owned State)
  const getOwnedStyle = () => {
    switch (item.rarity) {
      case "COMMON":
        return "bg-white border-green-200 shadow-sm";
      case "RARE":
        return "bg-blue-50 border-blue-200 shadow-md hover:-translate-y-1";
      case "EPIC":
        return "bg-purple-50 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105";
      case "LEGENDARY":
        return "bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:scale-105 z-10";
      default:
        return "bg-white";
    }
  };

  const lockedConfig = getLockedConfig();
  const containerStyle = isOwned ? getOwnedStyle() : lockedConfig.bg;

  return (
    <>
      <div
        className={`relative aspect-[3/4] rounded-2xl border-4 p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden group
          ${containerStyle}
        `}
        onClick={() => isOwned && setShowDetail(true)}
      >
        {/* Hiệu ứng Lấp lánh (Shine) chỉ cho Legendary đã sở hữu */}
        {isOwned && item.rarity === "LEGENDARY" && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent w-[200%] h-full animate-shine pointer-events-none"></div>
        )}

        {/* HEADER */}
        <div className="w-full flex justify-between items-start z-10">
          <div className="flex flex-col gap-1">
            {isOwned || item.rarity === "COMMON" ? (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border bg-white/80 w-fit">
                {item.rarity}
              </span>
            ) : (
              // Nếu chưa sở hữu thẻ hiện 1 vệt sáng mờ thay vì text
              <span className="h-4 w-12 bg-gray-200/50 rounded animate-pulse"></span>
            )}

            <span className={isOwned ? "text-gray-400" : "text-gray-300"}>
              {item.type === "GRAMMAR" ? (
                <GraduationCap size={16} />
              ) : (
                <BookOpen size={16} />
              )}
            </span>
          </div>

          {isOwned && item.audioUrl && (
            <button
              onClick={handlePlayAudio}
              className="p-1.5 bg-white rounded-full text-blue-600 shadow hover:bg-blue-100 transition active:scale-95"
            >
              <Volume2 size={16} />
              <audio ref={audioRef} src={item.audioUrl} />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative my-2 overflow-hidden">
          {/* Ổ KHÓA */}
          {!isOwned && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white/60 p-3 rounded-full backdrop-blur-sm shadow-sm">
                <Lock size={24} className={lockedConfig.iconColor} />
              </div>
            </div>
          )}

          {/* NỘI DUNG (Ảnh/Chữ) */}
          <div
            className={`transition-all duration-500 w-full flex justify-center
               ${!isOwned ? lockedConfig.imgFilter : ""} 
               ${
                 isOwned && item.type === "VOCAB" ? "group-hover:scale-110" : ""
               }
            `}
          >
            {item.type === "VOCAB" ? (
              <img
                src={item.imageUrl}
                className="max-w-full max-h-24 object-contain drop-shadow-md"
              />
            ) : (
              <div className="text-center w-full">
                <div className="text-4xl mb-2 opacity-50">📄</div>
                {/* Ẩn text ngữ pháp khi chưa sở hữu để tránh rối mắt */}
                {isOwned && (
                  <p className="text-[10px] text-gray-500 line-clamp-3 italic px-1 bg-white/50 rounded">
                    "{item.explanation}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Icon Play Video (Chỉ hiện khi đã có) */}
          {isOwned && item.videoUrl && item.type === "VOCAB" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-black/50 text-white rounded-full p-2 backdrop-blur-sm">
                <PlayCircle size={32} />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Tên thẻ */}
        <div className="w-full text-center z-10">
          <h3
            className={`font-black text-xs uppercase leading-tight 
               ${
                 isOwned
                   ? "text-slate-800"
                   : `text-gray-300 ${lockedConfig.textBlur}` // Chữ mờ màu xám nhạt
               }
            `}
          >
            {!isOwned && item.rarity === "LEGENDARY"
              ? "???"
              : item.type === "VOCAB"
                ? item.word
                : item.ruleName}
          </h3>

          {isOwned && item.type === "VOCAB" && (
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {item.meaning}
            </p>
          )}
        </div>
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-3 right-3 bg-gray-100 text-gray-500 p-1 rounded-full hover:bg-red-500 hover:text-white transition z-20"
            >
              <X size={20} />
            </button>
            {item.videoUrl ? (
              <div className="aspect-video w-full bg-black shrink-0">
                {item.videoUrl.includes("youtube") ||
                item.videoUrl.includes("youtu.be") ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={item.videoUrl
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}
                    title="Video"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <video controls autoPlay className="w-full h-full bg-black">
                    <source src={item.videoUrl} />
                  </video>
                )}
              </div>
            ) : (
              <div
                className={`h-40 w-full flex items-center justify-center ${
                  item.type === "VOCAB" ? "bg-blue-50" : "bg-yellow-50"
                }`}
              >
                {item.type === "VOCAB" ? (
                  <img src={item.imageUrl} className="h-32 object-contain" />
                ) : (
                  <GraduationCap
                    size={64}
                    className="text-yellow-600 opacity-50"
                  />
                )}
              </div>
            )}
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded text-white ${
                    item.rarity === "LEGENDARY"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                >
                  {item.rarity}
                </span>
                <h2 className="text-2xl font-bold text-slate-800">
                  {item.type === "VOCAB" ? item.word : item.ruleName}
                </h2>
              </div>
              {item.type === "VOCAB" ? (
                <div>
                  <p className="text-lg text-gray-600 font-medium mb-4">
                    {item.meaning}
                  </p>
                  {item.audioUrl && (
                    <button
                      onClick={() => audioRef.current?.play()}
                      className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
                    >
                      <Volume2 size={20} /> Nghe phát âm
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 text-sm uppercase mb-1">
                      Giải thích
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-500 text-sm uppercase mb-2">
                      Ví dụ minh họa
                    </h4>
                    <ul className="space-y-2">
                      {item.examples?.map((ex: string, i: number) => (
                        <li
                          key={i}
                          className="flex gap-2 text-slate-700 bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                          <span className="font-bold text-blue-500">
                            {i + 1}.
                          </span>
                          <span className="italic">"{ex}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

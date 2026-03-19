"use client";

import { useEffect, useState, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

// Import file JSON 
// Chuyển file vào thư mục 'src/assets/lottie' để import dễ hơn
import dragonAnimation from "@/public/lottie/Dragon.json";

interface Props {
  status: "IDLE" | "CORRECT" | "WRONG";
}

export default function PetHelper({ status }: Props) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Xử lý hiệu ứng khi status thay đổi
  useEffect(() => {
    if (lottieRef.current) {
      // 1. Reset để chạy từ đầu
      lottieRef.current.goToAndPlay(0);

      // 2. Điều chỉnh tốc độ
      // - WRONG: Chạy chậm (0.5) tạo cảm giác ủ rũ
      // - CORRECT/IDLE: Chạy bình thường (1)
      lottieRef.current.setSpeed(status === "WRONG" ? 0.5 : 1);
    }
  }, [status]);

  return (
    <div className="w-48 h-48 relative transition-all duration-300">
      {/* --- PHẦN BONG BÓNG HỘI THOẠI --- */}
      {status === "IDLE" && (
        <div className="absolute -top-10 right-0 bg-white p-2 rounded-lg text-xs shadow-md border animate-bounce z-20 whitespace-nowrap">
          Cố lên bạn ơi! 💪
        </div>
      )}

      {status === "CORRECT" && (
        <div className="absolute -top-10 right-0 bg-green-100 text-green-700 p-2 rounded-lg text-xs shadow-md border border-green-200 animate-pulse z-20 whitespace-nowrap">
          Giỏi quá đi! 🎉
        </div>
      )}

      {status === "WRONG" && (
        <div className="absolute -top-10 right-0 bg-gray-100 text-gray-600 p-2 rounded-lg text-xs shadow-md border animate-pulse z-20 whitespace-nowrap">
          Hic... Sai rồi! 🥺
        </div>
      )}

      {/* --- HIỆU ỨNG MÂY MƯA (Chỉ hiện khi sai) --- */}
      {status === "WRONG" && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-10 opacity-80">
          🌧️
        </div>
      )}

      {/* --- LOTTIE PLAYER --- */}
      {/* Dùng filter grayscale để làm rồng xám xịt khi sai */}
      <div
        className={`w-full h-full transition-all duration-500
            ${status === "WRONG" ? "grayscale brightness-90 scale-95" : ""}
        `}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={dragonAnimation} // Luôn dùng 1 file này
          loop={true}
          autoplay={true}
          className="w-full h-full drop-shadow-xl"
        />
      </div>
    </div>
  );
}

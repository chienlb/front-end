"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Gift, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import LottiePet from "./ui/LottiePet";

interface RewardData {
  gold?: number;
  xp?: number;
  items?: any[];
  bonus?: number;
}

interface Props {
  type: "LESSON" | "UNIT" | "COURSE";
  data: RewardData;
  onClose: () => void;
}

export default function RewardPopup({ type, data, onClose }: Props) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Xác định tiêu đề dựa trên loại phần thưởng
  const getTitle = () => {
    if (type === "UNIT") return "CHÚC MỪNG HOÀN THÀNH CHƯƠNG!";
    if (type === "COURSE") return "TỐT NGHIỆP KHÓA HỌC!";
    return "BÀI HỌC HOÀN TẤT!";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        {/* Pháo giấy */}
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={800}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header màu sắc */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50 animate-pulse"></div>
            <h2 className="text-2xl font-black text-white drop-shadow-md relative z-10">
              {getTitle()}
            </h2>
            <div className="flex justify-center mt-2 relative z-10">
              <div className="bg-white/20 p-2 rounded-full">
                <Star
                  size={48}
                  className="text-yellow-100 fill-white animate-spin-slow"
                />
              </div>
            </div>
          </div>

          {/* Body: Danh sách phần thưởng */}
          <div className="p-8 space-y-6">
            {/* 1. Vàng & XP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-3xl mb-1">💰</span>
                <span className="text-xl font-black text-yellow-600">
                  +{data.gold || 0}
                </span>
                <span className="text-xs font-bold text-yellow-400 uppercase">
                  Vàng
                </span>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-3xl mb-1">⚡</span>
                <span className="text-xl font-black text-blue-600">
                  +{data.xp || 0}
                </span>
                <span className="text-xs font-bold text-blue-400 uppercase">
                  Kinh nghiệm
                </span>
              </div>
            </div>

            {/* 2. Vật phẩm nhận được (Nếu có) */}
            {data.items && data.items.length > 0 && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                <p className="text-center text-purple-600 font-bold mb-3 flex items-center justify-center gap-2">
                  <Gift size={18} /> Quà tặng vật phẩm
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {data.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white rounded-xl shadow-sm border border-purple-100 p-2 flex items-center justify-center relative group"
                    >
                      {/* Tooltip tên vật phẩm */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        {item.name}
                      </div>
                      <img
                        src={
                          item.thumbnail ||
                          item.image ||
                          "https://cdn-icons-png.flaticon.com/512/10609/10609384.png"
                        }
                        alt="Item"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer: Nút nhận */}
          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              NHẬN QUÀ NGAY <ArrowRight />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

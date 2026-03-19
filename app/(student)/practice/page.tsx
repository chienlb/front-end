"use client";

import Link from "next/link";
import Image from "next/image";
import { practiceService } from "@/services/practice.service";
import { useEffect, useState } from "react";
import { Loader2, Lock, Play, Star, Trophy, Gamepad2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";

// --- CONFIG MÀU SẮC ---
const GAME_CONFIG = [
  {
    id: "matching",
    name: "Nối Hình Bắt Chữ",
    desc: "Tìm cặp đôi hoàn hảo!",
    emoji: "🧩",
    color: "from-teal-400 to-emerald-500", // Xanh ngọc
    border: "border-emerald-500",
    unlockLevel: 1,
  },
  {
    id: "listening",
    name: "Tai Nghe Siêu Đẳng",
    desc: "Lắng nghe bí mật...",
    emoji: "🎧",
    color: "from-rose-400 to-pink-500", // Hồng
    border: "border-pink-500",
    unlockLevel: 1,
  },
  {
    id: "spelling",
    name: "Ong Tìm Chữ",
    desc: "Ghép chữ thành từ.",
    emoji: "🐝",
    color: "from-amber-400 to-orange-500", // Cam vàng
    border: "border-orange-500",
    unlockLevel: 1,
  },
  {
    id: "speaking",
    name: "Siêu Sao Lồng Tiếng",
    desc: "Nói to và rõ ràng nhé!",
    emoji: "🎙️",
    color: "from-cyan-400 to-blue-500", // Xanh dương
    border: "border-blue-500",
    unlockLevel: 5,
  },
  {
    id: "quiz",
    name: "Đường Đua Tri Thức",
    desc: "Ai nhanh hơn nào?",
    emoji: "🏎️",
    color: "from-violet-400 to-purple-500", // Tím
    border: "border-purple-500",
    unlockLevel: 2,
  },
  {
    id: "flashcard",
    name: "Lật Thẻ Trí Nhớ",
    desc: "Thử thách trí nhớ siêu phàm.",
    emoji: "🎴",
    color: "from-lime-400 to-green-500", // Xanh lá mạ
    border: "border-green-500",
    unlockLevel: 3,
  },
];

// Component: Ngôi sao đánh giá
const StarRating = ({ score }: { score: number }) => {
  const stars = score >= 100 ? 3 : score >= 50 ? 2 : score > 0 ? 1 : 0;
  return (
    <div className="flex gap-1 bg-white/80 backdrop-blur px-2 py-1 rounded-full border border-slate-200 shadow-sm">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Star
            size={16}
            className={`${
              i <= stars
                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function PracticePage() {
  const [stats, setStats] = useState<any>({});
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes: any = await practiceService.getStats();
        setStats(statsRes || {});
        // Fake level
        setUserLevel(4);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#E0F7FA]">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-600 mb-4" />
        <p className="text-2xl font-black text-cyan-700 animate-bounce">
          Đang mở cổng công viên...
        </p>
      </div>
    );

  // Animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVars: Variants = {
    hidden: { y: 50, opacity: 0, scale: 0.8 },
    show: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans pb-24 pt-12 px-4">
      {/* 1. CARTOON BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-practice.png"
          alt="Game Park Background"
          fill
          className="object-cover"
          priority
        />
        {/* Lớp phủ gradient nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 via-white/20 to-white/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER: TITLE NỔI BẬT */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block relative"
          >
            {/* Hiệu ứng mây trôi xung quanh tiêu đề */}
            <div className="absolute -top-10 -left-10 text-6xl animate-bounce delay-700">
              ☁️
            </div>
            <div className="absolute -bottom-5 -right-10 text-6xl animate-pulse delay-1000">
              🎈
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] tracking-tight stroke-text">
              CÔNG VIÊN GAME 🎡
            </h1>
            <div className="bg-white/90 backdrop-blur-md text-slate-700 font-bold text-lg md:text-xl px-8 py-2 rounded-full shadow-lg mt-4 inline-block transform -rotate-2 border-2 border-dashed border-sky-300">
              Vừa học vừa chơi - Nhận quà mỏi tay! 🎁
            </div>
          </motion.div>
        </div>

        {/* LIST GAMES */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          {GAME_CONFIG.map((game) => {
            const highScore = stats[game.id] || 0;
            const isLocked = userLevel < (game.unlockLevel || 1);

            return (
              <motion.div
                key={game.id}
                variants={itemVars}
                whileHover={{ y: -10 }}
                className="h-full"
              >
                <Link
                  href={isLocked ? "#" : `/practice/${game.id}`}
                  className="block h-full group relative"
                >
                  {/* CARD CHÍNH */}
                  <div
                    className={`
                      relative h-full bg-white rounded-[2.5rem] p-6 pt-16 flex flex-col items-center text-center
                      border-[4px] border-b-[8px] transition-all duration-300 shadow-xl
                      ${
                        isLocked
                          ? "border-slate-300 bg-slate-100 opacity-90 cursor-not-allowed"
                          : `${game.border} hover:shadow-2xl hover:scale-[1.02]`
                      }
                    `}
                  >
                    {/* ICON GAME (Nổi lên trên) */}
                    <div
                      className={`
                        absolute -top-12 left-1/2 -translate-x-1/2
                        w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-lg border-4 border-white
                        bg-gradient-to-br ${game.color} text-white z-20
                        group-hover:rotate-6 transition-transform duration-300
                    `}
                    >
                      {game.emoji}
                    </div>

                    {/* LOCK OVERLAY */}
                    {isLocked && (
                      <div className="absolute top-4 right-4 z-30">
                        <div className="bg-slate-700 text-white p-2 rounded-full shadow-md animate-pulse">
                          <Lock size={20} />
                        </div>
                      </div>
                    )}

                    {/* CONTENT */}
                    <div className="mt-4 w-full flex-1 flex flex-col items-center">
                      <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-slate-500 font-medium mb-4 text-sm line-clamp-2">
                        {game.desc}
                      </p>

                      {/* Level Badge & Score */}
                      <div className="flex items-center justify-center gap-3 w-full mb-6">
                        {!isLocked ? (
                          <>
                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                              Lv.{game.unlockLevel}
                            </span>
                            <StarRating score={highScore} />
                          </>
                        ) : (
                          <span className="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                            Mở khóa Lv.{game.unlockLevel}
                          </span>
                        )}
                      </div>

                      {/* PLAY BUTTON */}
                      <button
                        className={`
                            w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all mt-auto
                            ${
                              isLocked
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : `bg-gradient-to-r ${game.color} text-white shadow-lg shadow-blue-200/50 group-hover:shadow-xl active:scale-95`
                            }
                        `}
                      >
                        {isLocked ? (
                          "ĐANG KHÓA"
                        ) : (
                          <>
                            CHƠI NGAY <Gamepad2 size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

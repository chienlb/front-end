"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { Loader2, Crown, Trophy } from "lucide-react";
import { motion, type Variants } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const podiumVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

// --- INTERFACES ---
interface UserRank {
  id: string;
  rank?: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  pet?: string | null;
  isMe?: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let [lbResponse, profileData]: [any, any] = await Promise.all([
          userService.getLeaderboard({ page: currentPage, limit: ITEMS_PER_PAGE }).catch(() => null),
          userService.getProfile().catch(() => null),
        ]);

        // Extract data and pagination info
        const lbData = lbResponse?.data || [];
        const paginationInfo = lbResponse?.pagination || { page: 1, totalPages: 1 };

        if (!Array.isArray(lbData)) setLeaderboard([]);
        if (!profileData) profileData = null;

        const myId = profileData?._id || profileData?.id;
        const formattedLb = lbData
          .map((u: any) => {
            const points =
              u.stats?.currentXP || u.currentXP || u.xp || u.exp || 0;
            const levelFromExp = Math.max(1, Math.floor(points / 1000) + 1);

            return {
              id: u._id || u.id || u.userId,
              rank: u.rank,
              name: u.fullName || u.fullname || u.name || u.username || "Ẩn danh",
              avatar:
                u.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  u.fullName || u.fullname || u.name || u.username || "User",
                )}`,
              points,
              level: u.stats?.level || u.currentLevel || u.level || levelFromExp,
              pet: u.equippedPet?.image || u.pet?.image || null,
              isMe: (u._id || u.id || u.userId) === myId,
            };
          })
          .sort((a: UserRank, b: UserRank) => {
            if (typeof a.rank === "number" && typeof b.rank === "number") {
              return a.rank - b.rank;
            }
            return b.points - a.points;
          });

        setLeaderboard(formattedLb);
        setTotalPages(paginationInfo.totalPages || 1);
      } catch (error) {
        console.error("Critical Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">
          Đang cập nhật bảng vàng...
        </p>
      </div>
    );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans pb-20 overflow-x-hidden relative">
      {/* BACKGROUND DECOR */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "50vh" }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-600 to-indigo-600 rounded-b-[3rem] shadow-2xl z-0"
      />
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-10 left-10 text-white text-9xl font-black"
        >
          1
        </motion.div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.1 }}
          transition={{ delay: 0.7 }}
          className="absolute top-20 right-10 text-white text-8xl font-black"
        >
          2
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10">
        {/* 1. HEADER */}
        <div className="text-center text-white mb-10">
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="text-3xl md:text-5xl font-black mb-2 flex items-center justify-center gap-3 drop-shadow-md"
          >
            <Trophy
              className="text-yellow-300 fill-yellow-300 animate-bounce"
              size={40}
            />
            Bảng Xếp Hạng
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-100 font-medium text-lg"
          >
            Tuần này ai sẽ là nhà vô địch? 🏆
          </motion.p>
        </div>

        {/* 2. PODIUM (Top 3) */}
        <div className="flex justify-center items-end gap-2 md:gap-6 mt-12 mb-12 min-h-[300px]">
          {/* TOP 2 */}
          <motion.div
            variants={podiumVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-1/3 md:w-32 order-1"
          >
            {top2 && (
              <>
                <div className="relative mb-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-300 overflow-hidden bg-white shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
                    <img
                      src={top2.avatar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                    2
                  </div>
                </div>
                <div className="text-center mb-2">
                  <p className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[100px] drop-shadow-sm">
                    {top2.name}
                  </p>
                  <p className="text-slate-700 text-xs font-bold">
                    {top2.points} XP
                  </p>
                </div>
                <div className="w-full h-24 md:h-32 bg-gradient-to-t from-slate-300 to-slate-400 rounded-t-2xl shadow-[0_24px_80px_rgba(148,163,184,0.18)] flex items-end justify-center pb-4 opacity-90">
                  <span className="text-4xl font-black text-slate-500/30">
                    2
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* TOP 1 */}
          <motion.div
            variants={podiumVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center w-1/3 md:w-40 order-2 z-10"
          >
            {top1 && (
              <>
                <div className="relative mb-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2"
                  >
                    <Crown
                      size={48}
                      className="text-yellow-300 fill-yellow-300 drop-shadow-lg"
                    />
                  </motion.div>

                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 overflow-hidden bg-white shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
                    <img
                      src={top1.avatar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-4 border-white shadow-sm">
                    1
                  </div>
                </div>
                <div className="text-center mb-3">
                  <p className="font-bold text-slate-900 text-lg md:text-xl truncate max-w-[140px] drop-shadow-sm">
                    {top1.name}
                  </p>
                  <p className="text-yellow-700 text-sm font-bold bg-yellow-200/70 px-2 rounded-full inline-block">
                    {top1.points} XP
                  </p>
                </div>
                <div className="w-full h-36 md:h-48 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-2xl shadow-[0_24px_80px_rgba(148,163,184,0.18)] flex items-end justify-center pb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <span className="text-6xl font-black text-yellow-600/30">
                    1
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* TOP 3 */}
          <motion.div
            variants={podiumVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center w-1/3 md:w-32 order-3"
          >
            {top3 && (
              <>
                <div className="relative mb-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-400 overflow-hidden bg-white shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
                    <img
                      src={top3.avatar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                    3
                  </div>
                </div>
                <div className="text-center mb-2">
                  <p className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[100px] drop-shadow-sm">
                    {top3.name}
                  </p>
                  <p className="text-slate-700 text-xs font-bold">
                    {top3.points} XP
                  </p>
                </div>
                <div className="w-full h-20 md:h-24 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-2xl shadow-[0_24px_80px_rgba(148,163,184,0.18)] flex items-end justify-center pb-4 opacity-90">
                  <span className="text-4xl font-black text-orange-700/30">
                    3
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* 3. RANKING LIST (Rest) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_24px_80px_rgba(148,163,184,0.18)]"
        >
          {others.map((user, index) => (
            <motion.div
              key={user.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, backgroundColor: "#F8FAFC" }}
              className={`flex items-center px-4 py-4 md:px-6 border-b border-slate-50 last:border-0 transition ${user.isMe ? "bg-yellow-50 hover:bg-yellow-100" : ""}`}
            >
              <div className="w-8 text-center font-black text-slate-400 text-lg mr-4">
                {typeof user.rank === "number" ? user.rank : index + 4}
              </div>

              <div className="relative">
                <img
                  src={user.avatar}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 object-cover shadow-sm bg-white"
                  alt={user.name}
                />
                {user.pet && (
                  <div className="absolute -bottom-1 -right-1 text-base animate-bounce">
                    {user.pet}
                  </div>
                )}
              </div>

              <div className="ml-4 flex-1">
                <h4
                  className={`font-bold text-sm md:text-base ${user.isMe ? "text-indigo-600" : "text-slate-700"}`}
                >
                  {user.name} {user.isMe && "(Tôi)"}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 rounded-full font-bold">
                    Lv.{user.level}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-indigo-600 text-lg">
                  {user.points}
                </span>
                <span className="text-xs text-slate-400 font-bold block">
                  XP
                </span>
              </div>
            </motion.div>
          ))}

          {others.length === 0 && leaderboard.length <= 3 && (
            <div className="text-center py-10 text-slate-400 italic">
              Chưa có thêm người chơi nào khác.
            </div>
          )}
        </motion.div>

        {leaderboard.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 shadow-sm">
            Chưa có dữ liệu bảng xếp hạng.
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              ← Trước
            </button>

            <div className="text-center">
              <p className="text-slate-700 font-black text-lg">
                Trang {currentPage} / {totalPages}
              </p>
              <p className="text-slate-500 text-xs">
                Mỗi trang {ITEMS_PER_PAGE} người
              </p>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              Tiếp →
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 pb-8 text-slate-400 text-sm font-medium"
        >
          Bảng xếp hạng được cập nhật tự động mỗi 5 phút. <br /> Hãy hoàn thành
          nhiệm vụ để thăng hạng nhé! 🚀
        </motion.div>
      </div>
    </div>
  );
}

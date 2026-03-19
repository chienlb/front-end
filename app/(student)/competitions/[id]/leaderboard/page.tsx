"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Trophy,
  Medal,
  Crown,
  Timer,
  Share2,
  Download,
  Zap,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

// --- TYPES ---
interface RankUser {
  id: string;
  name: string;
  avatar: string;
  score: number;
  time: string; // "mm:ss"
  rank: number;
  isMe?: boolean;
}

// --- MOCK DATA GENERATOR ---
const getMockData = (id: string) => {
  // Dữ liệu mẫu
  const baseData: RankUser[] = [
    {
      id: "u1",
      name: "Thánh Tiếng Anh",
      avatar: "https://i.pravatar.cc/150?img=33",
      score: 1000,
      time: "05:10",
      rank: 1,
    },
    {
      id: "u2",
      name: "Nguyễn Văn An",
      avatar: "https://i.pravatar.cc/150?img=12",
      score: 980,
      time: "06:05",
      rank: 2,
    },
    {
      id: "u3",
      name: "Trần Bảo Ngọc",
      avatar: "https://i.pravatar.cc/150?img=5",
      score: 950,
      time: "05:45",
      rank: 3,
    },
    {
      id: "u4",
      name: "Lê Minh",
      avatar: "https://i.pravatar.cc/150?img=3",
      score: 900,
      time: "07:00",
      rank: 4,
    },
    {
      id: "u5",
      name: "Phạm Hùng",
      avatar: "https://i.pravatar.cc/150?img=11",
      score: 890,
      time: "07:15",
      rank: 5,
    },
    {
      id: "u6",
      name: "Sarah Miller",
      avatar: "https://i.pravatar.cc/150?img=9",
      score: 850,
      time: "08:20",
      rank: 6,
    },
    {
      id: "u7",
      name: "David Beck",
      avatar: "https://i.pravatar.cc/150?img=8",
      score: 800,
      time: "09:00",
      rank: 7,
    },
    {
      id: "me",
      name: "Bạn (Tôi)",
      avatar: "https://i.pravatar.cc/150?img=60",
      score: 750,
      time: "09:30",
      rank: 8,
      isMe: true,
    },
    {
      id: "u9",
      name: "Tiến Đạt",
      avatar: "https://i.pravatar.cc/150?img=50",
      score: 700,
      time: "10:00",
      rank: 9,
    },
  ];

  return {
    competitionName:
      id === "C01"
        ? "Đấu Trường Từ Vựng: Unit 5"
        : "Thử thách Speaking: Holiday",
    totalParticipants: 142,
    ranking: baseData,
    myResult: baseData.find((u) => u.isMe) || baseData[7],
  };
};

export default function CompetitionLeaderboardPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Giả lập loading
    const loadedData = getMockData(params.id);
    setData(loadedData);
  }, [params.id]);

  if (!data)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        Loading...
      </div>
    );

  const top3 = data.ranking.slice(0, 3);
  const others = data.ranking.slice(3);

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans pb-24">
      {/* 1. HEADER & NAV */}
      <div className="bg-slate-900 text-white pt-6 pb-32 px-4 rounded-b-[2.5rem] relative overflow-hidden shadow-2xl">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Nav Bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-md"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
              Leaderboard
            </h2>
            <button className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-md">
              <Share2 size={20} />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
              {data.competitionName}
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1">
                <User size={14} /> {data.totalParticipants} thí sinh
              </span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="text-green-400">Đã kết thúc</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-24 relative z-20">
        {/* 2. TOP 3 PODIUM */}
        <div className="flex justify-center items-end gap-3 mb-8">
          {/* Rank 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-1/3"
          >
            <div className="relative mb-2">
              <img
                src={top3[1].avatar}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-slate-300 shadow-lg object-cover bg-white"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                #2
              </div>
            </div>
            <div className="text-center text-white/90 mb-2">
              <p className="font-bold text-xs truncate w-20">{top3[1].name}</p>
              <p className="text-[10px] font-mono text-slate-300">
                {top3[1].score} pts
              </p>
            </div>
            <div className="w-full h-24 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-2xl shadow-lg flex items-end justify-center pb-2 opacity-90 border-t border-white/20">
              <span className="text-4xl font-black text-slate-500/20">2</span>
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center z-10 w-1/3 -mx-2"
          >
            <div className="relative mb-3">
              <Crown
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce drop-shadow-lg"
                size={32}
                fill="currentColor"
              />
              <img
                src={top3[0].avatar}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/30 object-cover bg-white"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-0.5 rounded-full border-2 border-white shadow-md">
                #1
              </div>
            </div>
            <div className="text-center text-white mb-2">
              <p className="font-bold text-sm truncate w-24">{top3[0].name}</p>
              <p className="text-xs font-black text-yellow-400 font-mono">
                {top3[0].score} pts
              </p>
            </div>
            <div className="w-full h-32 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-2xl shadow-2xl flex items-end justify-center pb-4 relative overflow-hidden border-t border-yellow-300/50">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <Trophy
                className="text-yellow-800 opacity-20 mb-2"
                size={48}
                fill="currentColor"
              />
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center w-1/3"
          >
            <div className="relative mb-2">
              <img
                src={top3[2].avatar}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-orange-400 shadow-lg object-cover bg-white"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                #3
              </div>
            </div>
            <div className="text-center text-white/90 mb-2">
              <p className="font-bold text-xs truncate w-20">{top3[2].name}</p>
              <p className="text-[10px] font-mono text-slate-300">
                {top3[2].score} pts
              </p>
            </div>
            <div className="w-full h-16 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-2xl shadow-lg flex items-end justify-center pb-2 opacity-90 border-t border-white/20">
              <span className="text-3xl font-black text-orange-800/20">3</span>
            </div>
          </motion.div>
        </div>

        {/* 3. RANKING LIST */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col"
        >
          {/* List Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Hạng & Thí sinh</span>
            <span className="flex items-center gap-6 mr-1">
              <span>Thời gian</span>
              <span>Điểm số</span>
            </span>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-50">
            {others.map((user: RankUser, idx: number) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 px-6 transition hover:bg-slate-50 ${user.isMe ? "bg-yellow-50/80" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center font-bold text-slate-400 text-sm">
                    #{user.rank}
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 object-cover"
                    />
                    <div>
                      <p
                        className={`font-bold text-sm ${user.isMe ? "text-indigo-700" : "text-slate-700"}`}
                      >
                        {user.name}
                      </p>
                      {user.isMe && (
                        <p className="text-[10px] text-indigo-500 font-bold">
                          Tôi
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                    <Timer size={10} /> {user.time}
                  </span>
                  <span className="font-black text-indigo-600 w-10 text-sm">
                    {user.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 4. MY RANKING STICKY FOOTER */}
      {data.myResult && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50"
        >
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center bg-slate-100 px-3 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Hạng
                </span>
                <span className="text-xl font-black text-slate-800">
                  #{data.myResult.rank}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Thành tích của bạn
                </p>
                <p className="text-xs text-slate-500">Nỗ lực rất tốt! 🔥</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-2xl text-indigo-600 block leading-none">
                {data.myResult.score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Điểm
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

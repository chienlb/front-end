"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gamificationService } from "@/services/gamification.service";
import {
  Loader2,
  CheckCircle2,
  PlayCircle,
  Gift,
  Trophy,
  Target,
  Clock,
  CalendarCheck,
  Star,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Xuất hiện lần lượt
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const chestVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { type: "spring", bounce: 0.5 } },
  pulse: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } },
};

// --- INTERFACES ---
interface Mission {
  id: string;
  title: string;
  icon: any;
  target: number;
  progress: number;
  reward: number;
  status: "inprogress" | "claimable" | "claimed";
  link: string;
  color: "blue" | "emerald" | "amber" | "purple" | "rose";
}

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const data: any = await gamificationService.getMyQuests();

        const mappedMissions = data.map((item: any) => {
          let status: "inprogress" | "claimable" | "claimed" = "inprogress";
          if (item.isClaimed) status = "claimed";
          else if (item.progress >= item.target) status = "claimable";

          let icon = Target;
          let link = "/courses";
          let color: Mission["color"] = "blue";

          switch (item.type) {
            case "LOGIN":
              icon = CalendarCheck;
              link = "#";
              color = "emerald";
              break;
            case "LEARNING_TIME":
              icon = Clock;
              link = "/courses";
              color = "amber";
              break;
            case "LESSONS_COMPLETED":
              icon = BookOpenIcon;
              link = "/courses";
              color = "rose";
              break;
            case "GAME_WON":
              icon = Trophy;
              link = "/practice";
              color = "purple";
              break;
          }

          return {
            id: item._id,
            title: item.title,
            icon: icon,
            target: item.target,
            progress: item.progress || 0,
            reward: item.rewards?.gold || 0,
            status: status,
            link: link,
            color: color,
          };
        });

        setMissions(mappedMissions);
      } catch (error) {
        console.error("Lỗi tải nhiệm vụ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  // --- HELPERS ---
  const totalMissions = missions.length;
  const claimedMissions = missions.filter((m) => m.status === "claimed").length;
  const chestProgress =
    totalMissions > 0 ? (claimedMissions / totalMissions) * 100 : 0;

  const handleClaim = async (id: string, reward: number) => {
    const previousMissions = [...missions];
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "claimed" } : m)),
    );

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FF4500", "#00BFFF", "#FF69B4"],
      shapes: ["star", "circle"],
    });

    try {
      await gamificationService.claimReward(id);
    } catch (error: any) {
      setMissions(previousMissions);
      alert("Ui da, có lỗi rồi! Bé thử lại sau nhé.");
    }
  };

  const handleDoTask = (link: string) => {
    if (link !== "#") router.push(link);
  };

  const BookOpenIcon = (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF5F7] gap-3">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-rose-400 font-bold animate-pulse text-lg">
          Đang tìm nhiệm vụ cho bé...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen relative font-sans pb-20 pt-24 px-4 overflow-x-hidden">
      {/* 1. BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-missions.png"
          alt="Cartoon Landscape"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 2. HEADER & CHEST AREA */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm mb-4 border border-rose-100"
          >
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="text-slate-700 text-sm font-bold">
              Daily Quests
            </span>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="text-4xl md:text-5xl font-black text-slate-800 mb-2 drop-shadow-sm tracking-tight"
            style={{ textShadow: "2px 2px 0px white" }}
          >
            Nhiệm Vụ Hàng Ngày
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-600 font-bold mb-8 bg-white/40 inline-block px-4 py-1 rounded-full backdrop-blur-sm"
          >
            Hoàn thành nhiệm vụ để nhận Vàng và mở khóa Rương Báu thần kỳ!
          </motion.p>

          {/* CHEST CARD */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border-4 border-white/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-80"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                    Rương báu thần kỳ{" "}
                    <Sparkles className="text-yellow-500 animate-pulse" />
                  </h3>
                  <span className="text-sm font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full border border-orange-200">
                    {claimedMissions}/{totalMissions}
                  </span>
                </div>

                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner relative">
                  {/* Animated Progress Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${chestProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 relative rounded-full"
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/30 skew-x-12 animate-[shimmer_1.5s_infinite]"></div>
                  </motion.div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-bold italic">
                  {chestProgress === 100
                    ? "Xuất sắc! Rương đã mở!"
                    : "Cố lên! Sắp mở được rồi!"}
                </p>
              </div>

              <div className="shrink-0 relative">
                <motion.div
                  variants={chestVariants}
                  initial="hidden"
                  animate={chestProgress === 100 ? "pulse" : "visible"}
                  className={`text-7xl md:text-8xl cursor-pointer drop-shadow-2xl filter ${chestProgress !== 100 && "grayscale-[0.3]"}`}
                >
                  {chestProgress === 100 ? "🎁" : "🔒"}
                </motion.div>

                <AnimatePresence>
                  {chestProgress === 100 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 12 }}
                      className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white"
                    >
                      MỞ NGAY!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3. MISSION LIST */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {missions.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 bg-white/80 backdrop-blur rounded-[2rem] border-2 border-dashed border-slate-300"
            >
              <div className="text-6xl mb-4 grayscale opacity-50">😴</div>
              <h3 className="text-xl font-bold text-slate-600">
                Hết nhiệm vụ rồi!
              </h3>
              <p className="text-slate-500 font-medium">
                Bé hãy quay lại vào ngày mai nhé!
              </p>
            </motion.div>
          )}

          {missions.map((mission) => {
            const themes: Record<string, string> = {
              emerald: "bg-emerald-100 text-emerald-600 border-emerald-200",
              amber: "bg-amber-100 text-amber-600 border-amber-200",
              rose: "bg-rose-100 text-rose-600 border-rose-200",
              purple: "bg-purple-100 text-purple-600 border-purple-200",
              blue: "bg-blue-100 text-blue-600 border-blue-200",
            };
            const themeClass = themes[mission.color] || themes.blue;
            const isClaimed = mission.status === "claimed";
            const cardStyle = isClaimed
              ? "opacity-70 grayscale bg-white/60 border-slate-200 shadow-none backdrop-blur-sm"
              : "bg-white/90 backdrop-blur-md border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-xl hover:bg-white";

            return (
              <motion.div
                layout
                variants={itemVariants}
                key={mission.id}
                className={`rounded-[2rem] p-5 border-4 transition-colors duration-300 flex flex-col sm:flex-row items-center gap-5 ${cardStyle}`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm ${isClaimed ? "bg-slate-200 text-slate-400 border-slate-300" : themeClass}`}
                >
                  <mission.icon size={32} strokeWidth={2.5} />
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <h4 className="font-black text-slate-800 text-lg md:text-xl mb-1">
                    {mission.title}
                  </h4>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                        }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${isClaimed ? "bg-slate-400" : "bg-blue-500"}`}
                      ></motion.div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0 min-w-[120px]">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${isClaimed ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                  >
                    <span>💰</span> +{mission.reward} Vàng
                  </div>

                  {mission.status === "inprogress" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDoTask(mission.link)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 transition-colors"
                    >
                      <PlayCircle size={18} /> Thực hiện
                    </motion.button>
                  )}

                  {mission.status === "claimable" && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleClaim(mission.id, mission.reward)}
                      className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 text-white px-5 py-3 rounded-xl font-black text-sm border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 shadow-lg shadow-yellow-200 flex items-center justify-center gap-2"
                    >
                      <Gift size={20} className="animate-pulse" /> NHẬN QUÀ
                    </motion.button>
                  )}

                  {mission.status === "claimed" && (
                    <div className="w-full bg-transparent text-green-600 font-bold text-sm flex items-center justify-center gap-1 cursor-default py-3">
                      <CheckCircle2 size={20} /> Hoàn thành
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

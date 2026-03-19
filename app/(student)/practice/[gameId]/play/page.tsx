"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  X,
  Clock,
  Trophy,
  Coins,
  Star,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import api from "@/utils/api";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

import QuizGame from "@/components/student/games/QuizGame";
import ListeningGame from "@/components/student/games/ListeningGame";
import MatchingGame from "@/components/student/games/MatchingGame";
import SpellingGame from "@/components/student/games/SpellingGame";

// 1. Cấu hình ảnh nền
const GAME_DEFAULT_BGS: Record<string, string> = {
  quiz: "https://img.freepik.com/free-vector/jungle-landscape-background_23-2148043750.jpg",
  matching:
    "https://img.freepik.com/free-vector/underwater-background-for-video-conferencing_23-2148608630.jpg",
  listening:
    "https://img.freepik.com/free-vector/sky-background-video-conferencing_23-2148639325.jpg",
  spelling:
    "https://img.freepik.com/free-vector/cartoon-landscape-with-mountains_23-2148639326.jpg",
  speaking:
    "https://img.freepik.com/free-vector/space-background-with-planets_23-2148639327.jpg",
  default:
    "https://img.freepik.com/free-vector/hand-drawn-school-learning-background_23-2148862953.jpg",
};

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const gameType = params.gameId as string;
  const topic = searchParams.get("topic") || "ALL";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Game State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [totalGoldEarned, setTotalGoldEarned] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState<{
    xp: number;
    gold: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(5);

  const [streak, setStreak] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  // 1. Fetch Game Data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        console.log(`Fetching game: ${gameType}, topic: ${topic}`); // Debug log 1

        const res: any = await api.get(
          `/practice/play/${gameType}?topic=${topic}`,
        );
        console.log("Full Data Response:", res); // Debug log 2

        // Kiểm tra kỹ định dạng dữ liệu
        if (Array.isArray(res)) {
          setQuestions(res);
        } else if (res && res.data && Array.isArray(res.data)) {
          // Trường hợp API trả về { data: [...] }
          setQuestions(res.data);
        } else {
          console.warn("Dữ liệu trả về không đúng định dạng mảng:", res);
          setQuestions([]);
        }
      } catch (e) {
        console.error("Lỗi tải game:", e);
        setQuestions([]); // Set rỗng để hiện Empty State
      } finally {
        setLoading(false);
      }
    };
    if (gameType) fetchGame();
  }, [gameType, topic]);

  // 2. Submit Result (Giữ nguyên)
  useEffect(() => {
    if (isFinished) {
      const submitResult = async () => {
        try {
          const res: any = await api.post(`/practice/complete`, {
            gameType,
            topic,
            score,
            earnedGold: totalGoldEarned,
            earnedXP: totalXPEarned,
          });
          if (res && res.rewards) setEarnedRewards(res.rewards);
        } catch (error) {
          console.error("Lỗi lưu kết quả", error);
        }
      };
      submitResult();

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/practice";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isFinished]);

  const handleQuestionFinish = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((s) => s + 10);
      const currentQ = questions[currentIdx];
      const gold = currentQ?.rewardGold || 0;
      const xp = currentQ?.rewardXP || 0;
      setTotalGoldEarned((prev) => prev + gold);
      setTotalXPEarned((prev) => prev + xp);

      setStreak((s) => s + 1);
      if (streak > 1) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1500);
      }
    } else {
      setStreak(0);
    }

    if (currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx((c) => c + 1), 500);
    } else {
      setTimeout(() => setIsFinished(true), 500);
    }
  };

  const currentTopicImage =
    questions.length > 0 ? questions[0].topicImage : null;
  const gameBgImage = GAME_DEFAULT_BGS[gameType] || GAME_DEFAULT_BGS.default;
  const finalBackgroundImage = currentTopicImage || gameBgImage;

  // --- TRẠNG THÁI LOADING ---
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#E0F7FA] text-cyan-600">
        <Loader2 className="animate-spin mb-4" size={60} strokeWidth={3} />
        <p className="text-xl font-black uppercase tracking-widest animate-pulse">
          Đang tải trò chơi...
        </p>
      </div>
    );

  // --- TRẠNG THÁI KHÔNG CÓ DỮ LIỆU (EMPTY STATE) ---
  if (!loading && (!questions || questions.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center font-sans">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full border-4 border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-5xl animate-bounce">
            🙈
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Chưa có bài tập!
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-lg">
            Chủ đề <strong>"{topic}"</strong> chưa có câu hỏi nào. <br />
            Bé hãy quay lại chọn chủ đề khác nhé!
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-lg transition-all shadow-[0_4px_0_rgb(29,78,216)] hover:shadow-[0_2px_0_rgb(29,78,216)] hover:translate-y-[2px]"
          >
            QUAY LẠI
          </button>
        </div>
      </div>
    );
  }
  // --- MÀN HÌNH KẾT THÚC ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#FF9A9E] bg-gradient-to-b from-[#fad0c4] to-[#ffd1ff] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 300}
          recycle={false}
          numberOfPieces={500}
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-[3rem] p-8 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white relative z-10"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <div className="bg-yellow-400 p-6 rounded-full shadow-xl border-4 border-white animate-bounce">
              <Trophy size={64} className="text-white drop-shadow-md" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mt-12 mb-2">
            HOAN HÔ BÉ! 🎉
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Bé đã hoàn thành xuất sắc bài tập.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 flex flex-col items-center">
              <span className="text-orange-500 text-sm font-bold uppercase mb-1">
                Điểm số
              </span>
              <div className="text-orange-600 font-black text-2xl flex items-center gap-1">
                {score} <Star size={20} fill="currentColor" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 flex flex-col items-center">
              <span className="text-blue-500 text-sm font-bold uppercase mb-1">
                Vàng
              </span>
              <div className="text-blue-600 font-black text-2xl flex items-center gap-1">
                +{earnedRewards?.gold || totalGoldEarned}{" "}
                <Coins size={20} fill="currentColor" />
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all mb-3"
          >
            CHƠI LẠI
          </button>
          <p className="text-slate-400 text-sm font-bold">
            Tự động thoát sau {countdown}s...
          </p>
        </motion.div>
      </div>
    );
  }

  // --- MÀN HÌNH CHƠI GAME ---
  return (
    <div
      className="min-h-screen py-4 px-4 flex justify-center items-center font-sans overflow-hidden relative"
      style={{
        backgroundImage: `url(${finalBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0"></div>
      <div className="absolute top-10 left-10 text-9xl opacity-40 animate-pulse delay-1000 z-0">
        ☁️
      </div>

      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1.5, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/4 z-50 text-center pointer-events-none"
          >
            <div className="text-6xl font-black text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] stroke-white">
              COMBO {streak}! 🔥
            </div>
            <div className="text-white font-bold text-xl mt-2">
              Giỏi quá đi!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col h-[85vh] relative z-10"
      >
        <div className="bg-white p-5 flex items-center justify-between shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 border-blue-200">
                🦁
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                {currentIdx + 1}/{questions.length}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                Chủ đề
              </span>
              <span className="text-lg font-black text-slate-700 line-clamp-1">
                {topic === "ALL" ? "Tổng hợp" : topic}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <div className="px-6 py-2">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIdx + 1) / questions.length) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {(() => {
                const currentData = questions[currentIdx];
                if (!currentData) return null;

                switch (gameType) {
                  case "quiz":
                    return (
                      <QuizGame
                        data={currentData}
                        onFinish={handleQuestionFinish}
                      />
                    );
                  case "listening":
                    return (
                      <ListeningGame
                        data={currentData}
                        onFinish={handleQuestionFinish}
                      />
                    );
                  case "matching":
                    return (
                      <MatchingGame
                        data={currentData}
                        onFinish={handleQuestionFinish}
                      />
                    );
                  case "spelling":
                    return (
                      <SpellingGame
                        data={currentData}
                        onFinish={handleQuestionFinish}
                      />
                    );
                  default:
                    return <div>Game type chưa hỗ trợ</div>;
                }
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Play,
  Trophy,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";

// Định nghĩa kiểu dữ liệu cho Topic trả về từ API
interface TopicData {
  topic: string;
  image?: string;
  count: number;
}

// 1. Cấu hình Theme
const GAME_THEMES: any = {
  quiz: {
    title: "Đường Đua Tri Thức",
    color: "from-violet-500 to-purple-600",
    icon: "🏎️",
    bgIcon: "🏁",
  },
  matching: {
    title: "Nối Hình Bắt Chữ",
    color: "from-teal-400 to-emerald-500",
    icon: "🧩",
    bgIcon: "🔗",
  },
  listening: {
    title: "Tai Nghe Siêu Đẳng",
    color: "from-rose-400 to-red-500",
    icon: "🎧",
    bgIcon: "🎵",
  },
  spelling: {
    title: "Ong Tìm Chữ",
    color: "from-amber-400 to-orange-500",
    icon: "🐝",
    bgIcon: "🍯",
  },
  flashcard: {
    title: "Lật Thẻ Trí Nhớ",
    color: "from-lime-400 to-green-500",
    icon: "🎴",
    bgIcon: "🃏",
  },
  speaking: {
    title: "Siêu Sao Lồng Tiếng",
    color: "from-cyan-400 to-blue-500",
    icon: "🎙️",
    bgIcon: "🗣️",
  },
};

const TOPIC_COLORS = [
  "bg-blue-100 text-blue-600 border-blue-200",
  "bg-pink-100 text-pink-600 border-pink-200",
  "bg-yellow-100 text-yellow-600 border-yellow-200",
  "bg-purple-100 text-purple-600 border-purple-200",
  "bg-green-100 text-green-600 border-green-200",
];

export default function TopicSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  // State là mảng TopicData object, không phải string[]
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);

  const theme = GAME_THEMES[gameId] || {
    title: "Thử Thách",
    color: "from-blue-500 to-indigo-600",
    icon: "🎮",
    bgIcon: "🌟",
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res: any = await api.get(`/practice/topics/${gameId}`);
        // API trả về: [{ topic: "Animals", image: "url...", count: 10 }, ...]
        setTopics(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [gameId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]">
        <div className="animate-bounce text-4xl">⏳</div>
      </div>
    );

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute -top-10 -left-10 text-[20rem] rotate-12">
          {theme.bgIcon}
        </div>
        <div className="absolute bottom-20 right-10 text-[15rem] -rotate-12">
          {theme.bgIcon}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push("/practice")}
              className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <ArrowLeft className="text-slate-600" strokeWidth={3} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-4xl">{theme.icon}</span>
                <h1
                  className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.color}`}
                >
                  {theme.title}
                </h1>
              </div>
              <p className="text-slate-500 font-bold ml-1 mt-1">
                Chọn màn chơi để bắt đầu nhé!
              </p>
            </div>
          </div>
          <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="text-slate-600 font-bold text-sm">
              Điểm tích lũy: <span className="text-blue-600">1,250</span>
            </span>
          </div>
        </div>

        {/* GRID CONTENT */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* CARD TỔNG HỢP */}
          <motion.div
            variants={itemVars}
            className="col-span-1 sm:col-span-2 lg:col-span-3 mb-4"
          >
            <Link
              href={`/practice/${gameId}/play?topic=ALL`}
              className="group block"
            >
              <div
                className={`relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r ${theme.color} shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300`}
              >
                <div className="bg-white/10 backdrop-blur-sm h-full rounded-[20px] p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md animate-pulse">
                      ⚡
                    </div>
                    <div className="text-white">
                      <h3 className="text-2xl font-black uppercase tracking-wide mb-1">
                        Thử thách tổng hợp
                      </h3>
                      <p className="opacity-90 font-medium">
                        Câu hỏi ngẫu nhiên từ tất cả chủ đề.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex bg-white text-slate-800 px-6 py-3 rounded-xl font-black items-center gap-2 shadow-lg group-hover:scale-110 transition-transform">
                    CHIẾN LUÔN <Play size={20} fill="currentColor" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* LIST TOPICS */}
          {topics.map((item, index) => {
            // BƯỚC 1: Lấy dữ liệu an toàn từ Object item
            // Đảm bảo topicName luôn là chuỗi (String)
            const topicName =
              typeof item.topic === "string" ? item.topic : "Unknown";
            const topicImage = item.image;
            const questionCount = item.count || 0;

            const colorClass = TOPIC_COLORS[index % TOPIC_COLORS.length];
            const stars = Math.floor(Math.random() * 4);

            // BƯỚC 2: Lấy chữ cái đầu an toàn
            const firstChar = topicName.charAt(0).toUpperCase();

            return (
              <motion.div key={index} variants={itemVars}>
                {" "}
                {/* Dùng index làm key nếu topicName có thể trùng hoặc lỗi */}
                <Link
                  href={`/practice/${gameId}/play?topic=${topicName}`} // Dùng topicName string
                  className="group block h-full"
                >
                  <div
                    className={`
          h-full bg-white rounded-[2rem] p-5 border-[3px] border-b-[8px] border-slate-100 
          hover:border-blue-300 hover:border-b-blue-400
          hover:-translate-y-2 transition-all duration-300 relative overflow-hidden
        `}
                  >
                    {/* HIỂN THỊ ẢNH NỀN CHỦ ĐỀ (NẾU CÓ) */}
                    {topicImage && (
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                        style={{
                          backgroundImage: `url(${topicImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: "grayscale(30%)",
                        }}
                      />
                    )}

                    {/* Content Wrapper */}
                    <div className="relative z-10">
                      {/* Header Card */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`px-4 py-1.5 rounded-full text-xs font-black border-2 uppercase tracking-wider bg-white/90 ${colorClass}`}
                        >
                          Level {index + 1}
                        </div>
                        <div className="flex gap-1 bg-white/80 px-2 py-1 rounded-full">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={`${s <= stars ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Avatar & Title */}
                      <div className="flex flex-col items-center text-center py-4">
                        <div
                          className={`
                w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black mb-4 shadow-lg border-4 border-white
                bg-slate-50 text-slate-700 group-hover:scale-110 transition-transform duration-300 overflow-hidden
              `}
                        >
                          {topicImage ? (
                            <img
                              src={topicImage}
                              alt={topicName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Dùng biến firstChar đã xử lý
                            <span>{firstChar}</span>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors bg-white/50 backdrop-blur-[1px] px-2 rounded-lg">
                          {topicName}
                        </h3>
                        <p className="text-slate-500 text-sm font-bold mt-1 bg-white/50 px-2 rounded-lg">
                          {questionCount} câu hỏi
                        </p>
                      </div>

                      {/* Button */}
                      <div className="mt-4 pt-4 border-t border-slate-100/50">
                        <button className="w-full py-3 rounded-xl bg-slate-100/80 hover:bg-blue-500 text-slate-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2">
                          Bắt đầu <Sparkles size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {topics.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <span className="text-6xl">🙈</span>
            <h3 className="text-xl font-bold text-slate-600 mt-4">
              Chưa có chủ đề nào
            </h3>
            <p className="text-slate-400">Hãy quay lại sau nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
}

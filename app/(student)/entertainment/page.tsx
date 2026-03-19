"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowLeft,
  Languages,
  BookOpen,
  Tv,
  Play,
  RefreshCw,
  ExternalLink,
  Star,
  Music,
  Smile,
  Zap,
  Film,
  Grid,
  ChevronRight,
  Sparkles,
  Loader2,
  Clapperboard,
  Headphones,
  Feather,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { entertainmentService } from "@/services/entertainment.service";

// --- PLAYER ---
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-white" size={40} />
    </div>
  ),
});

// --- HELPER ---
const getYouTubeID = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

/* ===================== IMAGE BACKGROUND ===================== */
const BackgroundDecor = ({ type }: { type: string }) => {
  // Mapping loại filter với đường dẫn ảnh
  const bgImages: any = {
    all: "/images/bg-entertainment.png", // Ảnh rạp phim chung
    cartoon: "/images/bg-cartoon-land.png", // Ảnh công viên hoạt hình
    music: "/images/bg-music-stage.png", // Ảnh sân khấu âm nhạc
    story: "/images/bg-fairy-tale.png", // Ảnh khu rừng cổ tích
  };

  const currentBg = bgImages[type] || bgImages.all;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-100">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={type} // Key thay đổi để kích hoạt animation
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Ảnh nền */}
          <Image
            src={currentBg}
            alt="Background"
            fill
            className="object-cover"
            priority // Load ưu tiên để tránh nháy
          />

          {/* Lớp phủ mờ */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>

          {/* Hiệu ứng gradient nhẹ dưới chân trang */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ===================== MAIN COMPONENT ===================== */
export default function EntertainmentPage() {
  const [view, setView] = useState<"TOPICS" | "VIDEOS" | "PLAYER">("TOPICS");
  const [filterType, setFilterType] = useState("all");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchTopics();
  }, [filterType]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res: any = await entertainmentService.getCategories(
        filterType !== "all" ? filterType : undefined,
      );
      setTopics(res || []);
    } catch (error) {
      console.error("Lỗi tải chủ đề:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topicId: string) => {
    setLoading(true);
    try {
      const detail: any = await entertainmentService.getCategoryDetail(topicId);
      setSelectedTopic(detail);
      setView("VIDEOS");
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== VIEW 1: TOPIC LIST ===================== */
  if (view === "TOPICS") {
    return (
      <div className="min-h-screen font-sans relative pb-20 overflow-hidden">
        {/* BACKGROUND ẢNH */}
        <BackgroundDecor type={filterType} />

        <div className="max-w-7xl mx-auto relative z-10 px-6 pt-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-800/10 pb-6">
            <div>
              <motion.div
                key={filterType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-slate-800 px-4 py-1.5 rounded-full text-sm font-bold mb-3 shadow-sm"
              >
                {filterType === "cartoon" && (
                  <Smile size={16} className="text-yellow-600" />
                )}
                {filterType === "music" && (
                  <Music size={16} className="text-pink-600" />
                )}
                {filterType === "story" && (
                  <BookOpen size={16} className="text-green-600" />
                )}
                {filterType === "all" && (
                  <Clapperboard size={16} className="text-blue-600" />
                )}

                <span className="uppercase tracking-wider">
                  {filterType === "all"
                    ? "Learning Hub"
                    : filterType === "cartoon"
                      ? "Hoạt hình vui nhộn"
                      : filterType === "music"
                        ? "Thế giới âm nhạc"
                        : "Góc kể chuyện"}
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                Rạp Chiếu Phim 🎬
              </h1>
              <p className="text-slate-600 font-medium mt-2 text-lg">
                Học tiếng Anh qua video giải trí chọn lọc.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50">
              {[
                { id: "all", label: "Tất cả", icon: <Grid size={16} /> },
                {
                  id: "cartoon",
                  label: "Hoạt hình",
                  icon: <Smile size={16} />,
                },
                {
                  id: "music",
                  label: "Âm nhạc",
                  icon: <Headphones size={16} />,
                },
                {
                  id: "story",
                  label: "Truyện kể",
                  icon: <Feather size={16} />,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    filterType === t.id
                      ? "bg-slate-800 text-white shadow-md scale-105"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-slate-500" size={40} />
            </div>
          )}

          {/* Grid Topics */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {topics.map((topic, idx) => (
                  <motion.div
                    key={topic._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    onClick={() => handleSelectTopic(topic._id)}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden bg-slate-200">
                      <img
                        src={
                          topic.thumbnail ||
                          "https://via.placeholder.com/400x300"
                        }
                        alt={topic.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                      {/* Level Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Star
                          size={10}
                          className="text-yellow-500"
                          fill="currentColor"
                        />{" "}
                        {topic.level || "Easy"}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800">
                          <Play
                            size={20}
                            fill="currentColor"
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed font-medium">
                        {topic.description ||
                          "Khám phá chủ đề thú vị này ngay!"}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                          <Film size={12} /> {topic.videos?.length || 0} Tập
                        </div>
                        <div className="flex items-center text-slate-800 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          Xem ngay <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-xl">📭 Không tìm thấy chủ đề nào.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ===================== VIEW 2: VIDEO LIST ===================== */
  if (view === "VIDEOS" && selectedTopic) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans relative pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-12">
          {/* Header Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => {
                setSelectedTopic(null);
                setView("TOPICS");
              }}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition shadow-sm active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {selectedTopic.title}
              </h2>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                <Film size={14} /> Danh sách tập phim
              </p>
            </div>
          </div>

          {/* Video List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedTopic.videos?.map((video: any, idx: number) => {
              const ytID = getYouTubeID(video.url);

              return (
                <div
                  key={video._id}
                  onClick={() => {
                    setSelectedVideo(video);
                    setView("PLAYER");
                  }}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={
                        video.thumbnail ||
                        (ytID
                          ? `https://img.youtube.com/vi/${ytID}/mqdefault.jpg`
                          : "")
                      }
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      alt={video.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                    {/* Duration */}
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {Math.floor(video.duration / 60)}:
                        {(video.duration % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex gap-3">
                    <div className="text-2xl font-black text-slate-200 select-none">
                      {(idx + 1).toString().padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== VIEW 3: PLAYER ===================== */
  return (
    <VideoPlayerView
      video={selectedVideo}
      onBack={() => {
        setSelectedVideo(null);
        setView("VIDEOS");
      }}
    />
  );
}

/* ===================== COMPONENT: VIDEO PLAYER ===================== */
function VideoPlayerView({
  video,
  onBack,
}: {
  video: any;
  onBack: () => void;
}) {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [dualSub, setDualSub] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  const transcript = video.transcript || [];

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setPlaying(false);
    setPlayedSeconds(0);
    setError(null);
    setIsLoading(true);
    setUseFallback(false);
  }, [video._id]);

  const activeLineIndex = transcript.findIndex((line: any, i: number) => {
    const next = transcript[i + 1];
    return playedSeconds >= line.start && (!next || playedSeconds < next.start);
  });

  const youtubeId = getYouTubeID(video.url);

  if (!mounted) return <div className="h-screen bg-slate-950" />;

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* 1. VIDEO AREA */}
      <div className="flex-1 relative w-full h-full bg-black flex flex-col justify-center group">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur hover:bg-white/20 transition"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="text-sm font-medium text-white/90 truncate max-w-[300px]">
            {video.title}
          </div>
        </div>

        {/* Player */}
        <div className="w-full aspect-video max-h-full shadow-2xl relative">
          {!useFallback ? (
            <ReactPlayer
              ref={playerRef}
              url={video.url}
              playing={playing}
              controls
              width="100%"
              height="100%"
              onReady={() => setIsLoading(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setUseFallback(true)}
              onProgress={(s) => setPlayedSeconds(s.playedSeconds)}
              config={{ youtube: { playerVars: { modestbranding: 1 } } }}
            />
          ) : youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              className="w-full h-full"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Video lỗi
            </div>
          )}
        </div>

        {/* Subtitles Overlay */}
        <AnimatePresence>
          {activeLineIndex !== -1 && playing && transcript.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-16 left-0 w-full text-center z-20 pointer-events-none px-4"
            >
              <div className="inline-block bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/5">
                <p className="text-xl md:text-2xl font-bold text-yellow-400 mb-1 drop-shadow-md leading-tight">
                  {transcript[activeLineIndex].en}
                </p>
                {dualSub && (
                  <p className="text-sm md:text-lg text-white font-medium opacity-90 drop-shadow-md">
                    {transcript[activeLineIndex].vi}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SIDEBAR SCRIPT */}
      <div className="w-full md:w-[400px] bg-white border-l border-slate-200 flex flex-col h-[40vh] md:h-full z-20">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <BookOpen size={18} className="text-blue-600" /> Kịch bản phim
          </h3>
          <button
            onClick={() => setDualSub(!dualSub)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${dualSub ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-slate-400 border-slate-200"}`}
          >
            {dualSub ? "Song ngữ: ON" : "Song ngữ: OFF"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {transcript.map((line: any, i: number) => {
            const isActive = i === activeLineIndex;
            return (
              <div
                key={i}
                onClick={() => {
                  if (playerRef.current) {
                    playerRef.current.seekTo(line.start, "seconds");
                    setPlaying(true);
                  }
                }}
                className={`p-3 rounded-xl cursor-pointer transition border text-sm ${
                  isActive
                    ? "bg-blue-50 border-blue-100 shadow-sm"
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                }`}
              >
                <div
                  className={`font-bold mb-0.5 ${isActive ? "text-blue-700" : "text-slate-700"}`}
                >
                  {line.en}
                </div>
                {dualSub && (
                  <div
                    className={`font-medium ${isActive ? "text-blue-500" : "text-slate-400"}`}
                  >
                    {line.vi}
                  </div>
                )}
              </div>
            );
          })}
          {transcript.length === 0 && (
            <div className="text-center text-slate-400 py-10 text-sm">
              Chưa có lời thoại.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

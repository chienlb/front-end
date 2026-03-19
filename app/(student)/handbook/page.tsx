"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Lock,
  Search,
  BookOpen,
  Star,
  Volume2,
  X,
  Filter,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interface và Mock Data
interface HandbookItem {
  _id: string;
  title: string;
  type: "VOCAB" | "GRAMMAR" | "SPECIAL";
  image?: string;
  meaning?: string;
  example?: string;
  pronunciation?: string;
}

const MOCK_ITEMS: HandbookItem[] = [
  {
    _id: "1",
    title: "Astronaut",
    type: "VOCAB",
    meaning: "Phi hành gia",
    image: "🧑‍🚀",
    pronunciation: "/ˈæstrənɔːt/",
    example: "I want to be an astronaut.",
  },
  {
    _id: "2",
    title: "Galaxy",
    type: "VOCAB",
    meaning: "Dải ngân hà",
    image: "🌌",
    pronunciation: "/ˈɡæləksi/",
    example: "The galaxy is huge.",
  },
  {
    _id: "3",
    title: "Present Simple",
    type: "GRAMMAR",
    meaning: "Thì hiện tại đơn",
    image: "clock_icon.png",
    example: "I go to school every day.",
  },
  {
    _id: "4",
    title: "Dragon",
    type: "SPECIAL",
    meaning: "Rồng lửa",
    image: "🐉",
    pronunciation: "/ˈdræɡən/",
    example: "The dragon breathes fire.",
  },
  {
    _id: "5",
    title: "Telescope",
    type: "VOCAB",
    meaning: "Kính viễn vọng",
    image: "🔭",
    pronunciation: "/ˈtelɪskəʊp/",
    example: "Use a telescope to see stars.",
  },
  {
    _id: "6",
    title: "Rocket",
    type: "VOCAB",
    meaning: "Tên lửa",
    image: "🚀",
    pronunciation: "/ˈrɒkɪt/",
    example: "The rocket flies fast.",
  },
];

export default function MyHandbookPage() {
  const [allItems, setAllItems] = useState<HandbookItem[]>([]);
  const [userItems, setUserItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<HandbookItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setAllItems(MOCK_ITEMS);
          setUserItems(["1", "2", "4"]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Lỗi tải sổ tay:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredList = useMemo(() => {
    return allItems.filter((item) => {
      const matchType = filter === "ALL" || item.type === filter;
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [allItems, filter, searchTerm]);

  const progress = Math.round(
    (userItems.length / (allItems.length || 1)) * 100,
  );

  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden bg-[#FFF8E1]">
      {" "}
      {/* 🔥 1. BACKGROUND IMAGE 🔥 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-handbook.png"
          alt="Adventure Handbook Background"
          fill
          className="object-cover"
          priority
        />
        {/* Lớp phủ mờ (Overlay) */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      </div>
      <div className="max-w-6xl mx-auto relative z-10 p-4 md:p-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#5D4037] flex items-center gap-3 drop-shadow-sm">
              <BookOpen size={36} className="text-amber-600" />
              Sổ Tay Phiêu Lưu
            </h1>
            <p className="text-[#5D4037] font-bold mt-1 bg-white/50 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
              Sưu tầm kiến thức, mở khóa kho báu!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-[#D7CCC8] w-full md:w-64">
            <div className="flex justify-between text-xs font-bold text-[#5D4037] mb-2">
              <span>Bộ sưu tập</span>
              <span>
                {userItems.length}/{allItems.length}
              </span>
            </div>
            <div className="w-full bg-[#EFEBE9] h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* --- TOOLBAR (Search & Filter) --- */}
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-[#D7CCC8] mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-[#EFEBE9] p-1 rounded-xl">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "VOCAB", label: "Từ vựng" },
              { id: "GRAMMAR", label: "Ngữ pháp" },
              { id: "SPECIAL", label: "Hiếm ✨" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === tab.id
                    ? "bg-white text-[#5D4037] shadow-sm"
                    : "text-[#8D6E63] hover:text-[#5D4037]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-[#8D6E63]"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm thẻ..."
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-[#D7CCC8] rounded-xl text-sm outline-none focus:border-amber-500 text-[#5D4037] placeholder-[#BCAAA4]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- GRID ITEMS --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence>
              {filteredList.map((item) => {
                const isOwned = userItems.includes(item._id);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => isOwned && setSelectedItem(item)}
                    className={`relative aspect-[3/4] rounded-2xl border-4 shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-sm
                                    ${
                                      isOwned
                                        ? "bg-white/90 border-white hover:-translate-y-2 hover:shadow-xl hover:border-amber-200"
                                        : "bg-[#EFEBE9]/80 border-[#D7CCC8] cursor-not-allowed grayscale opacity-80"
                                    }`}
                  >
                    {/* Card Body */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="text-5xl mb-3 drop-shadow-md transition-transform group-hover:scale-110">
                        {isOwned ? (
                          item.image?.includes("http") ? (
                            <img
                              src={item.image}
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            item.image
                          )
                        ) : (
                          "❓"
                        )}
                      </div>

                      <h3
                        className={`font-bold text-sm line-clamp-2 ${isOwned ? "text-[#5D4037]" : "text-[#A1887F]"}`}
                      >
                        {isOwned ? item.title : "???"}
                      </h3>

                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#8D6E63] bg-[#EFEBE9] px-2 py-0.5 rounded-full">
                        {item.type}
                      </span>
                    </div>

                    {!isOwned && (
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <div className="bg-[#D7CCC8] p-3 rounded-full shadow-inner">
                          <Lock size={20} className="text-[#8D6E63]" />
                        </div>
                      </div>
                    )}

                    {isOwned && item.type === "SPECIAL" && (
                      <div className="absolute top-2 right-2">
                        <Sparkles
                          size={16}
                          className="text-yellow-400 animate-pulse"
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredList.length === 0 && (
          <div className="text-center py-20 text-[#5D4037] bg-white/60 backdrop-blur-md rounded-3xl mx-auto max-w-md shadow-lg border border-[#D7CCC8]">
            <p className="text-lg font-bold">
              Không tìm thấy thẻ nào trong sổ tay.
            </p>
          </div>
        )}
      </div>
      {/* --- DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFF8E1] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-24 bg-gradient-to-br from-amber-400 to-orange-400 relative">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 pb-8 pt-0 text-center relative">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg mx-auto -mt-12 flex items-center justify-center text-5xl mb-4">
                  {selectedItem.image?.includes("http") ? (
                    <img
                      src={selectedItem.image}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    selectedItem.image
                  )}
                </div>

                <h2 className="text-3xl font-black text-[#5D4037] mb-1">
                  {selectedItem.title}
                </h2>

                {selectedItem.pronunciation && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-[#8D6E63] bg-[#EFEBE9] inline-block px-4 py-1 rounded-full text-sm font-medium">
                    <span>{selectedItem.pronunciation}</span>
                    <button
                      onClick={() => playAudio(selectedItem.title)}
                      className="hover:text-amber-600 transition"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                )}

                <div className="space-y-4 text-left bg-white p-5 rounded-xl border border-[#EFEBE9] shadow-sm">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#A1887F] tracking-wide">
                      Nghĩa tiếng Việt
                    </label>
                    <p className="text-lg font-bold text-[#5D4037]">
                      {selectedItem.meaning}
                    </p>
                  </div>

                  {selectedItem.example && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#A1887F] tracking-wide">
                        Ví dụ
                      </label>
                      <div className="flex gap-2 items-start">
                        <p className="text-sm text-[#6D4C41] italic">
                          "{selectedItem.example}"
                        </p>
                        <button
                          onClick={() => playAudio(selectedItem.example!)}
                          className="text-[#A1887F] hover:text-amber-600"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import {
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  Loader2,
  PlayCircle,
  Languages,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "@/utils/api";

// --- 1. DEFINITIONS & TYPES ---

interface Example {
  en: string; // Câu ví dụ tiếng Anh
  vi: string; // Dịch nghĩa tiếng Việt
}

interface Definition {
  type: string; // Từ loại (Noun, Verb...)
  meaning: string; // Nghĩa chính
  explanation: string; // Giải thích chi tiết
  examples: Example[]; // Danh sách ví dụ minh họa
}

interface DictionaryResult {
  word: string;
  phonetic: string; // Phiên âm (IPA)
  audio: string; // Link file âm thanh chuẩn
  definitions: Definition[];
}

export default function DictionaryPage() {
  // --- STATE MANAGEMENT ---
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Ref để điều khiển thẻ <audio> ẩn
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 2. MAIN LOGIC (Xử lý tìm kiếm) ---
  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setResult(null); // Reset kết quả cũ để hiện loading

    try {
      // BƯỚC 1: Lấy Audio & Phiên âm từ Free Dictionary API
      let phonetic = "";
      let audioSrc = "";
      try {
        const dictRes = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`,
        );
        const data = dictRes.data[0];

        // Logic tìm phiên âm ưu tiên text có sẵn
        phonetic =
          data.phonetic || data.phonetics.find((p: any) => p.text)?.text || "";

        // Logic tìm file audio: Lấy file đầu tiên không rỗng
        audioSrc =
          data.phonetics.find((p: any) => p.audio && p.audio !== "")?.audio ||
          "";
      } catch (e) {
        console.log(
          "Dictionary API: Không tìm thấy audio/phonetic, sẽ dùng fallback.",
        );
      }

      // BƯỚC 2: Gọi AI để lấy Nghĩa & Ví dụ (Thông minh hơn API thường)
      // Prompt được tinh chỉnh để trả về JSON thuần túy
      const prompt = `
        Đóng vai một từ điển Anh-Việt cao cấp.
        Giải thích từ: "${keyword}".
        Yêu cầu Output: Chỉ trả về JSON (không markdown, không giải thích thêm) theo cấu trúc sau:
        {
          "definitions": [
            {
              "type": "từ loại (viết tắt tiếng Anh: noun/verb/adj...)",
              "meaning": "Nghĩa tiếng Việt ngắn gọn, chuẩn xác",
              "explanation": "Giải thích nghĩa bằng tiếng Việt dễ hiểu",
              "examples": [
                { "en": "Câu ví dụ tiếng Anh ngắn", "vi": "Dịch tiếng Việt tương ứng" },
                { "en": "Câu ví dụ tiếng Anh khác", "vi": "Dịch tiếng Việt tương ứng" }
              ]
            }
          ]
        }
      `;

      const aiRes: any = await api.post("/chat/talk", { message: prompt });

      // Xử lý dữ liệu trả về từ AI (Clean JSON string)
      let aiData = { definitions: [] };
      try {
        // Loại bỏ các ký tự markdown thừa nếu AI lỡ thêm vào (VD: ```json ... ```)
        const cleanJson = aiRes.reply.replace(/```json|```/g, "").trim();
        aiData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("Lỗi parse JSON từ AI:", parseError);
        // Fallback data nếu AI trả về lỗi
        aiData = {
          definitions: [
            {
              type: "Unknown",
              meaning: "Không thể phân tích",
              explanation: "Hệ thống chưa hiểu rõ từ này, bạn thử lại nhé.",
              examples: [],
            },
          ],
        };
      }

      // Set kết quả cuối cùng để hiển thị
      setResult({
        word: keyword.toLowerCase(),
        phonetic: phonetic || `/${keyword}/`,
        audio: audioSrc,
        definitions: Array.isArray(aiData.definitions)
          ? aiData.definitions
          : [],
      });
    } catch (err) {
      console.error(err);
      alert("Kết nối không ổn định. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. AUDIO HANDLERS ---

  // Phát âm từ vựng chính
  const playMainAudio = () => {
    if (result?.audio && audioRef.current) {
      // Ưu tiên dùng file audio chuẩn từ API
      audioRef.current.play().catch(() => {
        // Nếu lỗi file, fallback sang giọng Google
        speakFallback(keyword);
      });
    } else {
      // Nếu không có file audio, dùng Web Speech API
      speakFallback(keyword);
    }
  };

  // Phát âm câu ví dụ
  const playSentence = (text: string) => {
    speakFallback(text, 0.9); // Đọc chậm hơn (0.9) để dễ nghe
  };

  // Hàm helper đọc văn bản (Web Speech API)
  const speakFallback = (text: string, rate = 1) => {
    window.speechSynthesis.cancel(); // Dừng câu đang đọc dở
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    window.speechSynthesis.speak(u);
  };

  // Xóa ô tìm kiếm
  const clearSearch = () => {
    setKeyword("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={clearSearch}
          >
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Smart Dictionary
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            Powered by AI ✨
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* --- SEARCH BAR --- */}
        <div className="relative group mb-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search
              className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={22}
            />
          </div>
          <input
            type="text"
            className="w-full pl-14 pr-14 py-4 text-lg bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.1)] focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
            placeholder="Nhập từ vựng cần tra cứu (VD: Resilience)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />

          {/* Clear Button */}
          {keyword && (
            <button
              onClick={clearSearch}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
            >
              <X size={18} />
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-2.5 top-2.5 bottom-2.5 aspect-square bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>

        {/* --- RESULT AREA --- */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 1. WORD HEADER CARD */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 mb-3 capitalize tracking-tight">
                      {result.word}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-xl text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        {result.phonetic}
                      </span>
                      <button
                        onClick={playMainAudio}
                        className="group flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-bold transition-all active:scale-95"
                      >
                        <Volume2
                          size={20}
                          className="group-hover:animate-pulse"
                        />
                        <span className="text-sm">Phát âm</span>
                      </button>
                      {/* Audio Tag ẩn để play file mp3 */}
                      <audio ref={audioRef} src={result.audio} />
                    </div>
                  </div>
                  {/* Decor Icon */}
                  <div className="hidden md:block opacity-10">
                    <BookOpen size={80} className="text-blue-600" />
                  </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50"></div>
              </div>

              {/* 2. DEFINITIONS LIST */}
              <div className="space-y-6">
                {result.definitions?.map((def, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 md:p-8">
                      {/* Definition Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-slate-800">
                              {def.meaning}
                            </h3>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                              {def.type}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-lg">
                            {def.explanation}
                          </p>
                        </div>
                      </div>

                      {/* Examples Section */}
                      {def.examples.length > 0 && (
                        <div className="mt-6 pl-4 md:pl-12">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Sparkles size={14} /> Ví dụ ngữ cảnh
                          </h4>
                          <div className="grid gap-3">
                            {def.examples.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="group relative bg-slate-50 hover:bg-blue-50/50 rounded-xl p-4 transition-colors border border-slate-100"
                              >
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => playSentence(ex.en)}
                                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                                    title="Nghe câu này"
                                  >
                                    <PlayCircle size={20} />
                                  </button>
                                  <div>
                                    <p className="text-slate-800 font-medium text-[16px] mb-1">
                                      {ex.en}
                                    </p>
                                    <p className="text-slate-500 text-sm">
                                      {ex.vi}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* --- EMPTY STATE --- */
            !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-20 text-center"
              >
                <div className="bg-white inline-flex p-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
                  <Languages size={48} className="text-blue-500/50" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Từ điển AI Thông Minh
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Nhập bất kỳ từ tiếng Anh nào để xem nghĩa, phiên âm và ví dụ
                  minh họa chi tiết.
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  SkipForward,
  Lightbulb,
  Activity,
  RotateCcw,
} from "lucide-react";

interface Props {
  data: {
    word: string;
    audio?: string;
    video?: string;
    phonetic?: string;
  };
  onSuccess: () => void;
}

// --- THUẬT TOÁN LEVENSHTEIN DISTANCE ---
const similarity = (s1: string, s2: string) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (
    (longerLength - editDistance(longer, shorter)) /
    parseFloat(longerLength.toString())
  );
};

const editDistance = (s1: string, s2: string) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

export default function PronounceGame({ data, onSuccess }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState(""); // Văn bản đang nói dở
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState<number>(0);

  // Audio Visualizer State
  const [audioLevel, setAudioLevel] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- GAME LOGIC ---
  useEffect(() => {
    resetGame();
    return () => {
      stopListening();
      stopAudio();
      stopVisualizer();
    };
  }, [data]);

  const resetGame = () => {
    stopAudio();
    stopListening();
    setAttempts(0);
    setStatus("idle");
    setTranscript("");
    setInterimText("");
    setAccuracy(0);
    setIsListening(false);
    setTimeout(() => playSample(), 600);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // --- AUDIO VISUALIZER (Hiệu ứng sóng âm) ---
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Tính trung bình âm lượng
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        setAudioLevel(average); // Update state để render UI
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error("Mic Access Error:", err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (microphoneRef.current) microphoneRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setAudioLevel(0);
  };

  // --- SPEECH RECOGNITION ---
  const getLang = (text: string) => {
    // Basic detection: Tiếng Việt có dấu, Tiếng Anh không dấu (đơn giản hóa)
    const isVietnamese =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        text,
      );
    return isVietnamese ? "vi-VN" : "en-US";
  };

  const startListening = () => {
    stopAudio(); // Tắt loa trước khi thu âm

    if (
      typeof window !== "undefined" &&
      (window as any).webkitSpeechRecognition
    ) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      if (recognitionRef.current) recognitionRef.current.stop();

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getLang(data.word);
      recognition.continuous = false; // Dừng ngay khi ngắt câu
      recognition.interimResults = true; // Lấy kết quả tạm thời

      recognition.onstart = () => {
        setIsListening(true);
        setStatus("idle");
        setTranscript("");
        startVisualizer(); // Bật visualizer
      };

      recognition.onend = () => {
        setIsListening(false);
        stopVisualizer(); // Tắt visualizer
        // Check final result logic is handled in onresult
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Error:", e);
        setIsListening(false);
        stopVisualizer();
        if (e.error !== "no-speech") {
          setStatus("wrong");
          setAttempts((prev) => prev + 1);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript(finalTrans);
          checkPronunciation(finalTrans);
        } else {
          setInterimText(interimTrans);
        }
      };

      recognition.start();
    } else {
      alert("Trình duyệt không hỗ trợ. Vui lòng dùng Chrome trên PC/Android.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopVisualizer();
  };

  const checkPronunciation = (spoken: string) => {
    // 1. Chuẩn hóa chuỗi (Xóa dấu câu, lowercase)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    const target = normalize(data.word);
    const input = normalize(spoken);

    console.log(`Target: [${target}] | Input: [${input}]`);

    // 2. Tính độ tương đồng
    const matchScore = similarity(target, input);
    const percent = Math.round(matchScore * 100);
    setAccuracy(percent);

    // 3. Logic chấm điểm (Thả lỏng cho trẻ em)
    // Đúng nếu > 60% HOẶC chứa từ khóa chính
    if (matchScore >= 0.6 || input.includes(target)) {
      setStatus("correct");
      setTimeout(onSuccess, 1500);
    } else {
      setStatus("wrong");
      setAttempts((prev) => prev + 1);
    }
  };

  const playSample = () => {
    if (isListening) stopListening(); // Dừng mic nếu đang thu

    if (data.audio && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log("Audio play error", e));
      return;
    }

    // Fallback: Web Speech API (Giọng Google Chị Google)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.word);
      utterance.lang = getLang(data.word);
      utterance.rate = 0.9; // Đọc chậm một chút cho bé dễ nghe
      window.speechSynthesis.speak(utterance);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/"))
      return url.replace("youtu.be/", "youtube.com/embed/");
    return url;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* 1. MEDIA CARD */}
      <div className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group">
        {/* Decor Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

        {data.video ? (
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-sm relative z-10">
            <iframe
              src={getEmbedUrl(data.video)}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay"
            ></iframe>
          </div>
        ) : (
          <button
            onClick={playSample}
            className="relative w-28 h-28 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all cursor-pointer z-10 shadow-sm border border-blue-100"
          >
            <Volume2 size={48} />
            {/* Audio Wave Animation */}
            <span className="absolute w-full h-full rounded-full border-2 border-blue-200 animate-ping opacity-20"></span>
            {data.audio && <audio ref={audioRef} src={data.audio} />}
          </button>
        )}

        <div className="text-center z-10 mt-2">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {data.word}
          </h2>
          {data.phonetic && (
            <p className="text-slate-400 font-mono text-lg mt-1">
              /{data.phonetic}/
            </p>
          )}
        </div>
      </div>

      {/* 2. RECORDING AREA */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Visualizer Ring */}
        <div
          className={`absolute w-32 h-32 rounded-full border-4 border-blue-200 opacity-50 transition-transform duration-75`}
          style={{ transform: `scale(${1 + (audioLevel / 255) * 0.5})` }} // Zoom theo âm lượng
        ></div>

        <button
          onClick={isListening ? stopListening : startListening}
          disabled={status === "correct"}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl shadow-xl transition-all transform active:scale-95 z-20 relative
            ${
              status === "correct"
                ? "bg-green-500 shadow-green-200"
                : status === "wrong"
                  ? "bg-red-500 shadow-red-200"
                  : isListening
                    ? "bg-red-500 animate-pulse shadow-red-300"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300 hover:shadow-blue-400"
            }
          `}
        >
          {isListening ? (
            <div className="flex gap-1 items-end h-8">
              <span className="w-1 bg-white animate-bounce h-4"></span>
              <span className="w-1 bg-white animate-bounce delay-75 h-6"></span>
              <span className="w-1 bg-white animate-bounce delay-150 h-3"></span>
            </div>
          ) : (
            <Mic />
          )}
        </button>

        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
          {isListening ? "Đang nghe..." : "Bấm để nói"}
        </p>
      </div>

      {/* 3. FEEDBACK BOX */}
      <div className="w-full bg-slate-50 rounded-2xl p-4 min-h-[140px] flex flex-col items-center justify-center border border-slate-100 relative">
        {/* Transcript Text */}
        <p className="text-xl font-medium text-slate-700 text-center break-words w-full">
          {transcript || (
            <span className="text-slate-300 italic">
              {interimText || "..."}
            </span>
          )}
        </p>

        {/* Accuracy Bar */}
        {transcript && status !== "idle" && (
          <div className="w-full max-w-[200px] mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span>Độ chính xác</span>
              <span
                className={accuracy > 60 ? "text-green-500" : "text-red-500"}
              >
                {accuracy}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-out ${accuracy >= 60 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${accuracy}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mt-3 text-sm font-bold">
          {status === "correct" && (
            <span className="text-green-600 flex items-center gap-1 animate-bounce">
              🎉 Tuyệt vời! Chính xác.
            </span>
          )}
          {status === "wrong" && (
            <span className="text-red-500 flex items-center gap-1 animate-shake">
              😕 Chưa đúng lắm, thử lại nhé!
            </span>
          )}
        </div>

        {/* Skip Suggestion */}
        {attempts >= 3 && status !== "correct" && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4 rounded-2xl animate-in fade-in">
            <Lightbulb className="text-yellow-500 mb-2" size={24} />
            <p className="text-slate-600 text-sm font-medium mb-3">
              Từ này hơi khó nhỉ? Bé muốn bỏ qua không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAttempts(0)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Thử lại
              </button>
              <button
                onClick={onSuccess}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200 flex items-center gap-1"
              >
                Bỏ qua <SkipForward size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

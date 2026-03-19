"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Maximize2,
  Minimize2,
  Volume2,
  Eraser,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatService } from "@/services/chat.service";

const CHATBOT_ICON = "/images/icon-chatbot.svg";

/** Render text với **bold** và xuống dòng cho đẹp */
function formatMessageText(text: string): React.ReactNode {
  if (!text || typeof text !== "string") return text;
  const segments: { bold: boolean; content: string }[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex)
      segments.push({ bold: false, content: text.slice(lastIndex, match.index) });
    segments.push({ bold: true, content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length)
    segments.push({ bold: false, content: text.slice(lastIndex) });
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i}>{seg.content}</strong>
        ) : (
          <Fragment key={i}>
            {seg.content.split("\n").map((line, j) => (
              <Fragment key={`${i}-${j}`}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Fragment>
        )
      )}
    </>
  );
}
const ICON_BG = "#FFFFFF";

export default function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<"TEXT">("TEXT");

  const isCompact = isOpen && !isExpanded;

  const [messages, setMessages] = useState<any[]>([
    {
      role: "ai",
      text: "Hi! I'm your Study Buddy. What would you like to practice today?",
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Setup Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "vi-VN";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          handleSend(transcript);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // 2. Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isExpanded, mode]);

  // 3. Handle Send — dùng dữ liệu từ API /chatbot/chat
  const getReplyFromResponse = (res: any): string => {
    if (!res || typeof res !== "object") return "";
    const data = res.data ?? res;
    const statusLike = /completed successfully|success|ok|done/i;
    // Ưu tiên trường chứa nội dung trả lời AI, tránh dùng message khi nó chỉ là thông báo trạng thái
    const candidates = [
      data.reply ?? res.reply,
      data.content ?? res.content,
      data.response ?? res.response,
      data.answer ?? res.answer,
      data.result ?? res.result,
      data.text ?? res.text,
      data.message ?? res.message,
    ].filter(Boolean);
    for (const raw of candidates) {
      const s = typeof raw === "string" ? raw.trim() : "";
      if (s && !statusLike.test(s)) return s;
    }
    return candidates[0] && typeof candidates[0] === "string" ? String(candidates[0]).trim() : "";
  };

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return;
    const userMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setTextInput("");
    setIsLoading(true);

    try {
      const res: any = await chatService.chat(msg, messages);
      const aiReply = getReplyFromResponse(res) || "I didn't catch that. Could you say it again?";
      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
      speak(aiReply);
    } catch (e: any) {
      const resData = e?.response?.data;
      if (e?.response?.status === 400 && resData) {
        console.warn("Chatbot 400 response (check expected body format):", resData);
      } else {
        console.error("Chatbot API error:", e);
      }
      const rawMsg = resData?.message;
      const errMsg =
        (Array.isArray(rawMsg) ? rawMsg[0] : rawMsg) ||
        e?.message ||
        "Connection error. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: errMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      synthesisRef.current?.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const clearChat = () => {
    if (confirm("Clear chat history?")) {
      setMessages([
        { role: "ai", text: "History cleared. Let's start fresh!" },
      ]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className={
              isExpanded
                ? "fixed inset-0 z-[9999] bg-slate-200/60 backdrop-blur-sm flex items-center justify-center"
                : "fixed bottom-2 right-4 sm:right-6 z-[9999] flex flex-col items-end"
            }
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`
bg-white shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200
${isExpanded
                  ? "w-full h-full max-w-none rounded-none"
                  : "w-[94vw] sm:w-[420px] h-[70vh] sm:h-[600px] max-h-[720px] rounded-2xl"
                }
`}
            >
              {/* --- HEADER --- */}
              <div className="bg-white border-b border-teal-100 px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: ICON_BG }}>
                    <Image src={CHATBOT_ICON} alt="" width={44} height={44} className="object-contain" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight flex items-center gap-2 text-slate-800">
                      Study Buddy{" "}
                      <span className="bg-teal-200 text-teal-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pro
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Online
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={clearChat}
                    title="Clear history"
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Eraser size={18} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                  >
                    {isExpanded ? (
                      <Minimize2 size={20} />
                    ) : (
                      <Maximize2 size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* --- BODY CHAT --- */}
              <div className={`flex-1 overflow-y-auto bg-slate-50 ${isExpanded ? "p-6 md:p-8 space-y-6" : "p-4 space-y-4"}`}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm ring-2 ring-white
                        ${m.role === "ai" ? "" : "bg-slate-200 text-slate-600"}`}
                    style={m.role === "ai" ? { backgroundColor: ICON_BG } : undefined}
                    >
                      {m.role === "ai" ? <Image src={CHATBOT_ICON} alt="" width={24} height={24} className="object-contain" /> : "EM"}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`relative rounded-2xl text-sm leading-relaxed max-w-[78%] sm:max-w-[80%] md:max-w-[70%] shadow-sm px-4 py-3
                        ${m.role === "user"
                          ? "bg-white border border-slate-200 text-slate-800 rounded-tr-none"
                          : "bg-teal-50/80 border border-teal-200 text-slate-800 rounded-tl-none"
                        }
                        ${isExpanded ? "text-base px-6 py-4" : ""}
                    `}
                    >
                      {formatMessageText(m.text)}
                      {/* Audio Icon for AI */}
                      {m.role === "ai" &&
                        i === messages.length - 1 &&
                        !isSpeaking && (
                          <button
                            onClick={() => speak(m.text)}
                            className="absolute -bottom-6 left-0 text-slate-400 hover:text-teal-500 p-1"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white overflow-hidden p-1.5" style={{ backgroundColor: ICON_BG }}>
                      <Image src={CHATBOT_ICON} alt="" width={30} height={30} className="object-contain" />
                    </div>
                    <div className="bg-teal-50 p-4 rounded-2xl rounded-tl-none border border-teal-200 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* --- FOOTER CONTROLS --- */}
              <div className={`bg-white border-t border-slate-200 shrink-0 ${isExpanded ? "p-5" : "p-4"}`}>
                {/* Mode: TEXT */}
                {mode === "TEXT" && (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 relative">
                      <input
                        className={`w-full bg-slate-50 rounded-2xl pl-4 pr-12 py-3 outline-none border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 transition text-slate-800 placeholder:text-slate-400 ${isExpanded ? "text-base" : "text-sm"}`}
                        placeholder="Type your question..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSend(textInput)
                        }
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSend(textInput)}
                        disabled={!textInput.trim() || isLoading}
                        className="absolute right-2 top-1.5 p-2 bg-teal-400 text-white rounded-xl hover:bg-teal-500 disabled:bg-slate-300 transition shadow-sm"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NÚT KÍCH HOẠT (Floating Button) */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-[9998] group">
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-bold text-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask Study Buddy ✨
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-slate-100"></div>
          </div>

          {/* Main Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setIsExpanded(false);
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl flex items-center justify-center text-white relative ring-4 ring-white"
            style={{ backgroundColor: ICON_BG, boxShadow: "0 20px 25px -5px rgba(227, 106, 106, 0.3)" }}
          >
            <Image src={CHATBOT_ICON} alt="" width={38} height={38} className="sm:hidden object-contain" />
            <Image src={CHATBOT_ICON} alt="" width={44} height={44} className="hidden sm:block object-contain" />
            <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          </motion.button>
        </div>
      )}
    </>
  );
}

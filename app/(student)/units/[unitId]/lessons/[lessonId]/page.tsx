"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Lock,
  Sparkles,
  Star,
  Trophy,
  ArrowRight,
  BookOpen,
  Play,
  Volume2,
} from "lucide-react";
import Confetti from "react-confetti";

import MatchingGame from "@/components/student/games/MatchingGame";
import PronounceGame from "@/components/student/games/PronounceGame";
import ListeningGame from "@/components/student/games/ListeningGame";
import SpellingGame from "@/components/student/games/SpellingGame";
import QuizGame from "@/components/student/games/QuizGame";
import FlashcardGame from "@/components/student/games/FlashcardGame";
import RewardPopup from "@/components/student/RewardPopup";

import { lessonService } from "@/services/lessons.service";
import { dictionaryService } from "@/services/dictionary.service";

const SHARED_BG =
  "/images/3d-illustration-world-book-day-celebration/10444286.jpg";

function decodeHtmlEntitiesDeep(value: string): string {
  if (!value || typeof document === "undefined") return value;
  let current = value;
  for (let i = 0; i < 3; i += 1) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = current;
    const next = textarea.value;
    if (next === current) break;
    current = next;
  }
  return current;
}

function sanitizeHtml(value: string): string {
  if (!value || typeof document === "undefined") return value;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = decodeHtmlEntitiesDeep(value);

  // Remove dangerous tags and attributes before rendering.
  wrapper.querySelectorAll("script,style,iframe,object,embed").forEach((el) => el.remove());
  wrapper.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if (name === "style" || name === "class" || name === "id") {
        el.removeAttribute(attr.name);
      }
      if (["border", "frame", "rules", "cellpadding", "cellspacing", "bgcolor", "align"].includes(name)) {
        el.removeAttribute(attr.name);
      }
      if ((name === "src" || name === "href") && val.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });

    if (el.tagName === "IMG") {
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.removeAttribute("border");
      el.setAttribute("loading", "lazy");
    }
  });

  return wrapper.innerHTML;
}

function toPlainText(value: any): string {
  const raw = String(value ?? "");
  if (!raw) return "";
  if (typeof document === "undefined") {
    return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const wrapper = document.createElement("div");
  wrapper.innerHTML = decodeHtmlEntitiesDeep(raw);
  return (wrapper.textContent || "").replace(/\s+/g, " ").trim();
}

function normalizeLessonType(apiData: any): string {
  const candidates = [
    apiData?.type,
    apiData?.skillFocus,
    apiData?.content?.type,
    apiData?.contentType,
  ];

  for (const candidate of candidates) {
    const normalized = toPlainText(candidate).toLowerCase();
    if (normalized) return normalized;
  }

  return "";
}

function normalizeContentType(rawType: any, fallbackLessonType = ""): string {
  const normalized = toPlainText(rawType).toLowerCase();
  const fallback = toPlainText(fallbackLessonType).toLowerCase();
  const source = normalized || fallback;

  if (["vocab", "vocabulary"].includes(source)) return "vocabulary";
  if (source === "grammar") return "grammar";
  if (source === "dialogue") return "dialogue";
  if (source === "reading") return "reading";
  if (["listening", "speaking", "writing", "exercise", "exercises"].includes(source)) {
    return "exercises";
  }
  if (["quiz", "quizzes"].includes(source)) return "quizzes";
  if (["review", "reviews"].includes(source)) return "reviews";
  if (["summary", "summaries"].includes(source)) return "summaries";
  if (["game", "games"].includes(source)) return "games";
  if (["song", "songs"].includes(source)) return "songs";
  return source;
}

function toYoutubeEmbedUrl(rawUrl: string): string {
  const url = String(rawUrl || "")
    .trim()
    .replace(/[),.;!?]+$/g, "");
  if (!url) return "";

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/i);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/i);
  if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

  if (url.includes("youtube.com/embed/")) return url;
  return "";
}

function extractFirstYoutubeUrl(...sources: any[]): string {
  const text = sources
    .map((s) => String(s ?? ""))
    .join("\n");
  if (!text.trim()) return "";

  if (typeof document !== "undefined") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = decodeHtmlEntitiesDeep(text);

    const iframeSrc = wrapper.querySelector("iframe")?.getAttribute("src") || "";
    if (/youtube\.com|youtu\.be/i.test(iframeSrc)) return iframeSrc;

    const anchorSrc = Array.from(wrapper.querySelectorAll("a"))
      .map((a) => a.getAttribute("href") || "")
      .find((href) => /youtube\.com|youtu\.be/i.test(href));
    if (anchorSrc) return anchorSrc;
  }

  const match = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s<>"]+/i);
  return match ? match[0] : "";
}

function extractYoutubeFromStep(step: any): string {
  if (!step || typeof step !== "object") return "";
  return extractFirstYoutubeUrl(
    step.title,
    step.subtitle,
    step.question,
    step.content,
    step.prompt,
    step.script,
    Array.isArray(step.items) ? step.items.join("\n") : "",
    Array.isArray(step.options)
      ? step.options
          .map((o: any) => (typeof o === "string" ? o : JSON.stringify(o)))
          .join("\n")
      : "",
  );
}

function normalizeStepForDisplay(step: any): any {
  if (!step || typeof step !== "object") return step;

  const next: any = { ...step };
  const textKeys = [
    "title",
    "question",
    "word",
    "meaning",
    "ipa",
    "content",
    "instruction",
    "prompt",
    "task",
    "script",
    "translation",
    "audio",
  ];

  textKeys.forEach((key) => {
    if (typeof next[key] === "string") {
      next[key] = toPlainText(next[key]);
    }
  });

  if (Array.isArray(next.options)) {
    next.options = next.options.map((opt: any) => {
      if (typeof opt === "string") return toPlainText(opt);
      if (opt && typeof opt === "object") {
        const mapped: Record<string, any> = {};
        Object.entries(opt).forEach(([k, v]) => {
          mapped[k] = typeof v === "string" ? toPlainText(v) : v;
        });
        return mapped;
      }
      return opt;
    });
  }

  if (Array.isArray(next.correctAnswers)) {
    next.correctAnswers = next.correctAnswers.map((v: any) =>
      typeof v === "string" ? toPlainText(v) : v,
    );
  }

  if (Array.isArray(next.pairs)) {
    next.pairs = next.pairs.map((pair: any) => {
      if (!pair || typeof pair !== "object") return pair;
      const mapped: Record<string, any> = {};
      Object.entries(pair).forEach(([k, v]) => {
        mapped[k] = typeof v === "string" ? toPlainText(v) : v;
      });
      return mapped;
    });
  }

  if (Array.isArray(next.questionsAndAnswers)) {
    next.questionsAndAnswers = next.questionsAndAnswers.map((qa: any) => {
      if (!qa || typeof qa !== "object") {
        return typeof qa === "string" ? toPlainText(qa) : qa;
      }
      const mapped: Record<string, any> = {};
      Object.entries(qa).forEach(([k, v]) => {
        mapped[k] = typeof v === "string" ? toPlainText(v) : v;
      });
      return mapped;
    });
  }

  // reading giữ lại HTML trong subtitle/items để render qua sanitizeHtml + dangerouslySetInnerHTML.
  if (next.type === "reading") return next;

  if (typeof next.subtitle === "string") {
    next.subtitle = toPlainText(next.subtitle);
  }

  if (Array.isArray(next.items)) {
    next.items = next.items.map((it: any) =>
      typeof it === "string" ? toPlainText(it) : it,
    );
  }

  return next;
}

function normalizeContentBySchema(lessonType: string, rawContent: any, apiData: any): any {
  const content = rawContent && typeof rawContent === "object" ? rawContent : {};
  const contentType = normalizeContentType(content?.type, lessonType);
  const tags = Array.isArray(content?.tags)
    ? content.tags
    : Array.isArray(apiData?.tags)
      ? apiData.tags
      : [];

  if (contentType === "vocabulary") {
    return {
      ...(content || {}),
      type: "vocabulary",
      description: String(content?.description ?? apiData?.description ?? ""),
      words: Array.isArray(content?.words) ? content.words : [],
      tags,
    };
  }

  if (contentType === "grammar") {
    const examples = Array.isArray(content?.examples)
      ? content.examples
      : Array.isArray(content?.grammarExamples)
        ? content.grammarExamples
        : Array.isArray(content?.exampleSentences)
          ? content.exampleSentences
          : [];
    const commonMistakes = Array.isArray(content?.commonMistakes)
      ? content.commonMistakes
      : Array.isArray(content?.mistakes)
        ? content.mistakes
        : Array.isArray(content?.common_mistakes)
          ? content.common_mistakes
          : [];
    const grammarRules = Array.isArray(content?.grammarRules)
      ? content.grammarRules
      : [];
    const practiceIdeas = Array.isArray(content?.practiceIdeas)
      ? content.practiceIdeas
      : [];
    return {
      ...(content || {}),
      type: "grammar",
      description: String(content?.description || content?.overview || apiData?.description || ""),
      rule: String(content?.rule || ""),
      explanation_vi: String(content?.explanation_vi || content?.explanationVi || content?.explain_vi || content?.explanation || ""),
      explanation_en: String(content?.explanation_en || content?.explanationEn || content?.explain_en || ""),
      examples,
      commonMistakes,
      grammarRules,
      practiceIdeas,
      tags,
    };
  }

  if (contentType === "dialogue") {
    return {
      ...(content || {}),
      type: "dialogue",
      description: String(content?.description || ""),
      script: String(content?.script || ""),
      audio: String(content?.audio || ""),
      translation: String(content?.translation || ""),
      tags,
    };
  }

  if (contentType === "reading") {
    return {
      ...(content || {}),
      type: "reading",
      description: String(content?.description || content?.overview || ""),
      passage: String(content?.passage || content?.content || content?.text || ""),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
        : [],
      tags,
    };
  }

  if (contentType === "exercises") {
    return {
      ...(content || {}),
      type: "exercises",
      description: String(content?.description || ""),
      exerciseType: String(content?.exerciseType || lessonType),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
        : [],
      tags,
    };
  }

  if (contentType === "quizzes") {
    return {
      ...(content || {}),
      type: "quizzes",
      description: String(content?.description || ""),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
        : [],
      tags,
    };
  }

  if (contentType === "reviews") {
    return {
      ...(content || {}),
      type: "reviews",
      description: String(content?.description || ""),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
        : [],
      tags,
    };
  }

  if (contentType === "summaries") {
    return {
      ...(content || {}),
      type: "summaries",
      description: String(content?.description || ""),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
            : [],
      tags,
    };
  }

  if (contentType === "games") {
    return {
      ...(content || {}),
      type: "games",
      description: String(content?.description || ""),
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
            : [],
      tags,
    };
  }

  if (contentType === "songs") {
    return {
      ...(content || {}),
      type: "songs",
      description: String(content?.description || ""),
      lyrics: String(content?.lyrics || ""),
      translation: String(content?.translation || ""),
      audio: String(content?.audio || ""),
      video: String(content?.video || ""),
      vocabulary: Array.isArray(content?.vocabulary) ? content.vocabulary : [],
      questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
        ? content.questionsAndAnswers
        : Array.isArray(content?.questionAnswers)
          ? content.questionAnswers
          : Array.isArray(content?.questions)
            ? content.questions
            : [],
      tags,
    };
  }

  return {
    ...(content || {}),
    type: contentType || toPlainText(content?.type) || "",
    tags,
  };
}

function getStepTheme(stepType: string) {
  switch (stepType) {
    case "video":
      return {
        badge: "Khám phá",
        tint: "bg-[#E9F5FF] text-[#2D79C7]",
        panel: "from-[#EAF7FF] via-white to-[#F5FBFF]",
        ring: "ring-[#B9E2FF]",
      };
    case "vocab":
    case "vocab-intro":
      return {
        badge: "Từ mới",
        tint: "bg-[#FFF2E0] text-[#C97A15]",
        panel: "from-[#FFF8E9] via-white to-[#FFFDF6]",
        ring: "ring-[#FFD9A6]",
      };
    case "quiz":
    case "matching":
    case "flashcard":
      return {
        badge: "Trò chơi",
        tint: "bg-[#F5ECFF] text-[#8A52D1]",
        panel: "from-[#F9F1FF] via-white to-[#FDF8FF]",
        ring: "ring-[#E5D2FF]",
      };
    case "speaking":
    case "listening":
    case "spelling":
      return {
        badge: "Luyện tập",
        tint: "bg-[#EAFBF1] text-[#2D9B62]",
        panel: "from-[#F1FFF7] via-white to-[#F7FFFB]",
        ring: "ring-[#CBEFD9]",
      };
    default:
      return {
        badge: "Bài học",
        tint: "bg-[#FFEAF3] text-[#D65086]",
        panel: "from-[#FFF4F8] via-white to-[#FFFBFC]",
        ring: "ring-[#FFD5E4]",
      };
  }
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;

  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [unlockedStepIndex, setUnlockedStepIndex] = useState(0);
  const [bgImage, setBgImage] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [vocabAudioUrl, setVocabAudioUrl] = useState<string>("");
  const [vocabAudioLoading, setVocabAudioLoading] = useState(false);

  // Trạng thái chung
  const [isGameDone, setIsGameDone] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // Logic Queue quà tặng
  const [rewardQueue, setRewardQueue] = useState<{ type: string; data: any }[]>(
    [],
  );
  const [currentReward, setCurrentReward] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const currentData = steps[currentStepIndex];
  const progress =
    steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  // Tự scroll tới step hiện tại trong sidebar/mobile stepper
  useEffect(() => {
    if (!steps.length) return;
    const t = window.setTimeout(() => {
      const sidebarBtn = document.querySelector<HTMLButtonElement>(
        `[data-sidebar-step="${currentStepIndex}"]`,
      );
      if (sidebarBtn) {
        sidebarBtn.scrollIntoView({ block: "nearest" });
      }

      const mobileBtn = document.querySelector<HTMLButtonElement>(
        `[data-mobile-step="${currentStepIndex}"]`,
      );
      if (mobileBtn) {
        mobileBtn.scrollIntoView({ block: "nearest", inline: "center" });
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [currentStepIndex, steps.length]);

  // Với dạng đọc bài, cho phép bấm "TIẾP TỤC" ngay
  useEffect(() => {
    if (!currentData) return;
    // Các màn "xem/đọc" không cần làm bài để qua bước
    if (
      currentData.type === "video" ||
      currentData.type === "reading" ||
      currentData.type === "vocab-intro" ||
      currentData.type === "vocab"
    ) {
      setIsGameDone(true);
      setStatus("correct");
    }
  }, [currentData, currentStepIndex]);

  useEffect(() => {
    const run = async () => {
      if (currentData?.type !== "vocab" || !currentData?.word) {
        setVocabAudioUrl("");
        return;
      }
      try {
        setVocabAudioLoading(true);
        const url = await dictionaryService.getFirstAudioUrl(String(currentData.word));
        setVocabAudioUrl(url || "");
      } finally {
        setVocabAudioLoading(false);
      }
    };
    run();
  }, [currentData?.type, currentData?.word]);

  const ReadingCard = ({ title, subtitle, items }: any) => {
    const normalizedItems: string[] = Array.isArray(items)
      ? items
          .map((it: any) => (typeof it === "string" ? it : JSON.stringify(it)))
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const callouts = normalizedItems.filter((s) =>
      /^(remember:|note:|tip:)/i.test(s),
    );
    const bullets = normalizedItems.filter(
      (s) => !/^(remember:|note:|tip:)/i.test(s),
    );
    const subtitleHtml = sanitizeHtml(String(subtitle || ""));

    return (
      <div className="w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur animate-in zoom-in">
        <div className="bg-[linear-gradient(90deg,#FFE7F0_0%,#E8F6FF_52%,#FFF5D9_100%)] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FF8DB3] text-white shadow-sm shrink-0">
              <BookOpen />
            </div>
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-[#D65086]">
                Đọc và ghi nhớ
              </div>
              <h3 className="mt-3 text-2xl font-black text-slate-900 leading-snug">
                {title}
              </h3>
              {subtitle && (
                <div
                  className="mt-2 text-sm text-slate-700 leading-relaxed [&_p]:m-0 [&_img]:block [&_img]:max-w-full [&_img]:w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:border-0 [&_img]:outline-none [&_img]:shadow-none [&_img]:ring-0 [&_img]:[clip-path:inset(0_0_0_1px)]"
                  dangerouslySetInnerHTML={{ __html: subtitleHtml }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {bullets.length > 0 && (
            <ul
              className={`${
                bullets.length >= 8 ? "columns-1 sm:columns-2" : ""
              }`}
            >
              {bullets.map((text, i) => (
                <li
                  key={i}
                  className="mb-3 break-inside-avoid rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm"
                >
                  <div className="flex gap-3">
                    <span className="mt-1.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EEF6FF] text-xs font-black text-[#2D79C7]">
                      {i + 1}
                    </span>
                    <div
                      className="min-w-0 [&_p]:m-0 [&_img]:mt-2 [&_img]:block [&_img]:max-w-full [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border-0 [&_img]:outline-none [&_img]:shadow-none [&_img]:ring-0 [&_img]:[clip-path:inset(0_0_0_1px)]"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {callouts.length > 0 && (
            <div className="mt-5 space-y-3">
              {callouts.map((text, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#FFE1A6] bg-[#FFF9E8] px-4 py-3 text-sm text-slate-800"
                >
                  <span className="font-extrabold text-[#C97A15]">Ghi nhớ:</span>{" "}
                  <span
                    className="[&_img]:block [&_img]:max-w-full [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border-0 [&_img]:outline-none [&_img]:shadow-none [&_img]:ring-0 [&_img]:[clip-path:inset(0_0_0_1px)]"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(text.replace(/^(remember:|note:|tip:)\s*/i, "")),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const VocabView = ({ data }: any) => {
    const playWordAudio = () => {
      if (!vocabAudioUrl) return;
      const audio = new Audio(vocabAudioUrl);
      void audio.play();
    };

    return (
      <div className="w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
        <div className="bg-[linear-gradient(135deg,#FFF1DC_0%,#FFF7EA_48%,#FFFDF7_100%)] px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-[#C97A15]">
            <Sparkles size={14} />
            Từ vựng mới
          </div>
        </div>
        <div className="p-6">
        {data?.image && (
          <img
            src={data.image}
            alt={data.word}
            className="mb-5 h-48 w-full rounded-[1.75rem] object-cover"
          />
        )}
        <div className="text-center">
          <div className="text-sm font-black uppercase tracking-widest text-slate-500">
            Vocabulary
          </div>
          <div className="mt-3 text-4xl sm:text-5xl font-black text-[#53629E]">
            {data?.word}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={playWordAudio}
              disabled={!vocabAudioUrl || vocabAudioLoading}
              className="group inline-flex items-center gap-2.5 rounded-full bg-transparent px-4 py-2.5 text-sm font-black text-[#365B93] transition hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-transparent text-[#4F7AC7] ring-1 ring-[#D8E8FF]">
                <Volume2 size={14} className="group-hover:scale-110 transition-transform" />
              </span>
              {vocabAudioLoading ? "Đang tải phát âm..." : "Nghe phát âm chuẩn"}
            </button>
          </div>
          {data?.ipa && (
            <div className="mt-3 inline-flex rounded-full bg-[#EEF6FF] px-3 py-1 text-sm font-extrabold text-slate-500">
              {data.ipa}
            </div>
          )}
          <div className="mt-4 rounded-[1.5rem] bg-[#FFF7E8] px-4 py-4 text-lg font-extrabold text-slate-700">
            {data?.meaning ||
              data?.definition ||
              "Nhấn TIẾP TỤC để sang từ tiếp theo."}
          </div>
        </div>
        </div>
      </div>
    );
  };

  const VocabIntro = ({ data }: any) => {
    return (
      <div className="w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
        <div className="bg-[linear-gradient(90deg,#EAF7FF_0%,#F5ECFF_52%,#FFF7E8_100%)] px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-[#53629E]">
            <Star size={14} />
            Sẵn sàng học
          </div>
        </div>
        <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#53629E] text-white shadow-sm shrink-0">
            <CheckCircle />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              Vocabulary
            </div>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {lessonTitle}
            </h2>
            {data?.subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>

        {Array.isArray(data?.tags) && data.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {data.tags.map((t: string) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Nhấn <span className="font-extrabold text-[#EB4C4C]">TIẾP TỤC</span> để
          bắt đầu học từng từ.
        </div>
        </div>
      </div>
    );
  };

  // 1. FETCH DATA & MAP
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const apiRes: any = await lessonService.getLessonById(lessonId);
        const apiData: any = apiRes?.data ?? apiRes;
        console.log("LESSON DETAIL raw:", apiRes);
        console.log("LESSON DETAIL normalized:", apiData);
        if (!apiData) return;

        setLessonTitle(toPlainText(apiData.title ?? apiData.name ?? "Bài học"));

        if (apiData.backgroundImage) {
          setBgImage(apiData.backgroundImage);
        }
        // Fallback: nếu backend chỉ có thumbnail
        if (!apiData.backgroundImage && apiData.thumbnail) {
          setBgImage(apiData.thumbnail);
        }

        const newSteps: any[] = [];
        const lessonType = normalizeLessonType(apiData);
        const rawContent = apiData.content ?? {};
        const content = normalizeContentBySchema(lessonType, rawContent, apiData);
        const contentType = normalizeContentType(content?.type, lessonType);

        // Vocabulary dạng object: content.words = [{ word, definition, ipa, ... }]
        if (
          contentType === "vocabulary" &&
          Array.isArray(content?.words) &&
          content.words.length > 0 &&
          typeof content.words[0] === "object"
        ) {
          newSteps.push({
            type: "vocab-intro",
            title: "Giới thiệu",
            subtitle:
              content?.description ?? content?.overview ?? apiData.description ?? "",
            tags: content?.tags ?? apiData.tags ?? [],
          });
          (content.words as any[]).forEach((w, i) => {
            const word = String(w?.word ?? "").trim();
            if (!word) return;
            newSteps.push({
              type: "vocab",
              title: `Từ vựng ${i + 1}/${content.words.length}`,
              word,
              meaning: w?.definition ?? w?.meaning ?? "",
              ipa: w?.ipa ?? "",
              image: apiData.thumbnail,
            });
          });
        }

        // A. VIDEO
        const videoUrl =
          apiData.videoUrl ?? apiData.videoURL ?? apiData.video?.url ?? apiData.video;
        const fallbackYoutubeUrl = extractFirstYoutubeUrl(
          apiData.description,
          rawContent?.description,
          rawContent?.video,
          rawContent?.lyrics,
          rawContent?.script,
          content?.description,
          content?.lyrics,
          content?.video,
          content?.script,
        );
        const embedUrl = toYoutubeEmbedUrl(String(videoUrl || fallbackYoutubeUrl || ""));
        if (embedUrl) {
          newSteps.unshift({
            type: "video",
            title: "Video bài giảng",
            src: embedUrl,
          });
        }

        // B. ACTIVITIES
        const activities =
          apiData.activities ??
          apiData.activity ??
          content?.activities ??
          apiData.lesson?.activities ??
          [];

        // Nếu đã build vocab steps từ content.words rồi thì bỏ qua activities-string fallback
        if (newSteps.length === 0 && Array.isArray(activities) && activities.length > 0) {
          // Case 1: activities là mảng string
          if (typeof activities[0] === "string") {
            const items = (activities as string[])
              .map((s) => String(s).trim())
              .filter(Boolean);

            // Chỉ coi là vocab khi lesson thật sự là vocabulary
            if (contentType === "vocabulary") {
              items.forEach((word, i) => {
                newSteps.push({
                  type: "vocab",
                  title: `Từ vựng ${i + 1}/${items.length}`,
                  word,
                  meaning: "",
                  image: apiData.thumbnail,
                });
              });
            } else {
              newSteps.push({
                type: "reading",
                title: "Nội dung",
                subtitle: content?.overview ?? apiData.description ?? "",
                items,
              });
            }
          } else {
            // Case 2: Activity objects như flow builder
            (activities as any[]).forEach((act: any) => {
            const type = act.type.toUpperCase();
            const data = act.data || act.config || {};

            // Map data tương tự code cũ của bạn...
            if (type === "VOCAB") {
              newSteps.push({ type: "vocab", title: "Học từ vựng", ...data });
            } else if (type === "FLASHCARD") {
              newSteps.push({
                type: "flashcard",
                title: "Lật thẻ tìm cặp",
                question: act.content || data.content,
                pairs: data.pairs || [],
              });
            } else if (["MULTIPLE_CHOICE", "QUIZ"].includes(type)) {
              newSteps.push({
                type: "quiz",
                title: "Trắc nghiệm",
                question: data.question,
                audio: data.audio,
                image: data.image,
                options: data.options || [],
              });
            } else if (type === "LISTENING") {
              newSteps.push({
                type: "listening",
                title: "Luyện Nghe",
                ...data,
                options: data.options || [],
              });
            } else if (["FILL_IN_BLANK", "SPELLING"].includes(type)) {
              newSteps.push({
                type: "spelling",
                title: "Chính tả",
                correctAnswers: data.correctAnswers || [data.correctAnswer],
                ...data,
              });
            } else if (type === "MATCHING") {
              newSteps.push({
                type: "matching",
                title: "Nối từ vựng",
                pairs: data.pairs || [],
              });
            } else if (["PRONUNCIATION", "SPEAKING"].includes(type)) {
              newSteps.push({
                type: "speaking",
                title: "Luyện phát âm",
                word: data.word || act.content,
                ...data,
              });
            }
            });
          }
        }

        // C. GRAMMAR / READING CONTENT
        // API grammar thường trả: overview (string), grammarRules (string[]),
        // examples (string[] | object[]), practiceIdeas (string[]), commonMistakes (string[])
        // Nếu có video ở trên, vẫn append các phần grammar để học tiếp.
        const toText = (v: any) => {
          if (typeof v === "string") return v.trim();
          if (!v || typeof v !== "object") return "";
          // Các shape phổ biến của example: { sentence, meaning } hoặc { en, vi }
          const a =
            v.sentence ??
            v.example ??
            v.en ??
            v.english ??
            v.text ??
            v.content;
          const b =
            v.meaning ??
            v.vi ??
            v.vietnamese ??
            v.translation ??
            v.note;
          if (a && b) return `${String(a).trim()} — ${String(b).trim()}`;
          if (a) return String(a).trim();
          return "";
        };

        const toQaItems = (arr: any[]): string[] => {
          if (!Array.isArray(arr)) return [];
          return arr
            .map((x: any) => {
              if (typeof x === "string") return x.trim();
              if (!x || typeof x !== "object") return "";
              const q =
                x?.question ??
                x?.prompt ??
                x?.title ??
                x?.content ??
                x?.text ??
                x?.ask;
              const a =
                x?.answer ??
                x?.sampleAnswer ??
                x?.expectedAnswer ??
                x?.response ??
                x?.result;
              const qText = toText(q);
              const aText = toText(a);
              if (qText && aText) return `${qText} — ${aText}`;
              if (qText) return qText;
              if (aText) return aText;
              return "";
            })
            .filter(Boolean);
        };

        const buildExerciseFallbackItems = (c: any): string[] => {
          const scalarKeys = [
            "instruction",
            "instructions",
            "prompt",
            "topic",
            "script",
            "task",
            "content",
            "text",
            "question",
            "sampleAnswer",
            "expectedAnswer",
          ];

          const collected = scalarKeys
            .map((k) => toText(c?.[k]))
            .filter(Boolean);

          if (Array.isArray(c?.prompts)) {
            collected.push(...c.prompts.map(toText).filter(Boolean));
          }
          if (Array.isArray(c?.instructions)) {
            collected.push(...c.instructions.map(toText).filter(Boolean));
          }

          return [...new Set(collected)];
        };

        const toSectionTitle = (key: string) => {
          const cleaned = String(key || "")
            .replace(/[_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .trim();
          if (!cleaned) return "Nội dung";
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        };

        if (contentType === "grammar") {
          const overview = content.description ?? apiData.description ?? "";
          if (overview) {
            newSteps.push({
              type: "reading",
              title: "Tổng quan",
              subtitle: String(overview),
              items: [],
            });
          }

          // Một số lesson grammar trả về rule dạng string thay vì grammarRules[]
          const legacyRules = Array.isArray(content.grammarRules)
            ? content.grammarRules.map(toText).filter(Boolean)
            : [];
          const mergedRules = [toText(content.rule), ...legacyRules].filter(Boolean);
          if (mergedRules.length) {
            newSteps.push({
              type: "reading",
              title: "Quy tắc",
              subtitle: "Ghi nhớ công thức chính",
              items: mergedRules,
            });
          }

          const explainVi = toText(content.explanation_vi);
          const explainEn = toText(content.explanation_en);
          if (explainVi || explainEn) {
            newSteps.push({
              type: "reading",
              title: "Giải thích",
              subtitle: explainVi || explainEn,
              items: explainVi && explainEn ? [explainEn] : [],
            });
          }

          const examples = Array.isArray(content.examples)
            ? content.examples.map(toText).filter(Boolean)
            : [];
          if (examples.length) {
            newSteps.push({
              type: "reading",
              title: "Ví dụ",
              subtitle: "Xem cách dùng trong câu",
              items: examples,
            });
          }

          const practice = Array.isArray(content.practiceIdeas)
            ? content.practiceIdeas.map(toText).filter(Boolean)
            : [];
          if (practice.length) {
            newSteps.push({
              type: "reading",
              title: "Luyện tập",
              subtitle: "Gợi ý luyện tập nhanh",
              items: practice,
            });
          }

          const mistakes = Array.isArray(content.commonMistakes)
            ? content.commonMistakes.map(toText).filter(Boolean)
            : [];
          if (mistakes.length) {
            newSteps.push({
              type: "reading",
              title: "Lỗi thường gặp",
              subtitle: "Tránh các lỗi này",
              items: mistakes,
            });
          }

          // Fallback cho payload grammar cũ/tùy biến: hiển thị các field còn lại chưa map.
          const usedGrammarKeys = new Set([
            "type",
            "description",
            "overview",
            "rule",
            "grammarRules",
            "explanation_vi",
            "explanation_en",
            "explanationVi",
            "explanationEn",
            "explain_vi",
            "explain_en",
            "explanation",
            "examples",
            "grammarExamples",
            "exampleSentences",
            "practiceIdeas",
            "commonMistakes",
            "mistakes",
            "common_mistakes",
            "tags",
          ]);

          Object.entries(content || {}).forEach(([key, rawValue]) => {
            if (usedGrammarKeys.has(key)) return;
            if (rawValue === undefined || rawValue === null) return;

            const keyLower = key.toLowerCase();
            if (keyLower === "id" || keyLower === "_id" || keyLower === "slug") return;

            let subtitle = "";
            let items: string[] = [];

            if (typeof rawValue === "string") {
              subtitle = toText(rawValue);
            } else if (Array.isArray(rawValue)) {
              items = rawValue.map(toText).filter(Boolean);
            } else if (typeof rawValue === "object") {
              const titleLike = toText((rawValue as any).title);
              const subtitleLike =
                toText((rawValue as any).subtitle) ||
                toText((rawValue as any).description) ||
                toText((rawValue as any).content) ||
                toText((rawValue as any).text);
              const listLike = Array.isArray((rawValue as any).items)
                ? (rawValue as any).items.map(toText).filter(Boolean)
                : [];

              if (titleLike && !subtitleLike && !listLike.length) {
                subtitle = titleLike;
              } else {
                subtitle = subtitleLike;
                items = listLike;
              }

              if (!subtitle && !items.length) {
                items = Object.entries(rawValue as Record<string, any>)
                  .map(([k, v]) => {
                    if (["title", "subtitle", "description", "content", "text", "items"].includes(k)) {
                      return "";
                    }
                    const txt = toText(v);
                    return txt ? `${toSectionTitle(k)}: ${txt}` : "";
                  })
                  .filter(Boolean);
              }
            }

            if (!subtitle && !items.length) return;

            newSteps.push({
              type: "reading",
              title: toSectionTitle(key),
              subtitle,
              items,
            });
          });
        }

        // E. DIRECT CONTENT TYPES theo schema (không cần activities)
        if (newSteps.length === 0 && contentType === "dialogue") {
          const items = [content.translation, content.audio ? `Audio: ${content.audio}` : ""]
            .map((s: any) => String(s || "").trim())
            .filter(Boolean);
          newSteps.push({
            type: "reading",
            title: "Hội thoại",
            subtitle: content.script || content.description || apiData.description || "",
            items,
          });
        }

        if (newSteps.length === 0 && contentType === "reading") {
          const qaItems = Array.isArray(content.questionsAndAnswers)
            ? content.questionsAndAnswers
                .map((x: any) => {
                  const q = String(x?.question || "").trim();
                  const a = String(x?.answer || "").trim();
                  return q && a ? `${q} — ${a}` : q || a;
                })
                .filter(Boolean)
            : [];
          newSteps.push({
            type: "reading",
            title: "Đọc hiểu",
            subtitle: content.passage || content.description || apiData.description || "",
            items: qaItems,
          });
        }

        if (newSteps.length === 0 && ["exercises", "quizzes", "reviews", "summaries", "games"].includes(contentType)) {
          const qaItems = toQaItems(content.questionsAndAnswers || []);
          const fallbackItems = buildExerciseFallbackItems(content);
          const mergedItems = qaItems.length ? qaItems : fallbackItems;
          newSteps.push({
            type: "reading",
            title: "Nội dung",
            subtitle:
              content.description ||
              toText(content.instruction) ||
              toText(content.prompt) ||
              apiData.description ||
              "",
            items: mergedItems,
          });
        }

        if (newSteps.length === 0 && contentType === "songs") {
          if (content.description) {
            newSteps.push({
              type: "reading",
              title: "Giới thiệu bài hát",
              subtitle: content.description,
              items: [],
            });
          }

          if (content.lyrics || content.translation) {
            newSteps.push({
              type: "reading",
              title: "Lời bài hát",
              subtitle: content.lyrics || "",
              items: content.translation ? [String(content.translation)] : [],
            });
          }

          if (Array.isArray(content.vocabulary) && content.vocabulary.length > 0) {
            const vocabItems = content.vocabulary
              .map((v: any) => {
                const word = String(v?.word || "").trim();
                const def = String(v?.definition || "").trim();
                if (!word) return "";
                return def ? `${word} — ${def}` : word;
              })
              .filter(Boolean);
            if (vocabItems.length) {
              newSteps.push({
                type: "reading",
                title: "Từ vựng trong bài",
                subtitle: "",
                items: vocabItems,
              });
            }
          }

          const qaItems = Array.isArray(content.questionsAndAnswers)
            ? content.questionsAndAnswers
                .map((x: any) => {
                  const q = String(x?.question || "").trim();
                  const a = String(x?.answer || "").trim();
                  return q && a ? `${q} — ${a}` : q || a;
                })
                .filter(Boolean)
            : [];
          if (qaItems.length) {
            newSteps.push({
              type: "reading",
              title: "Câu hỏi",
              subtitle: "Trả lời câu hỏi theo bài hát",
              items: qaItems,
            });
          }

          const songEmbedUrl = toYoutubeEmbedUrl(String(content.video || ""));
          if (songEmbedUrl) {
            newSteps.push({
              type: "video",
              title: "Video bài hát",
              src: songEmbedUrl,
            });
          }
        }

        // D. FALLBACK: lesson có content nhưng không có activities/video
        // Tránh fallback dạng "đọc bài" cho lesson vocabulary (đã có flow riêng)
        if (newSteps.length === 0 && contentType !== "vocabulary") {
          const subtitle =
            content?.overview ?? apiData.description ?? "Nội dung bài học";

          const collected: string[] = [];
          if (content && typeof content === "object") {
            Object.values(content).forEach((v: any) => {
              if (Array.isArray(v)) {
                v.forEach((x) => {
                  if (typeof x === "string") {
                    const s = x.trim();
                    if (s) collected.push(s);
                  }
                });
              }
            });
          }

          newSteps.push({
            type: "reading",
            title: "Nội dung bài học",
            subtitle,
            items: collected,
          });
        }
        let normalizedSteps = newSteps.map((s) => normalizeStepForDisplay(s));

        const hasVideoStep = normalizedSteps.some((s: any) => s?.type === "video" && s?.src);
        if (!hasVideoStep) {
          const linkFromSteps = normalizedSteps.map((s: any) => extractYoutubeFromStep(s)).find(Boolean) || "";
          const linkFromPayload = extractFirstYoutubeUrl(JSON.stringify(apiData || {}));
          const fallbackEmbed = toYoutubeEmbedUrl(linkFromSteps || linkFromPayload);
          if (fallbackEmbed) {
            normalizedSteps = [
              {
                type: "video",
                title: "Video bài giảng",
                src: fallbackEmbed,
              },
              ...normalizedSteps,
            ];
          }
        }

        const firstType = normalizedSteps?.[0]?.type;
        const autoDone =
          firstType === "reading" ||
          firstType === "vocab-intro" ||
          firstType === "vocab";

        setSteps(normalizedSteps);
        setCurrentStepIndex(0);
        setUnlockedStepIndex(0);
        setIsGameDone(autoDone);
        setStatus(autoDone ? "correct" : "idle");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  // 2. HÀM XỬ LÝ KHI LÀM BÀI
  const handleStepComplete = async (isCorrect: boolean) => {
    // a. Logic cơ bản
    setIsGameDone(true);
    setStatus(isCorrect ? "correct" : "wrong");
    setUnlockedStepIndex((prev) => Math.max(prev, currentStepIndex + 1));

    if (!isCorrect) console.log("⚠️ Bé làm sai bài này:", currentData);
  };

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setUnlockedStepIndex((prev) => Math.max(prev, currentStepIndex + 1));
      setCurrentStepIndex((prev) => prev + 1);
      setIsGameDone(false);
      setStatus("idle");
    } else {
      try {
        const res: any = await lessonService.completeLesson(lessonId);
        const queue = [];
        if (res.earned) queue.push({ type: "LESSON", data: res.earned });
        if (res.unitEarned) queue.push({ type: "UNIT", data: res.unitEarned });
        if (res.courseEarned)
          queue.push({ type: "COURSE", data: res.courseEarned });

        setRewardQueue(queue);
        if (queue.length > 0) setCurrentReward(queue[0]);
        else setIsCompleted(true);
      } catch (e) {
        console.error(e);
        setIsCompleted(true);
      }
    }
  };

  const handleCloseReward = () => {
    const nextQueue = rewardQueue.slice(1);
    setRewardQueue(nextQueue);
    if (nextQueue.length > 0) setCurrentReward(nextQueue[0]);
    else router.back();
  };

  // Render Popup Quà
  if (currentReward) {
    return (
      <RewardPopup
        type={currentReward.type as any}
        data={currentReward.data}
        onClose={handleCloseReward}
      />
    );
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#FFF6FB_0%,#F4FAFF_45%,#FFFCEE_100%)]">
        <div className="rounded-[2rem] bg-white/90 px-8 py-6 shadow-primary-card">
          <div className="flex items-center gap-3 text-[#53629E]">
            <Loader2 className="animate-spin" />
            <span className="text-lg font-black">Đang tải bài học...</span>
          </div>
        </div>
      </div>
    );
  if (steps.length === 0)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#FFF6FB_0%,#F4FAFF_45%,#FFFCEE_100%)] p-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/95 p-8 text-center shadow-primary-card">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[1.5rem] bg-[#53629E] text-white">
            <XCircle />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            Bài học trống
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Bài học này hiện chưa có nội dung. Bạn có thể quay lại và chọn bài
            khác.
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 rounded-2xl bg-[#EB4C4C] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#D94444]"
          >
            Quay lại
          </button>
        </div>
      </div>
    );

  if (isCompleted) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 animate-in zoom-in"
        style={{
          background: `url(${SHARED_BG}) center/cover no-repeat fixed`,
        }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <Confetti recycle={false} numberOfPieces={500} />
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 p-8 text-center shadow-primary-card">
          <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#FF9BC2_0%,#6BCBFF_50%,#FFD166_100%)]" />
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(135deg,#FFD166_0%,#FFB84D_100%)] text-white shadow-lg">
            <Trophy size={36} />
          </div>
          <div className="text-sm font-black uppercase tracking-[0.28em] text-[#D65086]">
            Xuất sắc
          </div>
          <h1 className="mt-3 text-3xl font-black text-[#53629E]">
            Hoàn thành bài học!
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Bé đã đi hết hành trình của bài này. Nghỉ một chút rồi tiếp tục chinh
            phục bài học mới nhé.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#FF8A65] px-8 py-3 font-extrabold text-white shadow-lg transition hover:bg-[#F9734E]"
          >
            Về bản đồ
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const stepTheme = getStepTheme(currentData?.type ?? "reading");
  const canContinue = isGameDone || currentData.type === "video";

  return (
    <div
      className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFF6FB_0%,#F4FAFF_42%,#FFFCEE_100%)]"
      style={{
        backgroundImage: bgImage
          ? `radial-gradient(circle at top left, rgba(255,233,242,0.92), transparent 30%), radial-gradient(circle at top right, rgba(219,242,255,0.92), transparent 28%), linear-gradient(180deg, rgba(255,246,251,0.92) 0%, rgba(244,250,255,0.95) 42%, rgba(255,252,238,0.96) 100%), url(${bgImage})`
          : undefined,
        backgroundSize: bgImage ? "auto, auto, auto, cover" : undefined,
        backgroundPosition: bgImage ? "top left, top right, center, center" : undefined,
      }}
    >
      <div className="pointer-events-none absolute left-[-40px] top-24 h-40 w-40 rounded-full bg-white/55 blur-2xl" />
      <div className="pointer-events-none absolute right-[-30px] top-44 h-44 w-44 rounded-full bg-[#FFE7A3]/45 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(255,181,214,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_28%)]" />

      {/* HEADER */}
      <div className="sticky top-0 z-30 w-full border-b border-white/70 bg-white/75 p-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 md:px-8">
          <button
            onClick={() => router.back()}
            className="rounded-2xl bg-white p-2 text-[#53629E] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <X />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              <div className="inline-flex items-center gap-2">
                <Sparkles size={14} className="text-[#D65086]" />
                Bài học
              </div>
              <div>
                {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
              </div>
            </div>
            <div className="mt-1 truncate text-base font-black text-slate-900">
              {lessonTitle || "Bài học"}
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full bg-[linear-gradient(90deg,#FF97B7_0%,#62B6FF_58%,#7CCF63_100%)] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative flex w-full flex-1 flex-col pb-28">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <div className="pt-6">
            <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-primary-card backdrop-blur">
              <div className="grid gap-4 px-6 py-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-slate-700 bg-white shadow-sm">
                    <span className={`rounded-full px-2.5 py-1 ${stepTheme.tint}`}>
                      {stepTheme.badge}
                    </span>
                    Buoc {Math.min(currentStepIndex + 1, steps.length)}
                  </div>
                  <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
                    {currentData?.title || lessonTitle || "Bài học"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Học từng bước nhỏ, hoàn thành từng nhiệm vụ và mở khóa phần
                    tiếp theo. Mỗi tiến bộ đều rất đáng khen.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[1.5rem] bg-[#FFF2E8] px-4 py-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#C97A15]">
                      Tiến độ
                    </div>
                    <div className="mt-2 text-3xl font-black text-slate-900">
                      {Math.round(progress)}%
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#EEF7FF] px-4 py-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2D79C7]">
                      Đang học
                    </div>
                    <div className="mt-2 text-3xl font-black text-slate-900">
                      {currentStepIndex + 1}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#FFF8DD] px-4 py-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#BE8A14]">
                      Ngôi sao
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-2xl font-black text-slate-900">
                      <Star size={20} className="fill-[#FFD166] text-[#FFD166]" />
                      {currentStepIndex + (isGameDone ? 1 : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[290px_1fr] lg:gap-8">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-[96px] space-y-3">
                <div className="rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-primary-card backdrop-blur">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Hành trình bài học
                  </div>
                  <div className="mt-2 text-lg font-black text-slate-900">
                    {currentData?.title}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
                  </div>
                  <div className="mt-4 rounded-[1.5rem] bg-[#F8FAFC] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Mục tiêu
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      Hoàn thành bước hiện tại để mở khóa phần tiếp theo trong bài
                      học.
                    </div>
                  </div>
                  <button
                    onClick={() => router.back()}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-[#53629E] shadow-sm transition hover:bg-slate-50"
                  >
                    Quay lại
                  </button>
                </div>

                {steps.length > 1 && (
                  <div className="rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-primary-card backdrop-blur">
                    <div className="max-h-[320px] overflow-auto space-y-2 pr-1">
                      {steps.map((s: any, i: number) => {
                        const locked = i > unlockedStepIndex;
                        const active = i === currentStepIndex;
                        const itemTheme = getStepTheme(s.type);
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (locked) return;
                              setCurrentStepIndex(i);
                              setIsGameDone(false);
                              setStatus("idle");
                            }}
                            disabled={locked}
                            aria-disabled={locked}
                            className={`w-full rounded-[1.35rem] border px-3 py-3 text-left transition ${
                              active
                                ? "border-[#53629E] bg-[#EEF3FF]"
                                : locked
                                  ? "cursor-not-allowed border-slate-200 bg-white opacity-70"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                            data-sidebar-step={i}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`grid h-7 w-7 place-items-center rounded-xl text-[11px] font-black ${
                                  active
                                    ? "bg-[#53629E] text-white"
                                    : `${itemTheme.tint}`
                                }`}
                              >
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-extrabold text-slate-800">
                                  {s.title || s.type}
                                </div>
                                <div className="mt-0.5 text-[11px] font-bold text-slate-500">
                                  {itemTheme.badge}
                                </div>
                              </div>
                              {locked && (
                                <Lock size={14} className="text-slate-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-sm transition ${
                    canContinue
                      ? "bg-[#FF8A65] hover:bg-[#F9734E]"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  Tiếp tục
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0">
              {/* Stepper (mobile) */}
              {steps.length > 1 && (
                <div className="sticky top-[72px] z-20 -mx-4 border-b border-white/70 bg-white/85 px-4 py-3 backdrop-blur md:-mx-8 md:top-[76px] md:px-8 lg:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {steps.map((s: any, i: number) => {
                      const locked = i > unlockedStepIndex;
                      const active = i === currentStepIndex;
                      const itemTheme = getStepTheme(s.type);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (locked) return;
                            setCurrentStepIndex(i);
                            setIsGameDone(false);
                            setStatus("idle");
                          }}
                          disabled={locked}
                          aria-disabled={locked}
                          className={`shrink-0 rounded-[1.25rem] border px-3 py-2.5 text-left transition ${
                            active
                              ? "border-[#53629E] bg-[#EEF3FF]"
                              : locked
                                ? "cursor-not-allowed border-slate-200 bg-white opacity-70"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                          data-mobile-step={i}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`grid h-6 w-6 place-items-center rounded-lg text-[11px] font-black ${
                                active
                                  ? "bg-[#53629E] text-white"
                                  : `${itemTheme.tint}`
                              }`}
                            >
                              {i + 1}
                            </span>
                            <div className="max-w-[220px]">
                              <div className="truncate text-xs font-extrabold text-slate-800">
                                {s.title || s.type}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                {itemTheme.badge}
                              </div>
                            </div>
                            {locked && (
                              <Lock size={14} className="text-slate-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-5">
                <div
                  className={`overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-b ${stepTheme.panel} p-4 shadow-primary-card ring-1 ${stepTheme.ring} md:p-6`}
                >
                  <div className="mb-5 flex flex-col gap-3 rounded-[1.5rem] bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.22em] ${stepTheme.tint}`}>
                        {stepTheme.badge}
                      </div>
                      <div className="mt-3 text-2xl font-black text-slate-900">
                        {currentData.title}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-600">
                      {canContinue
                        ? "Bạn đã sẵn sàng sang bước tiếp theo."
                        : "Hãy hoàn thành phần này trước nhé."}
                    </div>
                  </div>

                  {currentData.type === "video" && (
                    <div className="overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-xl">
                      <div className="aspect-video w-full">
                        <iframe
                          src={currentData.src}
                          className="h-full w-full"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  {currentData.type === "vocab-intro" && (
                    <VocabIntro data={currentData} />
                  )}
                  {currentData.type === "vocab" && <VocabView data={currentData} />}
                  {currentData.type === "flashcard" && (
                    <FlashcardGame
                      data={{
                        content: currentData.question || "Tìm cặp tương ứng",
                        pairs: currentData.pairs || [],
                      }}
                      onFinish={(isCorrect) => handleStepComplete(isCorrect)}
                    />
                  )}
                  {currentData.type === "quiz" && (
                    <QuizGame data={currentData} onFinish={handleStepComplete} />
                  )}
                  {currentData.type === "listening" && (
                    <ListeningGame data={currentData} onFinish={handleStepComplete} />
                  )}
                  {currentData.type === "spelling" && (
                    <SpellingGame data={currentData} onFinish={handleStepComplete} />
                  )}
                  {currentData.type === "matching" && (
                    <MatchingGame
                      data={currentData.pairs}
                      onFinish={() => handleStepComplete(true)}
                    />
                  )}
                  {currentData.type === "speaking" && (
                    <PronounceGame
                      data={currentData}
                      onSuccess={() => handleStepComplete(true)}
                    />
                  )}
                  {currentData.type === "reading" && (
                    <ReadingCard
                      title={currentData.title}
                      subtitle={currentData.subtitle}
                      items={currentData.items}
                    />
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="rounded-[1.5rem] border border-white/80 bg-white/80 px-4 py-4 text-sm text-slate-600 shadow-sm">
                    <div className="flex items-center gap-2 font-black text-slate-800">
                      <Play size={16} className="text-[#FF8A65]" />
                      Hướng dẫn nhanh
                    </div>
                    <p className="mt-2 leading-6">
                      Học xong bước hiện tại, nhấn <span className="font-extrabold text-[#FF8A65]">Tiếp tục</span> để đi tiếp.
                      Nếu muốn xem lại, bé có thể bấm vào bước đã mở khóa trong danh sách.
                    </p>
                  </div>
                  <div className="hidden items-center justify-end lg:flex">
                    <button
                      onClick={handleNext}
                      disabled={!canContinue}
                      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition ${
                        canContinue
                          ? "bg-[#FF8A65] hover:bg-[#F9734E]"
                          : "cursor-not-allowed bg-gray-300"
                      }`}
                    >
                      Tiếp tục
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Continue button (mobile) */}
                <div className="mt-4 flex justify-end lg:hidden">
                  <button
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-sm transition ${
                      canContinue
                        ? "bg-[#FF8A65] hover:bg-[#F9734E]"
                        : "cursor-not-allowed bg-gray-300"
                    }`}
                  >
                    Tiếp tục
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

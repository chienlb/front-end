"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Loader2, CheckCircle, XCircle, Lock } from "lucide-react";
import Confetti from "react-confetti";

import MatchingGame from "@/components/student/games/MatchingGame";
import PronounceGame from "@/components/student/games/PronounceGame";
import ListeningGame from "@/components/student/games/ListeningGame";
import SpellingGame from "@/components/student/games/SpellingGame";
import QuizGame from "@/components/student/games/QuizGame";
import FlashcardGame from "@/components/student/games/FlashcardGame";
import RewardPopup from "@/components/student/RewardPopup";

import { lessonService } from "@/services/lessons.service";

const SHARED_BG =
  "/images/3d-illustration-world-book-day-celebration/10444286.jpg";

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

  // Trạng thái chung
  const [isGameDone, setIsGameDone] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

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
      currentData.type === "reading" ||
      currentData.type === "vocab-intro" ||
      currentData.type === "vocab"
    ) {
      setIsGameDone(true);
      setStatus("correct");
    }
  }, [currentData?.type, currentStepIndex]);

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

    return (
      <div className="w-full rounded-3xl border border-slate-200 bg-white/92 p-6 shadow-xl backdrop-blur animate-in zoom-in">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#53629E] text-white shadow-sm shrink-0">
            <CheckCircle />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-900 leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {bullets.length > 0 && (
          <ul
            className={`mt-5 ${
              bullets.length >= 8 ? "columns-1 sm:columns-2" : ""
            }`}
          >
            {bullets.map((text, i) => (
              <li
                key={i}
                className="break-inside-avoid mb-2 flex gap-2 text-sm leading-relaxed text-slate-800"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#53629E]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}

        {callouts.length > 0 && (
          <div className="mt-5 space-y-2">
            {callouts.map((text, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                <span className="font-extrabold text-[#53629E]">Ghi nhớ:</span>{" "}
                {text.replace(/^(remember:|note:|tip:)\s*/i, "")}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const VocabView = ({ data }: any) => {
    return (
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {data?.image && (
          <img
            src={data.image}
            alt={data.word}
            className="mb-5 h-44 w-full rounded-3xl object-cover"
          />
        )}
        <div className="text-center">
          <div className="text-sm font-black uppercase tracking-widest text-slate-500">
            Vocabulary
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-[#53629E]">
            {data?.word}
          </div>
          {data?.ipa && (
            <div className="mt-2 text-sm font-extrabold text-slate-500">
              {data.ipa}
            </div>
          )}
          <div className="mt-3 text-lg font-extrabold text-slate-700">
            {data?.meaning ||
              data?.definition ||
              "Nhấn TIẾP TỤC để sang từ tiếp theo."}
          </div>
        </div>
      </div>
    );
  };

  const VocabIntro = ({ data }: any) => {
    return (
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#53629E] text-white shadow-sm shrink-0">
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

        setLessonTitle(apiData.title ?? apiData.name ?? "Bài học");

        if (apiData.backgroundImage) {
          setBgImage(apiData.backgroundImage);
        }
        // Fallback: nếu backend chỉ có thumbnail
        if (!apiData.backgroundImage && apiData.thumbnail) {
          setBgImage(apiData.thumbnail);
        }

        const newSteps: any[] = [];
        const lessonType = String(
          apiData.type ?? apiData.skillFocus ?? "",
        ).toLowerCase();
        const content = apiData.content ?? {};

        // Vocabulary dạng object: content.words = [{ word, definition, ipa, ... }]
        if (
          ["vocabulary", "vocab"].includes(lessonType) &&
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
        if (videoUrl) {
          let embedUrl = String(videoUrl);
          if (embedUrl.includes("watch?v="))
            embedUrl = embedUrl.replace("watch?v=", "embed/");
          if (embedUrl.includes("youtu.be/"))
            embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");

          newSteps.push({
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
            if (["vocabulary", "vocab"].includes(lessonType)) {
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

        if (lessonType === "grammar") {
          const overview =
            content.overview ?? content.description ?? apiData.description ?? "";
          if (overview) {
            newSteps.push({
              type: "reading",
              title: "Tổng quan",
              subtitle: String(overview),
              items: [],
            });
          }

          // Một số lesson grammar trả về rule dạng string thay vì grammarRules[]
          const ruleText = toText(content.rule);
          const rules = Array.isArray(content.grammarRules)
            ? content.grammarRules.map(toText).filter(Boolean)
            : [];
          const mergedRules = [
            ...(ruleText ? [ruleText] : []),
            ...rules,
          ].filter(Boolean);
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
        }

        // D. FALLBACK: lesson có content nhưng không có activities/video
        // Tránh fallback dạng "đọc bài" cho lesson vocabulary (đã có flow riêng)
        if (newSteps.length === 0 && !["vocabulary", "vocab"].includes(lessonType)) {
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
        const firstType = newSteps?.[0]?.type;
        const autoDone =
          firstType === "reading" ||
          firstType === "vocab-intro" ||
          firstType === "vocab";

        setSteps(newSteps);
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
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#53629E]" />
      </div>
    );
  if (steps.length === 0)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#53629E] text-white">
            <XCircle />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
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
        className="min-h-screen flex flex-col items-center justify-center p-4 animate-in zoom-in"
        style={{
          background: `url(${SHARED_BG}) center/cover no-repeat fixed`,
        }}
      >
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />
        <Confetti recycle={false} numberOfPieces={500} />
        <h1 className="relative text-3xl font-black text-[#53629E] mb-2">
          🎉 HOÀN THÀNH XUẤT SẮC!
        </h1>
        <button
          onClick={() => router.back()}
          className="relative bg-[#EB4C4C] text-white px-8 py-3 rounded-2xl font-extrabold shadow-lg hover:bg-[#D94444] transition"
        >
          Về bản đồ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <div className="w-full bg-white/85 backdrop-blur p-4 sticky top-0 z-20 border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#53629E] hover:bg-slate-100 p-2 rounded-2xl transition"
          >
            <X />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm font-extrabold text-slate-900">
                {lessonTitle || "Bài học"}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
              </div>
            </div>
            <div className="mt-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#EB4C4C] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 w-full pb-28 flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-8">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-[96px] space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Nội dung bài học
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {currentData?.title}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {Math.min(currentStepIndex + 1, steps.length)}/{steps.length || 0}
                  </div>
                  <button
                    onClick={() => router.back()}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-[#53629E] shadow-sm transition hover:bg-slate-50"
                  >
                    Quay lại
                  </button>
                </div>

                {steps.length > 1 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="max-h-[260px] overflow-auto space-y-2 pr-1">
                      {steps.map((s: any, i: number) => {
                        const locked = i > unlockedStepIndex;
                        const active = i === currentStepIndex;
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
                            className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                              active
                                ? "border-[#53629E] bg-[#53629E]/10"
                                : locked
                                  ? "border-slate-200 bg-white opacity-70 cursor-not-allowed"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                    data-sidebar-step={i}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`grid h-5 w-5 place-items-center rounded-lg text-[11px] font-black ${
                                  active
                                    ? "bg-[#53629E] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {i + 1}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-xs font-extrabold text-slate-800">
                                {s.title || s.type}
                              </span>
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
                  disabled={!isGameDone}
                  className={`w-full rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition ${
                    isGameDone
                      ? "bg-[#EB4C4C] hover:bg-[#D94444]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  TIẾP TỤC
                </button>
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0">
              {/* Stepper (mobile) */}
              {steps.length > 1 && (
                <div className="lg:hidden sticky top-[72px] md:top-[76px] z-10 -mx-4 md:-mx-8 px-4 md:px-8 py-2 bg-white/90 backdrop-blur border-b border-slate-200">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {steps.map((s: any, i: number) => {
                      const locked = i > unlockedStepIndex;
                      const active = i === currentStepIndex;
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
                          className={`shrink-0 rounded-2xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-[#53629E] bg-[#53629E]/10"
                              : locked
                                ? "border-slate-200 bg-white opacity-70 cursor-not-allowed"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                          data-mobile-step={i}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`grid h-5 w-5 place-items-center rounded-lg text-[11px] font-black ${
                                active
                                  ? "bg-[#53629E] text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <span className="max-w-[220px] truncate text-xs font-extrabold text-slate-800">
                              {s.title || s.type}
                            </span>
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
                {/* Render Game Content */}
                {currentData.type === "video" && (
                  <div
                    className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl"
                    onEnded={() => setIsGameDone(true)}
                  >
                    <iframe
                      src={currentData.src}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
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

                {/* Continue button (mobile) */}
                <div className="mt-4 flex justify-end lg:hidden">
                  <button
                    onClick={handleNext}
                    disabled={!isGameDone}
                    className={`rounded-2xl px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition ${
                      isGameDone
                        ? "bg-[#EB4C4C] hover:bg-[#D94444]"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    TIẾP TỤC
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

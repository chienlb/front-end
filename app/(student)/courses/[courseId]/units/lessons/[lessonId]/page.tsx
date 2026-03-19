"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import Confetti from "react-confetti";
import { courseService } from "@/services/course.service";

// --- IMPORT TẤT CẢ CÁC GAME ---
import MatchingGame from "@/components/student/games/MatchingGame";
import PronounceGame from "@/components/student/games/PronounceGame";
import ListeningGame from "@/components/student/games/ListeningGame";
import SpellingGame from "@/components/student/games/SpellingGame";
import QuizGame from "@/components/student/games/QuizGame";
import VocabCard from "@/components/student/games/VocabCard";
import FlashcardGame from "@/components/student/games/FlashcardGame";
import RewardPopup from "@/components/student/RewardPopup";

// 1. IMPORT PET HELPER
import PetHelper from "@/components/student/PetHelper";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;

  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bgImage, setBgImage] = useState<string>("");

  // Trạng thái chung
  const [isGameDone, setIsGameDone] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // State cảm xúc của Pet
  const [gameStatus, setGameStatus] = useState<"IDLE" | "CORRECT" | "WRONG">(
    "IDLE",
  );

  // Logic Queue quà tặng
  const [rewardQueue, setRewardQueue] = useState<{ type: string; data: any }[]>(
    [],
  );
  const [currentReward, setCurrentReward] = useState<{
    type: string;
    data: any;
  } | null>(null);

  // 1. FETCH DATA & MAP
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const apiData = await courseService.getLesson(lessonId);
        if (!apiData) return;

        if (apiData.backgroundImage) {
          setBgImage(apiData.backgroundImage);
        }

        const newSteps: any[] = [];

        // A. VIDEO
        if (apiData.videoUrl) {
          let embedUrl = apiData.videoUrl;
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
        if (apiData.activities) {
          apiData.activities.forEach((act: any) => {
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
        setSteps(newSteps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const currentData = steps[currentStepIndex];
  const progress =
    steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  // 2. HÀM XỬ LÝ KHI LÀM BÀI
  const handleStepComplete = async (isCorrect: boolean) => {
    // a. Logic cơ bản
    setIsGameDone(true);
    setStatus(isCorrect ? "correct" : "wrong");

    // b. Điều khiển Pet: Vui hay Buồn
    if (isCorrect) {
      setGameStatus("CORRECT");
      // Sau 2.5s thì Pet quay về trạng thái bình thường
      setTimeout(() => setGameStatus("IDLE"), 2500);
    } else {
      setGameStatus("WRONG");
      setTimeout(() => setGameStatus("IDLE"), 2500);

      // Log lỗi nếu cần
      console.log("⚠️ Bé làm sai bài này:", currentData);
    }
  };

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setIsGameDone(false);
      setStatus("idle");
      setGameStatus("IDLE"); // Reset pet khi qua bài mới
    } else {
      try {
        const res: any = await courseService.completeLesson(lessonId);
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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (steps.length === 0)
    return <div className="p-10 text-center">Bài học trống.</div>;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 animate-in zoom-in">
        <Confetti recycle={false} numberOfPieces={500} />
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          🎉 HOÀN THÀNH XUẤT SẮC!
        </h1>
        <button
          onClick={() => router.back()}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition"
        >
          Về bản đồ
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center relative overflow-hidden transition-all duration-500"
      style={{
        // Nếu có ảnh -> dùng ảnh (cover). Nếu không -> dùng màu xám mặc định (slate-100)
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat fixed`
          : "#f1f5f9",
      }}
    >
      {/* Lớp phủ mờ */}
      {bgImage && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0"></div>
      )}
      {/* HEADER */}
      <div className="w-full bg-white p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition"
          >
            <X />
          </button>
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 w-full max-w-2xl p-4 pb-32 flex flex-col justify-center z-10">
        <h2 className="text-center text-gray-500 text-sm font-bold uppercase tracking-widest mb-6 animate-fade-in">
          {currentData.title}
        </h2>

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
        {currentData.type === "vocab" && (
          <VocabCard
            data={currentData}
            onFinish={() => handleStepComplete(true)}
          />
        )}
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
      </div>

      {/* 3. NHÚNG PET COMPONENT */}
      <div className="fixed bottom-24 left-4 z-20 pointer-events-none hidden md:block">
        {/* pointer-events-none để không chặn click nếu pet che mất nút */}
        <PetHelper status={gameStatus} />
      </div>

      {/* (Mobile) Pet nhỏ hơn nằm góc trên trái */}
      <div className="fixed top-16 left-2 z-20 md:hidden scale-75 origin-top-left pointer-events-none">
        <PetHelper status={gameStatus} />
      </div>

      {/* FOOTER */}
      <div
        className={`fixed bottom-0 left-0 w-full p-4 border-t transition-colors z-30 ${isGameDone ? "bg-green-50 border-green-200" : "bg-white border-slate-200"}`}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            {isGameDone ? (
              <div className="text-green-700 font-bold text-xl flex items-center gap-2 animate-bounce">
                <CheckCircle /> Chính xác!
              </div>
            ) : (
              <div className="text-slate-400 font-medium text-sm">
                Hãy hoàn thành bài tập...
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={
              !isGameDone &&
              currentData.type !== "video" &&
              currentData.type !== "vocab"
            }
            className={`px-8 py-3 rounded-2xl font-bold shadow-lg transition text-white flex items-center gap-2 ${isGameDone || currentData.type === "video" || currentData.type === "vocab" ? "bg-green-600 hover:bg-green-700 hover:scale-105 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
          >
            TIẾP TỤC
          </button>
        </div>
      </div>
    </div>
  );
}

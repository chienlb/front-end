"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { userService } from "@/services/user.service";
import { Star, Trophy, Lock, Play } from "lucide-react";
import LottiePet from "@/components/student/ui/LottiePet";

const DEFAULT_BG = "linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const router = useRouter();

  // --- STATE ---
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [currentPetPosition, setCurrentPetPosition] = useState<string | null>(
    null,
  );
  const [equippedPetData, setEquippedPetData] = useState<any>(null);
  const [activeBg, setActiveBg] = useState<string>(DEFAULT_BG);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. FETCH DATA & MAP
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. GET USER (PET)
        try {
          const user = await userService.getProfile();
          setEquippedPetData(
            user?.data?.equippedPet || user?.equippedPet || null,
          );
        } catch {}

        // B. GET TREE
        const treeData = await courseService.getTree(courseId);

        // 1. Sort Units
        const sortedUnits = (treeData?.units || []).sort(
          (a: any, b: any) => (a.order || 0) - (b.order || 0),
        );

        let foundActiveLesson = false;
        let petLocationId: string | null = null;
        let lastCompletedLessonId: string | null = null;

        // 2. Map Data
        const mappedZones = sortedUnits.map((unit: any, uIndex: number) => {
          const sortedLessons = (unit.lessons || []).sort(
            (a: any, b: any) => (a.order || 0) - (b.order || 0),
          );

          const mappedLessons = sortedLessons.map((lesson: any) => {
            const rawStatus = lesson.status
              ? String(lesson.status).toLowerCase().trim()
              : "locked";

            let status = "locked";
            if (["completed", "finished", "passed"].includes(rawStatus)) {
              status = "completed";
            } else if (
              ["unlocked", "active", "in_progress"].includes(rawStatus)
            ) {
              status = "unlocked";
            }

            if (status === "completed") {
              lastCompletedLessonId = lesson._id;
            }

            if (status === "unlocked" && !foundActiveLesson) {
              petLocationId = lesson._id;
              foundActiveLesson = true;
            }

            return {
              id: lesson._id,
              originalId: lesson._id,
              title: lesson.title,
              status: status,
            };
          });

          return {
            id: unit._id || `unit_${uIndex}`,
            title: unit.title,
            bgImage: unit.backgroundImage,
            lessons: mappedLessons,
          };
        });

        if (!petLocationId && lastCompletedLessonId) {
          petLocationId = lastCompletedLessonId;
        }

        setZones(mappedZones);
        setCurrentPetPosition(petLocationId);

        if (mappedZones.length > 0 && mappedZones[0].bgImage) {
          const bg = mappedZones[0].bgImage;
          setActiveBg(bg.startsWith("http") ? `url("${bg}")` : bg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // 2. AUTO SCROLL
  useEffect(() => {
    if (!loading && currentPetPosition) {
      const el = document.getElementById(`lesson-${currentPetPosition}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, currentPetPosition]);

  // 3. OBSERVER BACKGROUND
  useEffect(() => {
    if (!zones.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bg = entry.target.getAttribute("data-bg");
            if (bg) setActiveBg(bg.includes("gradient") ? bg : `url("${bg}")`);
          }
        });
      },
      { threshold: 0.3 },
    );

    unitRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [zones]);

  const handleStartLearning = () => {
    if (selectedLesson) {
      router.push(
        `/courses/${courseId}/units/lessons/${selectedLesson.originalId}`,
      );
    }
  };

  // 4. DRAW PATH SVG
  const renderCurvedPath = (lessonCount: number) => {
    const NODE_HEIGHT = 80;
    const GAP = 40;
    const CONTAINER_WIDTH = 400;
    const CENTER_X = CONTAINER_WIDTH / 2;
    const OFFSET_X = 75;
    const getNodeX = (i: number) =>
      i % 2 === 0 ? 0 : i % 4 === 1 ? -OFFSET_X : OFFSET_X;

    let pathD = "";
    for (let i = 0; i < lessonCount - 1; i++) {
      const currentX = CENTER_X + getNodeX(i);
      const currentY = NODE_HEIGHT / 2 + i * (NODE_HEIGHT + GAP);
      const nextX = CENTER_X + getNodeX(i + 1);
      const nextY = NODE_HEIGHT / 2 + (i + 1) * (NODE_HEIGHT + GAP);
      if (i === 0) pathD += `M ${currentX} ${currentY} `;
      pathD += `C ${currentX} ${currentY + 50}, ${nextX} ${nextY - 50}, ${nextX} ${nextY} `;
    }
    const svgHeight = lessonCount * (NODE_HEIGHT + GAP);

    return (
      <svg
        className="absolute top-[40px] left-0 w-full h-full z-0 pointer-events-none overflow-visible"
        width={CONTAINER_WIDTH}
        height={svgHeight}
      >
        <path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="12 12"
        />
      </svg>
    );
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-blue-500 font-bold text-xl">
        ⏳ Đang tải bản đồ...
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-40 font-sans bg-[#f0fdf4]">
      {/* CSS Styles for Animations (Wiggle & PopIn) */}
      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-wiggle {
          animation: wiggle 3s infinite;
        }
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .bg-pattern {
          background-image:
            radial-gradient(#dcfce7 15%, transparent 16%),
            radial-gradient(#dcfce7 15%, transparent 16%);
          background-size: 60px 60px;
          background-position:
            0 0,
            30px 30px;
        }
      `}</style>

      {/* Background Layer */}
      <div
        className="fixed inset-0 z-0 transition-[background-image] duration-500 ease-in-out bg-pattern"
        style={{
          backgroundImage: activeBg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 h-[70px] bg-white/90 backdrop-blur-md z-50 flex items-center justify-between px-5 border-b-4 border-slate-200 shadow-sm">
          <Link
            href="/courses"
            className="font-extrabold text-slate-500 text-lg transition-transform hover:scale-110 hover:text-blue-500"
          >
            ← Quay lại
          </Link>
          <div className="font-black text-slate-700 uppercase tracking-widest text-lg">
            Bản Đồ
          </div>
          <div className="flex gap-2 font-extrabold bg-white px-3 py-1 rounded-full border-b-4 border-slate-200 text-slate-600 text-sm">
            <Trophy size={16} className="text-blue-400 fill-blue-400" /> VIP
          </div>
        </div>

        {/* Map Wrapper */}
        <div className="mt-[100px] flex flex-col items-center w-full">
          {zones.map((zone, index) => (
            <div
              key={zone.id}
              ref={(el) => {
                unitRefs.current[index] = el;
              }}
              data-bg={zone.bgImage || DEFAULT_BG}
              className="w-full max-w-[400px] py-16 rounded-[3rem] mb-16 relative overflow-visible bg-white/25 backdrop-blur-md border-4 border-white shadow-xl"
            >
              {/* Zone Sign */}
              <div className="text-center font-black text-white px-6 py-2.5 rounded-2xl w-fit mx-auto mb-5 border-4 border-white/30 uppercase tracking-widest shadow-[0_8px_0_rgba(0,0,0,0.1)] -rotate-2 relative z-20 bg-blue-600">
                {zone.title}
              </div>

              {/* Path & Lessons */}
              <div className="relative w-full min-h-[200px] flex flex-col items-center mt-16">
                {renderCurvedPath(zone.lessons.length)}

                {zone.lessons.map((lesson: any, lIdx: number) => {
                  const isPetHere = currentPetPosition === lesson.id;
                  const translateX =
                    lIdx % 2 === 0 ? 0 : lIdx % 4 === 1 ? -75 : 75;

                  let btnBg = "#cbd5e1";
                  let btnShadow = "#64748b";

                  if (lesson.status === "completed") {
                    btnBg = "#FCD34D"; // Yellow
                    btnShadow = "#D97706";
                  } else if (lesson.status === "unlocked") {
                    btnBg = "#60A5FA"; // Blue
                    btnShadow = "#1D4ED8";
                  }

                  return (
                    <div
                      key={lesson.id}
                      id={`lesson-${lesson.id}`}
                      className="lesson-node rounded-full border-4 border-white flex items-center justify-center relative cursor-pointer transition-transform active:scale-90"
                      style={{
                        transform: `translateX(${translateX}px)`,
                        marginTop: lIdx === 0 ? 0 : `40px`,
                        width: `80px`,
                        height: `80px`,
                        backgroundColor: btnBg,
                        boxShadow: `inset 0 4px 0 rgba(255,255,255,0.4), 0 6px 0 ${btnShadow}, 0 10px 10px rgba(0,0,0,0.15)`,
                        zIndex: isPetHere ? 50 : 10,
                      }}
                      onClick={() => {
                        if (lesson.status !== "locked") {
                          setSelectedLesson(lesson);
                          setCurrentPetPosition(lesson.id);
                        }
                      }}
                    >
                      {/* Icons inside Node */}
                      {lesson.status === "locked" && (
                        <Lock size={28} className="text-slate-500 opacity-50" />
                      )}
                      {lesson.status === "completed" && !isPetHere && (
                        <Star
                          size={36}
                          fill="white"
                          stroke="none"
                          className="drop-shadow-sm"
                        />
                      )}
                      {(lesson.status === "unlocked" || isPetHere) && (
                        <Play
                          size={32}
                          fill="white"
                          stroke="none"
                          className="ml-1 drop-shadow-sm"
                        />
                      )}

                      {/* Pet Avatar */}
                      {isPetHere && (
                        <div className="absolute -top-[90px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] z-50">
                          {equippedPetData && equippedPetData.lottieUrl ? (
                            <LottiePet
                              src={equippedPetData.lottieUrl}
                              className="w-full h-full drop-shadow-md"
                            />
                          ) : (
                            <span className="text-6xl filter drop-shadow-md animate-bounce block">
                              🐶
                            </span>
                          )}

                          {/* Speech Bubble */}
                          <div className="absolute top-2.5 -right-10 bg-white px-2.5 py-1 rounded-xl text-xs font-black text-slate-800 border-2 border-slate-800 shadow-sm animate-wiggle whitespace-nowrap z-[60]">
                            Đi thôi!
                          </div>
                        </div>
                      )}

                      {/* Node Label (Hover) */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-lg text-xs font-extrabold text-slate-600 whitespace-nowrap shadow-[0_4px_0_#cbd5e1] border-2 border-slate-200 opacity-0 transition-all pointer-events-none group-hover:opacity-100 group-hover:-bottom-10">
                        {lesson.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedLesson && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-5"
          onClick={() => setSelectedLesson(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[30px] overflow-hidden shadow-[0_20px_0_rgba(0,0,0,0.1)] animate-popIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 flex flex-col items-center relative overflow-hidden text-white bg-gradient-to-br from-blue-500 to-blue-600">
              <button
                onClick={() => setSelectedLesson(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white font-bold text-2xl z-20"
              >
                ✕
              </button>
              <div className="text-7xl mb-4 animate-bounce drop-shadow-md">
                <LottiePet
                  src={equippedPetData?.lottieUrl}
                  className="w-24 h-24"
                />
              </div>
              <h2 className="text-2xl font-black text-center leading-tight drop-shadow-sm px-4">
                {selectedLesson.title}
              </h2>
            </div>
            <div className="p-6 bg-white">
              <button
                onClick={handleStartLearning}
                className="w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg transform transition active:scale-95 bg-gradient-to-b from-green-400 to-green-500 shadow-green-700 flex items-center justify-center gap-2 border-b-4 border-green-700"
              >
                <Play fill="white" /> BẮT ĐẦU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

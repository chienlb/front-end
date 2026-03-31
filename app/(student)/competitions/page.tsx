"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { competitionService } from "@/services/competition.service"; // Import interface
import { userService } from "@/services/user.service";
import { ranksService } from "@/services/ranks.service";

import {
  Trophy,
  Calendar,
  Users,
  Star,
  Medal,
  Zap,
  Lock,
  Gift,
  ArrowRight,
  BarChart3,
  Clock,
} from "lucide-react";

// --- TYPES ---
type CompStatus = "HAPPENING" | "UPCOMING" | "ENDED";

interface Competition {
  id: string;
  title: string;
  type: "QUIZ" | "SPEAKING";
  startTime: string;
  endTime: string;
  participants: number;
  status: CompStatus;
  reward: string;
  myRank?: number;
  myScore?: number;
  isCompleted?: boolean;
  imageBg: string;
}


export default function StudentCompetitionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  const getBgColor = (type: string) => {
    return type === "rank" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-purple-500 to-pink-600";
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response: any = await competitionService.getAllCompetitions();
        const profileRes: any = await userService.getProfile().catch(() => null);
        const profileId: string | null =
          (profileRes?._id ?? profileRes?.data?._id ?? profileRes?.id) ?? null;

        let ranksRes: any = null;
        if (typeof profileId === "string" && profileId) {
          ranksRes = await ranksService
            .getRanksByUser(profileId)
            .catch(() => null);
        }

        // Normalize competitions list
        const rawList =
          (Array.isArray(response) ? response : null) ??
          (Array.isArray(response?.data) ? response.data : null) ??
          (Array.isArray(response?.items) ? response.items : null) ??
          [];

        // If profileId is missing, no need to mark completed
        const rawRanks: any[] = Array.isArray(ranksRes) ? ranksRes : [];

        const ranksByCompetitionId: Record<
          string,
          { rank?: number; score?: number }
        > = {};
        for (const r of rawRanks) {
          const competitionId =
            typeof r?.idCompetition === "string"
              ? r.idCompetition
              : typeof r?.competitionId === "string"
                ? r.competitionId
                : typeof r?.id === "string"
                  ? r.id
                  : null;

          if (!competitionId) continue;

          ranksByCompetitionId[competitionId] = {
            rank:
              typeof r?.rank === "number"
                ? r.rank
                : typeof r?.position === "number"
                  ? r.position
                  : undefined,
            score:
              typeof r?.score === "number"
                ? r.score
                : typeof r?.points === "number"
                  ? r.points
                  : undefined,
          };
        }

        console.log("DỮ LIỆU CUỘC THI:", response);

        const now = Date.now();
        const normalized = rawList.map((c: any) => {
          const start = c?.startTime ?? c?.startAt ?? c?.startDate ?? null;
          const end = c?.endTime ?? c?.endAt ?? c?.endDate ?? null;
          const startMs = start ? new Date(start).getTime() : NaN;
          const endMs = end ? new Date(end).getTime() : NaN;

          // Luôn tính trạng thái theo mốc thời gian để tự mở khi đến giờ bắt đầu.
          let status: "UPCOMING" | "HAPPENING" | "ENDED";
          if (!Number.isNaN(startMs) && now < startMs) status = "UPCOMING";
          else if (!Number.isNaN(endMs) && now > endMs) status = "ENDED";
          else if (!Number.isNaN(startMs) || !Number.isNaN(endMs)) status = "HAPPENING";
          else status = "UPCOMING";

          const compId = String(c?._id ?? c?.id ?? "");
          const my = ranksByCompetitionId[compId];

          return {
            ...c,
            _id: c?._id ?? c?.id,
            title: c?.title ?? c?.name ?? "Cuộc thi",
            // API sample: type = "rank" | ...
            type: c?.type ?? "rank",
            startTime: start,
            endTime: end,
            status,
            reward: c?.reward ?? c?.prize ?? c?.gift ?? "---",
            totalParticipants:
              c?.totalParticipants ?? c?.participants ?? c?.participantCount ?? 0,
            myRank: my?.rank,
            myScore: my?.score,
            isCompleted:
              typeof my?.score === "number" || typeof my?.rank === "number",
          };
        });

        setCompetitions(normalized);

      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách cuộc thi:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeList = competitions.filter((c) => c.status !== "ENDED");
  const historyList = competitions.filter((c) => c.status === "ENDED");


  const goToPlay = (compId: string) => {
    router.push(`/competitions/${compId}/play`);
  };

  const goToLeaderboard = (compId: string) => {
    router.push(`/competitions/${compId}/leaderboard`);
  };

  const goToMyRanks = () => {
    router.push(`/competitions/my-ranks`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
        {/* 1. HEADER HERO */}
        <div className="bg-white rounded-3xl p-6 md:p-10 mb-8 border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Zap size={14} fill="currentColor" /> Đấu trường
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                Thử Thách Bản Thân 🚀
              </h1>
              <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed">
                Tham gia các cuộc thi để tích lũy điểm thưởng, leo bảng xếp hạng
                và nhận những phần quà hấp dẫn!
              </p>
            </div>

            {/* User Stats Card - Compact on mobile, wider on desktop */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap md:flex-nowrap items-center justify-center gap-6 shadow-xl shadow-slate-200 w-full md:w-auto min-w-[320px]">
              <div className="text-center flex-1">
                <div className="text-yellow-400 mb-2 flex justify-center">
                  <Trophy size={28} />
                </div>
                <div className="text-2xl font-black leading-none mb-1">03</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Chiến thắng
                </div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700 hidden md:block"></div>
              <div className="text-center flex-1">
                <div className="text-blue-400 mb-2 flex justify-center">
                  <Star size={28} />
                </div>
                <div className="text-2xl font-black leading-none mb-1">
                  1250
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Tổng XP
                </div>
              </div>
              <div className="w-[1px] h-10 bg-slate-700 hidden md:block"></div>
              <div className="text-center flex-1">
                <div className="text-green-400 mb-2 flex justify-center">
                  <Medal size={28} />
                </div>
                <div className="text-2xl font-black leading-none mb-1">#12</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Rank Tuần
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TABS */}
        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-6 py-3 mt-1 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 
      ${activeTab === "ACTIVE"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5" // Active: Bóng màu xanh, nổi lên
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300" // Inactive: Viền xám nhẹ
              }`}
          >
            <Zap
              size={18}
              className={activeTab === "ACTIVE" ? "fill-current" : ""}
            />
            Đang diễn ra
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-6 py-3 mt-1 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 
      ${activeTab === "HISTORY"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
              }`}
          >
            <Clock size={18} />
            Lịch sử tham gia
          </button>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={goToMyRanks}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#ECE7F6] bg-white px-5 py-3 text-sm font-black text-[#5b21b6] shadow-primary-card hover:bg-white transition"
          >
            <Trophy size={16} />
            Xem thứ hạng của tôi
          </button>
        </div>

        {/* 3. CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* === ACTIVE TAB === */}
          {activeTab === "ACTIVE" &&
            activeList.map((comp) => (
              <div
                key={comp._id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Card Header */}
                <div
                  className="h-36 relative p-6 flex flex-col justify-between overflow-hidden rounded-t-3xl"
                  style={{
                    backgroundImage: comp.imageBg
                      ? undefined
                      : `url('https://img.freepik.com/free-vector/enter-win-banner-design_23-2150313960.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-black/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10">
                      {comp.type === "QUIZ" ? "🧩 Quiz" : "🎙️ Speaking"}
                    </span>
                    {comp.status === "HAPPENING" && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 bg-white rounded-full block animate-ping" />{" "}
                        Live
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-slate-900 font-black text-lg leading-snug mb-5 line-clamp-2">
                    {comp.title}
                  </h3>
                  <div className="space-y-5 mb-8">
                    {/* Time */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          Thời gian
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {formatDateTime(comp.startTime)}
                        </p>
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Gift size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          Phần thưởng
                        </p>
                        <p className="text-sm font-bold text-orange-600">
                          {comp.reward}
                        </p>
                      </div>
                    </div>

                    {/* Participants & Live Leaderboard */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                          +{comp.totalParticipants} tham gia
                        </p>
                      </div>

                      {comp.status === "HAPPENING" && (
                        <button
                          onClick={() => goToLeaderboard(comp._id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <BarChart3 size={14} /> BXH Live
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto">
                    {comp.isCompleted ? (
                      <button
                        disabled
                        className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold transition flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <Lock size={18} /> Đã thi xong
                      </button>
                    ) : comp.status === "HAPPENING" ? (
                      <button
                        onClick={() => goToPlay(comp._id)}
                        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-red-300 transition flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 animate-pulse"
                      >
                        <Zap size={20} fill="currentColor" /> Tham gia ngay <ArrowRight size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold transition flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <Lock size={18} /> Chưa đến giờ mở
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* === HISTORY TAB === */}
          {activeTab === "HISTORY" &&
            historyList.map((comp) => (
              <div
                key={comp._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-5 transition hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Kết thúc: {comp.endTime}
                    </p>
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                    Đã kết thúc
                  </span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Hạng của bạn
                    </span>
                    <span
                      className={`text-base font-black ${comp.myRank && comp.myRank <= 3
                        ? "text-yellow-600"
                        : "text-slate-700"
                        }`}
                    >
                      #{comp.myRank}
                    </span>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                      style={{ width: "80%" }} // Mock progress
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Điểm số
                    </span>
                    <span className="text-xs text-blue-600 font-bold">
                      {comp.myScore} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => goToLeaderboard(comp._id)}
                  className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 text-sm flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Trophy size={16} className="text-yellow-500" /> Xem bảng xếp
                  hạng
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

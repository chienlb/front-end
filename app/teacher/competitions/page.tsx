"use client";
import { useState } from "react";
import {
  Trophy,
  Plus,
  Users,
  Search,
  Gift,
  Clock,
  Calendar,
  Medal,
  CheckCircle,
} from "lucide-react";

import CompetitionBuilder, {
  CompetitionData,
} from "@/components/teacher/competitions/CompetitionBuilder";

// --- TYPES ---
type CompStatus = "UPCOMING" | "HAPPENING" | "ENDED";

interface StudentRank {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  time?: string;
  rewarded: boolean;
}

interface Competition {
  id: string;
  title: string;
  type: "QUIZ" | "SPEAKING" | "WRITING";
  startTime: string;
  endTime: string;
  participants: number;
  status: CompStatus;
  topStudents?: StudentRank[];
}

// --- MOCK DATA ---
const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: "CP01",
    title: "Rung Chuông Vàng - Unit 1-3",
    type: "QUIZ",
    startTime: "20:00, 20/11/2023",
    endTime: "21:00, 20/11/2023",
    participants: 45,
    status: "UPCOMING",
  },
  {
    id: "CP02",
    title: "Thử thách Speaking: My Dream Job",
    type: "SPEAKING",
    startTime: "01/11/2023",
    endTime: "07/11/2023",
    participants: 32,
    status: "HAPPENING",
    topStudents: [
      {
        rank: 1,
        name: "Nguyễn Văn A",
        avatar: "https://i.pravatar.cc/150?img=11",
        score: 95,
        time: "45s",
        rewarded: false,
      },
      {
        rank: 2,
        name: "Trần Thị B",
        avatar: "https://i.pravatar.cc/150?img=5",
        score: 92,
        time: "50s",
        rewarded: false,
      },
      {
        rank: 3,
        name: "Lê Văn C",
        avatar: "https://i.pravatar.cc/150?img=3",
        score: 88,
        time: "55s",
        rewarded: false,
      },
    ],
  },
  {
    id: "CP03",
    title: "Đua top Từ vựng Tháng 10",
    type: "QUIZ",
    startTime: "01/10/2023",
    endTime: "31/10/2023",
    participants: 120,
    status: "ENDED",
    topStudents: [
      {
        rank: 1,
        name: "Phạm Minh D",
        avatar: "https://i.pravatar.cc/150?img=8",
        score: 1000,
        rewarded: true,
      },
      {
        rank: 2,
        name: "Hoàng Yến",
        avatar: "https://i.pravatar.cc/150?img=9",
        score: 980,
        rewarded: true,
      },
      {
        rank: 3,
        name: "Cao Thắng",
        avatar: "https://i.pravatar.cc/150?img=12",
        score: 950,
        rewarded: true,
      },
    ],
  },
];

export default function CompetitionsPage() {
  const [competitions, setCompetitions] =
    useState<Competition[]>(INITIAL_COMPETITIONS);
  const [activeTab, setActiveTab] = useState<CompStatus | "ALL">("ALL");
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  // State bật tắt Modal Builder
  const [isCreating, setIsCreating] = useState(false);

  // Filter Logic
  const filteredList =
    activeTab === "ALL"
      ? competitions
      : competitions.filter((c) => c.status === activeTab);

  // --- HANDLERS ---
  const handleAward = (studentName: string) => {
    alert(`Đã gửi phần thưởng (Huy hiệu + Điểm) cho em ${studentName}!`);
  };

  const handleCreateCompetition = (data: CompetitionData) => {
    const newComp: Competition = {
      id: `CP${Date.now()}`,
      title: data.title,
      type: data.type,
      startTime: new Date(data.startTime).toLocaleString("vi-VN"),
      endTime: new Date(data.endTime).toLocaleString("vi-VN"),
      participants: 0,
      status: "UPCOMING",
    };

    setCompetitions([newComp, ...competitions]);
    setIsCreating(false); // Đóng modal
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. LEFT CONTENT: LIST & STATS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Trophy className="text-yellow-500" size={32} /> Cuộc thi & Sự
                kiện
              </h1>
              <p className="text-slate-500 mt-1">
                Tổ chức sân chơi và vinh danh học sinh xuất sắc.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
            >
              <Plus size={20} /> Tạo cuộc thi mới
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Đang diễn ra
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {competitions.filter((c) => c.status === "HAPPENING").length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Tổng người tham gia
                </p>
                <p className="text-2xl font-black text-slate-800">197</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Đã trao thưởng
                </p>
                <p className="text-2xl font-black text-slate-800">15</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
              {["ALL", "HAPPENING", "UPCOMING", "ENDED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === tab ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {tab === "ALL"
                    ? "Tất cả"
                    : tab === "HAPPENING"
                      ? "Đang diễn ra"
                      : tab === "UPCOMING"
                        ? "Sắp tới"
                        : "Đã kết thúc"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                placeholder="Tìm cuộc thi..."
              />
            </div>
          </div>

          {/* List Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-20">
            {filteredList.map((comp) => (
              <div
                key={comp.id}
                onClick={() => setSelectedComp(comp)}
                className={`group bg-white p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${selectedComp?.id === comp.id ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
              >
                {/* Status Badge */}
                <div
                  className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold ${
                    comp.status === "HAPPENING"
                      ? "bg-green-500 text-white animate-pulse"
                      : comp.status === "UPCOMING"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {comp.status === "HAPPENING"
                    ? "ĐANG DIỄN RA"
                    : comp.status === "UPCOMING"
                      ? "SẮP DIỄN RA"
                      : "ĐÃ KẾT THÚC"}
                </div>

                <div className="flex gap-4 items-start">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm ${comp.type === "QUIZ" ? "bg-purple-100" : comp.type === "SPEAKING" ? "bg-orange-100" : "bg-blue-100"}`}
                  >
                    {comp.type === "QUIZ"
                      ? "🧩"
                      : comp.type === "SPEAKING"
                        ? "🎙️"
                        : "✍️"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition mb-1">
                      {comp.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {comp.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {comp.participants} tham gia
                      </span>
                    </div>
                  </div>
                </div>

                {comp.topStudents && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center -space-x-2">
                      {comp.topStudents.slice(0, 3).map((s, i) => (
                        <img
                          key={i}
                          src={s.avatar}
                          className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-100"
                          title={s.name}
                        />
                      ))}
                      <div className="ml-4 text-xs font-bold text-slate-400">
                        +Top dẫn đầu
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDEBAR: LEADERBOARD & DETAILS */}
      {selectedComp ? (
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 animate-in slide-in-from-right-10">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="font-black text-xl text-slate-800 leading-tight mb-2">
              {selectedComp.title}
            </h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600">
                {selectedComp.type}
              </span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600">
                {selectedComp.participants} Thí sinh
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-100">
            <button className="flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition">
              Chỉnh sửa
            </button>
            <button className="flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg text-sm font-bold transition">
              Kết thúc
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Medal className="text-yellow-500" /> Bảng Xếp Hạng
            </h3>
            {selectedComp.topStudents ? (
              <div className="space-y-3">
                {selectedComp.topStudents.map((student) => (
                  <div
                    key={student.rank}
                    className={`p-3 rounded-xl border flex items-center gap-3 relative ${student.rank === 1 ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-100"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${student.rank === 1 ? "bg-yellow-500" : student.rank === 2 ? "bg-slate-400" : "bg-orange-600"}`}
                    >
                      {student.rank}
                    </div>
                    <img
                      src={student.avatar}
                      className="w-10 h-10 rounded-full border border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.score} điểm{" "}
                        {student.time && `• ${student.time}`}
                      </p>
                    </div>
                    {!student.rewarded ? (
                      <button
                        onClick={() => handleAward(student.name)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm"
                        title="Trao thưởng"
                      >
                        <Gift size={18} />
                      </button>
                    ) : (
                      <div
                        className="p-2 text-green-500"
                        title="Đã trao thưởng"
                      >
                        <CheckCircle size={18} />
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 font-medium">
                    ... và 42 học sinh khác ...
                  </p>
                  <button className="text-xs text-blue-600 font-bold hover:underline mt-1">
                    Xem toàn bộ danh sách
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p>Cuộc thi chưa bắt đầu hoặc chưa có dữ liệu xếp hạng.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-96 bg-slate-50 border-l border-slate-200 hidden xl:flex items-center justify-center text-slate-300 flex-col">
          <Trophy size={64} className="opacity-20 mb-4" />
          <p className="font-bold">Chọn cuộc thi để xem chi tiết</p>
        </div>
      )}

      {/* --- INTEGRATED BUILDER COMPONENT --- */}
      {isCreating && (
        <CompetitionBuilder
          onClose={() => setIsCreating(false)}
          onSave={handleCreateCompetition}
        />
      )}
    </div>
  );
}

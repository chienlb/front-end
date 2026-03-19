"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  BookOpen,
  Calendar,
  Folder,
  Users,
  ArrowLeft,
  Share2,
  MoreVertical,
  Star,
  ClipboardList,
} from "lucide-react";

// --- IMPORT CÁC TAB CON ---
import StudentStream from "@/components/student/classes/StudentStream";
import StudentClasswork from "@/components/student/classes/StudentClasswork";
import StudentRepository from "@/components/student/classes/StudentRepository";
import StudentAssignmentsTab from "@/components/student/classes/StudentAssignmentsTab"; // [NEW] Component bài tập của lớp

// Các tab dùng lại từ Teacher
import TabPeople from "@/components/teacher/classes/TabPeople/TabPeople";
import TabSchedule from "@/components/teacher/classes/TabSchedule";
import TabGroups from "@/components/teacher/classes/TabGroups";

// --- MOCK DATA ---
const CLASS_INFO = {
  id: "C01",
  name: "Tiếng Anh Giao Tiếp K12 - Advanced",
  code: "ENG-K12-ADV",
  scheduleText: "T2 - T4 - T6 (19:30 - 21:00)",
  coverImage:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop",
  progress: 65,
  teacher: {
    name: "Cô Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
};

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Thêm 'ASSIGNMENTS' vào state
  const [activeTab, setActiveTab] = useState<
    | "STREAM"
    | "CLASSWORK"
    | "ASSIGNMENTS"
    | "SCHEDULE"
    | "PEOPLE"
    | "GROUPS"
    | "REPOSITORY"
  >("CLASSWORK");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* 1. HEADER */}
      <div className="relative h-[300px] bg-slate-900 text-white shadow-xl overflow-hidden group">
        <img
          src={CLASS_INFO.coverImage}
          className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-between py-6">
          <div className="flex justify-between items-start">
            <button
              onClick={() => router.push("/my-classes")}
              className="flex items-center gap-2 text-sm font-bold bg-black/20 hover:bg-black/40 text-white/90 hover:text-white px-4 py-2 rounded-full backdrop-blur-md transition"
            >
              <ArrowLeft size={16} /> Danh sách lớp
            </button>
            <div className="flex gap-2">
              <button className="p-2.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md text-white">
                <Share2 size={20} />
              </button>
              <button className="p-2.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md text-white">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-600 text-[10px] font-black px-2.5 py-1 rounded text-white border border-blue-400/50 uppercase">
                  HỌC VIÊN
                </span>
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                  <img
                    src={CLASS_INFO.teacher.avatar}
                    className="w-4 h-4 rounded-full"
                  />
                  GV: {CLASS_INFO.teacher.name}
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2 text-white">
                {CLASS_INFO.name}
              </h1>
              <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Calendar size={14} /> {CLASS_INFO.scheduleText}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[280px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1">
                  <Star
                    size={12}
                    className="text-yellow-400"
                    fill="currentColor"
                  />{" "}
                  Tiến độ
                </span>
                <span className="text-xl font-black text-white">
                  {CLASS_INFO.progress}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${CLASS_INFO.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm/50 backdrop-blur-xl bg-white/90">
        <div className="max-w-6xl mx-auto px-6 flex gap-2 md:gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "STREAM", label: "Bảng tin", icon: MessageSquare },
            { id: "CLASSWORK", label: "Bài học", icon: BookOpen },
            { id: "ASSIGNMENTS", label: "Bài tập", icon: ClipboardList }, // [NEW] Tab Bài tập
            { id: "SCHEDULE", label: "Lịch học", icon: Calendar },
            { id: "PEOPLE", label: "Thành viên", icon: Users },
            { id: "GROUPS", label: "Nhóm", icon: Users },
            { id: "REPOSITORY", label: "Tài liệu", icon: Folder },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <tab.icon
                size={18}
                className={
                  activeTab === tab.id ? "text-blue-600" : "text-slate-400"
                }
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {activeTab === "STREAM" && <StudentStream />}
        {activeTab === "CLASSWORK" && <StudentClasswork />}

        {activeTab === "ASSIGNMENTS" && <StudentAssignmentsTab classId={id} />}

        {activeTab === "PEOPLE" && <TabPeople readonly={true} />}
        {activeTab === "SCHEDULE" && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <TabSchedule />
          </div>
        )}
        {activeTab === "GROUPS" && <TabGroups />}
        {activeTab === "REPOSITORY" && <StudentRepository />}
      </div>
    </div>
  );
}

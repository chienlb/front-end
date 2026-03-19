"use client";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Video,
  Clock,
  ArrowLeft,
  MoreVertical,
  Settings,
  Copy,
  Users,
  Share2,
  CheckCircle2,
} from "lucide-react";

export default function Header({ classData }: { classData: any }) {
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.code);
    alert(`Đã sao chép mã lớp: ${classData.code}`);
  };

  return (
    <div className="relative bg-slate-900 text-white shadow-xl overflow-hidden mb-6">
      {/* 1. BACKGROUND IMAGE & GRADIENT */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2940&auto=format&fit=crop"
          alt="Class Cover"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
      </div>

      {/* 2. TOP NAVIGATION */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <div className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition">
            <ArrowLeft size={16} />
          </div>
          Quay lại danh sách
        </button>

        <div className="flex gap-1">
          <button
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Cài đặt"
          >
            <Settings size={20} />
          </button>
          <button className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between">
          {/* LEFT: CLASS INFO */}
          <div className="space-y-4 flex-1">
            {/* Badges Row */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm border border-blue-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                Live Class
              </span>

              <div
                onClick={handleCopyCode}
                className="group flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition select-none"
              >
                <span className="text-xs font-mono text-slate-300 group-hover:text-white tracking-widest">
                  {classData.code}
                </span>
                <Copy
                  size={12}
                  className="text-slate-500 group-hover:text-white"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 tracking-tight">
                {classData.name}
              </h1>
              {/* Metadata Row - Clean Style */}
              <div className="flex flex-wrap items-center gap-y-2 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span>{classData.schedule}</span>
                </div>
                <span className="mx-3 text-slate-600 hidden sm:block">•</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-400" />
                  <span>90 phút/buổi</span>
                </div>
                <span className="mx-3 text-slate-600 hidden sm:block">•</span>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-400" />
                  <span>25 Học viên</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-stretch gap-3 w-full lg:w-auto">
            <button className="p-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-white rounded-xl transition flex items-center justify-center backdrop-blur-sm">
              <Share2 size={20} />
            </button>

            <button className="flex-1 lg:flex-none py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 group border-t border-blue-400/20">
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition">
                <Video size={18} className="text-white" />
              </div>
              <span>Vào Lớp Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

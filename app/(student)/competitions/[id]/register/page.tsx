"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, Users, Trophy, ShieldCheck, AlertCircle,
  ChevronLeft, Share2, MapPin, CheckCircle2, Gift, Zap, HelpCircle
} from "lucide-react";
import { competitionService } from "@/services/competition.service";
import { showAlert } from "@/utils/dialog";

export default function CompetitionRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [registering, setRegistering] = useState(false);
  const resolvedParams = use(params);
  const competitionId = resolvedParams.id;

  const router = useRouter();
  const [comp, setComp] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await competitionService.getCompetitionById(competitionId);
        setComp(response.data || response);
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [competitionId]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleString("sv-SE", {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).replace('T', ' ');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!comp) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy cuộc thi</div>;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await competitionService.joinCompetition(competitionId);
      setIsRegistered(true);
      // Tự động chuyển sang phòng thi sau 1.5s
      setTimeout(() => {
        router.push(`/competitions/${competitionId}/play`);
      }, 1500);
    } catch (err) {
      console.error("Lỗi đăng ký cuộc thi:", err);
      await showAlert("Đăng ký thất bại. Vui lòng thử lại sau nhé.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans pb-24">
      {/* 1. HERO BANNER */}
      <div
        className="relative h-64 md:h-80 text-white overflow-hidden rounded-b-[40px]"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), transparent), url('https://img.freepik.com/free-vector/enter-win-banner-design_23-2150313960.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
          <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md">
            <ChevronLeft size={24} />
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md">
            <Share2 size={20} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black uppercase rounded-lg mb-3 shadow-lg">
              {comp.type === "rank" ? "Xếp hạng" : "Trắc nghiệm"}
            </span>
            <h1 className="text-2xl md:text-4xl font-black mb-2 shadow-sm leading-tight">
              {comp.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90">
              <span className="flex items-center gap-1">
                <Calendar size={16} /> {formatDateTime(comp.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} /> Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 2. LEFT COLUMN */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-blue-500" /> Giới thiệu
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {comp.description || "Chưa có mô tả cho cuộc thi này."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-500" /> Thông tin bài thi
              </h2>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-slate-400" />
                  Số lượng câu hỏi: <strong>{comp.countQuestion} câu</strong>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-400" />
                  Thời gian kết thúc: <strong>{formatDateTime(comp.endTime)}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. RIGHT COLUMN: ACTION CARD */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Trạng thái</p>
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase ${comp.status === 'ended' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                  {comp.status === 'ended' ? "Đã kết thúc" : "Đang mở"}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Users size={16} /> Đã tham gia
                  </span>
                  <span className="font-bold text-slate-800">
                    {comp.participants?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Gift size={16} /> Lệ phí
                  </span>
                  <span className="font-black text-blue-600 text-lg">Miễn phí</span>
                </div>
              </div>

              {comp.status !== 'ended' ? (
                !isRegistered ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70"
                  >
                    {registering ? "Đang xử lý..." : "Đăng ký tham gia"}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/competitions/${competitionId}/play`)}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Zap size={20} fill="currentColor" /> Vào phòng thi
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-slate-200 text-slate-500 rounded-2xl font-bold cursor-not-allowed"
                >
                  Cuộc thi đã kết thúc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
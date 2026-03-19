"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { competitionService } from "@/services/competition.service";
import { userService } from "@/services/user.service";
import { ranksService } from "@/services/ranks.service";
import { Loader2, Trophy, Calendar, ArrowLeft } from "lucide-react";

type RankItem = {
  id?: string;
  competitionId?: string;
  score?: number;
  rank?: number;
  submittedAt?: string | Date;
};

function getId(v: any): string | null {
  if (typeof v === "string") return v;
  const id = v?._id ?? v?.id ?? v?.userId ?? v?.competitionId;
  return typeof id === "string" ? id : null;
}

function formatDateTime(d?: string | Date): string {
  if (!d) return "---";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "---";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function MyCompetitionRanksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ranks, setRanks] = useState<RankItem[]>([]);
  const [competitionsById, setCompetitionsById] = useState<Record<string, any>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileRes: any = await userService.getProfile();
        const userId =
          getId(profileRes?.data) ?? getId(profileRes) ?? getId(profileRes?.user);
        if (!userId) throw new Error("Không lấy được userId từ profile");

        const [ranksRes, compsRes]: [any, any] = await Promise.all([
          ranksService.getRanksByUser(userId),
          competitionService.getAllCompetitions(),
        ]);

        const rawRanks: any[] = Array.isArray(ranksRes) ? ranksRes : [];

        // Normalize competition list to a map (id -> title/status/times)
        const rawComps: any[] = Array.isArray(compsRes)
          ? compsRes
          : Array.isArray(compsRes?.data)
            ? compsRes.data
            : Array.isArray(compsRes?.items)
              ? compsRes.items
              : [];

        const map: Record<string, any> = {};
        for (const c of rawComps) {
          const cid = getId(c);
          if (cid) map[cid] = c;
        }
        setCompetitionsById(map);

        const normalized: RankItem[] = rawRanks.map((r: any) => {
          const competitionId =
            typeof r?.idCompetition === "string"
              ? r.idCompetition
              : typeof r?.competitionId === "string"
                ? r.competitionId
                : getId(r);
          return {
            id: typeof r?._id === "string" ? r._id : undefined,
            competitionId: competitionId ?? undefined,
            score:
              typeof r?.score === "number"
                ? r.score
                : typeof r?.points === "number"
                  ? r.points
                  : undefined,
            rank:
              typeof r?.rank === "number"
                ? r.rank
                : typeof r?.position === "number"
                  ? r.position
                  : undefined,
            submittedAt:
              r?.submittedAt ??
              r?.createdAt ??
              r?.updatedAt ??
              undefined,
          };
        });

        // Sort: newest first (fallback to rank/score if no time)
        normalized.sort((a, b) => {
          const at = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const bt = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return bt - at;
        });

        setRanks(normalized);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Không tải được dữ liệu xếp hạng.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const hasData = ranks.length > 0;

  const stats = useMemo(() => {
    const ended = ranks.filter((r) => {
      const c = r.competitionId ? competitionsById[r.competitionId] : null;
      if (!c) return true; // nếu không biết status thì vẫn coi là có dữ liệu
      const end = c?.endTime ?? c?.endAt ?? c?.endDate ?? null;
      if (!end) return true;
      return Date.now() >= new Date(end).getTime();
    });
    return { ended: ended.length };
  }, [ranks, competitionsById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center px-4">
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-primary-card flex items-center gap-3">
          <Loader2 className="animate-spin text-[#7B6ED6]" />
          <span className="font-bold text-slate-700">Đang tải xếp hạng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-bold text-[#5b21b6] shadow-primary-card hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed] group-hover:bg-[#ddd6fe] transition-all duration-300">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </span>
            Quay lại
          </button>

          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white transition"
          >
            <Trophy size={16} /> Danh sách kỳ thi
          </Link>
        </div>

        <div className="rounded-[3rem] border border-white/80 bg-white/95 shadow-primary-card p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <Trophy size={18} className="text-[#7B6ED6]" />
                <span className="font-black text-slate-700 text-sm">Xếp hạng của tôi</span>
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
                Theo từng kỳ thi
              </h1>
              <p className="mt-2 text-slate-600 font-semibold">
                Bạn có {ranks.length} bản ghi xếp hạng ({stats.ended} kỳ thi đã kết thúc).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F8F3FF] px-4 py-2 text-sm font-black text-[#7B6ED6] border border-[#ECE7F6] shadow-sm">
                <Calendar size={16} className="inline-block mr-2" />
                Mới nhất: {ranks[0]?.submittedAt ? formatDateTime(ranks[0].submittedAt) : "---"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 font-semibold">
              {error}
            </div>
          )}

          {!hasData && !error && (
            <div className="mt-8 text-center py-16 bg-white/60 rounded-[2rem] border border-dashed border-[#ECE7F6]">
              <div className="text-6xl mb-4">🏅</div>
              <div className="text-slate-700 font-black text-lg">Chưa có dữ liệu xếp hạng</div>
              <div className="text-slate-500 text-sm mt-1">
                Hãy đăng ký tham gia kỳ thi để hệ thống tạo `ranks`, sau đó thi xong sẽ tự động update điểm và thứ hạng.
              </div>
            </div>
          )}

          {hasData && (
            <div className="mt-8 grid gap-4">
              {ranks.map((r) => {
                const c = r.competitionId ? competitionsById[r.competitionId] : null;
                const title = c?.title ?? c?.name ?? `Kỳ thi ${r.competitionId ?? ""}`;
                const rankText = typeof r.rank === "number" ? `#${r.rank}` : "Chưa xếp hạng";
                const scoreText =
                  typeof r.score === "number" ? `${r.score} điểm` : "—";

                return (
                  <div
                    key={r.id ?? `${r.competitionId}-${r.submittedAt ?? ""}`}
                    className="rounded-[2rem] border border-[#ECE7F6] bg-white p-5 shadow-primary-card"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-600">
                          {c?.type ?? "competition"}
                        </div>
                        <div className="mt-2 text-xl font-black text-slate-900 line-clamp-1">
                          {title}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-600 inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-[#F8F3FF] border border-[#ECE7F6] px-3 py-1 rounded-full text-[#7B6ED6]">
                            <Trophy size={14} /> {rankText}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-700">
                            {scoreText}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 md:flex-col md:items-end">
                        <div className="text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Gửi lúc</span>
                          </div>
                          <div className="mt-1 text-sm font-black text-slate-800">
                            {formatDateTime(r.submittedAt)}
                          </div>
                        </div>

                        {r.competitionId && (
                          <Link
                            href={`/competitions/${r.competitionId}/leaderboard`}
                            className="rounded-2xl bg-[#7B6ED6] text-white px-5 py-3 text-sm font-black shadow-[0_10px_0_rgba(123,110,214,0.20),0_30px_76px_rgba(148,163,184,0.18)] hover:bg-[#6E62C9] transition"
                          >
                            Xem bảng xếp hạng
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


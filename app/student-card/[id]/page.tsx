"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Check,
  Coins,
  Copy,
  Download,
  Gem,
  GraduationCap,
  Home,
  Loader2,
  Mail,
  Phone,
  Share2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { communitesService } from "@/services/communites.service";

const API_ORIGIN = "https://teach-english-3786e536fe68.herokuapp.com";
const API_BASE = `${API_ORIGIN}/api/v1`;

const FALLBACK_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Student";

export type StudentCardData = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  diamond: number;
  streak: number;
  title: string;
  id: string;
  badges: { icon?: string; name?: string; unlocked?: boolean }[];
  memberLabel: string;
};

async function fetchUserNoAuth(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
    });
    if (!r.ok) return null;
    const j = await r.json();
    return (j?.data ?? j) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveAvatar(u: Record<string, unknown>): string {
  const raw = typeof u.avatar === "string" ? u.avatar.trim() : "";
  if (!raw) return FALLBACK_AVATAR;
  if (raw.startsWith("http")) return raw;
  const path = raw.replace(/^\//, "");
  return `${API_ORIGIN}/${path}`;
}

function formatMemberSince(createdAt: unknown): string {
  if (!createdAt) return "";
  const d = new Date(String(createdAt));
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function normalizeCardUser(
  raw: Record<string, unknown> | null,
  fullnameHint: string,
  id: string,
): StudentCardData {
  const u = raw ?? {};
  const stats = (u.stats as Record<string, unknown>) || {};

  const fullName =
    (typeof u.fullName === "string" && u.fullName) ||
    (typeof u.name === "string" && u.name) ||
    (typeof u.displayName === "string" && u.displayName) ||
    fullnameHint ||
    "Học viên SmartKids";

  const username =
    (typeof u.username === "string" && u.username.trim()) ||
    (typeof u.userName === "string" && u.userName.trim()) ||
    "";

  const email = typeof u.email === "string" ? u.email : "";
  const phone =
    typeof u.phone === "string"
      ? u.phone
      : typeof u.phoneNumber === "string"
        ? u.phoneNumber
        : "";

  const level = Number(stats.level ?? u.level ?? 1);
  const xp = Number(stats.xp ?? u.xp ?? 0);
  const nextLevelXp = Math.max(
    1,
    Number(stats.nextLevelXp ?? u.nextLevelXp ?? level * 1000),
  );
  const gold = Number(u.gold ?? stats.gold ?? 0);
  const diamond = Number(u.diamond ?? stats.diamond ?? 0);
  const streak = Number(u.streak ?? stats.streak ?? 0);

  const title =
    typeof u.title === "string" && u.title.trim() ? u.title : "Học viên";

  const badgesRaw = Array.isArray(u.badges) ? u.badges : [];
  const badges = badgesRaw.slice(0, 8).map((b: any) => ({
    icon: typeof b?.icon === "string" ? b.icon : "🏅",
    name: typeof b?.name === "string" ? b.name : "",
    unlocked: b?.unlocked !== false,
  }));

  const created = (u as any).createdAt ?? (u as any).created_at;
  const memberLabel = formatMemberSince(created);

  return {
    fullName,
    username,
    email,
    phone,
    avatar: resolveAvatar(u),
    level: Number.isFinite(level) ? level : 1,
    xp: Number.isFinite(xp) ? xp : 0,
    nextLevelXp: Number.isFinite(nextLevelXp) ? nextLevelXp : 1000,
    gold: Number.isFinite(gold) ? gold : 0,
    diamond: Number.isFinite(diamond) ? diamond : 0,
    streak: Number.isFinite(streak) ? streak : 0,
    title,
    id,
    badges,
    memberLabel,
  };
}

export default function StudentCardPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<StudentCardData | null>(null);
  const cardCaptureRef = useRef<HTMLDivElement>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    setPageUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      let raw: Record<string, unknown> | null = await fetchUserNoAuth(id);
      if (!raw) {
        try {
          const r = await userService.getUserById(id);
          const o = (r as any)?.data ?? r;
          if (o && typeof o === "object" && !Array.isArray(o)) {
            raw = o as Record<string, unknown>;
          }
        } catch {
          raw = null;
        }
      }
      let fullnameHint = "";
      try {
        fullnameHint = await communitesService.getFullname(id);
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      setCard(normalizeCardUser(raw, fullnameHint, id));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const xpPercent = useMemo(() => {
    if (!card) return 0;
    return Math.min(100, Math.round((card.xp / card.nextLevelXp) * 100));
  }, [card]);

  const handleCopyLink = async () => {
    if (!pageUrl) return;
    setActionMsg(null);
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setActionMsg("Không sao chép được. Hãy chọn địa chỉ trên thanh trình duyệt.");
    }
  };

  const handleShare = async () => {
    if (!pageUrl || !card) return;
    setActionMsg(null);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `Thẻ học viên — ${card.fullName}`,
          text: "Xem thẻ học viên trên SmartKids",
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === "AbortError") return;
      await handleCopyLink();
    }
  };

  const handleDownloadPng = async () => {
    const el = cardCaptureRef.current;
    if (!el || !card) return;
    setDownloading(true);
    setActionMsg(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#0c1222",
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95),
      );
      if (!blob) throw new Error("toBlob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `the-hoc-vien-${card.id.slice(-8)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const el2 = cardCaptureRef.current;
        if (!el2) return;
        const canvas = await html2canvas(el2, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#0c1222",
        });
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png", 0.92),
        );
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `the-hoc-vien-${card.id.slice(-8)}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          throw new Error("blob");
        }
      } catch {
        setActionMsg(
          "Không xuất được ảnh (ảnh đại diện có thể chặn tải). Dùng «Sao chép link».",
        );
      }
    } finally {
      setDownloading(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <p>Thiếu mã học viên.</p>
      </div>
    );
  }

  if (loading || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b14] text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="text-slate-400 text-sm">Đang tải thẻ học viên…</p>
      </div>
    );
  }

  const idDisplay =
    card.id.length > 22 ? `${card.id.slice(0, 12)}…${card.id.slice(-8)}` : card.id;

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050810] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Nền: aurora + noise */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -30%, rgba(6, 182, 212, 0.25), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 20%, rgba(99, 102, 241, 0.2), transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 90%, rgba(168, 85, 247, 0.15), transparent 45%),
            #050810
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 pb-12 pt-4 sm:pt-6 sm:pb-14">
        <Link
          href="/"
          className="mb-6 flex w-full max-w-[420px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-cyan-200 backdrop-blur-sm transition hover:border-cyan-500/30 hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4 shrink-0" />
          Về trang chủ SmartKids
        </Link>

        {/* Header brand */}
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/90">
                SmartKids
              </p>
              <p className="text-sm font-black text-white tracking-tight">
                Thẻ học viên số
              </p>
            </div>
          </div>
          {card.memberLabel ? (
            <p className="text-xs text-slate-500">
              Thành viên từ {card.memberLabel}
            </p>
          ) : null}
        </header>

        {/* Sao chép / Chia sẻ / Tải ảnh */}
        <div className="mb-6 flex w-full max-w-[420px] flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Đã sao chép link" : "Sao chép link"}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/25"
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={() => void handleDownloadPng()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/15 px-4 py-2.5 text-sm font-bold text-violet-100 transition hover:bg-violet-500/25 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Đang tạo ảnh…" : "Tải ảnh thẻ (PNG)"}
          </button>
        </div>
        {actionMsg ? (
          <p className="mb-4 max-w-[420px] text-center text-xs text-amber-300/90">
            {actionMsg}
          </p>
        ) : null}

        {/* Thẻ chính — ref dùng để xuất PNG */}
        <article className="w-full max-w-[420px]">
          <div
            ref={cardCaptureRef}
            className="rounded-[2rem] p-[1.5px] shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(34,211,238,0.65) 0%, rgba(99,102,241,0.5) 40%, rgba(192,132,252,0.45) 100%)",
              boxShadow:
                "0 25px 50px -12px rgba(6, 182, 212, 0.15), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            <div className="overflow-hidden rounded-[1.92rem] bg-gradient-to-b from-slate-900 via-[#0c1222] to-[#080c18] ring-1 ring-white/10">
              {/* Dải holographic */}
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-95" />

              <div className="p-6 sm:p-8">
                {/* Hàng 1: vai trò + level */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      <Shield className="h-3 w-3" />
                      {card.title}
                    </span>
                    <h1 className="mt-3 text-2xl font-black leading-tight text-white sm:text-[1.65rem]">
                      {card.fullName}
                    </h1>
                    {card.username ? (
                      <p className="mt-1.5 font-mono text-sm text-slate-400">
                        @{card.username}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="flex items-center gap-1 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10 px-3 py-1.5 text-sm font-black text-amber-200 shadow-inner"
                      title="Cấp độ"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      Lv.{card.level}
                    </span>
                  </div>
                </div>

                {/* Ảnh + XP */}
                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-stretch">
                  <div className="mx-auto shrink-0 sm:mx-0">
                    <div className="relative">
                      <div
                        className="absolute -inset-0.5 rounded-2xl opacity-70 blur-[2px]"
                        style={{
                          background:
                            "linear-gradient(135deg, #22d3ee, #6366f1, #c084fc)",
                        }}
                      />
                      <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-800 shadow-xl ring-4 ring-black/20 sm:h-40 sm:w-40">
                        <img
                          src={card.avatar}
                          alt=""
                          crossOrigin="anonymous"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <div className="mb-1.5 flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Kinh nghiệm (XP)</span>
                        <span className="font-mono text-cyan-200/90">
                          {Math.floor(card.xp)} / {card.nextLevelXp}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 transition-all duration-700"
                          style={{ width: `${xpPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-[10px] text-slate-500">
                        {xpPercent}% tới cấp tiếp theo
                      </p>
                    </div>

                    {/* Liên hệ */}
                    <div className="space-y-2 rounded-xl border border-white/8 bg-white/[0.04] p-3 backdrop-blur-sm">
                      {card.email ? (
                        <div className="flex items-start gap-2.5 text-sm">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <span className="min-w-0 break-all text-slate-300">
                            {card.email}
                          </span>
                        </div>
                      ) : null}
                      {card.phone ? (
                        <div className="flex items-start gap-2.5 text-sm">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <span className="tabular-nums text-slate-300">
                            {card.phone}
                          </span>
                        </div>
                      ) : null}
                      {!card.email && !card.phone ? (
                        <p className="text-center text-xs text-slate-500">
                          Thông tin liên hệ được bảo vệ hoặc chưa công khai.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Chỉ số game */}
                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-2 py-3 text-center sm:px-3">
                    <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20">
                      <Zap className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-lg font-black text-white tabular-nums sm:text-xl">
                      {card.streak}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
                      Chuỗi ngày
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-2 py-3 text-center sm:px-3">
                    <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20">
                      <Coins className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-lg font-black text-white tabular-nums sm:text-xl">
                      {card.gold}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
                      Vàng
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 px-2 py-3 text-center sm:px-3">
                    <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20">
                      <Gem className="h-4 w-4 text-sky-400" />
                    </div>
                    <p className="text-lg font-black text-white tabular-nums sm:text-xl">
                      {card.diamond}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
                      Kim cương
                    </p>
                  </div>
                </div>

                {/* Huy hiệu */}
                {card.badges.length > 0 ? (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <Award className="h-3.5 w-3.5" />
                      Huy hiệu
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {card.badges.map((b, i) => (
                        <span
                          key={i}
                          title={b.name || ""}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
                            b.unlocked !== false
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-slate-700 bg-slate-800/50 opacity-50 grayscale"
                          }`}
                        >
                          {b.icon ?? "🏅"}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Mã định danh */}
                <div className="mt-6 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Mã định danh học viên
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-cyan-100/80 sm:text-xs">
                    {idDisplay}
                  </p>
                </div>

                <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                  <p className="max-w-[220px] text-[10px] leading-snug text-slate-500">
                    Thẻ điện tử SmartKids — dùng mã QR trên ứng dụng để xác minh.
                  </p>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-400">
                    SK·{card.id.slice(-8).toUpperCase()}
                  </span>
                </footer>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

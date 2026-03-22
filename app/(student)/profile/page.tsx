"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  Loader2,
  Calendar,
  Award,
  Zap,
  Coins,
  Gem,
  ScanLine,
  Share2,
  Mail,
  User,
  Sparkles,
  BarChart3,
  Pencil,
  X,
  Phone,
  ImageIcon,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { userService } from "@/services/user.service";
import { mediaService } from "@/services/media.service";
import { authService } from "@/services/auth.service";

const FALLBACK_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Student";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 60 },
  },
};

/** Chuẩn hoá payload /auths/profile */
function normalizeProfile(raw: any) {
  const u = raw?.data ?? raw;
  const id = String(u?._id ?? u?.id ?? "");
  const fullName =
    u?.fullName ?? u?.name ?? u?.displayName ?? "Học viên";
  const username =
    (typeof u?.username === "string" && u.username.trim()) ||
    (typeof u?.userName === "string" && u.userName.trim()) ||
    "";
  const email = typeof u?.email === "string" ? u.email : "";
  const phone =
    typeof u?.phone === "string"
      ? u.phone
      : typeof u?.phoneNumber === "string"
        ? u.phoneNumber
        : "";
  const avatar =
    typeof u?.avatar === "string" && u.avatar.trim()
      ? u.avatar
      : FALLBACK_AVATAR;
  const level =
    u?.stats?.level ?? u?.level ?? 1;
  const xp = Number(u?.stats?.xp ?? u?.xp ?? 0);
  const nextLevelXp = Math.max(
    1,
    Number(u?.stats?.nextLevelXp ?? u?.nextLevelXp ?? level * 1000),
  );
  const gold = Number(u?.gold ?? u?.stats?.gold ?? 0);
  const diamond = Number(u?.diamond ?? u?.stats?.diamond ?? 0);
  const streak = Number(u?.streak ?? u?.stats?.streak ?? 0);
  const title =
    typeof u?.title === "string" && u.title.trim()
      ? u.title
      : "Học viên";
  const attendance = Array.isArray(u?.attendance) ? u.attendance : [];
  const badges = Array.isArray(u?.badges) ? u.badges : [];

  return {
    raw: u,
    id,
    fullName,
    username,
    email,
    phone,
    avatar,
    level,
    xp,
    nextLevelXp,
    gold,
    diamond,
    streak,
    title,
    attendance,
    badges,
  };
}

function extractUploadUrl(res: any): string | null {
  const d = res?.data ?? res;
  if (typeof d === "string" && /^https?:\/\//.test(d)) return d;
  const url =
    d?.url ??
    d?.fileUrl ??
    d?.data?.url ??
    d?.path ??
    (typeof d?.location === "string" ? d.location : null);
  return typeof url === "string" && url.length > 0 ? url : null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ReturnType<typeof normalizeProfile> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  type EditTab = "profile" | "password";
  const [editTab, setEditTab] = useState<EditTab>("profile");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    old: false,
    next: false,
    confirm: false,
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editOpen && profile) {
      setEditForm({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        avatar:
          profile.avatar && profile.avatar !== FALLBACK_AVATAR
            ? profile.avatar
            : "",
      });
      setFormError(null);
    }
    if (!editOpen) {
      setEditTab("profile");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError(null);
      setPasswordSuccess(null);
    }
  }, [editOpen, profile]);

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    const name = editForm.fullName.trim();
    const email = editForm.email.trim();
    const phone = editForm.phone.trim();
    const avatar = editForm.avatar.trim();

    if (!name) {
      setFormError("Vui lòng nhập họ tên.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Email không hợp lệ.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        fullName: name,
        email: email || undefined,
        phone,
      };
      if (avatar) payload.avatar = avatar;

      await userService.updateMyProfile(profile.id, payload);
      const fresh = await userService.getProfile();
      const p = normalizeProfile(fresh as any);
      setProfile(p);
      if (typeof window !== "undefined") {
        const raw = (fresh as any)?.data ?? fresh;
        const stored = localStorage.getItem("currentUser");
        const prev = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ ...prev, ...raw }),
        );
        window.dispatchEvent(new Event("smartkids-profile-updated"));
      }
      setEditOpen(false);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        (Array.isArray(e?.response?.data?.message)
          ? e.response.data.message.join(", ")
          : null) ??
        e?.message ??
        "Không lưu được. Thử lại sau.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    const oldP = passwordForm.oldPassword;
    const newP = passwordForm.newPassword;
    const cf = passwordForm.confirmPassword;

    if (!oldP) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newP.length < 6) {
      setPasswordError("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }
    if (newP !== cf) {
      setPasswordError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (oldP === newP) {
      setPasswordError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await authService.changePassword({
        oldPassword: oldP,
        newPassword: newP,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess("Đã đổi mật khẩu thành công.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        (Array.isArray(e?.response?.data?.message)
          ? e.response.data.message.join(", ")
          : null) ??
        e?.message ??
        "Không đổi được mật khẩu. Kiểm tra mật khẩu hiện tại.";
      setPasswordError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Chỉ chấp nhận file ảnh.");
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const res = await mediaService.uploadFile(file);
      const url = extractUploadUrl(res);
      if (url) {
        setEditForm((f) => ({ ...f, avatar: url }));
      } else {
        setFormError("Không nhận được URL ảnh từ server.");
      }
    } catch {
      setFormError("Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDayOfMonth + 1;
        return day > 0 && day <= daysInMonth ? day : null;
      }),
    [firstDayOfMonth, daysInMonth],
  );

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await userService.getProfile();

        if (cancelled) return;

        const p = normalizeProfile(profileRes as any);
        setProfile(p);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Đã có lỗi xảy ra.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const xpPercent = profile
    ? Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100))
    : 0;

  const siteOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  /** Quét mã → mở trang thẻ học viên (HTML/CSS) */
  const studentCardLink = profile?.id
    ? `${siteOrigin}/student-card/${profile.id}`
    : "";

  const displayName = profile
    ? profile.username
      ? `${profile.fullName} (@${profile.username})`
      : profile.fullName
    : "";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F0F9FF]">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F0F9FF] px-4">
        <p className="text-lg font-bold text-slate-700 text-center">
          {error ?? "Không tìm thấy thông tin."}
        </p>
        <Link
          href="/"
          className="mt-4 text-indigo-600 font-bold hover:underline"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-24 pt-6 px-4 md:px-8 font-sans text-slate-800">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Cột trái: thẻ hồ sơ + QR */}
        <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white ring-1 ring-indigo-100/80">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-500 relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="px-6 pb-8 text-center -mt-16 relative z-10">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden mx-auto">
                  <img
                    src={profile.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-black mt-4 text-slate-900 leading-tight">
                {displayName}
              </h1>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 inline-block px-3 py-1 rounded-full mt-2">
                {profile.title}
              </p>

              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="relative z-30 mt-4 inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-sm font-bold shadow-sm hover:bg-indigo-50 transition pointer-events-auto"
              >
                <Pencil size={16} aria-hidden /> Chỉnh sửa thông tin
              </button>

              <div className="mt-6 mx-auto w-full max-w-[280px] space-y-2.5 text-left">
                {profile.email ? (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Mail
                      size={18}
                      className="text-slate-400 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 break-all leading-snug">
                      {profile.email}
                    </span>
                  </div>
                ) : null}
                {profile.phone ? (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Phone
                      size={18}
                      className="text-slate-400 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 tabular-nums leading-snug">
                      {profile.phone}
                    </span>
                  </div>
                ) : null}
                {profile.username ? (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <User
                      size={18}
                      className="text-slate-400 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 leading-snug">
                      @{profile.username}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 text-left">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>Level {profile.level}</span>
                  <span>
                    {Math.floor(profile.xp)} / {profile.nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-center italic">
                  Cố lên! Sắp lên cấp rồi! 🚀
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="bg-orange-100 p-2 rounded-full mb-1">
                    <Zap
                      size={20}
                      className="text-orange-500 fill-orange-500"
                    />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {profile.streak}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Chuỗi ngày
                  </span>
                </div>
                <div className="flex flex-col items-center border-x border-slate-100">
                  <div className="bg-amber-100 p-2 rounded-full mb-1">
                    <Coins
                      size={20}
                      className="text-amber-500 fill-amber-500"
                    />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {profile.gold}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Vàng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-sky-100 p-2 rounded-full mb-1">
                    <Gem size={20} className="text-sky-500 fill-sky-400" />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {profile.diamond}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Kim cương
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-6">
                <Link
                  href="/progress"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm hover:bg-indigo-50 hover:border-indigo-200 transition"
                >
                  <BarChart3 size={18} /> Tiến độ học tập
                </Link>
                <Link
                  href="/community"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow"
                >
                  <Sparkles size={18} /> Cộng đồng
                </Link>
              </div>
            </div>
          </div>

          {profile.id && studentCardLink ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <QRCodeCanvas value={studentCardLink} size={96} />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
                    <ScanLine size={18} /> Mã thẻ học viên
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 mb-3 leading-relaxed">
                    Quét QR để mở trang <strong className="text-white">thẻ học viên</strong>{" "}
                    (hiển thị đẹp trên điện thoại). Có thể chia sẻ link bên dưới.
                  </p>
                  <div className="bg-white/10 px-3 py-1 rounded text-xs font-mono tracking-wider inline-block border border-white/20">
                    ID: {profile.id.slice(0, 8).toUpperCase()}…
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                title="Chia sẻ link thẻ học viên"
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({
                      title: "Thẻ học viên SmartKids",
                      url: studentCardLink,
                    });
                  } else {
                    void navigator.clipboard.writeText(studentCardLink);
                  }
                }}
              >
                <Share2 size={16} />
              </button>
            </div>
          ) : null}
        </motion.div>

        {/* Cột phải: lịch + huy hiệu */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    Lịch học tập
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tháng {currentMonth + 1}, {currentYear}
                  </p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold">
                🔥 Đã điểm danh: {profile.attendance.length} ngày
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3 text-center mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-xs font-bold text-slate-400 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx} />;

                const isAttended =
                  profile.attendance.includes(day) ||
                  profile.attendance.includes(String(day));
                const isToday = day === currentDay;
                const isPast = day < currentDay;

                return (
                  <div
                    key={idx}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                      ${
                        isAttended
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                          : isToday
                            ? "bg-sky-100 text-sky-800 border-2 border-sky-300"
                            : isPast
                              ? "bg-slate-50 text-slate-300"
                              : "bg-white text-slate-600 border border-slate-100"
                      }
                    `}
                  >
                    {isAttended ? <Zap size={16} fill="currentColor" /> : day}
                    {isToday && !isAttended && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              Lịch điểm danh minh họa khi API trả mảng <code>attendance</code>{" "}
              (số ngày trong tháng).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" /> Huy hiệu
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {profile.badges.slice(0, 6).map((badge: any, i: number) => (
                  <div
                    key={badge._id ?? badge.id ?? i}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl border-2 transition-all ${
                      badge.unlocked !== false
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-100 grayscale opacity-60"
                    }`}
                    title={badge.name ?? ""}
                  >
                    {badge.icon ?? "🏅"}
                  </div>
                ))}
                {profile.badges.length === 0 &&
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center"
                    >
                      <span className="text-slate-300 text-xs">?</span>
                    </div>
                  ))}
              </div>
          </div>
        </motion.div>
      </motion.div>

      {editOpen ? (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-edit-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2
                id="profile-edit-title"
                className="text-lg font-black text-slate-900"
              >
                Hồ sơ &amp; bảo mật
              </h2>
              <button
                type="button"
                onClick={() =>
                  !saving && !passwordSaving && setEditOpen(false)
                }
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pt-4 flex gap-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditTab("profile");
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  editTab === "profile"
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditTab("password");
                  setFormError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition inline-flex items-center justify-center gap-2 ${
                  editTab === "password"
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <KeyRound size={16} />
                Đổi mật khẩu
              </button>
            </div>

            <div className="p-5 space-y-4">
              {editTab === "profile" ? (
                <>
                  {formError ? (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">
                      {formError}
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                        value={editForm.fullName}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            fullName: e.target.value,
                          }))
                        }
                        disabled={saving}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        disabled={saving}
                        placeholder="0xxx xxx xxx"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, email: e.target.value }))
                        }
                        disabled={saving}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Ảnh đại diện
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                          <img
                            src={editForm.avatar || FALLBACK_AVATAR}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition shadow">
                          <ImageIcon size={16} />
                          {uploading ? "Đang tải ảnh…" : "Chọn ảnh từ máy"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFile}
                            disabled={uploading || saving}
                          />
                        </label>
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Hoặc dán URL ảnh
                        </label>
                        <input
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none bg-white"
                          value={editForm.avatar}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              avatar: e.target.value,
                            }))
                          }
                          disabled={saving}
                          placeholder="https://..."
                        />
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          Ảnh sẽ được lưu sau khi bạn bấm &quot;Lưu thông tin&quot;.
                        </p>
                      </div>
                    </div>
                  </div>

                  {profile.username ? (
                    <p className="text-xs text-slate-400">
                      Tên đăng nhập{" "}
                      <span className="font-mono text-slate-600">
                        @{profile.username}
                      </span>{" "}
                      — liên hệ admin nếu cần đổi.
                    </p>
                  ) : null}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveProfile()}
                      disabled={saving || uploading}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : null}
                      Lưu thông tin
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {passwordError ? (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">
                      {passwordError}
                    </div>
                  ) : null}
                  {passwordSuccess ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3">
                      {passwordSuccess}
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Mật khẩu hiện tại *
                      </label>
                      <div className="relative">
                        <input
                          type={showPw.old ? "text" : "password"}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-11 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                          value={passwordForm.oldPassword}
                          onChange={(e) =>
                            setPasswordForm((f) => ({
                              ...f,
                              oldPassword: e.target.value,
                            }))
                          }
                          disabled={passwordSaving}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                          onClick={() =>
                            setShowPw((s) => ({ ...s, old: !s.old }))
                          }
                          aria-label="Hiện mật khẩu"
                        >
                          {showPw.old ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Mật khẩu mới * (ít nhất 6 ký tự)
                      </label>
                      <div className="relative">
                        <input
                          type={showPw.next ? "text" : "password"}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-11 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((f) => ({
                              ...f,
                              newPassword: e.target.value,
                            }))
                          }
                          disabled={passwordSaving}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                          onClick={() =>
                            setShowPw((s) => ({ ...s, next: !s.next }))
                          }
                          aria-label="Hiện mật khẩu"
                        >
                          {showPw.next ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Nhập lại mật khẩu mới *
                      </label>
                      <div className="relative">
                        <input
                          type={showPw.confirm ? "text" : "password"}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-11 text-sm font-medium focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((f) => ({
                              ...f,
                              confirmPassword: e.target.value,
                            }))
                          }
                          disabled={passwordSaving}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                          onClick={() =>
                            setShowPw((s) => ({ ...s, confirm: !s.confirm }))
                          }
                          aria-label="Hiện mật khẩu"
                        >
                          {showPw.confirm ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      disabled={passwordSaving}
                      className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSavePassword()}
                      disabled={passwordSaving}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {passwordSaving ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : null}
                      Đổi mật khẩu
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

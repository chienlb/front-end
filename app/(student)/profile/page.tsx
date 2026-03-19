"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  Loader2,
  Edit3,
  Calendar,
  Users,
  Award,
  Zap,
  Coins,
  Gem,
  ScanLine,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 50 },
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LOGIC LỊCH ---
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // Lấy ngày đầu tiên của tháng là thứ mấy (0: CN, 1: T2...)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Tổng số ngày trong tháng
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Tạo mảng ngày để render (bao gồm cả các ô trống đầu tháng)
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, friendsRes] = await Promise.all([
          api.get("/auths/profile"),
          api.get("/auths/friends/top"),
        ]);

        setUser(profileRes);
        setFriends((friendsRes as any) || []);
      } catch (e) {
        console.error("Lỗi tải profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-500">
        <p className="text-xl font-bold">Không tìm thấy thông tin.</p>
        <Link href="/" className="text-blue-500 hover:underline mt-2">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const friendLink = `${typeof window !== "undefined" ? window.location.origin : ""}/add-friend/${user.id}`;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-8 font-sans text-slate-800">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- CỘT TRÁI: THÔNG TIN USER --- */}
        <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants}>
          {/* USER CARD */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </div>

            {/* Avatar & Info */}
            <div className="px-6 pb-8 text-center -mt-16 relative z-10">
              <div className="relative inline-block group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden flex items-center justify-center">
                  {user.avatar.startsWith("http") ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-6xl">{user.avatar}</span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-800 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Edit3 size={14} />
                </div>
              </div>

              <h1 className="text-2xl font-black mt-3 text-slate-800">
                {user.name}
              </h1>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider bg-blue-50 inline-block px-3 py-1 rounded-full mt-1">
                {user.title || "Học viên mới"}
              </p>

              {/* LEVEL BAR */}
              <div className="mt-6 text-left">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>Level {user.level}</span>
                  <span>
                    {Math.floor(user.xp)}/{user.nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(user.xp / user.nextLevelXp) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-1 text-center italic">
                  Cố lên! Sắp lên cấp rồi! 🚀
                </p>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="bg-orange-100 p-2 rounded-full mb-1">
                    <Zap
                      size={20}
                      className="text-orange-500 fill-orange-500"
                    />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {user.streak}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Ngày
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-r border-slate-100">
                  <div className="bg-yellow-100 p-2 rounded-full mb-1">
                    <Coins
                      size={20}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {user.gold}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Vàng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 p-2 rounded-full mb-1">
                    <Gem size={20} className="text-blue-500 fill-blue-500" />
                  </div>
                  <span className="font-black text-lg text-slate-700">
                    {user.diamond}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    KC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR CODE CARD */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <QRCodeCanvas value={friendLink} size={80} />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ScanLine size={18} /> Thẻ Học Sinh
                </h3>
                <p className="text-slate-300 text-xs mt-1 mb-3">
                  Quét mã để kết bạn với tớ nhé!
                </p>
                <div className="bg-white/10 px-3 py-1 rounded text-xs font-mono tracking-wider inline-block border border-white/20">
                  ID: {user.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
            <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
              <Share2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* --- CỘT PHẢI: LỊCH & BẠN BÈ --- */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* 1. LỊCH ĐIỂM DANH */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    Lịch Học Tập
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tháng {currentMonth + 1}, {currentYear}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                🔥 Chăm chỉ: {user.attendance?.length || 0} ngày
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4 text-center mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-xs font-bold text-slate-400 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx}></div>;

                const isAttended = user.attendance?.includes(day);
                const isToday = day === currentDay;
                const isPast = day < currentDay;

                return (
                  <div
                    key={idx}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                      ${
                        isAttended
                          ? "bg-green-500 text-white shadow-md shadow-green-200"
                          : isToday
                            ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                            : isPast
                              ? "bg-slate-50 text-slate-300"
                              : "bg-white text-slate-600 border border-slate-100"
                      }
                    `}
                  >
                    {isAttended ? <Zap size={16} fill="currentColor" /> : day}
                    {isToday && !isAttended && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. DANH SÁCH BẠN BÈ */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-blue-500" /> Bạn Bè
                </h3>
                <Link
                  href="/friends"
                  className="text-xs font-bold text-blue-500 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="space-y-3">
                {friends.slice(0, 3).map((friend) => (
                  <Link
                    href={`/profile/${friend.id}`}
                    key={friend.id}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {friend.avatar?.startsWith("http") ? (
                        <img
                          src={friend.avatar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-lg">
                          {friend.avatar || "👶"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">
                        {friend.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Level {friend.level || 1}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/friends"
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition text-sm font-bold"
                >
                  + Thêm bạn mới
                </Link>
              </div>
            </div>

            {/* 3. HUY HIỆU */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Award size={20} className="text-yellow-500" /> Huy Hiệu
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {user.badges?.slice(0, 6).map((badge: any, i: number) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl border-2 transition-all ${
                      badge.unlocked
                        ? "bg-yellow-50 border-yellow-200 grayscale-0"
                        : "bg-slate-50 border-slate-100 grayscale opacity-50"
                    }`}
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))}
                {/* Placeholder badges nếu ít */}
                {(!user.badges || user.badges.length < 3) &&
                  [1, 2, 3]
                    .slice(0, 3 - (user.badges?.length || 0))
                    .map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200/50"></div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

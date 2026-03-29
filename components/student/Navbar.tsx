"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  ChevronDown,
  BookOpen,
  Gamepad2,
  Users,
  Newspaper,
  BookA,
  Lightbulb,
  GraduationCap,
  Target,
  Speech,
  MessageCircle,
  MonitorPlay,
  Phone,
  Search,
  X,
  Sparkles,
  Bell,
  Tag,
  Clock,
  Library,
  Trophy,
  ClipboardList,
  BarChart3,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { notificationService } from "@/services/notifications.service";

// Components
import InventoryModal from "@/components/student/course/InventoryModal";
import AITutorWidget from "./AITutorWidget";

type HeaderNotification = {
  id: string;
  title: string;
  desc: string;
  type: string;
  read: boolean;
  time: string;
  link?: string;
};

/** Tránh crash khi localStorage `currentUser` rỗng / không phải JSON hợp lệ (JSON.parse → Unexpected end of JSON input). */
function parseStoredUser(raw: string | null): Record<string, unknown> | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    const v = JSON.parse(t) as unknown;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // STATE
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<HeaderNotification | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  // --- CONFIG MENU DATA ---
  const navGroups = [
    {
      label: "Học tập",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        {
          name: "Khoá học",
          path: "/units",
          icon: BookOpen,
          desc: "Lộ trình bài bản",
        },
        {
          name: "Thơ văn",
          path: "/literatures",
          icon: Library,
          desc: "Bổ sung kiến thức",
        },
        {
          name: "Luyện phát âm",
          path: "/pronunciations",
          icon: Speech,
          desc: "Tập đọc, nói",
        },
        {
          name: "Bài tập về nhà",
          path: "/assignments",
          icon: ClipboardList,
          desc: "Deadline cần làm",
        },
        {
          name: "Bảng điểm & Tiến độ",
          path: "/progress",
          icon: BarChart3,
          desc: "Thống kê kết quả",
        },
        {
          name: "Luyện tập",
          path: "/practice",
          icon: Target,
          desc: "Ôn tập kiến thức",
        },
      ],
    },
    {
      label: "Cuộc thi",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        {
          name: "Cuộc thi & Sự kiện",
          path: "/competitions",
          icon: Trophy,
          desc: "Đấu trường trí tuệ",
        },
      ],
    },
    {
      label: "Xếp hạng",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      items: [
        {
          name: "Bảng xếp hạng",
          path: "/leaderboard",
          icon: ShieldCheck,
          desc: "Đua top vinh quang",
        },
      ],
    },
    {
      label: "Kết nối",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      items: [
        {
          name: "Nhóm của tôi",
          path: "/my-groups",
          icon: Users,
          desc: "Tìm kiếm và nhắn tin theo nhóm",
        },
        {
          name: "Cộng đồng",
          path: "/community",
          icon: MessageCircle,
          desc: "Diễn đàn trao đổi",
        },
        {
          name: "Feedback",
          path: "/feedback",
          icon: MessageSquare,
          desc: "Góp ý cho hệ thống",
        },
      ],
    },
    {
      label: "Từ điển",
      icon: BookA,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      items: [
        {
          name: "Tra từ điển",
          path: "/dictionary",
          icon: BookA,
          desc: "Tra cứu từ vựng nhanh",
        },
      ],
    },
    {
      label: "Bài viết",
      icon: Newspaper,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      items: [
        {
          name: "Danh sách",
          path: "/blogs",
          icon: MessageSquare,
          desc: "Biết thêm điều mới",
        }
      ],
    },
  ];

  // EFFECTS
  useEffect(() => {
    const fetchUser = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("currentUser");
        const parsed = parseStoredUser(storedUser);
        if (parsed) {
          setUser(parsed);
          userService
            .getProfile()
            .then((res) => {
              const profile = res?.data ?? res;
              if (profile && typeof profile === "object") {
                setUser({ ...parsed, ...profile });
              }
            })
            .catch(() => { });
        }
      }
    };
    fetchUser();

    const onProfileUpdated = () => {
      if (typeof window === "undefined") return;
      const storedUser = localStorage.getItem("currentUser");
      const parsed = parseStoredUser(storedUser) ?? {};
      userService
        .getProfile()
        .then((res) => {
          const profile = res?.data ?? res;
          if (profile && typeof profile === "object") {
            const merged = { ...parsed, ...profile };
            setUser(merged);
            localStorage.setItem("currentUser", JSON.stringify(merged));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("smartkids-profile-updated", onProfileUpdated);

    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setShowUserMenu(false);
      if (notiRef.current && !notiRef.current.contains(event.target))
        setShowNotiMenu(false);
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("smartkids-profile-updated", onProfileUpdated);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    setUser(null);
    router.push("/login");
  };

  const handlePetChange = () => {
    setShowInventory(false);
    window.location.reload();
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Vừa xong";
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 60) return `${Math.max(minutes, 1)} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const mapNotificationType = (rawType?: string) => {
    const t = String(rawType || "").toUpperCase();
    if (t.includes("PROMO") || t.includes("ANNOUNCE")) return "PROMO";
    if (t.includes("REMINDER") || t.includes("WARNING")) return "REMINDER";
    return "SYSTEM";
  };

  const getCurrentUserId = () => {
    const stored = parseStoredUser(
      typeof window !== "undefined" ? localStorage.getItem("currentUser") : null,
    );
    return String(
      stored?._id ||
        stored?.id ||
        stored?.userId ||
        "",
    ).trim();
  };

  const loadNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);
      const res = await notificationService.getNotificationsByUserId(userId, {
        page: 1,
        limit: 20,
      });

      const mapped: HeaderNotification[] = (res?.data || []).map((n: any) => ({
        id: String(n?._id ?? n?.id ?? ""),
        title: String(n?.title ?? "Thông báo"),
        desc: String(n?.message ?? ""),
        type: mapNotificationType(n?.type),
        read: Boolean(n?.isRead),
        time: formatTimeAgo(n?.createdAt),
        link: String(n?.data?.link ?? "").trim() || undefined,
      }));

      setNotifications(mapped.filter((n) => n.id));
    } catch (error) {
      console.error("Lỗi tải thông báo header:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleReadAllNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      await notificationService.markAllAsReadByUser(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Lỗi đánh dấu đọc tất cả:", error);
    }
  };

  const handleNotificationClick = async (notif: HeaderNotification) => {
    setExpandedNotificationId((prev) => (prev === notif.id ? null : notif.id));
    setSelectedNotification(notif);

    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      try {
        await notificationService.markAsRead(notif.id);
      } catch (error) {
        console.error("Lỗi đánh dấu đã đọc:", error);
      }
    }

  };

  const getNotiColor = (type: string) => {
    switch (type) {
      case "PROMO":
        return "bg-red-500 shadow-red-200";
      case "REMINDER":
        return "bg-amber-500 shadow-amber-200";
      default:
        return "bg-blue-500 shadow-blue-200";
    }
  };

  return (
    <>
      <div className="h-20"></div>

      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-slate-200 py-2"
          : "bg-white border-transparent py-3"
          }`}
      >
        <div className="container mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          {/* 1. LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3 mr-8 shrink-0 group"
          >
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:bg-blue-800 transition-colors transform group-hover:scale-105 duration-300">
              <GraduationCap size={22} strokeWidth={2.5} />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                Happy Cat
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                Education System
              </span>
            </div>
          </Link>

          {/* 2. MEGA MENU (DESKTOP) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group, idx) => {
              const isActiveGroup = group.items.some((i) =>
                pathname.startsWith(i.path),
              );
              return (
                <div key={idx} className="relative group px-2 py-2">
                  <button
                    className={`flex items-center gap-1.5 text-sm font-bold transition-all px-4 py-2.5 rounded-full ${isActiveGroup
                      ? `${group.color} ${group.bgColor} shadow-sm ring-1 ring-inset ring-current ring-opacity-10`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <group.icon size={18} strokeWidth={2.5} />
                    {group.label}
                    <ChevronDown
                      size={14}
                      className="opacity-50 group-hover:rotate-180 transition-transform duration-300"
                    />
                  </button>

                  <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out origin-top-left z-[60]">
                    <div className="grid gap-1">
                      {group.items.map((item) => {
                        const isActiveItem = pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-start gap-4 p-3 rounded-2xl transition-all group/item ${isActiveItem ? "bg-slate-50" : "hover:bg-slate-50"
                              }`}
                          >
                            <div
                              className={`p-3 rounded-xl transition-colors ${isActiveItem ? "bg-white shadow-sm text-blue-600" : "bg-slate-100 text-slate-500 group-hover/item:bg-white group-hover/item:shadow-sm group-hover/item:text-blue-500"}`}
                            >
                              <item.icon size={20} />
                            </div>
                            <div>
                              <div
                                className={`text-sm font-bold ${isActiveItem ? "text-blue-600" : "text-slate-700 group-hover/item:text-slate-900"}`}
                              >
                                {item.name}
                              </div>
                              <div className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* 3. RIGHT ACTIONS */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notiRef}>
                <button
                  onClick={() => {
                    setShowNotiMenu(!showNotiMenu);
                    setShowUserMenu(false);
                    if (!showNotiMenu) {
                      void loadNotifications();
                    }
                  }}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${showNotiMenu ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 text-slate-500"}`}
                >
                  <Bell
                    size={20}
                    className={showNotiMenu ? "animate-tada" : ""}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* Noti Dropdown */}
                {showNotiMenu && (
                  <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[80] overflow-hidden">
                    <div className="px-4 py-3 flex justify-between items-center border-b border-slate-50">
                      <h3 className="font-bold text-slate-800">Thông báo</h3>
                      <button
                        onClick={() => void handleReadAllNotifications()}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Đọc tất cả
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {loadingNotifications ? (
                        <div className="p-4 text-xs text-slate-500">Đang tải thông báo...</div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => void handleNotificationClick(notif)}
                            className={`flex gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group ${!notif.read ? "bg-blue-50/50" : ""}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${getNotiColor(notif.type)}`}
                            >
                              {notif.type === "PROMO" ? (
                                <Tag size={16} className="text-white" />
                              ) : (
                                <Clock size={16} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`text-sm font-bold mb-1 ${!notif.read ? "text-slate-900" : "text-slate-600"}`}
                              >
                                {notif.title}
                              </h4>
                              <p
                                className={`text-xs text-slate-500 ${expandedNotificationId === notif.id ? "" : "line-clamp-2"}`}
                              >
                                {notif.desc}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                {notif.time}
                              </span>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-slate-500">Chưa có thông báo nào.</div>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-50 text-center">
                      <Link
                        href="/notifications"
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotiMenu(false);
                  }}
                  className={`flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border transition-all duration-200 group ${showUserMenu
                    ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                    }`}
                >
                  <div className="hidden md:flex flex-col items-end mr-2 px-2 text-right">
                    <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">
                      {user.fullname || "Học viên"}
                    </span>
                    <span className="text-[10px] font-black text-amber-500 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-amber-100">
                      <Sparkles size={8} fill="currentColor" />{" "}
                      {user.gold?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="relative w-10 h-10">
                    <img
                      src={
                        user.avatar ||
                        `https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg`
                      }
                      className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                      alt="Avatar"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 z-[70]">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-3 flex items-center gap-4 text-white shadow-lg relative overflow-hidden">
                      <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-sm shrink-0">
                        <img
                          src={user.avatar}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="relative z-10">
                        <p className="font-bold text-lg truncate">
                          {user.fullName}
                        </p>
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition inline-flex items-center gap-1 backdrop-blur-sm"
                        >
                          Hồ sơ của tôi{" "}
                          <ChevronDown size={10} className="-rotate-90" />
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Link
                        href="/progress"
                        onClick={() => setShowUserMenu(false)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-slate-600 hover:text-cyan-700 transition border border-cyan-100"
                      >
                        <BarChart3 size={22} className="mb-2 text-cyan-500" />
                        <span className="text-xs font-bold">Tiến độ học</span>
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setShowUserMenu(false)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition border border-blue-100"
                      >
                        <Bell size={22} className="mb-2 text-blue-500" />
                        <span className="text-xs font-bold">Thông báo</span>
                      </Link>
                    </div>

                    <div className="space-y-1 mb-3">
                      {/* Đã xóa link Góc phụ huynh ở đây */}
                      <Link
                        href="/subscription"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                      >
                        <Target size={18} className="text-indigo-500" /> Gói
                        cước VIP
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Phone size={18} className="text-slate-400" /> Hỗ trợ
                      </Link>
                    </div>

                    <div className="h-px bg-slate-100 my-2 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm transition"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-sm"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5 transition-all text-sm"
                >
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <span className="font-extrabold text-xl text-slate-800">
                Menu
              </span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              {navGroups.map((group, idx) => (
                <div
                  key={idx}
                  className="animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <h4
                    className={`font-black uppercase text-xs mb-4 flex items-center gap-2 ${group.color.replace("text-", "text-opacity-80 text-")}`}
                  >
                    <group.icon size={16} /> {group.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl text-center border transition-all ${pathname.startsWith(item.path) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-transparent hover:bg-slate-50 hover:shadow-sm"}`}
                      >
                        <item.icon
                          className={`mb-2 ${pathname.startsWith(item.path) ? "text-blue-600" : "text-slate-400"}`}
                          size={24}
                        />
                        <span
                          className={`text-xs font-bold ${pathname.startsWith(item.path) ? "text-blue-700" : "text-slate-600"}`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    ))}

                    {selectedNotification && (
                      <div
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onMouseDown={(e) => {
                          if (e.target !== e.currentTarget) return;
                          setSelectedNotification(null);
                        }}
                      >
                        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-black text-slate-900">
                                Chi tiết thông báo
                              </h3>
                              <p className="text-xs text-slate-400 mt-1">{selectedNotification.time}</p>
                            </div>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() => setSelectedNotification(null)}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="px-5 py-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-2">
                              {selectedNotification.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {selectedNotification.desc || "Không có nội dung chi tiết."}
                            </p>
                          </div>

                          <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedNotification(null)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
                            >
                              Đóng
                            </button>
                            {selectedNotification.link && (
                              <button
                                type="button"
                                onClick={() => {
                                  const target = selectedNotification.link;
                                  setSelectedNotification(null);
                                  setShowNotiMenu(false);
                                  router.push(target);
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                              >
                                Đi tới liên quan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!user && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full py-3 text-center font-bold text-slate-600 bg-slate-50 rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full py-3 text-center font-bold text-white bg-blue-600 rounded-xl shadow-lg"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        currentPetId={user?.equippedPet?._id || user?.equippedPet}
        onEquipSuccess={handlePetChange}
      />
      {user && <AITutorWidget />}
    </>
  );
}

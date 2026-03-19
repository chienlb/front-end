"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Heart,
  FileQuestion,
  Headset,
  FileInput,
  Trophy,
  Settings,
  NotebookPen,
  BarChart3,
  MessageSquareText,
  UserCog,
  CalendarDays,
  School,
  Contact,
  GraduationCap,
  Bell,
  Search,
  Menu,
  Dumbbell,
  Database,
  ClipboardList,
  PenTool,
  Users,
} from "lucide-react";

// --- 1. COMPONENT SIDEBAR ---
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      group: "GIẢNG DẠY",
      items: [
        { name: "Tổng quan", href: "/teacher", icon: LayoutDashboard },
        {
          name: "Báo cáo tiến độ",
          href: "/teacher/analytics",
          icon: BarChart3,
        },
        { name: "Lịch dạy", href: "/teacher/schedule", icon: CalendarDays },
        { name: "Lớp chủ nhiệm", href: "/teacher/classes", icon: School },
      ],
    },
    {
      group: "SOẠN THẢO",
      items: [
        { name: "Giáo trình", href: "/teacher/courses", icon: BookOpen },
        {
          name: "Ngân hàng câu hỏi",
          href: "/teacher/questions",
          icon: Database,
        },
        {
          name: "Bài tập & Kiểm tra",
          href: "/teacher/assignments",
          icon: ClipboardList,
        },
        { name: "Luyện tập", href: "/teacher/practice", icon: Dumbbell }, // Changed to Dumbbell
        { name: "Cuộc thi", href: "/teacher/competitions", icon: Trophy },
        { name: "Thư viện Media", href: "/teacher/resources", icon: Library },
      ],
    },
    {
      group: "QUẢN LÝ",
      items: [
        { name: "Quản lý học sinh", href: "/teacher/students", icon: Users }, // Changed to Users
        { name: "Sổ tay học sinh", href: "/teacher/handbook", icon: Contact },
        { name: "Chấm điểm", href: "/teacher/grading", icon: PenTool }, // Changed to PenTool
        {
          name: "Giao tiếp",
          href: "/teacher/communication",
          icon: MessageSquareText,
        },
      ],
    },
    {
      group: "HỆ THỐNG",
      items: [
        { name: "Hồ sơ cá nhân", href: "/teacher/profile", icon: UserCog },
        { name: "Yêu cầu hỗ trợ", href: "/teacher/requests", icon: FileInput },
        { name: "Cài đặt", href: "/teacher/settings", icon: Settings },
        { name: "Trợ giúp", href: "/teacher/support", icon: Headset },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out z-50
      ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* --- LOGO AREA --- */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 shrink-0 sticky top-0 bg-[#0F172A] z-10">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap px-4">
          {/* Logo Icon */}
          <div
            className={`w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 shrink-0 ${isCollapsed ? "scale-110" : "scale-100"}`}
          >
            <GraduationCap className="text-white" size={22} />
          </div>

          {/* Logo Text */}
          <div
            className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            <span className="text-xl font-bold text-white tracking-tight block">
              Smart<span className="text-blue-500">Teach</span>
            </span>
          </div>
        </div>
      </div>

      {/* --- MENU LIST --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-8">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="px-3">
            {/* Group Label */}
            <div
              className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "text-center" : "px-3"}`}
            >
              {isCollapsed ? (
                <span className="block w-6 h-[2px] bg-slate-800 mx-auto rounded-full"></span>
              ) : (
                group.group
              )}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/teacher"
                    ? pathname === "/teacher"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group flex items-center"
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm w-full relative overflow-hidden
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                            : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      <item.icon
                        size={20}
                        className={`shrink-0 transition-transform duration-300 ${
                          !isCollapsed && isActive ? "scale-105" : ""
                        }`}
                      />

                      {/* Text Menu */}
                      <span
                        className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}
                      >
                        {item.name}
                      </span>

                      {/* Active Indicator (Small dot for collapsed mode) */}
                      {isActive && isCollapsed && (
                        <span className="absolute right-2 top-2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-sm"></span>
                      )}
                    </div>

                    {/* Tooltip khi thu gọn */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-slate-700 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none">
                        {item.name}
                        {/* Mũi tên tooltip */}
                        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* --- FOOTER USER --- */}
      <div className="p-4 border-t border-slate-800 shrink-0 bg-[#0F172A]">
        <div
          className={`bg-slate-800/40 rounded-xl transition-all duration-300 border border-slate-800/50 flex items-center ${isCollapsed ? "justify-center p-2" : "p-3 gap-3"}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shrink-0 shadow-inner ring-2 ring-slate-800">
            <Heart size={16} className="text-white fill-white animate-pulse" />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}
          >
            <p className="text-xs font-bold text-white truncate">
              Smart Education
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Phiên bản v1.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// --- 2. LAYOUT CHÍNH (WRAPPER) ---
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State quản lý mở/đóng sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100">
      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${isCollapsed ? "ml-20" : "ml-72"}`}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between transition-all duration-300 shadow-sm">
          {/* Left: Toggle Button & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 -ml-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors active:scale-95 border border-transparent hover:border-slate-200"
              title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              <Menu size={20} />
            </button>

            <div className="hidden md:block h-5 w-px bg-slate-200 mx-1"></div>

            <div className="hidden md:block">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Hệ thống quản lý
              </h2>
              <p className="text-sm font-bold text-slate-800 leading-none">
                Teacher Portal
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Box */}
            <div className="hidden md:flex items-center bg-slate-100/50 hover:bg-white px-3 py-2 rounded-xl border border-slate-200/50 hover:border-blue-300 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-100 transition-all w-64 group cursor-text">
              <Search
                size={16}
                className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                placeholder="Tìm kiếm nhanh (Ctrl + K)"
                className="bg-transparent border-none outline-none text-xs font-medium text-slate-700 ml-2 w-full placeholder:text-slate-400"
              />
            </div>

            {/* Notification */}
            <button className="relative p-2.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors border border-transparent hover:border-slate-200">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
                  Cô Minh Anh
                </p>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 group-hover:bg-blue-100 transition">
                  Giáo viên
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=5"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform group-hover:shadow-lg group-hover:ring-2 ring-blue-100"
                  alt="Avatar"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 relative overflow-hidden bg-[#F8FAFC]">
          <div className="relative z-10 mx-auto w-full animate-in fade-in duration-500 slide-in-from-bottom-2">
            {children}
          </div>
        </main>

        <footer className="py-6 text-center border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-400">
            © 2026 SmartKids Education System.{" "}
            <span className="hidden sm:inline opacity-70">
              All rights reserved.
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}

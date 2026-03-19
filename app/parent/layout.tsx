"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LineChart,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  LifeBuoy,
  History,
  Menu,
  Search,
  Baby,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

// --- 1. CONFIG MENU ---
const MENU_ITEMS = [
  {
    group: "QUẢN LÝ",
    items: [
      { name: "Tổng quan", href: "/parent", icon: LayoutDashboard },
      { name: "Quản lý hồ sơ con", href: "/parent/children", icon: Users },
    ],
  },
  {
    group: "HỌC TẬP",
    items: [
      { name: "Kết quả học tập", href: "/parent/reports", icon: LineChart },
      { name: "Nhật ký hoạt động", href: "/parent/activities", icon: History },
    ],
  },
  {
    group: "TÀI CHÍNH & LIÊN HỆ",
    items: [
      { name: "Gói học phí", href: "/parent/subscription", icon: CreditCard },
      {
        name: "Nhắn tin Giáo viên",
        href: "/parent/messages",
        icon: MessageSquare,
      },
      {
        name: "Thông báo nhà trường",
        href: "/parent/notifications",
        icon: Bell,
      },
    ],
  },
  {
    group: "HỆ THỐNG",
    items: [
      { name: "Hỗ trợ & Khiếu nại", href: "/parent/support", icon: LifeBuoy },
      { name: "Cài đặt tài khoản", href: "/parent/settings", icon: Settings },
    ],
  },
];

// --- 2. COMPONENT SIDEBAR ---
function ParentSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-sm
      ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* LOGO AREA */}
      <div className="h-16 flex items-center justify-center border-b border-slate-100 shrink-0 relative overflow-hidden bg-white/50 backdrop-blur-sm">
        <Link
          href="/parent/dashboard"
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
            <GraduationCap size={22} />
          </div>

          <div
            className={`flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">
              Parent<span className="text-blue-600">Portal</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Dành cho phụ huynh
            </span>
          </div>
        </Link>
      </div>

      {/* MENU LIST */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-8 scroll-smooth hover:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} className="px-3">
            {/* Group Label */}
            <div
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap ${isCollapsed ? "text-center" : "px-3"}`}
            >
              {isCollapsed ? (
                <div className="h-0.5 w-4 bg-slate-200 mx-auto rounded-full" />
              ) : (
                group.group
              )}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <item.icon
                      size={20}
                      className={`shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />

                    {!isCollapsed && (
                      <span className="ml-3 text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                        {item.name}
                      </span>
                    )}

                    {/* Active Indicator (Right Border) */}
                    {!isCollapsed && isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full"></div>
                    )}

                    {/* Tooltip khi thu gọn */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] shadow-xl pointer-events-none translate-x-[-10px] group-hover:translate-x-0">
                        {item.name}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <button
          className={`flex items-center w-full px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogOut
            size={20}
            className="shrink-0 group-hover:-translate-x-1 transition-transform"
          />
          {!isCollapsed && (
            <span className="ml-3 text-sm font-bold">Đăng xuất</span>
          )}
        </button>
      </div>
    </aside>
  );
}

// --- 3. LAYOUT CHÍNH ---
export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Sidebar Component */}
      <ParentSidebar isCollapsed={!isSidebarOpen} />

      {/* Main Content Wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${isSidebarOpen ? "ml-72" : "ml-20"}`}
      >
        {/* HEADER */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
          {/* Left: Toggle & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500 transition active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
            <h1 className="text-sm font-bold text-slate-700 hidden md:block">
              Cổng thông tin Phụ huynh
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-full w-64 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Notification */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown Trigger */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700">
                  Phụ huynh Bé Na
                </p>
                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Premium Plan
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=32"
                  alt="Parent Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 relative">
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50 to-transparent -z-10 pointer-events-none"></div>

          <div className="relative z-10 mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        {/* FOOTER TEXT */}
        <footer className="py-6 text-center">
          <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-yellow-500" />
            Đồng hành cùng sự phát triển của con
          </p>
        </footer>
      </div>
    </div>
  );
}

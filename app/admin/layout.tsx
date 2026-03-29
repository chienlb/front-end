"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  GraduationCap,
  MessageSquare,
  LogOut,
  Settings,
  UserCircle2,
  ChevronDown,
} from "lucide-react";
import { ADMIN_MENU } from "@/components/admin/admin-constants";
import { authService } from "@/services/auth.service";

function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-[#0B1120] text-slate-300
      border-r border-slate-800/50 shadow-2xl transition-all duration-300 flex flex-col
      ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* --- 1. LOGO --- */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800/50 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shrink-0">
            <GraduationCap size={20} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-lg font-bold text-white leading-none">
                Smart<span className="text-blue-500">Admin</span>
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* --- 2. MENU --- */}
      <div className="flex-1 overflow-y-auto min-h-0 py-6 px-3 space-y-8 scroll-smooth hover:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {ADMIN_MENU.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-3 tracking-wider">
                {group.group}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}`}
                  >
                    <span
                      className={`shrink-0 ${active ? "" : "group-hover:text-white"}`}
                    >
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="block text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="h-6"></div>
      </div>

      {/* --- 3. FOOTER --- */}
      <div className="p-4 border-t border-slate-800/50 bg-[#0B1120] shrink-0 z-10">
        <div className="bg-slate-900/50 rounded-xl p-3 flex items-center gap-3 border border-slate-800/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
            SA
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">
                Quản trị hệ thống
              </p>
              <p className="text-[10px] text-slate-400 truncate">v2.0.5</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const activeMenuItem =
    ADMIN_MENU.flatMap((group) => group.items).find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(item.href + "/"),
    ) ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network/server logout errors
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("currentUser");
      }
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} />

      <div
        className={`min-h-screen transition-all duration-300 flex flex-col bg-white
        shadow-[-8px_0_24px_rgba(15,23,42,0.06)]
        ${collapsed ? "ml-20" : "ml-72"}`}
      >
        <header className="h-16 sticky top-0 z-40 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 -ml-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition active:scale-95
              shadow-sm hover:bg-blue-50 hover:text-blue-700"
              title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-900">
                {activeMenuItem?.name ?? "Tổng quan hệ thống"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div
              className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl w-80 transition-all group
              border border-slate-200 bg-slate-50 shadow-sm focus-within:border-blue-300 focus-within:bg-white"
            >
              <Search
                size={18}
                className="text-slate-500 group-focus-within:text-blue-600"
              />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none text-sm w-full font-medium text-slate-800 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition
                shadow-sm hover:bg-blue-50 hover:text-blue-700"
              >
                <MessageSquare size={20} />
              </button>

              <button
                className="p-2 rounded-xl relative border border-slate-200 bg-slate-100 text-slate-700 transition
                shadow-sm hover:bg-blue-50 hover:text-blue-700"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-100 animate-pulse"></span>
              </button>
            </div>

            <div className="relative pl-4 border-l border-slate-500/15" ref={userMenuRef}>
              <button
                onClick={() => setOpenUserMenu((v) => !v)}
                className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-1 transition bg-transparent hover:bg-slate-100"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">
                    {user?.fullName || user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    {String(user?.role?.name || user?.role || "Quản trị")}
                  </p>
                </div>
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      String(user?.fullName || user?.name || "Quản trị viên"),
                    )}&background=0F172A&color=fff`
                  }
                  className="w-10 h-10 rounded-full ring-2 ring-slate-500/15 shadow-[2px_2px_6px_rgba(15,23,42,0.12)]"
                  alt="Avatar"
                />
                <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50">
                  <button
                    onClick={() => {
                      setOpenUserMenu(false);
                      router.push("/admin/settings");
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Settings size={16} /> Cài đặt tài khoản
                  </button>
                  <button
                    onClick={() => {
                      setOpenUserMenu(false);
                      router.push("/admin");
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <UserCircle2 size={16} /> Trang quản trị
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-6 md:p-8 relative overflow-x-hidden min-h-0 bg-transparent">
          <div className="relative z-10 mx-auto w-full rounded-[2rem] border border-transparent bg-transparent shadow-primary-card backdrop-blur animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

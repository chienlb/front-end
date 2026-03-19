"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, GraduationCap, MessageSquare } from "lucide-react";
import { ADMIN_MENU } from "@/components/admin/admin-constants";

function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-[#0B1120] text-slate-400
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
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 px-3 tracking-wider">
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
                        : "hover:bg-slate-800/50 hover:text-slate-100"
                    }
                    ${collapsed ? "justify-center" : ""}`}
                  >
                    <span
                      className={`shrink-0 ${active ? "" : "group-hover:text-white"}`}
                    >
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
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
                System Admin
              </p>
              <p className="text-[10px] text-slate-500 truncate">v2.0.5</p>
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} />

      {/* Main Wrapper */}
      <div
        className={`min-h-screen transition-all duration-300 flex flex-col
        ${collapsed ? "ml-20" : "ml-72"}`}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-500 transition active:scale-95"
              title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 hidden md:block">
              Tổng quan hệ thống
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 bg-gray-100/80 hover:bg-gray-100 px-4 py-2 rounded-xl w-80 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all group">
              <Search
                size={18}
                className="text-gray-400 group-focus-within:text-blue-500"
              />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none text-sm w-full font-medium text-gray-700"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 transition">
                <MessageSquare size={20} />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-full relative text-gray-500 hover:text-blue-600 transition">
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-700">Admin</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Super User
                </p>
              </div>
              <img
                src="https://ui-avatars.com/api/?name=Admin+Supper&background=0F172A&color=fff"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          <div className="relative z-10 mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

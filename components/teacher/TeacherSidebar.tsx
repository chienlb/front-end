"use client";
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
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

// Định nghĩa Props nhận từ Layout
interface TeacherSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function TeacherSidebar({
  isCollapsed,
  toggleSidebar,
}: TeacherSidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      group: "GIẢNG DẠY",
      items: [
        {
          name: "Tổng quan",
          href: "/teacher/dashboard",
          icon: LayoutDashboard,
        },
        { name: "Lịch dạy", href: "/teacher/schedule", icon: CalendarDays },
        { name: "Lớp chủ nhiệm", href: "/teacher/classes", icon: School },
      ],
    },
    {
      group: "SOẠN THẢO & NỘI DUNG",
      items: [
        {
          name: "Giáo trình & Bài giảng",
          href: "/teacher/courses",
          icon: BookOpen,
        },
        {
          name: "Ngân hàng câu hỏi",
          href: "/teacher/questions",
          icon: FileQuestion,
        },
        {
          name: "Bài tập & Kiểm tra",
          href: "/teacher/assignments",
          icon: NotebookPen,
        },
        {
          name: "Cuộc thi & Sự kiện",
          href: "/teacher/competitions",
          icon: Trophy,
        },
        { name: "Thư viện Media", href: "/teacher/resources", icon: Library },
      ],
    },
    {
      group: "QUẢN LÝ HỌC SINH",
      items: [
        { name: "Sổ tay học sinh", href: "/teacher/handbook", icon: Contact },
        {
          name: "Chấm điểm & Feedback",
          href: "/teacher/grading",
          icon: NotebookPen,
        },
        {
          name: "Báo cáo tiến độ",
          href: "/teacher/analytics",
          icon: BarChart3,
        },
        {
          name: "Trung tâm giao tiếp",
          href: "/teacher/communication",
          icon: MessageSquareText,
        },
      ],
    },
    {
      group: "CÁ NHÂN & HỖ TRỢ",
      items: [
        { name: "Hồ sơ & Hợp đồng", href: "/teacher/profile", icon: UserCog },
        {
          name: "Yêu cầu & Đề xuất",
          href: "/teacher/requests",
          icon: FileInput,
        },
        { name: "Cài đặt", href: "/teacher/settings", icon: Settings },
        { name: "Hỗ trợ Kỹ thuật", href: "/teacher/support", icon: Headset },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen fixed left-0 top-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out z-50
      ${isCollapsed ? "w-20" : "w-72"} 
      `}
    >
      {/* 1. Header Logo & Toggle Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 sticky top-0 bg-slate-900 z-10 relative">
        {/* Logo Text - Ẩn khi collapse */}
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-white whitespace-nowrap">
            Smart<span className="text-blue-500">Teach</span>
          </span>
        </div>

        {/* Logo Icon Only - Hiện khi collapse */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${
            isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <School className="text-white" size={20} />
          </div>
        </div>

        {/* Toggle Button: Gọi hàm từ Props */}
        <button
          onClick={toggleSidebar}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors shadow-lg z-20`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* 2. Menu List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="px-3">
            {!isCollapsed ? (
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 transition-opacity duration-300">
                {group.group}
              </h3>
            ) : (
              <div className="h-px w-8 bg-slate-800 mx-auto mb-4 mt-2" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group flex items-center"
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm w-full
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/40"
                            : "hover:bg-slate-800 hover:text-white text-slate-400"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      <item.icon
                        size={isCollapsed ? 22 : 18}
                        className={`shrink-0 transition-transform duration-300 ${
                          !isCollapsed && isActive ? "scale-110" : ""
                        }`}
                      />
                      <span
                        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {/* Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-slate-700 translate-x-2 group-hover:translate-x-0">
                        {item.name}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 transform rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer Quote */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div
          className={`bg-slate-800/50 rounded-xl transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
              <Heart size={14} className="text-white animate-pulse" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}
            >
              <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-2">
                "Người thầy cầm tay, mở ra khối óc..."
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

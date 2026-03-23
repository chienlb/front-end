import {
  LayoutDashboard,
  Tags,
  LibraryBig,
  BookOpen,
  Trophy,
  School,
  Users,
  GraduationCap,
  Settings,
  Newspaper,
  Headphones,
  MessageSquareText,
} from "lucide-react";

export const ADMIN_MENU = [
  {
    group: "QUẢN TRỊ",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        href: "/admin",
      },
      {
        name: "Chủ đề bài học",
        icon: <Tags size={20} />,
        href: "/admin/units",
      },
      {
        name: "Quản lý bài học",
        icon: <BookOpen size={20} />,
        href: "/admin/lessons",
      },
      {
        name: "Thư viện văn học",
        icon: <LibraryBig size={20} />,
        href: "/admin/resources",
      },
      {
        name: "Quản lý học viên",
        icon: <Users size={20} />,
        href: "/admin/students",
      },
      {
        name: "Quản lý giáo viên",
        icon: <GraduationCap size={20} />,
        href: "/admin/tutors",
      },
      {
        name: "Feedback",
        icon: <MessageSquareText size={20} />,
        href: "/admin/reports",
      },
      {
        name: "Hỗ trợ người dùng",
        icon: <Headphones size={20} />,
        href: "/admin/support",
      },
      {
        name: "Quản lý lớp học",
        icon: <School size={20} />,
        href: "/admin/classes",
      },
      {
        name: "Cuộc thi",
        icon: <Trophy size={20} />,
        href: "/admin/competitions",
      },
      {
        name: "Tin tức & blogs",
        icon: <Newspaper size={20} />,
        href: "/admin/posts",
      },
      {
        name: "Cài đặt hệ thống",
        icon: <Settings size={20} />,
        href: "/admin/settings",
      },
    ],
  },
];

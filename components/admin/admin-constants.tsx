import {
  LayoutDashboard,
  PieChart,
  Library,
  School,
  CalendarDays,
  Users,
  Baby,
  GraduationCap,
  AlertTriangle,
  Gamepad2,
  Gift,
  MessageSquare,
  TicketPercent,
  BellRing,
  Megaphone,
  DollarSign,
  CreditCard,
  Shield,
  History,
  Settings,
  Newspaper,
  ClipboardCheck,
  Package,
  Receipt,
  Briefcase,
  FileSignature,
  Headphones,
  FolderOpen,
  Undo2,
  AirVentIcon,
  Bot,
} from "lucide-react";

export const ADMIN_MENU = [
  // 1. TỔNG QUAN
  {
    group: "TỔNG QUAN",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        href: "/admin",
      },
      {
        name: "Báo cáo Đào tạo",
        icon: <PieChart size={20} />,
        href: "/admin/analytics",
      },
    ],
  },

  // 2. QUẢN LÝ ĐÀO TẠO (Content & Classes)
  {
    group: "QUẢN LÝ ĐÀO TẠO",
    items: [
      {
        name: "Kho Khóa học",
        icon: <Library size={20} />,
        href: "/admin/courses",
      },
      {
        name: "Duyệt Game và cuộc thi",
        icon: <ClipboardCheck size={20} />,
        href: "/admin/approvals",
      },
      {
        name: "Quản lý Lớp học",
        icon: <School size={20} />,
        href: "/admin/classes",
      },
      {
        name: "Kho Tài nguyên",
        icon: <FolderOpen size={20} />,
        href: "/admin/resources",
      },
    ],
  },

  // 3. NGƯỜI DÙNG (Users)
  {
    group: "NGƯỜI DÙNG",
    items: [
      {
        name: "Danh sách Học viên",
        icon: <Users size={20} />,
        href: "/admin/students",
      },
      {
        name: "Danh sách Phụ huynh",
        icon: <Baby size={20} />,
        href: "/admin/parents",
      },
    ],
  },

  // 4. ĐỐI TÁC & GIÁO VIÊN (Teachers)
  {
    group: "ĐỐI TÁC & GIÁO VIÊN",
    items: [
      {
        name: "Danh sách Giảng viên",
        icon: <GraduationCap size={20} />,
        href: "/admin/tutors",
      },
      {
        name: "Tuyển dụng & Duyệt",
        icon: <Briefcase size={20} />,
        href: "/admin/recruitment",
      },
      {
        name: "Hợp đồng & Lương",
        icon: <FileSignature size={20} />,
        href: "/admin/contracts",
      },
      {
        name: "Yêu cầu & Đề xuất",
        icon: <MessageSquare size={20} />,
        href: "/admin/requests",
      },
    ],
  },

  // 5. KINH DOANH (Business)
  {
    group: "KINH DOANH",
    items: [
      {
        name: "Quản lý Gói cước",
        icon: <Package size={20} />,
        href: "/admin/packages",
      },
      {
        name: "Quản lý Đăng ký",
        icon: <CreditCard size={20} />,
        href: "/admin/subscriptions",
      },
      {
        name: "Giao dịch & Hoàn tiền",
        icon: <Receipt size={20} />,
        href: "/admin/transactions",
      },
    ],
  },

  // 6. MARKETING & TRUYỀN THÔNG
  {
    group: "MARKETING & TRUYỀN THÔNG",
    items: [
      {
        name: "Tin tức & Blog",
        icon: <Newspaper size={20} />,
        href: "/admin/posts",
      },
      {
        name: "Banner Quảng cáo",
        icon: <Megaphone size={20} />,
        href: "/admin/banners",
      },
      {
        name: "Thông báo hệ thống",
        icon: <BellRing size={20} />,
        href: "/admin/notifications",
      },
      {
        name: "Mã giảm giá",
        icon: <TicketPercent size={20} />,
        href: "/admin/vouchers",
      },
    ],
  },

  // 7. GAMIFICATION & CỘNG ĐỒNG
  {
    group: "GAMIFICATION",
    items: [
      {
        name: "Level & Huy hiệu",
        icon: <Gamepad2 size={20} />,
        href: "/admin/gamification",
      },
      {
        name: "Cửa hàng đổi quà",
        icon: <Gift size={20} />,
        href: "/admin/shop",
      },
      {
        name: "Kiểm duyệt Cộng đồng",
        icon: <Shield size={20} />,
        href: "/admin/community",
      },
    ],
  },

  // 8. HỖ TRỢ & HỆ THỐNG
  {
    group: "HỆ THỐNG & HỖ TRỢ",
    items: [
      {
        name: "Ticket Hỗ trợ",
        icon: <Headphones size={20} />,
        href: "/admin/support",
      },
      {
        name: "Phân quyền (Roles)",
        icon: <Users size={20} />,
        href: "/admin/roles",
      },
      {
        name: "Nhật ký hoạt động",
        icon: <History size={20} />,
        href: "/admin/audit-logs",
      },
      {
        name: "Cài đặt AI",
        icon: <Bot size={20} />,
        href: "/admin/ai-management",
      },
      {
        name: "Cài đặt hệ thống",
        icon: <Settings size={20} />,
        href: "/admin/settings",
      },
    ],
  },
];

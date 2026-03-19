"use client";
import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  Info,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  Clock,
  MoreHorizontal,
} from "lucide-react";

// --- TYPES ---
type NotiType = "INFO" | "SUCCESS" | "WARNING" | "ANNOUNCEMENT";

interface Notification {
  id: string;
  type: NotiType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string; // Link điều hướng (đến bài tập, thanh toán)
}

// --- MOCK DATA ---
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "N1",
    type: "WARNING",
    title: "Sắp hết hạn gói học",
    message:
      "Gói Premium của bé Nguyễn Văn An sẽ hết hạn trong 3 ngày tới. Vui lòng gia hạn để không gián đoạn việc học.",
    time: "2 giờ trước",
    isRead: false,
    link: "/parent/subscription",
  },
  {
    id: "N2",
    type: "SUCCESS",
    title: "Bé Ngọc hoàn thành xuất sắc bài tập",
    message:
      "Chúc mừng! Bé Trần Bảo Ngọc vừa đạt điểm 10/10 bài kiểm tra Unit 3: Animals.",
    time: "5 giờ trước",
    isRead: false,
    link: "/parent/reports",
  },
  {
    id: "N3",
    type: "INFO",
    title: "Bài tập về nhà mới",
    message: "Cô Lan Anh đã giao bài tập mới cho lớp 3A. Hạn nộp: 20/11/2023.",
    time: "1 ngày trước",
    isRead: true,
    link: "/parent/dashboard", // Giả định link
  },
  {
    id: "N4",
    type: "ANNOUNCEMENT",
    title: "Bảo trì hệ thống",
    message:
      "Hệ thống sẽ bảo trì nâng cấp từ 00:00 đến 02:00 ngày mai. Xin lỗi vì sự bất tiện này.",
    time: "2 ngày trước",
    isRead: true,
  },
  {
    id: "N5",
    type: "SUCCESS",
    title: "Thanh toán thành công",
    message: "Đã nhận được thanh toán 199.000đ cho gói Basic (Bé Ngọc).",
    time: "3 ngày trước",
    isRead: true,
    link: "/parent/subscription",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  // Filter Logic
  const filteredList =
    filter === "ALL" ? notifications : notifications.filter((n) => !n.isRead);

  // Actions
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Helper: Icon & Style based on Type
  const getTypeStyle = (type: NotiType) => {
    switch (type) {
      case "WARNING":
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bg: "bg-orange-50",
        };
      case "SUCCESS":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-50",
        };
      case "ANNOUNCEMENT":
        return {
          icon: Megaphone,
          color: "text-purple-500",
          bg: "bg-purple-50",
        };
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-50" };
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            Thông Báo{" "}
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {notifications.filter((n) => !n.isRead).length} mới
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cập nhật tin tức mới nhất từ Happy Cat.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <Check size={16} /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setFilter("ALL")}
          className={`pb-3 text-sm font-bold border-b-2 transition ${filter === "ALL" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-800"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`pb-3 text-sm font-bold border-b-2 transition ${filter === "UNREAD" ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-800"}`}
        >
          Chưa đọc
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const style = getTypeStyle(item.type);
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`relative p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group flex gap-4 ${
                  item.isRead
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/50 border-blue-100"
                }`}
              >
                {/* Status Indicator */}
                {!item.isRead && (
                  <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                )}

                {/* Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
                >
                  <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 pr-8">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-bold text-base ${item.isRead ? "text-slate-700" : "text-slate-900"}`}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p
                    className={`text-sm mb-2 leading-relaxed ${item.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}
                  >
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="p-2 bg-white text-red-500 rounded-full shadow-sm border border-slate-100 hover:bg-red-50"
                    title="Xóa thông báo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bell size={64} className="opacity-20 mb-4" />
            <p>Không có thông báo nào.</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {notifications.length > 5 && (
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 italic">
            Hệ thống chỉ lưu trữ thông báo trong vòng 30 ngày.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Megaphone,
  Check,
  CheckCheck,
  Trash2,
  Plus,
} from "lucide-react";
import { notificationService } from "@/services/notifications.service";
import PushComposerModal from "@/components/admin/marketing/PushComposerModal";

type NotiType =
  | "system"
  | "message"
  | "reminder"
  | "alert"
  | "assignment"
  | "competition";

interface Notification {
  id: string;
  type: NotiType;
  title: string;
  message: string;
  createdAt?: string;
  isRead: boolean;
}

export default function PushNotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 60) return `${Math.max(minutes, 1)} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const mapType = (typeRaw?: string): NotiType => {
    const value = String(typeRaw || "").toUpperCase();
    if (value === "MESSAGE") return "message";
    if (value === "REMINDER") return "reminder";
    if (value === "ALERT") return "alert";
    if (value === "ASSIGNMENT") return "assignment";
    if (value === "COMPETITION") return "competition";
    return "system";
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAllNotifications({ page: 1, limit: 100 });
      const mapped = (res.data || []).map((n: any) => ({
        id: String(n?._id ?? n?.id ?? "").trim(),
        type: mapType(n?.type),
        title: String(n?.title ?? "Thông báo"),
        message: String(n?.message ?? ""),
        createdAt: n?.createdAt,
        isRead: Boolean(n?.isRead),
      }));
      setNotifications(mapped.filter((n: Notification) => n.id));
    } catch (err) {
      console.error("Lỗi tải thông báo admin:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const handleCreateNotification = async (payload: {
    title: string;
    body: string;
    image?: string;
    link?: string;
    segment: "ALL_USERS" | "TEACHERS";
    type:
      | "system"
      | "message"
      | "reminder"
      | "alert"
      | "assignment"
      | "competition";
  }) => {
    try {
      setIsSubmitting(true);
      setActionMessage("");

      const rawUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
      const currentUser = rawUser ? JSON.parse(rawUser) : null;
      const senderId = currentUser?._id || currentUser?.id || currentUser?.userId;

      const body = {
        userId: senderId ? String(senderId) : undefined,
        senderId: senderId ? String(senderId) : undefined,
        title: payload.title,
        message: payload.body,
        type: payload.type,
        data: {
          link: payload.link,
          image: payload.image,
          segment: payload.segment,
        },
        isRead: false,
      };

      if (payload.segment === "TEACHERS") {
        await notificationService.sendNotificationToTeachers(body);
      } else {
        await notificationService.sendNotificationToAllUsers(body);
      }

      setIsComposerOpen(false);
      setActionMessage("Tạo thông báo thành công.");
      await fetchNotifications();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message;
      setActionMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Tạo thông báo thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    void notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    void Promise.all(ids.map((id) => notificationService.markAsRead(id)));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void notificationService.deleteNotification(id);
  };

  const getTypeStyle = (type: NotiType) => {
    switch (type) {
      case "reminder":
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bg: "bg-orange-50",
        };
      case "assignment":
      case "competition":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-50",
        };
      case "alert":
        return {
          icon: Megaphone,
          color: "text-violet-500",
          bg: "bg-violet-50",
        };
      case "message":
        return { icon: Bell, color: "text-cyan-500", bg: "bg-cyan-50" };
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-50" };
    }
  };

  const filteredList =
    filter === "ALL" ? notifications : notifications.filter((n) => !n.isRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            Thông báo hệ thống
            <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} chưa đọc
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dữ liệu lấy trực tiếp từ API, không dùng mock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={16} /> Tạo thông báo
          </button>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setFilter("ALL")}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            filter === "ALL"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            filter === "UNREAD"
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
        >
          Chưa đọc
        </button>
      </div>

      {actionMessage ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {actionMessage}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Bell size={56} className="opacity-30 mb-4" />
            <p>Đang tải thông báo...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Bell size={56} className="opacity-30 mb-4" />
            <p>Không có thông báo nào.</p>
          </div>
        ) : (
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
                {!item.isRead && (
                  <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                )}

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
                >
                  <Icon size={22} />
                </div>

                <div className="flex-1 pr-8">
                  <h3
                    className={`font-bold text-base ${
                      item.isRead ? "text-slate-700" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm mb-2 leading-relaxed ${
                      item.isRead ? "text-slate-500" : "text-slate-700 font-medium"
                    }`}
                  >
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={12} /> {formatTimeAgo(item.createdAt)}
                  </p>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {!item.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.id);
                      }}
                      className="p-2 bg-white text-blue-600 rounded-full shadow-sm border border-slate-100 hover:bg-blue-50"
                      title="Đánh dấu đã đọc"
                    >
                      <Check size={16} />
                    </button>
                  )}
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
        )}
      </div>

      <PushComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreateNotification}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

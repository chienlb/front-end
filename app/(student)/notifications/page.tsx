"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Tag,
  Clock,
  Trophy,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService } from "@/services/notifications.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- ACTIONS ---
  const markAllRead = async () => {
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);
    const userId = user?._id || user?.id || user?.userId;
    if (!userId) return;

    try {
      await notificationService.markAllAsReadByUser(String(userId));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
    }
  };

  const normalizeList = (res: any) => {
    // `api` interceptor returns `response.data` directly.
    // Supported shapes:
    // - Array<Notification>
    // - { data: Array<Notification>, ...pagination }
    // - { items: Array<Notification>, ...pagination }
    const list =
      (Array.isArray(res) ? res : null) ??
      (Array.isArray(res?.data) ? res.data : null) ??
      (Array.isArray(res?.items) ? res.items : null) ??
      [];

    const mapped = list.map((n: any) => ({
      id: n._id ?? n.id,
      type: n.type || "SYSTEM",
      title: n.title,
      desc: n.message ?? n.desc ?? "",
      time: formatTimeAgo(n.createdAt),
      isRead: !!n.isRead,
    }));

    return mapped;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const rawUser = localStorage.getItem("currentUser");
        if (!rawUser) return;

        const user = JSON.parse(rawUser);
        const userId = user._id;

        setPage(1);
        setHasMore(true);

        const res = await notificationService.getNotificationsByUserId(userId, {
          page: 1,
          limit: 20,
        });

        const mapped = normalizeList(res.data);
        setNotifications(mapped);

        // If backend returns pagination, use it; else infer from page size.
        const totalPages =
          (typeof res.totalPages === "number" ? res.totalPages : null) ??
          (typeof res?.meta?.totalPages === "number" ? res.meta.totalPages : null);

        if (typeof totalPages === "number") setHasMore(1 < totalPages);
        else setHasMore(mapped.length >= 20);
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      const rawUser = localStorage.getItem("currentUser");
      if (!rawUser) return;

      const user = JSON.parse(rawUser);
      const userId = user._id;

      const nextPage = page + 1;

      const res = await notificationService.getNotificationsByUserId(userId, {
        page: nextPage,
        limit: 20,
      });

      const mapped = normalizeList(res.data);

      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        const merged = [...prev];
        for (const item of mapped) if (!seen.has(item.id)) merged.push(item);
        return merged;
      });

      setPage(nextPage);

      const totalPages =
        (typeof res.totalPages === "number" ? res.totalPages : null) ??
        (typeof res?.meta?.totalPages === "number" ? res.meta.totalPages : null);
      if (typeof totalPages === "number") setHasMore(nextPage < totalPages);
      else setHasMore(mapped.length >= 20);
    } catch (err) {
      console.error("Lỗi tải thêm thông báo:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  function formatTimeAgo(dateString: string) {
    if (!dateString) return "";

    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  }


  const filteredList = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // --- HELPER STYLES ---
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "PROMO":
        return { icon: Tag, color: "text-pink-500", bg: "bg-pink-100" };
      case "REMINDER":
        return { icon: Clock, color: "text-amber-500", bg: "bg-amber-100" };
      case "ACHIEVEMENT":
        return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100" };
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-100" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              Thông Báo{" "}
              <div className="relative">
                <Bell className="text-blue-600 fill-blue-100" size={28} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Cập nhật tin tức, khuyến mãi và nhắc nhở học tập.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm"
            >
              <CheckCheck size={16} /> Đánh dấu đã đọc
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          {/* TABS */}
          <div className="flex items-center border-b border-slate-100 p-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${filter === "ALL" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${filter === "UNREAD" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Chưa đọc{" "}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-2">
            <AnimatePresence mode="popLayout">
              {filteredList.length > 0 ? (
                <>
                  {filteredList.map((item) => {
                  const style = getTypeStyles(item.type);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className={`group relative p-4 rounded-2xl mb-2 transition-all border ${item.isRead ? "bg-white border-transparent hover:border-slate-100" : "bg-blue-50/40 border-blue-100"}`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
                        >
                          <style.icon size={24} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pr-8">
                          <div className="flex justify-between items-start mb-1">
                            <h3
                              className={`text-base font-bold ${item.isRead ? "text-slate-700" : "text-slate-900"}`}
                            >
                              {item.title}
                            </h3>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {item.time}
                            </span>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${item.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Actions (Hover show) */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteNotification(item.id)}
                          className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm border border-slate-100 transition"
                          title="Xóa thông báo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Unread Indicator */}
                      {!item.isRead && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full group-hover:opacity-0 transition-opacity"></div>
                      )}
                    </motion.div>
                  );
                  })}

                  {hasMore && filter === "ALL" && (
                    <div className="p-3">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm transition disabled:opacity-60"
                      >
                        {loadingMore ? "Đang tải..." : "Tải thêm"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Bell size={40} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-lg">Không có thông báo nào</p>
                  <p className="text-sm">Bạn đã xem hết tất cả tin tức rồi!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

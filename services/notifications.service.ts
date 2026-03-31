import api from "@/utils/api";

export interface NotificationItem {
  _id?: string;
  id?: string;
  userId?: string;
  senderId?: string;
  title?: string;
  message?: string;
  type?: string;
  data?: Record<string, unknown>;
  firebaseToken?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  limit: number;
}

const normalizeListResponse = (res: any): NotificationListResponse => {
  const data =
    (Array.isArray(res?.data) ? res.data : null) ??
    (Array.isArray(res?.items) ? res.items : null) ??
    (Array.isArray(res) ? res : []);

  return {
    data,
    total: Number(res?.total ?? data.length ?? 0),
    totalPages: Number(res?.totalPages ?? (data.length ? 1 : 0)),
    nextPage: typeof res?.nextPage === "number" ? res.nextPage : null,
    prevPage: typeof res?.prevPage === "number" ? res.prevPage : null,
    limit: Number(res?.limit ?? data.length ?? 0),
  };
};

export const notificationService = {
  createNotification: async (data: any): Promise<NotificationItem> => {
    const res = await api.post("/notifications", data);
    return (res as any)?.data ?? (res as any);
  },

  sendNotificationToTeachers: async (data: any): Promise<NotificationItem[]> => {
    const res = await api.post("/notifications/send-to-teachers", data);
    const payload = (res as any)?.data ?? (res as any);
    return Array.isArray(payload) ? payload : [];
  },


  getAllNotifications: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<NotificationListResponse> => {
    const res = await api.get("/notifications/all", { params });
    return normalizeListResponse(res);
  },


  getNotificationById: async (id: string): Promise<NotificationItem> => {
    const res = await api.get(`/notifications/${id}`);
    return (res as any)?.data ?? (res as any);
  },


  updateNotification: async (id: string, data: any): Promise<NotificationItem> => {
    const res = await api.put(`/notifications/${id}`, data);
    return (res as any)?.data ?? (res as any);
  },


  deleteNotification: async (id: string): Promise<NotificationItem> => {
    const res = await api.delete(`/notifications/${id}`);
    return (res as any)?.data ?? (res as any);
  },


  getNotificationsByUserId: async (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<NotificationListResponse> => {
    const res = await api.get(`/notifications/user/${userId}`, { params });
    return normalizeListResponse(res);
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    return notificationService.updateNotification(id, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
  },

  markAllAsReadByUser: async (userId: string, page = 1, limit = 100) => {
    const res = await notificationService.getNotificationsByUserId(userId, {
      page,
      limit,
    });

    const unread = res.data.filter((n) => !n?.isRead);
    await Promise.all(
      unread
        .map((n) => String(n?._id ?? n?.id ?? "").trim())
        .filter(Boolean)
        .map((id) => notificationService.markAsRead(id)),
    );
  },
};
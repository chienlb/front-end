import api from "@/utils/api";

export const notificationService = {
  createNotification: async (data: any) => {
    return api.post("/notifications", data);
  },


  getAllNotifications: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get("/notifications/all", { params });
    return res.data ?? res;
  },


  getNotificationById: async (id: string) => {
    return api.get(`/notifications/${id}`);
  },


  updateNotification: async (id: string, data: any) => {
    return api.put(`/notifications/${id}`, data);
  },


  deleteNotification: async (id: string) => {
    return api.delete(`/notifications/${id}`);
  },


  getNotificationsByUserId: async (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) => {
    const res = await api.get(`/notifications/user/${userId}`, { params });
    return res.data ?? res;
  },
};
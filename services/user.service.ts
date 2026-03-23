import api from "@/utils/api";

export const userService = {
  getUsers: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    role?: string;
  }) => {
    return api.get("/users", { params });
  },

  /**
   * Backend mới:
   * GET /api/v1/users/role/:role
   * role: "student" | "teacher"
   */
  getUsersByRole: async (role: "student" | "teacher") => {
    return api.get(`/users/role/${encodeURIComponent(role)}`);
  },

  updateStatus: async (id: string, isActive: boolean) => {
    return api.patch(`/users/${id}/status`, { isActive });
  },

  giveGift: async (id: string, rewards: { gold: number; diamond: number }) => {
    return api.patch(`/users/${id}/gift`, rewards);
  },

  // --- STAFF ---
  getStaffs: async () => api.get("/users/staffs"),

  createStaff: async (data: any) => api.post("/users/staffs", data),

  updateUserRole: async (userId: string, roleId: string) => {
    return api.put(`/users/${userId}/role`, { roleId });
  },

  // Dùng chung hàm update user để sửa tên/email nếu cần
  updateUser: async (id: string, data: any) => api.put(`/users/${id}`, data),

  // Xóa
  deleteUser: async (id: string) => api.delete(`/users/${id}/delete`),

  getProfile: async () => {
    const res = await api.get("/auths/profile");
    return res.data ?? res;
  },

  /** GET /users/:id — dùng cho thẻ học viên / QR (có thể 401 nếu API không public). */
  getUserById: async (id: string) => {
    const res = await api.get(`/users/${encodeURIComponent(id)}`);
    return res.data ?? res;
  },

  /**
   * Cập nhật thông tin cá nhân (user đang đăng nhập).
   * Thử PATCH /auths/profile; nếu backend không có (404/405) thì PUT /users/:id.
   */
  updateMyProfile: async (userId: string, data: Record<string, unknown>) => {
    try {
      const res = await api.patch("/auths/profile", data);
      return res.data ?? res;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        const res = await api.put(`/users/${userId}`, data);
        return res.data ?? res;
      }
      throw err;
    }
  },

  getLeaderboard: async () => {
    const res = await api.get("/users/leaderboard");
    return res.data ?? res;
  },

  equipItem: (itemId: string) => {
    return api.post("/users/equip", { itemId });
  },
};

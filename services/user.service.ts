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
    return api.get("/auths/profile");
  },

  getLeaderboard: async () => {
    return api.get("/users/leaderboard");
  },

  equipItem: (itemId: string) => {
    return api.post("/users/equip", { itemId });
  },
};

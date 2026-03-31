import api from "@/utils/api";

const normalizeProfilePayload = (data: Record<string, unknown>) => {
  const payload: Record<string, unknown> = { ...data };

  // Backend DTO nhận `fullname`, không nhận `fullName`.
  if (payload.fullName != null && payload.fullname == null) {
    payload.fullname = payload.fullName;
  }

  // Loại các field backend không cho phép để tránh 400 (whitelistValidation).
  delete payload.fullName;
  delete payload.address;

  return payload;
};

const isFileLike = (value: unknown): value is File => {
  return typeof File !== "undefined" && value instanceof File;
};

const buildProfileBody = (data: Record<string, unknown>) => {
  const normalized = normalizeProfilePayload(data);
  const avatar = normalized.avatar;

  if (!isFileLike(avatar)) {
    return {
      body: normalized,
      isMultipart: false,
    };
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(normalized)) {
    if (value == null || value === "") continue;
    if (key === "avatar") continue;

    if (typeof value === "string") {
      formData.append(key, value);
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      formData.append(key, String(value));
    }
  }

  formData.append("avatar", avatar);

  return {
    body: formData,
    isMultipart: true,
  };
};

const extractLeaderboardArray = (input: any): any[] => {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];

  const directKeys = [
    "data",
    "items",
    "users",
    "leaderboard",
    "docs",
    "results",
  ];
  for (const key of directKeys) {
    if (Array.isArray(input[key])) return input[key];
  }

  const nestedKeys = ["data", "payload", "result"];
  for (const key of nestedKeys) {
    const extracted = extractLeaderboardArray(input[key]);
    if (extracted.length) return extracted;
  }

  return [];
};

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
  updateUser: async (id: string, data: any) => api.patch(`/users/${id}`, data),

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
   * Thử PATCH /auths/profile; nếu backend không có (404/405) thì PATCH /users/:id.
   */
  updateMyProfile: async (userId: string, data: Record<string, unknown>) => {
    const { body, isMultipart } = buildProfileBody(data);

    // Backend nhận file avatar qua PATCH /users/:id (multipart/form-data).
    if (isMultipart) {
      const res = await api.patch(`/users/${userId}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data ?? res;
    }

    try {
      const res = await api.patch("/auths/profile", body);
      return res.data ?? res;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        const res = await api.patch(`/users/${userId}`, body);
        return res.data ?? res;
      }
      throw err;
    }
  },

  getLeaderboard: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get("/users/leaderboard/xp", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    const payload = res?.data ?? {};

    // Return full response with pagination metadata
    return {
      data: extractLeaderboardArray(payload),
      pagination: {
        page: payload?.page || payload?.pagination?.page || 1,
        limit: payload?.limit || payload?.pagination?.limit || 20,
        total: payload?.total || payload?.pagination?.total || 0,
        totalPages: payload?.totalPages || payload?.pagination?.totalPages || 1,
      },
    };
  },

  equipItem: (itemId: string) => {
    return api.post("/users/equip", { itemId });
  },

  /**
   * Thay đổi mật khẩu (dùng cho cả Admin, Teacher, Student).
   * POST /auths/change-password hoặc /users/:id/change-password
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const res = await api.post("/auths/change-password", {
        oldPassword,
        newPassword,
      });
      return res.data ?? res;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        // Fallback: thử endpoint khác
        const res = await api.post("/users/change-password", {
          oldPassword,
          newPassword,
        });
        return res.data ?? res;
      }
      throw err;
    }
  },

  /**
   * Update thông tin cá nhân (fullName, avatar, phone, etc).
   * PATCH /auths/profile hoặc PATCH /users/:id
   */
  updateProfile: async (data: {
    fullName?: string;
    avatar?: string | File;
    phone?: string;
    address?: string;
    bio?: string;
    [key: string]: any;
  }) => {
    const { body, isMultipart } = buildProfileBody(data);

    if (isMultipart) {
      const profile = await userService.getProfile();
      const userId = profile?._id ?? profile?.id;
      if (!userId) throw new Error("Không lấy được userId");

      const res = await api.patch(`/users/${userId}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data ?? res;
    }

    try {
      const res = await api.patch("/auths/profile", body);
      return res.data ?? res;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        const profile = await userService.getProfile();
        const userId = profile?._id ?? profile?.id;
        if (!userId) throw new Error("Không lấy được userId");
        const res = await api.patch(`/users/${userId}`, body);
        return res.data ?? res;
      }
      throw err;
    }
  },
};

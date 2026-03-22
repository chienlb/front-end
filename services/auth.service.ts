import api from "@/utils/api";
const API_BASE_URL =
  "https://teach-english-3786e536fe68.herokuapp.com/api/v1";

export const authService = {
  register: async (data: {
    fullname: string;
    username: string;
    email: string;
    password: string;
    role: string;
    birthDate?: string;
    phone?: string;
    gender?: string;
    typeAccount?: string;
  }) => {
    const res = await api.post("/auths/register", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
    deviceId: string;
  }) => {
    const res = await api.post("/auths/login", data);
    return res.data;
  },

  logout: async () => {
    return api.post("/auths/logout");
  },

  getProfile: async () => {
    return api.get("/auths/profile");
  },

  forgotPassword: (email: string) => {
    return api.post("/auths/forgot-password", { email });
  },

  /**
   * Đổi mật khẩu khi đã đăng nhập.
   * POST /auths/change-password; nếu backend không có (404/405) → PATCH /auths/password.
   * Body: { oldPassword, newPassword } — chỉnh backend nếu dùng tên field khác.
   */
  changePassword: async (params: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const body = {
      oldPassword: params.oldPassword,
      newPassword: params.newPassword,
    };
    try {
      const res = await api.post("/auths/change-password", body);
      return res.data ?? res;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        const res = await api.patch("/auths/password", body);
        return res.data ?? res;
      }
      throw err;
    }
  },
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auths/google/login`;
  },

  facebookLogin: () => {
    window.location.href = `${API_BASE_URL}/auths/facebook/login`;
  },
};

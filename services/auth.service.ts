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
  }): Promise<any> => {
    const res = await api.post("/auths/register", data);
    return res as any;
  },

  login: async (data: {
    email: string;
    password: string;
    deviceId: string;
  }): Promise<any> => {
    const res = await api.post("/auths/login", data);
    return res as any;
  },

  logout: async (): Promise<any> => {
    const res = await api.post("/auths/logout");
    return res as any;
  },

  getProfile: async (): Promise<any> => {
    const res = await api.get("/auths/profile");
    return res as any;
  },

  forgotPassword: async (email: string): Promise<any> => {
    const res = await api.post("/auths/forgot-password", { email });
    return res as any;
  },

  resetPassword: async (data: {
    codeVerify: string;
    password: string;
  }): Promise<any> => {
    const res = await api.post("/auths/reset-password", data);
    return res as any;
  },

  verifyEmail: async (data: {
    email: string;
    codeVerify: string;
  }): Promise<any> => {
    const res = await api.post("/auths/verify-email", data);
    return res as any;
  },

  resendVerificationEmail: async (email: string): Promise<any> => {
    const res = await api.post("/auths/resend-verification-email", { email });
    return res as any;
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
      return res as any;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        const res = await api.patch("/auths/password", body);
        return res as any;
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

import api from "@/utils/api";

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
  googleLogin: () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/auths/google/login`;
  },

  facebookLogin: () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/auths/facebook/login`;
  },
};

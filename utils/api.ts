import axios from "axios";
const API_BASE_URL =
  "https://teach-english-3786e536fe68.herokuapp.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Cho phép gửi/nhận cookie từ Backend
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

const clearSessionAndRedirectLogin = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("currentUser");
  window.location.replace("/login");
};

// Tự động gắn Token vào mọi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage (nơi bạn lưu khi login thành công)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi 401 (Hết hạn token hoặc chưa login)
api.interceptors.response.use(
  (response) => response.data, // Trả về data trực tiếp cho gọn
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();

    // Backend đã revoke token => buộc đăng nhập lại, không refresh nữa.
    if (status === 401 && message.includes("revoked")) {
      resolvePendingRequests(null);
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newAccessToken) => {
            if (!newAccessToken) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        // Dùng axios gốc để tránh vòng lặp interceptor.
        const refreshRes: any = await axios.post(
          `${api.defaults.baseURL}/auths/refresh-token`,
          { refreshToken },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );

        const newAccessToken =
          refreshRes?.data?.data?.accessToken ||
          refreshRes?.data?.accessToken ||
          null;
        const newRefreshToken =
          refreshRes?.data?.data?.refreshToken ||
          refreshRes?.data?.refreshToken ||
          null;

        if (!newAccessToken) {
          throw new Error("Missing access token in refresh response");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
          }
        }

        resolvePendingRequests(newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        resolvePendingRequests(null);
        clearSessionAndRedirectLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

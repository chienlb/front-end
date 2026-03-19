import axios from "axios";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://teach-english-3786e536fe68.herokuapp.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  // Cho phép gửi/nhận cookie từ Backend
  withCredentials: true,
});

// Tự động gắn Token vào mọi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage (nơi bạn lưu khi login thành công)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    // DEBUG LOG: Check if token is found
    console.log("Interceptor running. Token found:", token ? "YES" : "NO");

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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Đá về trang login
      if (typeof window !== "undefined") {
        // localStorage.removeItem('access_token'); // Xóa token cũ
        // window.location.href = '/login'; // Redirect
        console.error("Lỗi 401: Bạn chưa đăng nhập hoặc Token hết hạn");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

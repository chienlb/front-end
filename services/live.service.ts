import api from "@/utils/api";

export const liveService = {
  // --- QUẢN LÝ LỚP HỌC (BOOKINGS) ---

  // 1. Lấy danh sách lớp học
  getClasses: async (params?: any) => {
    return api.get("/booking/list", { params });
  },

  // 2. Tạo lớp học mới
  createClass: async (data: any) => {
    return api.post("/booking/create-class", data);
  },

  // 3. Thêm học sinh vào lớp
  addStudent: async (classId: string, studentId: string) => {
    return api.put(`/booking/${classId}/add-student`, { studentId });
  },

  // 4. Cập nhật link Record
  updateRecord: async (classId: string, url: string) => {
    return api.put(`/booking/${classId}/recording`, { url });
  },

  // 5. Xóa/Hủy lớp
  deleteClass: async (classId: string) => {
    return api.delete(`/booking/${classId}`);
  },

  // 1. Lấy danh sách học sinh (để Add vào lớp)
  getStudents: async () => {
    return api.get("/users?role=STUDENT");
  },

  // --- QUẢN LÝ GIA SƯ (TUTORS) ---

  // 1. Lấy danh sách
  getTutors: async () => {
    return api.get("/users?role=TUTOR");
  },

  // 2. Tạo gia sư mới
  createTutor: async (data: any) => {
    return api.post("/users/tutors", data);
  },

  // 3. Cập nhật thông tin gia sư
  updateTutor: async (id: string, data: any) => {
    return api.put(`/users/${id}`, data);
  },

  // 4. Xóa gia sư
  deleteTutor: async (id: string) => {
    return api.delete(`/users/${id}`);
  },
  joinRoom: async (bookingId: string) => {
    const res = await api.get(`/live/join/${bookingId}`);
    console.log("token", res);
    return res;
  },
};

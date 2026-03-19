import api from "@/utils/api";

export const liveClassService = {
  // Lấy danh sách lớp của học sinh
  getMyClasses: async () => {
    return api.get("/classes/my-enrollments");
  },

  // Lấy chi tiết lộ trình 1 lớp (Kèm lịch học)
  getClassDetail: async (classId: string) => {
    return api.get(`/classes/${classId}`);
  },

  // Vào phòng (Lấy Token)
  joinRoom: async (classId: string) => {
    const res: any = await api.get(`/classes/${classId}/join`);
    return res.data ? res.data : res;
  },

  // Nộp bài kiểm tra
  submitExam: async (examId: string, answers: any) => {
    return api.post(`/quiz/submit`, { examId, answers });
  },

  updateClass: (id: string, data: any) => api.put(`/classes/${id}`, data),
  deleteClass: (id: string) => api.delete(`/classes/${id}`),

  getAllClasses: async () => api.get("/classes/admin/all"),
  createClass: async (data: any) => api.post("/classes", data),
  addStudent: async (classId: string, studentId: string) =>
    api.post(`/classes/${classId}/students`, { studentId }),
  updateSchedule: async (classId: string, lessonId: string, data: any) =>
    api.put(`/classes/${classId}/schedule/${lessonId}`, data),

  // 1. Lấy danh sách khóa học (Gọi API Course)
  getAllCourses: async () => {
    return api.get("/courses");
  },

  // 2. Lấy danh sách giảng viên (Gọi API User có lọc Role)
  getAllTutors: async () => {
    return api.get("/users?role=TUTOR");
  },

  // Lấy danh sách lớp đang mở (Public Catalog)
  getAvailableClasses: async (search?: string) => {
    return api.get("/classes/public", { params: { search } });
  },

  // Đăng ký vào lớp
  enrollClass: async (classId: string) => {
    return api.post(`/classes/${classId}/enroll`);
  },

  // Tìm user theo email
  searchUserByEmail: async (email: string) => {
    return api.get(`/users/search?email=${email}`);
  },

  syncContent: async (classId: string) => {
    return api.put(`/classes/${classId}/sync`);
  },

  // Gọi API lấy lịch
  getAdminCalendar: () => api.get("/classes/admin/calendar"),

  // Lấy chi tiết 1 bài học (để lấy danh sách câu hỏi Exam)
  getLessonDetail: async (lessonId: string) => {
    return api.get(`/courses/lessons/${lessonId}`);
  },
};

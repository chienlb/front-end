import api from "@/utils/api";

export const courseService = {
  // 1. QUẢN LÝ COURSE

  // Lấy danh sách tất cả khóa học.
  getAllCourses: async () => {
    return api.get("/courses");
  },

  // Tạo một khóa học mới.
  createCourse: async (title: string) => {
    return api.post("/courses", { title });
  },

  // Cập nhật thông tin chung của khóa học (Tên, Ảnh bìa, Mô tả...).
  updateCourse: async (id: string, data: any) => {
    return api.patch(`/courses/${id}`, data);
  },

  // Xóa hoàn toàn một khóa học (Kèm theo các Unit và Lesson con).
  deleteCourse: async (id: string) => {
    return api.delete(`/courses/${id}`);
  },

  // Lấy cấu trúc cây thư mục của khóa học: Course -> Units -> Lessons.
  getTree: async (id: string) => {
    return api.get(`/courses/${id}/tree`);
  },

  // 2. QUẢN LÝ UNIT (Chương học)

  // Thêm một chương mới vào khóa học.
  addUnit: async (
    courseId: string,
    data: { title: string; videoUrl?: string },
  ) => {
    return api.post(`/courses/${courseId}/units`, data);
  },

  // Cập nhật thông tin Unit (Tên, Video giới thiệu).
  updateUnit: async (unitId: string, data: any) => {
    return api.patch(`/courses/units/${unitId}`, data);
  },

  // Cập nhật Video.
  updateUnitVideo: async (unitId: string, videoUrl: string) => {
    return api.patch(`/courses/units/${unitId}`, { videoUrl });
  },

  // Xóa một chương học.
  deleteUnit: async (unitId: string) => {
    return api.delete(`/courses/units/${unitId}`);
  },

  // 3. QUẢN LÝ LESSON (Bài học chi tiết)

  // Thêm bài học mới vào một chương.
  addLesson: async (
    unitId: string,
    data: { title: string; videoUrl?: string },
  ) => {
    return api.post(`/courses/units/${unitId}/lessons`, data);
  },

  // Cập nhật thông tin cơ bản của bài học (Tiêu đề, Video).
  updateLesson: async (lessonId: string, data: any) => {
    return api.patch(`/courses/lessons/${lessonId}`, data);
  },

  // Cập nhật riêng Video bài giảng.
  updateLessonVideo: async (lessonId: string, videoUrl: string) => {
    return api.patch(`/courses/lessons/${lessonId}`, { videoUrl });
  },

  // Lấy chi tiết nội dung bài học.
  getLesson: async (lessonId: string) => {
    return api.get(`/courses/lessons/${lessonId}`);
  },

  // Cập nhật nội dung Lesson
  updateLessonContent: async (lessonId: string, activities: any[]) => {
    return api.put(`/courses/lessons/${lessonId}/content`, { activities });
  },

  // Đánh dấu hoàn thành bài học (Dành cho Học viên).

  completeLesson: async (lessonId: string) => {
    return api.post(`/courses/lessons/${lessonId}/complete`);
  },

  // Xóa một bài học.
  deleteLesson: async (lessonId: string) => {
    return api.delete(`/courses/lessons/${lessonId}`);
  },

  // 4. TIỆN ÍCH KHÁC (Files, Sync)

  // Upload file (Ảnh/Video/Tài liệu) lên Server.
  // Sử dụng FormData để gửi file dạng multipart/form-data.
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res: any = await api.post(
      "http://localhost:4000/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data ? res.data : res;
  },

  syncContent: (id: string) => api.put(`/classes/${id}/sync`),
};

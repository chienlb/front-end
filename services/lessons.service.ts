import api from "@/utils/api";

export const lessonService = {
  // Lấy danh sách tất cả lesson (có phân trang)
  getAllLessons: async (params?: { page?: number; limit?: number }) => {
    return api.get("/lessons", { params });
  },

  // Lấy chi tiết lesson theo ID
  getLessonById: async (id: string) => {
    return api.get(`/lessons/${id}`);
  },

  /**
   * Đánh dấu hoàn thành lesson – gọi API lesson-progress (POST /lesson-progress).
   * Body: { userId, lessonId, progress: 100, status: 'completed' }
   */
  completeLesson: async (lessonId: string) => {
    let userId: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("currentUser");
        if (raw) {
          const user = JSON.parse(raw);
          userId = user?._id ?? user?.id ?? null;
        }
      } catch {}
    }
    return api.post("/lesson-progress", {
      userId: userId ?? "",
      lessonId,
      progress: 100,
      status: "completed",
    });
  },

  // Tạo lesson mới (form-data + files)
  createLesson: async (formData: FormData) => {
    return api.post("/lessons", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Cập nhật lesson
  updateLesson: async (id: string, data: any) => {
    return api.patch(`/lessons/${id}`, data);
  },

  // Xóa lesson
  deleteLesson: async (id: string) => {
    return api.delete(`/lessons/${id}`);
  },

  // Restore lesson
  restoreLesson: async (id: string) => {
    return api.patch(`/lessons/${id}/restore`);
  },


  // Lấy lesson theo UNIT ID
  getLessonsByUnitId: async (unitId: string) => {
    return api.get(`/lessons/${unitId}/unit`);
  },

  /**
   * Lấy danh sách lesson progress theo lessonId.
   * API: GET /lesson-progress/lesson/:lessonId?page=&limit=
   * Response: { data: [], total, totalPages, currentPage, hasNextPage, hasPreviousPage, limit }
   */
  getLessonProgressByLessonId: async (
    lessonId: string,
    params?: { page?: number; limit?: number }
  ) => {
    return api.get(`/lesson-progress/lesson/${lessonId}`, { params });
  },

  /**
   * Lấy progress của user hiện tại (từ JWT) cho một lesson.
   * API: GET /lesson-progress/user/:lessonId
   * Trả về object progress đã bỏ bọc, hoặc null nếu chưa có (404).
   */
  getProgressByUserAndLessonId: async (lessonId: string) => {
    try {
      const res = await api.get(`/lesson-progress/user/lessons/${lessonId}`);
      const body = res as any;
      return body?.data ?? body;
    } catch (err: any) {
      // 404 = chưa có progress cho lesson này → trả null, không coi là lỗi
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Lấy toàn bộ lesson progress của 1 user.
   * API: GET /lesson-progress/user/lessons/:userId?page=&limit=
   *
   * Backend controller trả về dạng:
   * { data: LessonProgressDocument[], total, totalPages, currentPage, hasNextPage, ... }
   */
  getLessonProgressByUserId: async (userId: string, params?: { page?: number; limit?: number }) => {
    return api.get(`/lesson-progress/user/lessons/${userId}`, { params });
  },

  /**
   * Lấy tiến độ lesson theo unit (danh sách lesson đã hoàn thành).
   * Dùng để khóa lesson sau nếu lesson trước chưa học xong.
   *
   * API: GET /lesson-progress?unitId=xxx (hoặc GET /lessons/process?unitId=xxx nếu backend dùng path đó)
   * Response: mảng lessonId đã hoàn thành hoặc { completedLessonIds } / { data: [...] }
   */
  getLessonProcessByUnitId: async (unitId: string) => {
    const res = await api.get("/lesson-progress", { params: { unitId } });
    // Api interceptor đã trả về response.data, nên res là body luôn
    const body = res as any;
    const data = body?.data ?? body;
    let completedIds =
      data?.completedLessonIds ??
      data?.completedIds ??
      (Array.isArray(data) ? data : Array.isArray(body) ? body : []);
    if (Array.isArray(completedIds) && completedIds.length > 0) {
      const first = completedIds[0];
      if (typeof first === "object" && first !== null && ("lessonId" in first || "_id" in first)) {
        completedIds = (completedIds as any[]).map((x: any) => x.lessonId ?? x._id ?? x);
      }
    }
    return Array.isArray(completedIds) ? completedIds : [];
  },

  // Lấy lesson theo USER ID
  getLessonsByUserId: async (userId: string) => {
    return api.get(`/lessons/${userId}/user`);
  },
};
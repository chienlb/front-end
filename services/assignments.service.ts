import api from "@/utils/api";

const firstSuccessful = async <T,>(fns: Array<() => Promise<T>>): Promise<T> => {
  let lastErr: unknown;
  for (const fn of fns) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
};

export const assignmentsService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Backend upload endpoint không phải lúc nào cũng nằm trong /api/v1
    // (một số môi trường dùng thẳng http://localhost:4000/files/upload)
    const res: any = await api.post(
      "http://localhost:4000/files/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data ?? res;
  },

  submitFileOnly: async (assignmentId: string, fileUrl: string, note?: string) => {
    const id = assignmentId.trim();
    const payload = { fileUrl, note: note?.trim() || undefined };

    // Try common endpoint variants because backend implementation may vary.
    return firstSuccessful([
      () => api.post(`/assignments/${id}/submit`, payload),
      () => api.post(`/assignments/${id}/submit-file`, payload),
      () => api.post(`/assignments/${id}/submissions`, payload),
      () => api.post(`/homeworks/${id}/submit`, payload),
    ]);
  },

  /**
   * Nộp bài theo SubmissionsController: POST /submissions (multipart/form-data)
   * Field file: "files" (số lượng tối đa 10 ở backend)
   * Body: assignmentId, studentId, status, submittedAt, feedback...
   */
  submitWithSubmissions: async (
    assignmentId: string,
    studentId: string,
    file: File,
    note?: string,
  ) => {
    const formData = new FormData();
    formData.append("assignmentId", assignmentId.trim());
    formData.append("studentId", studentId.trim());
    formData.append("status", "submitted");
    formData.append("submittedAt", new Date().toISOString());

    const feedback = note?.trim();
    if (feedback) formData.append("feedback", feedback);

    // Backend: FilesInterceptor('files', 10)
    formData.append("files", file);

    return api.post("/submissions", formData);
  },

  getAssignmentsByClassId: async (
    classId: string,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = classId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/class/${id}`, { params });
  },

  getAssignmentsByLessonId: async (
    lessonId: string,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = lessonId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/lesson/${id}`, { params });
  },

  getAssignmentsByUserId: async (
    userId: string,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = userId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/user/${id}`, { params });
  },

  getAssignmentById: async (assignmentId: string) => {
    const id = assignmentId.trim();
    return api.get(`/assignments/${id}`);
  },
};


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
    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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


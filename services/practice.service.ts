import api from "@/utils/api";

export const practiceService = {
  getAll: async (type?: string) => {
    const params = type && type !== "ALL" ? { type } : {};
    return api.get("/practice/questions", { params });
  },
  create: async (data: any) => {
    return api.post("/practice/questions", data);
  },
  update: async (id: string, data: any) => {
    return api.put(`/practice/questions/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/practice/questions/${id}`);
  },
  getStats: async () => {
    return api.get("/practice/stats");
  },
  submitWriting: async (practiceId: string, studentWriting: string) => {
    return api.post(`/practices/${practiceId}/submit`, { studentWriting });
  },
  createWritingPractice: async (studentId: string, type: string) => {
    return api.post("/practices/", { studentId, type });
  },
  getAllPracticesByStudentId: async (studentId: string) => {
    return api.get(`/practices/student/${encodeURIComponent(studentId.trim())}`);
  },
};

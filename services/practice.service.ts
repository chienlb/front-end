import api from "@/utils/api";

export const practiceService = {
  getAll: async (type?: string) => {
    const params = type && type !== "ALL" ? { type } : {};
    return api.get("/practices", { params });
  },
  create: async (data: any) => {
    return api.post("/practices", data);
  },
  update: async (id: string, data: any) => {
    return api.patch(`/practices/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/practices/${id}`);
  },
  getStats: async () => {
    return api.get("/practices");
  },
  submitWriting: async (practiceId: string, studentWriting: string) => {
    return api.post(`/practices/${practiceId}/submit`, { studentWriting });
  },
  createWritingPractice: async (studentId: string, type: string) => {
    return api.post("/practices/", { studentId, type });
  },
  getAllByStudentId: async (studentId: string) => {
    return api.get(`/practices/student/${studentId}`);
  },
  getAllPracticesByStudentId: async (studentId: string) => {
    return api.get(`/practices/student/${encodeURIComponent(studentId.trim())}`);
  },
};

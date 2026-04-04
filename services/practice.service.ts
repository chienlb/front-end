import api from "@/utils/api";

/** Giá trị `type` mà API luyện viết chấp nhận (Nest/class-validator). */
export type WritingPracticeApiType = "sentences" | "letter" | "discussion";

/**
 * Slug trên URL (/practice/writing/[type]) → type gửi API.
 * - sentence → sentences
 * - essay → discussion
 * - letter → letter
 */
export function mapWritingSlugToApiType(slug: string): WritingPracticeApiType {
  switch (String(slug || "").toLowerCase()) {
    case "sentence":
      return "sentences";
    case "letter":
      return "letter";
    case "essay":
      return "discussion";
    default:
      return "discussion";
  }
}

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
  createWritingPractice: async (studentId: string, typeSlug: string) => {
    const type = mapWritingSlugToApiType(typeSlug);
    return api.post("/practices/", { studentId, type });
  },
  getAllByStudentId: async (studentId: string) => {
    return api.get(`/practices/student/${studentId}`);
  },
  getAllPracticesByStudentId: async (studentId: string) => {
    return api.get(`/practices/student/${encodeURIComponent(studentId.trim())}`);
  },
};

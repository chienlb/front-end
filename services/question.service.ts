import api from "@/utils/api";

export const questionService = {
  // Lấy danh sách
  getAll: async (params?: {
    type?: string;
    difficulty?: string;
    search?: string;
  }) => {
    return api.get("/questions", { params });
  },

  // Tạo mới
  create: async (data: any) => {
    return api.post("/questions", data);
  },

  // Cập nhật
  update: async (id: string, data: any) => {
    return api.put(`/questions/${id}`, data);
  },

  // Xóa
  delete: async (id: string) => {
    return api.delete(`/questions/${id}`);
  },
};

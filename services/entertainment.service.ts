import api from "@/utils/api";

export const entertainmentService = {
  // --- CATEGORY (CHỦ ĐỀ) ---

  // 1. Lấy danh sách chủ đề
  getCategories: async (type?: string) => {
    return api.get("/categories", { params: { type } });
  },

  // 2. Tạo chủ đề mới
  createCategory: async (data: any) => {
    return api.post("/categories", data);
  },

  // 3. Lấy chi tiết chủ đề (bao gồm list videos bên trong)
  getCategoryDetail: async (id: string) => {
    return api.get(`/categories/${id}`);
  },

  // 4. Xóa chủ đề
  deleteCategory: async (id: string) => {
    return api.delete(`/categories/${id}`);
  },

  // --- QUẢN LÝ VIDEO TRONG CHỦ ĐỀ ---

  // 5. Thêm video vào chủ đề
  addVideoToCategory: async (categoryId: string, mediaId: string) => {
    return api.post(`/categories/${categoryId}/videos`, { mediaId });
  },

  // 6. Gỡ video khỏi chủ đề
  removeVideoFromCategory: async (categoryId: string, mediaId: string) => {
    return api.delete(`/categories/${categoryId}/videos/${mediaId}`);
  },
};

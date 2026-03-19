import api from "@/utils/api";

export const mediaService = {
  // Lấy danh sách
  getAll: async (params?: { type?: string; search?: string }) => {
    return api.get("/media", { params });
  },

  // Tạo mới
  create: async (data: any) => {
    return api.post("/media", data);
  },

  // Cập nhật
  update: async (id: string, data: any) => {
    return api.put(`/media/${id}`, data);
  },

  // Xóa
  delete: async (id: string) => {
    return api.delete(`/media/${id}`);
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

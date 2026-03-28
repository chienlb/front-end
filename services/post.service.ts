import api from "@/utils/api";

export const postService = {
  // --- BLOGS API (backend NestJS) ---
  getAllAdmin: (params?: { page?: number; limit?: number }) =>
    api.get("/blogs/all", { params }),
  getById: (id: string) => api.get(`/blogs/view/${encodeURIComponent(id)}`),
  create: (data: any) => api.post("/blogs/create", data),
  update: (id: string, data: any) =>
    api.put(`/blogs/update/${encodeURIComponent(id)}`, data),
  delete: (id: string) =>
    api.delete(`/blogs/delete/${encodeURIComponent(id)}`),
};

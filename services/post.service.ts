import api from "@/utils/api";

export const postService = {
  getAll: (category?: string) =>
    api.get(`/posts${category ? `?category=${category}` : ""}`),
  getBySlug: (slug: string) => api.get(`/posts/${slug}`),

  // API Admin
  getAllAdmin: () => api.get("/posts/admin/all"),
  create: (data: any) => api.post("/posts", data),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

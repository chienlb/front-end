import api from "@/utils/api";

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const blogService = {
  findAllBlogs: async (params?: BlogQueryParams) => {
    return api.get("/blogs/all", { params });
  },

  findBlogById: async (id: string) => {
    return api.get(`/blogs/view/${id}`);
  },

  createBlog: async (data: any) => {
    return api.post("/blogs/create", data);
  },

  updateBlog: async (id: string, data: any) => {
    return api.put(`/blogs/update/${id}`, data);
  },

  deleteBlog: async (id: string) => {
    return api.delete(`/blogs/delete/${id}`);
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res: any = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data ?? res;
  },
};
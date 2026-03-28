import api from "@/utils/api";

export const literatureService = {
  // Lấy danh sách literatures (có phân trang). page/limit 1-based, không gửi offset.
  getAllLiteratures: async (params?: { page?: number; limit?: number; type?: string; grade?: string }) => {
    const query: Record<string, number | string> = {};
    const page = params?.page != null ? Math.max(1, parseInt(String(params.page), 10) || 1) : undefined;
    const limit = params?.limit != null ? Math.max(1, Math.min(100, parseInt(String(params.limit), 10) || 10)) : undefined;
    if (page != null) query.page = page;
    if (limit != null) query.limit = limit;
    if (params?.type && params.type !== "all") query.type = params.type;
    if (params?.grade && params.grade !== "all") query.grade = params.grade;
    return api.get("/literatures", { params: Object.keys(query).length ? query : undefined });
  },

  // Lấy chi tiết literature theo ID
  getLiteratureById: async (id: string) => {
    return api.get(`/literatures/${id}`);
  },

  // Tạo literature mới (multipart/form-data)
  createLiterature: async (formData: FormData) => {
    return api.post("/literatures", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update literature
  updateLiterature: async (id: string, data: any) => {
    const isFormData =
      typeof FormData !== "undefined" && data && typeof data === "object" && data instanceof FormData;
    if (isFormData) {
      return api.put(`/literatures/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.put(`/literatures/${id}`, data);
  },

  // Xoá literature
  deleteLiterature: async (id: string) => {
    try {
      return await api.delete(`/literatures/${id}`);
    } catch (error: any) {
      const status = Number(error?.response?.status || 0);
      if (status && status !== 404 && status !== 405) throw error;
    }

    const fallbackUrls = [`/literatures/delete/${id}`, `/literatures/${id}/delete`];
    let lastError: any = null;
    for (const url of fallbackUrls) {
      try {
        return await api.delete(url);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error("Delete literature failed");
  },

  // Restore literature
  restoreLiterature: async (id: string) => {
    return api.patch(`/literatures/${id}`);
  },

  // Đổi trạng thái publish
  changeLiteratureStatus: async (id: string, status: boolean) => {
    return api.patch(`/literatures/${id}/status`, status);
  },

  // Upload file dùng chung (nếu cần)
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res: any = await api.post(
      "http://localhost:4000/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data ?? res;
  },
};
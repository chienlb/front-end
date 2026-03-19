import api from "@/utils/api";

export const unitService = {
  // Lấy danh sách tất cả unit (có phân trang)
  getAllUnits: async (params?: { page?: number; limit?: number }) => {
    return api.get("/units", { params });
  },

  // Tạo unit mới (form-data + files)
  createUnit: async (formData: FormData) => {
    return api.post("/units", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Lấy chi tiết unit theo ID
  getUnitById: async (id: string) => {
    return api.get(`/units/${id}`);
  },

  // Cập nhật unit
  updateUnit: async (id: string, data: any) => {
    return api.patch(`/units/${id}`, data);
  },

  // Xóa unit
  deleteUnit: async (id: string) => {
    return api.delete(`/units/${id}`);
  },

  // Lấy unit theo userId
  getUnitByUserId: async (
    userId: string,
    params?: {
      orderIndex?: number;
      unitId?: string;
    },
  ) => {
    return api.get(`/units/user/${userId}`, { params });
  },

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
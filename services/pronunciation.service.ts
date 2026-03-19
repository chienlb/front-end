import api from "@/utils/api";

export const pronunciationService = {
  getAll: async (params?: { lessonId?: string; unitId?: string }) => {
    return api.get("/pronunciation/get-all", { params });
  },

  getById: async (id: string) => {
    return api.get("/pronunciation/get-by-id", {
      params: { id },
    });
  },

  create: async (data: any) => {
    return api.post("/pronunciation/create", data);
  },

  update: async (id: string, data: any) => {
    return api.put(`/pronunciation/update/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete("/pronunciation/delete", {
      params: { id },
    });
  },

  assess: async (formData: FormData) => {
    return api.post("/pronunciation/assess", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
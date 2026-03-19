import api from "@/utils/api";

export const roleService = {
  getRoles: async () => api.get("/roles"),
  createRole: async (data: any) => api.post("/roles", data),
  updateRole: async (id: string, data: any) => api.put(`/roles/${id}`, data),
  deleteRole: async (id: string) => api.delete(`/roles/${id}`),
};

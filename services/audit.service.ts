import api from "@/utils/api";

export const auditService = {
  getLogs: async (params: {
    page?: number;
    limit?: number;
    module?: string;
    search?: string;
  }) => {
    return api.get("/audit", { params });
  },
};

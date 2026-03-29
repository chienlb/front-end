import api from "@/utils/api";

export interface CreateSupportPayload {
  userId?: string;
  subject: string;
  message: string;
  attachments?: string[];
}

export interface UpdateSupportPayload {
  subject?: string;
  message?: string;
  attachments?: string[];
  status?: string;
}

export const supportsService = {
  createSupport: async (payload: CreateSupportPayload): Promise<any> => {
    const res = await api.post("/supports", payload);
    return res as any;
  },

  getSupports: async (): Promise<any> => {
    const res = await api.get("/supports");
    return res as any;
  },

  getSupportById: async (id: string): Promise<any> => {
    const res = await api.get(`/supports/${id}`);
    return res as any;
  },

  getSupportsByUserId: async (userId: string): Promise<any> => {
    const res = await api.get(`/supports/user/${userId}`);
    return res as any;
  },

  getSupportsByStatus: async (status: string): Promise<any> => {
    const res = await api.get(`/supports/status/${status}`);
    return res as any;
  },

  updateSupport: async (id: string, payload: UpdateSupportPayload): Promise<any> => {
    const res = await api.put(`/supports/${id}`, payload);
    return res as any;
  },
};

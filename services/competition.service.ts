import api from "@/utils/api";

export interface CompetitionQueryParams {
  page?: number;
  limit?: number;
}

export const competitionService = {
  getAllCompetitions: async () => {
    // Backend environments differ: some expose GET `/competitions`,
    // others still use GET `/competitions/all`.
    try {
      return await api.get("/competitions");
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status === 404) {
        return api.get("/competitions/all");
      }
      throw err;
    }
  },
  createCompetition: async (data: any) => {
    const isFormData =
      typeof FormData !== "undefined" && data && typeof data === "object" && data instanceof FormData;
    if (isFormData) {
      return api.post("/competitions", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post("/competitions", data);
  },

  getCompetitionById: async (id: string) => {
    return api.get(`/competitions/${id}`);
  },

  updateCompetition: async (id: string, data: any) => {
    const isFormData =
      typeof FormData !== "undefined" && data && typeof data === "object" && data instanceof FormData;
    if (isFormData) {
      return api.put(`/competitions/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put(`/competitions/${id}`, data);
  },

  deleteCompetition: async (id: string) => {
    return api.delete(`/competitions/${id}`);
  },

  getCompetitionsByUserId: async (userId: string, params?: CompetitionQueryParams) => {
    return api.get(`/competitions/user/${userId}`, { params });
  },

  joinCompetition: async (competitionId: string) => {
    return api.post("/competitions/join", { competitionId });
  },

  submitCompetition: async (data: { competitionId: string; score: number }) => {
    return api.post("/competitions/submit", data);
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res: any = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data ?? res;
  },

  getCompetitionLeaderboard: async (
    competitionId: string,
    params?: CompetitionQueryParams,
  ) => {
    return api.get(`/competitions/${competitionId}/leaderboard`, { params });
  },
};
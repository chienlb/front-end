import api from "@/utils/api";

type CreateRankPayload = {
  idCompetition: string;
  userId: string;
  score?: number;
  submittedAt?: string;
};

export const ranksService = {
  getLeaderboardByCompetition: async (competitionId: string, limit = 100) => {
    return api.get(`/ranks/competition/${competitionId}/leaderboard`, {
      params: { limit },
    });
  },

  getUserRankInCompetition: async (competitionId: string, userId: string) => {
    try {
      return await api.get(
        `/ranks/competition/${competitionId}/user/${userId}`,
      );
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  },

  getRanksByUser: async (userId: string) => {
    try {
      return await api.get(`/ranks/user/${userId}`);
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status;
      if (status === 404) {
        return [];
      }
      throw error;
    }
  },

  createRank: async (payload: CreateRankPayload) => {
    return api.post("/ranks", {
      idCompetition: payload.idCompetition,
      userId: payload.userId,
      score: typeof payload.score === "number" ? payload.score : 0,
      submittedAt: payload.submittedAt,
    });
  },
};


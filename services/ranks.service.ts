import api from "@/utils/api";

export const ranksService = {
  getLeaderboardByCompetition: async (competitionId: string, limit = 100) => {
    return api.get(`/ranks/competition/${competitionId}/leaderboard`, {
      params: { limit },
    });
  },

  getUserRankInCompetition: async (competitionId: string, userId: string) => {
    return api.get(
      `/ranks/competition/${competitionId}/user/${userId}`,
    );
  },

  getRanksByUser: async (userId: string) => {
    return api.get(`/ranks/user/${userId}`);
  },
};


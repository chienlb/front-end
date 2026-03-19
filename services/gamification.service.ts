import api from "@/utils/api";

export const gamificationService = {
  // --- QUESTS ---
  getQuests: async () => api.get("/gamification/quests"),
  createQuest: async (data: any) => api.post("/gamification/quests", data),
  updateQuest: async (id: string, data: any) =>
    api.put(`/gamification/quests/${id}`, data),
  deleteQuest: async (id: string) => api.delete(`/gamification/quests/${id}`),

  // --- LEVELS ---
  getLevels: async () => api.get("/gamification/levels"),
  createLevel: async (data: any) => api.post("/gamification/levels", data),
  updateLevel: async (id: string, data: any) =>
    api.put(`/gamification/levels/${id}`, data),
  deleteLevel: async (id: string) => api.delete(`/gamification/levels/${id}`),

  // --- BADGES (ACHIEVEMENTS) ---
  getBadges: async () => api.get("/gamification/achievements"),
  createBadge: async (data: any) =>
    api.post("/gamification/achievements", data),
  updateBadge: async (id: string, data: any) =>
    api.put(`/gamification/achievements/${id}`, data),
  deleteBadge: async (id: string) =>
    api.delete(`/gamification/achievements/${id}`),

  // --- CLIENT METHODS ---

  // Lấy danh sách nhiệm vụ kèm tiến độ của User hiện tại
  getMyQuests: async () => {
    return api.get("/gamification/quests/me");
  },

  // Nhận thưởng nhiệm vụ
  claimReward: async (questId: string) => {
    return api.post(`/gamification/quests/${questId}/claim`);
  },
};

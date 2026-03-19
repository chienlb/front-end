import api from "@/utils/api";

export const communityService = {
  // Posts
  getPosts: async (status: string = "ALL") => {
    return api.get("/community/posts", { params: { status } });
  },
  approvePost: async (id: string) => {
    return api.patch(`/community/posts/${id}/status`, { status: "APPROVED" });
  },
  rejectPost: async (id: string) => {
    return api.patch(`/community/posts/${id}/status`, { status: "REJECTED" });
  },
  toggleFeature: async (id: string) => {
    return api.patch(`/community/posts/${id}/feature`);
  },
  deletePost: async (id: string) => {
    return api.delete(`/community/posts/${id}`);
  },

  // Reports
  getReports: async (status: string = "OPEN") => {
    return api.get("/community/reports", { params: { status } });
  },
  resolveReport: async (id: string, action: "RESOLVED" | "DISMISSED") => {
    return api.patch(`/community/reports/${id}/resolve`, { action });
  },

  // --- CLIENT METHODS ---

  // Lấy bài viết đã được duyệt (APPROVED) để hiện lên Feed
  getPublicFeed: async () => {
    return api.get("/community/posts", { params: { status: "APPROVED" } });
  },

  // Thả tim
  likePost: async (id: string, liked: boolean) => {
    return api.patch(`community/posts/${id}/like`, {
      params: { liked: liked },
    });
  },
};

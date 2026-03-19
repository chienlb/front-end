import api from "@/utils/api";

export const friendService = {
  // Lấy danh sách bạn bè
  getFriends: async () => {
    return api.get("/friends");
  },

  // Lấy danh sách lời mời
  getRequests: async () => {
    return api.get("/friends/requests");
  },

  // Gửi lời mời kết bạn (friendId là ID của user muốn kết bạn)
  sendRequest: async (friendId: string) => {
    return api.post("/friends/request", { friendId });
  },

  // Đồng ý (requestId là ID của lời mời)
  acceptRequest: async (requestId: string) => {
    return api.patch(`/friends/accept/${requestId}`);
  },

  // Từ chối
  rejectRequest: async (requestId: string) => {
    return api.delete(`/friends/reject/${requestId}`);
  },

  // Hủy kết bạn
  unfriend: async (friendId: string) => {
    return api.delete(`/friends/${friendId}`);
  },

  // Tìm người dùng để kết bạn (Tận dụng API users search có sẵn)
  searchUser: async (query: string) => {
    return api.get(`/users?search=${query}&limit=5`);
  },
};

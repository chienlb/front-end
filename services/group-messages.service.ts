import api from "@/utils/api";

export const groupMessagesService = {
  // Preferred (suggested) route: GET /group-messages/group/:groupId
  // Fallback: GET /group-messages/:groupId (nếu backend chưa tách route)
  getMessagesByGroupId: async (groupId: string, params?: { page?: number; limit?: number }) => {
    const { page = 1, limit = 50 } = params ?? {};

    try {
      return await api.get(`/group-messages/${groupId}`, {
        params: { page, limit },
      });
    } catch {
      return api.get(`/group-messages/${groupId}`, {
        params: { page, limit },
      });
    }
  },

  sendMessage: async (payload: {
    groupId: string;
    content: string;
    type?: string;
    attachments?: string[];
    mentions?: string[];
    replyTo?: string | null;
  }) => {
    const normalizedType =
      (payload.type ?? "text").toLowerCase();

    return api.post("/group-messages", {
      ...payload,
      // Backend enum: text | image | file | audio | video | system
      type: normalizedType,
      attachments: payload.attachments ?? [],
      mentions: payload.mentions ?? [],
      replyTo: payload.replyTo ?? null,
    });
  },
};


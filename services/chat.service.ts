import api from "@/utils/api";

export const chatService = {
  chat: async (message: string, _history?: any) => {
    // Chỉ gửi message (string). Backend 400 khi gửi thêm trường messages.
    return api.post("/chatbot/chat", {
      message: message.trim(),
    });
  },
};

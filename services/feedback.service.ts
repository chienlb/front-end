import api from "@/utils/api";

export type FeedbackCategory = "BUG" | "SUGGESTION" | "CONTENT" | "OTHER";

export interface CreateFeedbackPayload {
  category: FeedbackCategory;
  rating?: number; // 1..5
  message: string;
  pageUrl?: string;
}

export const feedbackService = {
  create: async (payload: CreateFeedbackPayload) => {
    // If your backend uses a different endpoint, change it here.
    // Common patterns: POST /feedback, POST /feedbacks
    return api.post("/feedback", payload);
  },
};


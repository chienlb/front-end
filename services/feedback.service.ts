import api from "@/utils/api";

export type FeedbackType = "general" | "lesson" | "feature" | "bug";

export interface FeedbackItem {
  _id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  content: string;
  rating?: number;
  relatedId?: string;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeedbackPayload {
  type: FeedbackType;
  title: string;
  content: string;
  rating?: number;
  relatedId?: string;
  isResolved?: boolean;
}

export interface UpdateFeedbackPayload {
  type?: FeedbackType;
  title?: string;
  content?: string;
  rating?: number;
  relatedId?: string;
  isResolved?: boolean;
}

export const feedbackService = {
  create: async (payload: CreateFeedbackPayload) => {
    return api.post("/feedbacks", payload);
  },

  findAll: async (page = 1, limit = 10) => {
    return api.get("/feedbacks", { params: { page, limit } });
  },

  findById: async (id: string) => {
    return api.get(`/feedbacks/${id}`);
  },

  updateById: async (id: string, payload: UpdateFeedbackPayload) => {
    return api.put(`/feedbacks/${id}`, payload);
  },

  deleteById: async (id: string) => {
    return api.delete(`/feedbacks/${id}`);
  },
};


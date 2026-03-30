import api from "@/utils/api";

export type FeedbackType = "general" | "lesson" | "feature" | "bug";

export interface FeedbackItem {
  _id: string;
  userId: string;
  type?: FeedbackType;
  title?: string;
  content: string;
  rating: number;
  relatedId?: string;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackListResponse {
  data: FeedbackItem[];
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CreateFeedbackPayload {
  userId: string;
  content: string;
  rating: number;
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

  getAll: async (page = 1, limit = 10): Promise<FeedbackListResponse> => {
    return api.get("/feedbacks", { params: { page, limit } });
  },

  findAll: async (page = 1, limit = 10): Promise<FeedbackListResponse> => {
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


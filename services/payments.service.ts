import api from "@/utils/api";

export type CreatePaymentPayload = {
  subscriptionId: string;
  amount: number;
  method: "paypal" | "vnpay";
  currency?: string;
  description?: string;
};

export const paymentsService = {
  getUserSubscriptionByPackageId: async (packageId: string) => {
    const id = packageId.trim();
    return api.get(`/subscriptions/user-subscriptions/${id}`);
  },

  extractSubscriptionId: (raw: any): string => {
    const payload = raw?.data || raw;
    return String(
      payload?.subscriptionId ||
        payload?._id ||
        payload?.id ||
        payload?.data?.subscriptionId ||
        payload?.data?._id ||
        payload?.data?.id ||
        "",
    );
  },

  createPayment: async (payload: CreatePaymentPayload) => {
    // DTO backend hiện tại strict whitelist; chỉ gửi các field cần thiết.
    const body = {
      subscriptionId: payload.subscriptionId,
      amount: payload.amount,
      method: payload.method,
      currency: payload.currency || "VND",
      description: payload.description,
    };
    return api.post("/payments/create", body);
  },

  handleReturn: async (query: Record<string, string>) => {
    return api.get("/payments/return", { params: query });
  },
};


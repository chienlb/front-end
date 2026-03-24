import api from "@/utils/api";

export const subscriptionsService = {
  createSubscription: async (payload: {
    packageId: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  }) => {
    return api.post("/subscriptions", payload);
  },

  extractSubscriptionId: (raw: any) => {
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
};


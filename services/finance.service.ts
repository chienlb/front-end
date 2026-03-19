import api from "@/utils/api";

export const financeService = {
  // Packages
  getPackages: async (activeOnly = false) =>
    api.get("/finance/packages", { params: { active: activeOnly } }),
  createPackage: async (data: any) => api.post("/finance/packages", data),
  updatePackage: async (id: string, data: any) =>
    api.put(`/finance/packages/${id}`, data),
  deletePackage: async (id: string) => api.delete(`/finance/packages/${id}`),

  // Transactions & Subscriptions
  getTransactions: async () => api.get("/finance/transactions"),
  getSubscriptions: async () => api.get("/finance/subscriptions"),

  // Client Buy (Test)
  buyPackage: async (data: any) => api.post("/finance/transactions", data),

  // Client lấy danh sách gói đang mở bán
  getPublicPackages: async () => {
    return api.get("/finance/packages", { params: { active: true } });
  },

  // Client tạo yêu cầu thanh toán (Tạo Transaction PENDING)
  createPayment: async (packageId: string, amount: number) => {
    // method mặc định là BANK (Chuyển khoản) hoặc MOMO
    return api.post("/finance/transactions", {
      packageId,
      amount,
      method: "BANK",
    });
  },
};

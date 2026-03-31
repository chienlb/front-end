import api from "@/utils/api";

export type ExportType =
  | "USERS"
  | "PAYMENTS"
  | "REVENUE"
  | "STATISTICS"
  | "users"
  | "payments"
  | "revenue"
  | "statistics";

export type ExportFilter = {
  type: ExportType;
  startDate?: string;
  endDate?: string;
  status?: string;
  role?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

export type SystemFeature = {
  _id?: string;
  id?: string;
  key?: string;
  name?: string;
  flagName?: string;
  description?: string;
  isEnabled: boolean;
};

export const adminService = {
  getDashboardData: () => api.get("/admin/dashboard"),
  getRevenueData: () => api.get("/admin/revenue"),
  getUserActivity: () => api.get("/admin/user-activity"),
  getUnitStatistics: () => api.get("/admin/unit-statistics"),
  getGroupStatistics: () => api.get("/admin/group-statistics"),
  getRecentPayments: () => api.get("/payments/get-list-payment"),
  getRecentUsers: () => api.get("/admin/recent-users"),
  getRevenueByMonth: () => api.get("/admin/revenue-by-month"),
  getSystemFeatures: () => api.get("/admin/system-features"),
  toggleSystemFeature: (id: string, isEnabled: boolean) =>
    api.patch(`/admin/system-features/${id}/toggle`, { isEnabled }),
  getUserByMonth: () => api.get("/admin/user-by-month"),
  exportToExcel: async (filters: ExportFilter) => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== "") params[k] = String(v);
    });

    try {
      const res = await api.get("/admin/export", {
        params,
        responseType: "blob",
      });
      return res.data as Blob;
    } catch (err: any) {
      let message = "Export thất bại";
      const data = err?.response?.data;
      if (typeof data === "string") {
        message = data;
      } else if (data instanceof Blob) {
        try {
          const text = await data.text();
          if (text) message = text;
        } catch {
          // keep default message
        }
      } else if (data?.message) {
        message = Array.isArray(data.message) ? data.message.join(", ") : String(data.message);
      } else if (err?.message) {
        message = String(err.message);
      }
      throw new Error(message);
    }
  },
  async uploadDocument(groupId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);

    return api.post("/admin/upload-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

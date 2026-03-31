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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== "") params.append(k, String(v));
    });
    const base = String(api.defaults.baseURL || "").replace(/\/$/, "");
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
    const url = `${base}/admin/export?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    });
    if (!res.ok) {
      let message = "Export thất bại";
      try {
        const body = await res.json();
        if (body?.message) message = String(body.message);
      } catch {
        // ignore non-json response
      }
      throw new Error(message);
    }
    return res.blob();
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

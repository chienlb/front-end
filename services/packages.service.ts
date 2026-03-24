import api from "@/utils/api";

export type PackageApiItem = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  durationInDays?: number;
  price?: number;
  currency?: string;
  features?: string[];
  isActive?: boolean;
};

export const packagesService = {
  getPackages: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) => {
    return api.get("/packages", { params });
  },
};


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
  createdAt?: string;
  updatedAt?: string;
};

export const packagesService = {
  getPackages: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) => {
    return api.get("/packages", { params });
  },

  getPackageById: async (id: string) => {
    return api.get(`/packages/${encodeURIComponent(id)}`);
  },

  createPackage: async (payload: {
    name: string;
    description?: string;
    type: string;
    durationInDays: number;
    price: number;
    currency?: string;
    features?: string[];
    isActive?: boolean;
  }) => {
    return api.post("/packages", payload);
  },

  updatePackageById: async (
    id: string,
    payload: {
      name?: string;
      description?: string;
      type?: string;
      durationInDays?: number;
      price?: number;
      currency?: string;
      features?: string[];
      isActive?: boolean;
    },
  ) => {
    return api.put(`/packages/${encodeURIComponent(id)}`, payload);
  },

  deletePackageById: async (id: string) => {
    return api.delete(`/packages/${encodeURIComponent(id)}`);
  },

  restorePackageById: async (id: string) => {
    return api.put(`/packages/${encodeURIComponent(id)}/restore`);
  },
};


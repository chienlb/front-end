import api from "@/utils/api";

export const handbookService = {
  getItems: async () => {
    return api.get("/handbook/items");
  },
};

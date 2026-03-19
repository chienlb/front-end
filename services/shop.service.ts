import api from "@/utils/api";

export const shopService = {
  getItems: async (type?: string) => {
    // Nếu type = ALL thì không truyền param để lấy tất cả
    const params = type && type !== "ALL" ? { type } : {};
    return api.get("/shop", { params });
  },
  createItem: async (data: any) => {
    return api.post("/shop", data);
  },
  updateItem: async (id: string, data: any) => {
    return api.put(`/shop/${id}`, data);
  },
  deleteItem: async (id: string) => {
    return api.delete(`/shop/${id}`);
  },

  // 🔥 Thêm hàm Mua
  buyItem: async (itemId: string) => {
    return api.post("/shop/buy", { itemId });
  },

  // 🔥 Thêm hàm Trang bị
  equipItem: async (itemId: string) => {
    return api.post("/shop/equip", { itemId });
  },
};

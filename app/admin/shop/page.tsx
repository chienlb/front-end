"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Cat,
  Frame,
  Coins,
  Gem,
  Loader2,
  User,
} from "lucide-react";
import ItemEditorModal from "@/components/admin/shop/ItemEditorModal";
import { shopService } from "@/services/shop.service";

export default function ShopManagerPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Load Data
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data: any = await shopService.getItems(activeTab);
      // Lọc client-side để đảm bảo chỉ hiện PET và FRAME (phòng API trả về loại cũ)
      const filteredData = data.filter((item: any) =>
        ["PET", "FRAME"].includes(item.type),
      );
      setItems(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  // Xử lý Xóa
  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa vật phẩm này?")) {
      await shopService.deleteItem(id);
      fetchItems();
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Cửa hàng & Vật phẩm 🛒
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Quản lý Thú cưng và Khung viền Avatar.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <Plus size={18} /> Thêm Vật phẩm
        </button>
      </div>

      {/* 2. FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: "ALL", label: "Tất cả", icon: null },
            { id: "PET", label: "Thú cưng", icon: <Cat size={16} /> },
            { id: "FRAME", label: "Khung viền", icon: <Frame size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-72 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* 3. ITEMS GRID */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-64 flex-col gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="text-slate-400 text-sm font-bold">
              Đang tải dữ liệu...
            </span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Cat size={48} className="mb-2 opacity-50" />
            <p className="font-bold">Chưa có vật phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col"
              >
                {/* Image Preview Area */}
                <div
                  className={`h-40 rounded-xl mb-4 flex items-center justify-center p-4 relative overflow-hidden ${
                    item.type === "PET" ? "bg-orange-50" : "bg-purple-50"
                  }`}
                >
                  {/* Nếu là FRAME, hiện avatar giả */}
                  {item.type === "FRAME" && (
                    <div className="absolute w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white">
                      <User className="text-slate-400" />
                    </div>
                  )}

                  {/* Ảnh chính */}
                  <img
                    src={item.thumbnail || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className={`object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110 z-10 ${
                      item.type === "FRAME"
                        ? "w-24 h-24 absolute"
                        : "h-full w-full"
                    }`}
                  />
                </div>

                {/* Badge Type */}
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${
                      item.type === "PET"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {item.type === "PET" ? "Thú cưng" : "Khung viền"}
                  </span>
                </div>

                {/* Info */}
                <h3
                  className="font-bold text-slate-800 text-sm mb-1 truncate"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8 flex-1 leading-relaxed">
                  {item.description || "Không có mô tả"}
                </p>

                {/* Footer Price & Actions */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex items-center gap-1.5 font-black text-sm">
                    {item.currency === "GOLD" ? (
                      <Coins
                        size={16}
                        className="text-yellow-500 fill-yellow-500"
                      />
                    ) : (
                      <Gem size={16} className="text-blue-500 fill-blue-500" />
                    )}
                    <span
                      className={
                        item.currency === "GOLD"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }
                    >
                      {item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Card Thêm Nhanh */}
            <button
              onClick={handleCreate}
              className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition h-full min-h-[280px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm">Thêm mới</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ItemEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchItems()}
        initialData={editingItem}
      />
    </div>
  );
}

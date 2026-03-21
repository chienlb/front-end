"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, PackageOpen } from "lucide-react";
import { userService } from "@/services/user.service";
import LottiePet from "@/components/student/ui/LottiePet";
import { showAlert } from "@/utils/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPetId?: string;
  onEquipSuccess: (newPet: any) => void;
}

// Component con xử lý logic hiển thị
const PetDisplay = ({ item }: { item: any }) => {
  const [lottieError, setLottieError] = useState(false);

  // Nếu có link Lottie và chưa bị lỗi thì hiện Lottie
  if (item.lottieUrl && !lottieError) {
    return (
      <div className="w-full h-full relative">
        <LottiePet
          src={item.lottieUrl}
          className="w-full h-full"
          onError={() => setLottieError(true)}
        />
      </div>
    );
  }

  // Fallback: Hiện ảnh tĩnh nếu không có Lottie hoặc Lottie lỗi
  return (
    <img
      src={
        item.thumbnail ||
        "https://cdn-icons-png.flaticon.com/512/10609/10609384.png"
      }
      alt={item.name}
      className="w-full h-full object-contain drop-shadow-md"
    />
  );
};

export default function InventoryModal({
  isOpen,
  onClose,
  currentPetId,
  onEquipSuccess,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchInventory();
  }, [isOpen]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res: any = await userService.getProfile();

      const userData = res.data || res;

      console.log("Check Data Inventory:", userData.inventory);

      const inventoryList = userData.inventory || [];

      // Lọc item là PET
      const pets = inventoryList.filter(
        (item: any) => item && item.type === "PET",
      );

      setItems(pets);
    } catch (error) {
      console.error("Lỗi tải túi đồ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (item: any) => {
    if (item._id === currentPetId) return;
    setEquippingId(item._id);
    try {
      // Gọi API equip
      await userService.equipItem(item._id);
      onEquipSuccess(item);
    } catch (error) {
      await showAlert("Lỗi trang bị pet!");
    } finally {
      setEquippingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
          <h2 className="text-xl font-black flex items-center gap-2">
            🎒 Túi Đồ Của Bé
          </h2>
          <button
            onClick={onClose}
            className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-purple-50 flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-purple-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Đang tìm Pet...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              <PackageOpen size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold">Chưa có Pet nào!</p>
              <p className="text-sm">Hãy vào Cửa Hàng để mua nhé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => {
                const isEquipped = item._id === currentPetId;
                const isProcessing = equippingId === item._id;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleEquip(item)}
                    className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer border-4 transition-all hover:scale-105 active:scale-95
                        ${isEquipped ? "border-green-500 bg-green-50 shadow-lg" : "border-white bg-white hover:border-purple-300 shadow-sm"}
                    `}
                  >
                    {isEquipped && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                        <Check size={10} /> ĐANG DÙNG
                      </div>
                    )}

                    <div className="h-28 w-28 relative">
                      {/* 🔥 HIỂN THỊ: Ưu tiên LottieUrl, fallback sang Thumbnail */}
                      {item.lottieUrl ? (
                        <PetDisplay item={item} />
                      ) : (
                        <img
                          src={
                            item.thumbnail ||
                            "https://cdn-icons-png.flaticon.com/512/10609/10609384.png"
                          }
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    <div className="text-center w-full">
                      <h3
                        className={`font-bold text-sm truncate ${isEquipped ? "text-green-700" : "text-slate-700"}`}
                      >
                        {item.name}
                      </h3>
                    </div>

                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-20">
                        <Loader2
                          className="animate-spin text-purple-600"
                          size={32}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t text-center">
          <button
            onClick={onClose}
            className="text-slate-500 font-bold hover:text-slate-800 text-sm px-6 py-2 rounded-full hover:bg-slate-100 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

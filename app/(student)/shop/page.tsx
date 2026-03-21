"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shopService } from "@/services/shop.service";
import { userService } from "@/services/user.service";
import {
  Loader2,
  ArrowLeft,
  Coins,
  ShoppingBag,
  User,
  Check,
  Shield,
  Lock,
  Star,
  Sparkles,
} from "lucide-react";
import { showAlert, showConfirm } from "@/utils/dialog";

// --- 1. MOCK DATA ---
const MOCK_DATA = [
  // PETS (3D/Realistic Style)
  {
    _id: "pet_1",
    type: "PET",
    name: "Husky Thông Thái",
    price: 1500,
    thumbnail: "https://cdn-icons-png.flaticon.com/512/4392/4392524.png",
  },
  {
    _id: "pet_2",
    type: "PET",
    name: "Robot Trợ Lý",
    price: 2500,
    thumbnail: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
  },
  {
    _id: "pet_3",
    type: "PET",
    name: "Rồng Lửa",
    price: 3000,
    thumbnail: "https://cdn-icons-png.flaticon.com/512/1998/1998610.png",
  },
  {
    _id: "pet_4",
    type: "PET",
    name: "Cú Mèo Tri Thức",
    price: 1200,
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3062/3062634.png",
  },

  // FRAMES (Viền Avatar - CSS Pure)
  {
    _id: "frame_1",
    type: "FRAME",
    name: "Hào Quang Vàng",
    price: 500,
    thumbnail: "👑",
    style: "border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]",
  },
  {
    _id: "frame_2",
    type: "FRAME",
    name: "Công Nghệ Xanh",
    price: 800,
    thumbnail: "💠",
    style:
      "border-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] bg-cyan-400/10",
  },
  {
    _id: "frame_3",
    type: "FRAME",
    name: "Vành Đai Lửa",
    price: 1000,
    thumbnail: "🔥",
    style:
      "border-[5px] border-red-500 border-double shadow-[0_0_15px_rgba(239,68,68,0.6)]",
  },
  {
    _id: "frame_4",
    type: "FRAME",
    name: "Tinh Tú Galaxy",
    price: 1200,
    thumbnail: "✨",
    style:
      "border-4 border-indigo-500 border-dashed shadow-[0_0_15px_rgba(99,102,241,0.6)]",
  },
];

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PET" | "FRAME">("PET");

  // State Data
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>({
    gold: 0,
    avatar:
      "https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=b6e3f4",
    inventory: [],
    equipped: { pet: null, frame: null },
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [apiItemsRes, userRes] = await Promise.allSettled([
        shopService.getItems("ALL"),
        userService.getProfile(),
      ]);

      if (userRes.status === "fulfilled") setUserData(userRes.value);

      let finalItems: any[] = [];
      if (
        apiItemsRes.status === "fulfilled" &&
        Array.isArray(apiItemsRes.value)
      ) {
        finalItems = apiItemsRes.value;
      }

      const hasPet = finalItems.some((i) => i.type === "PET");
      const hasFrame = finalItems.some((i) => i.type === "FRAME");

      if (!hasPet)
        finalItems = [
          ...finalItems,
          ...MOCK_DATA.filter((i) => i.type === "PET"),
        ];
      if (!hasFrame)
        finalItems = [
          ...finalItems,
          ...MOCK_DATA.filter((i) => i.type === "FRAME"),
        ];

      setShopItems(finalItems);
    } catch (error) {
      console.error("Shop error:", error);
      setShopItems(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleBuy = async (item: any) => {
    if (userData.gold < item.price) {
      await showAlert("Số dư không đủ. Hãy hoàn thành thêm bài học nhé!");
      return;
    }

    if (!(await showConfirm(`Xác nhận mua "${item.name}"?`))) return;

    const previousState = { ...userData };
    setUserData((prev: any) => ({
      ...prev,
      gold: prev.gold - item.price,
      inventory: [...prev.inventory, item._id],
    }));

    try {
      if (!item._id.startsWith("pet_") && !item._id.startsWith("frame_")) {
        await shopService.buyItem(item._id);
      }
    } catch (err) {
      setUserData(previousState);
      await showAlert("Lỗi kết nối, vui lòng thử lại.");
    }
  };

  const handleEquip = async (item: any) => {
    const slot = item.type.toLowerCase();
    const isEquipping = getEquippedId(slot) !== item._id;

    const previousState = { ...userData };

    setUserData((prev: any) => ({
      ...prev,
      equipped: { ...prev.equipped, [slot]: isEquipping ? item._id : null },
    }));

    try {
      if (!item._id.startsWith("pet_") && !item._id.startsWith("frame_")) {
        await shopService.equipItem(item._id);
      }
    } catch (err) {
      setUserData(previousState);
    }
  };

  const getEquippedId = (type: string) => {
    const item = userData.equipped?.[type.toLowerCase()];
    return typeof item === "object" && item !== null ? item._id : item;
  };

  const checkOwned = (id: string) => userData?.inventory?.includes(id);
  const checkEquipped = (id: string, type: string) =>
    getEquippedId(type) === id;

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        <p className="text-slate-500 font-medium">Đang tải cửa hàng...</p>
      </div>
    );

  const filteredItems = shopItems.filter((i) => i.type === activeTab);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-blue-700 transition group"
        >
          <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-100 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold text-sm uppercase tracking-wide hidden sm:inline">
            Trang chủ
          </span>
        </Link>

        <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          <ShoppingBag size={28} className="text-blue-600 fill-blue-100" /> Cửa
          Hàng
        </h1>

        <div className="bg-white border-2 border-yellow-100 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider hidden sm:inline">
            Tài sản
          </span>
          <div className="flex items-center gap-1.5 text-yellow-600 font-black text-lg">
            <Coins size={20} className="fill-yellow-400 text-yellow-600" />{" "}
            {userData?.gold?.toLocaleString()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* --- LEFT COL: PREVIEW (Sticky) --- */}
          <div className="lg:w-1/3 w-full relative">
          <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl p-6 shadow-primary-card overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>

              <div className="relative z-10">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={14} /> Xem trước diện mạo
                </h2>

                {/* AVATAR BOX */}
                <div className="relative w-full aspect-square bg-white rounded-2xl border border-slate-100 flex items-center justify-center overflow-visible mb-6 shadow-inner group">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {/* 1. FRAME */}
                  {(() => {
                    const equippedFrameId = getEquippedId("FRAME");
                    const frameItem =
                      shopItems.find((i) => i._id === equippedFrameId) ||
                      MOCK_DATA.find((i) => i._id === equippedFrameId);

                    return (
                      <div
                        className={`absolute z-20 w-48 h-48 rounded-full pointer-events-none transition-all duration-500 ease-out ${frameItem?.style || "border-4 border-white shadow-lg"}`}
                      ></div>
                    );
                  })()}

                  {/* 2. AVATAR */}
                  <div className="relative z-10 w-40 h-40 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={userData?.avatar}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 3. PET */}
                  {(() => {
                    const equippedPetId = getEquippedId("PET");
                    const petItem =
                      shopItems.find((i) => i._id === equippedPetId) ||
                      MOCK_DATA.find((i) => i._id === equippedPetId);

                    if (!petItem) return null;

                    return (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                        }}
                        className="absolute -bottom-2 -right-2 z-30 w-24 h-24 drop-shadow-xl filter"
                      >
                        <img
                          src={petItem.thumbnail}
                          alt="Pet"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-0 right-0 animate-pulse">
                          <Sparkles
                            size={16}
                            className="text-yellow-400 fill-yellow-200"
                          />
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>

                {/* Info Status */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">
                      Khung viền
                    </span>
                    <span className="font-bold text-slate-800">
                      {(
                        shopItems.find(
                          (i) => i._id === getEquippedId("FRAME"),
                        ) ||
                        MOCK_DATA.find((i) => i._id === getEquippedId("FRAME"))
                      )?.name || "Mặc định"}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Thú cưng</span>
                    <span className="font-bold text-blue-600">
                      {(
                        shopItems.find((i) => i._id === getEquippedId("PET")) ||
                        MOCK_DATA.find((i) => i._id === getEquippedId("PET"))
                      )?.name || "Chưa có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COL: ITEMS --- */}
          <div className="lg:w-2/3 w-full">
            {/* TABS */}
            <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
              {[
                { id: "PET", label: "Thú Cưng", icon: Star },
                { id: "FRAME", label: "Khung Viền", icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* GRID (Đã xóa thuộc tính layout ở thẻ cha để fix lỗi kéo dãn) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 min-h-[300px]">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const isOwned = checkOwned(item._id);
                  const isEquipped = checkEquipped(item._id, item.type);
                  const canBuy = userData.gold >= item.price;

                  return (
                    <motion.div
                      key={item._id}
                      layout // Giữ layout ở item con để animation mượt khi filter
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`relative bg-white border transition-all p-4 rounded-2xl flex flex-col items-center group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                        isEquipped
                          ? "border-blue-500 ring-2 ring-blue-100 shadow-blue-100"
                          : "border-slate-100 hover:border-blue-200"
                      }`}
                    >
                      {isOwned && (
                        <div className="absolute top-3 right-3 text-white bg-green-500 rounded-full p-1 shadow-sm z-10">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}

                      <div
                        className={`w-full aspect-[4/3] mb-4 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors ${item.type === "PET" ? "bg-orange-50/50" : "bg-slate-50"}`}
                      >
                        {item.type === "PET" ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-28 h-28 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={`w-20 h-20 rounded-full bg-white relative ${item.style} shadow-sm group-hover:scale-105 transition-transform duration-300`}
                          ></div>
                        )}
                      </div>

                      <div className="w-full mb-4 px-1 text-center">
                        <h3 className="font-bold text-slate-800 text-sm truncate mb-1">
                          {item.name}
                        </h3>
                        {!isOwned && (
                          <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-md w-fit mx-auto">
                            <Coins size={12} className="fill-yellow-500" />{" "}
                            {item.price.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="w-full mt-auto">
                        {isOwned ? (
                          <button
                            onClick={() => handleEquip(item)}
                            className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                              isEquipped
                                ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                : "bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-md shadow-blue-200"
                            }`}
                          >
                            {isEquipped ? "Đang sử dụng" : "Trang bị"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={!canBuy}
                            className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all ${
                              canBuy
                                ? "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            }`}
                          >
                            {!canBuy && <Lock size={12} />}
                            Mua ngay
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">
                  Chưa có vật phẩm nào trong danh mục này.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

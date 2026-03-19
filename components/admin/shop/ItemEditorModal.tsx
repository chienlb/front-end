"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  FileJson,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { shopService } from "@/services/shop.service";
import LottiePet from "@/components/student/ui/LottiePet";
import { courseService } from "@/services/course.service";

export default function ItemEditorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "SKIN",
    price: 1000,
    currency: "GOLD",
    thumbnail: "",
    lottieUrl: "",
    config: {},
    isActive: true,
  });

  // 🔥 STATE CHO THUMBNAIL UPLOAD
  const [thumbTab, setThumbTab] = useState<"LINK" | "UPLOAD">("LINK");
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  // STATE CHO LOTTIE UPLOAD
  const [lottieTab, setLottieTab] = useState<"LINK" | "UPLOAD">("LINK");
  const [lottieFile, setLottieFile] = useState<File | null>(null);

  // State cấu hình PET
  const [petEvo, setPetEvo] = useState([
    { level: 1, name: "Trứng", image: "" },
    { level: 10, name: "Sơ sinh", image: "" },
    { level: 50, name: "Trưởng thành", image: "" },
  ]);

  // Load Data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        type: initialData.type,
        price: initialData.price,
        currency: initialData.currency,
        thumbnail: initialData.thumbnail || "",
        lottieUrl: initialData.lottieUrl || "",
        config: initialData.config || {},
        isActive: initialData.isActive,
      });

      // Reset Tabs
      setThumbTab("LINK");
      setThumbFile(null);
      setLottieTab("LINK");
      setLottieFile(null);

      if (initialData.type === "PET" && initialData.config?.evolution) {
        setPetEvo(initialData.config.evolution);
      }
    } else {
      // Reset Form
      setFormData({
        name: "",
        description: "",
        type: "SKIN",
        price: 500,
        currency: "GOLD",
        thumbnail: "",
        lottieUrl: "",
        config: {},
        isActive: true,
      });
      setThumbTab("LINK");
      setThumbFile(null);
      setLottieTab("LINK");
      setLottieFile(null);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên vật phẩm!");

    setLoading(true);
    setUploading(true);
    try {
      let finalThumbnail = formData.thumbnail;
      let finalLottieUrl = formData.lottieUrl;

      // 1. Upload Thumbnail (Nếu có file)
      if (thumbTab === "UPLOAD" && thumbFile) {
        const res: any = await courseService.uploadFile(thumbFile);
        finalThumbnail = res.url || res;
      }

      // 2. Upload Lottie (Nếu có file)
      if (formData.type === "PET" && lottieTab === "UPLOAD" && lottieFile) {
        const res: any = await courseService.uploadFile(lottieFile);
        finalLottieUrl = res.url || res;
      }

      const payload: any = {
        ...formData,
        thumbnail: finalThumbnail,
        lottieUrl: finalLottieUrl,
      };

      if (payload.type === "PET") {
        payload.config = { ...payload.config, evolution: petEvo };
      }

      if (initialData?._id) {
        await shopService.updateItem(initialData._id, payload);
      } else {
        await shopService.createItem(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi lưu/upload vật phẩm");
      console.error(error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in zoom-in-95">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-slate-800">
            {initialData ? "Sửa vật phẩm" : "Thêm vật phẩm mới"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* BODY SCROLL */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Loại & Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Loại
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="PET">Thú cưng (Pet)</option>
                <option value="SKIN">Trang phục (Skin)</option>
                <option value="CONSUMABLE">Vật phẩm (Item)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Giá bán
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="border p-2 rounded-lg bg-gray-50 text-sm font-bold"
                >
                  <option value="GOLD">💰 Vàng</option>
                  <option value="DIAMOND">💎 KC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tên Vật phẩm */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Tên vật phẩm
            </label>
            <input
              className="w-full border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Rồng lửa..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* 🔥 THUMBNAIL INPUT */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon size={14} /> Ảnh hiển thị (Thumbnail)
            </label>

            {/* Tabs Thumbnail */}
            <div className="flex bg-gray-200/50 p-1 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setThumbTab("LINK")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${thumbTab === "LINK" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <LinkIcon size={12} /> Link
              </button>
              <button
                type="button"
                onClick={() => setThumbTab("UPLOAD")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${thumbTab === "UPLOAD" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <Upload size={12} /> Upload
              </button>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-1">
                {thumbTab === "LINK" ? (
                  <input
                    className="w-full border p-2 rounded-lg text-sm font-mono text-gray-600 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="https://...png"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center relative hover:bg-white transition cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setThumbFile(file);
                        if (file)
                          setFormData({
                            ...formData,
                            thumbnail: URL.createObjectURL(file),
                          });
                      }}
                    />
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Upload size={20} className="mb-1" />
                      <span className="text-[10px] font-bold">
                        {thumbFile ? thumbFile.name : "Chọn ảnh PNG/JPG"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Preview Thumbnail */}
              <div className="h-16 w-16 bg-white border rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {formData.thumbnail ? (
                  <img
                    src={formData.thumbnail}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          {/* LOTTIE FILE INPUT */}
          {formData.type === "PET" && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 transition-all">
              <label className="block text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                <FileJson size={14} /> File Hoạt Hình (Lottie JSON)
              </label>

              {/* Tabs Lottie */}
              <div className="flex bg-blue-100/50 p-1 rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setLottieTab("LINK")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${lottieTab === "LINK" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                >
                  <LinkIcon size={12} /> Link
                </button>
                <button
                  type="button"
                  onClick={() => setLottieTab("UPLOAD")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${lottieTab === "UPLOAD" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                >
                  <Upload size={12} /> Upload
                </button>
              </div>

              <div className="space-y-3">
                {lottieTab === "LINK" ? (
                  <input
                    className="w-full border p-2 rounded-lg text-sm font-mono text-gray-600 bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="https://assets.../pet.json"
                    value={formData.lottieUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, lottieUrl: e.target.value })
                    }
                  />
                ) : (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center relative hover:bg-blue-50 transition cursor-pointer group bg-white">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setLottieFile(file);
                        if (file)
                          setFormData({
                            ...formData,
                            lottieUrl: URL.createObjectURL(file),
                          });
                      }}
                    />
                    <div className="flex flex-col items-center justify-center text-blue-400 group-hover:text-blue-600">
                      <Upload size={24} className="mb-2" />
                      <p className="text-xs font-bold">
                        {lottieFile ? lottieFile.name : "Chọn file .JSON"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview Lottie */}
                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                  <div className="h-20 w-20 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    {formData.lottieUrl ? (
                      <LottiePet
                        src={formData.lottieUrl}
                        className="w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Preview</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 flex-1">
                    Preview chuyển động của Pet trên bản đồ.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONFIG SKIN */}
          {formData.type === "SKIN" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Vị trí mặc
              </label>
              <select
                className="w-full border p-2 rounded-lg text-sm"
                value={formData.config["slot"] || "HEAD"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, slot: e.target.value },
                  })
                }
              >
                <option value="HEAD">Mũ (Head)</option>
                <option value="FACE">Kính (Face)</option>
                <option value="BODY">Áo (Body)</option>
                <option value="FRAME">Khung Avatar</option>
              </select>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />{" "}
                {uploading ? "Đang upload..." : "Đang lưu..."}
              </>
            ) : (
              <>
                <Save size={16} /> Lưu vật phẩm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

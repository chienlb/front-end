"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { userService } from "@/services/user.service";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    fullName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
  };
  autoFetch?: boolean;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  autoFetch = true,
}: UpdateProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch profile từ API khi modal mở
  useEffect(() => {
    if (isOpen && autoFetch && !initialData) {
      const fetchProfile = async () => {
        try {
          setFetching(true);
          const res: any = await userService.getProfile();
          
          // Xử lý wrapper data
          const data = res?.data ?? res;
          
          // Lấy fullName từ nhiều field khác nhau
          let fullNameFromApi = 
            data?.fullName || 
            data?.fullname || 
            data?.name || 
            data?.displayName ||
            "";
          
          // Nếu vẫn không có, thử ghép firstName + lastName
          if (!fullNameFromApi && (data?.firstName || data?.lastName)) {
            fullNameFromApi = `${data?.firstName || ""} ${data?.lastName || ""}`.trim();
          }
          
          const avatarFromApi =
            data?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullNameFromApi)}`;

          setFullName(fullNameFromApi);
          setPhone(data?.phone || data?.phoneNumber || "");
          setAddress(data?.address || "");
          setBio(data?.bio || "");
          setAvatar(avatarFromApi);
        } catch (err) {
          console.error("Lỗi fetch profile:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchProfile();
    } else if (initialData) {
      setFullName(initialData.fullName || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setBio(initialData.bio || "");
      setAvatar(initialData.avatar || "");
    }
  }, [isOpen, initialData, autoFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    try {
      setLoading(true);
      const data: Record<string, any> = {
        fullName: fullName.trim(),
      };
      if (phone) data.phone = phone.trim();
      if (address) data.address = address.trim();
      if (bio) data.bio = bio.trim();
      if (avatar) data.avatar = avatar.trim();

      await userService.updateProfile(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Cập nhật thông tin thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            Cập nhật thông tin
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Loading State */}
        {fetching && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">
              Cập nhật thành công!
            </p>
            <p className="text-sm text-slate-500">
              Thông tin của bạn đã được lưu lại...
            </p>
          </div>
        )}

        {/* Form */}
        {!fetching && !success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle
                  size={20}
                  className="text-red-600 shrink-0 mt-0.5"
                />
                <div className="text-sm text-red-600 font-medium leading-relaxed">
                  {error}
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                placeholder="Nhập họ tên"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                placeholder="Nhập địa chỉ"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mô tả bản thân
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                placeholder="Nhập mô tả bản thân"
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                URL Avatar
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                disabled={loading}
                placeholder="Nhập URL ảnh đại diện"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-400"
              />
              {avatar && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={avatar}
                    alt="preview"
                    className="w-32 h-32 rounded-lg object-cover mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://ui-avatars.com/api/?name=Avatar";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

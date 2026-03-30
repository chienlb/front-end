"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Shield, Pencil, LogOut } from "lucide-react";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import ChangePasswordModal from "@/components/common/ChangePasswordModal";
import UpdateProfileModal from "@/components/common/UpdateProfileModal";
import { useRouter } from "next/navigation";

interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  bio: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openUpdateProfileModal, setOpenUpdateProfileModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res: any = await userService.getProfile();
        const fullName = res?.fullName || res?.fullname || res?.name || "Quản trị viên";
        const avatar =
          res?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;

        setProfile({
          id: String(res?._id || res?.id || ""),
          fullName,
          email: String(res?.email || ""),
          phone: String(res?.phone || ""),
          avatar,
          address: String(res?.address || ""),
          bio: String(res?.bio || ""),
        });
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      try {
        await authService.logout();
        router.push("/login");
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-red-500 font-medium">Không thể tải hồ sơ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Header Hero */}
      <div className="relative h-48 bg-gradient-to-r from-slate-900 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"
        }}></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-blue-100 shadow-md"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                {profile.fullName}
              </h1>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={20} className="text-blue-600 shrink-0" />
                  <span className="break-all">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={20} className="text-green-600 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={20} className="text-red-600 shrink-0" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.bio && (
                  <div className="text-slate-600 italic pt-2">{profile.bio}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setOpenUpdateProfileModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md active:scale-95"
                >
                  <Pencil size={18} />
                  Cập nhật thông tin
                </button>
                <button
                  onClick={() => setOpenChangePasswordModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition shadow-md active:scale-95"
                >
                  <Shield size={18} />
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md active:scale-95"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <ChangePasswordModal
        isOpen={openChangePasswordModal}
        onClose={() => setOpenChangePasswordModal(false)}
        onSuccess={() => {
          // Success notification
        }}
      />
      <UpdateProfileModal
        isOpen={openUpdateProfileModal}
        onClose={() => setOpenUpdateProfileModal(false)}
        initialData={{
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          avatar: profile.avatar,
        }}
        onSuccess={() => {
          // Refresh profile
          window.location.reload();
        }}
      />
    </div>
  );
}

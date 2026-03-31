"use client";

import { useEffect, useState } from "react";
import {
  User,
  Shield,
  Camera,
  AlertCircle,
  Save,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ChevronRight,
  PenLine,
} from "lucide-react";
import { userService } from "@/services/user.service";
import ChangePasswordModal from "@/components/common/ChangePasswordModal";
import UpdateProfileModal from "@/components/common/UpdateProfileModal";

// --- TYPES ---
interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  joinDate: string;
  certificates: { name: string; url: string; status: "VERIFIED" | "PENDING" }[];
  contract: {
    code: string;
    type: "FULL_TIME" | "PART_TIME";
    startDate: string;
    endDate: string;
    baseRate: number;
    status: "ACTIVE" | "EXPIRED";
  };
  banking: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const DEFAULT_PROFILE: TeacherProfile = {
  id: "T001",
  fullName: "Giáo viên",
  email: "",
  phone: "",
  avatar: "https://ui-avatars.com/api/?name=Teacher",
  address: "",
  joinDate: "",
  certificates: [
    { name: "IELTS 8.5 Certificate", url: "#", status: "VERIFIED" },
    { name: "TESOL Certification", url: "#", status: "VERIFIED" },
    { name: "Bằng Thạc sĩ (Đang chờ duyệt)", url: "#", status: "PENDING" },
  ],
  contract: {
    code: "HD-2023-001",
    type: "FULL_TIME",
    startDate: "01/01/2023",
    endDate: "01/01/2025",
    baseRate: 15000000,
    status: "ACTIVE",
  },
  banking: {
    bankName: "Techcombank",
    accountNumber: "190333444555",
    accountName: "NGUYEN THI MINH ANH",
  },
};

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "GENERAL" | "SECURITY"
  >("GENERAL");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>(DEFAULT_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openUpdateProfileModal, setOpenUpdateProfileModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const res: any = await userService.getProfile();
        const fullName =
          res?.fullName || res?.fullname || res?.name || "Giáo viên";
        const avatar =
          res?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;
        const joinDateSource = res?.createdAt || res?.joinDate || "";

        setProfile((prev) => ({
          ...prev,
          id: String(res?._id || res?.id || prev.id),
          fullName: String(fullName),
          email: String(res?.email || ""),
          phone: String(res?.phone || res?.phoneNumber || ""),
          avatar: String(avatar),
          address: String(res?.address || ""),
          joinDate: joinDateSource
            ? new Date(joinDateSource).toLocaleDateString("vi-VN")
            : prev.joinDate,
          certificates: Array.isArray(res?.certificates)
            ? res.certificates
            : prev.certificates,
          contract: res?.contract || prev.contract,
          banking: res?.banking || prev.banking,
        }));
      } catch {
        // Keep fallback data if API fails
      } finally {
        setIsLoadingProfile(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userService.updateMyProfile(profile.id, {
        fullname: profile.fullName,
        phone: profile.phone,
        avatar: profile.avatar,
      });
      setIsEditing(false);
      alert("Đã cập nhật hồ sơ thành công!");
    } catch (error: any) {
      alert(error?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* 1. HEADER HERO (Improved) */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-36 h-36 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white p-1">
              <img
                src={profile.avatar}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 border-2 border-white">
              <Camera size={18} />
            </button>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 pb-2 flex flex-col md:flex-row justify-between items-end md:items-end gap-4 w-full">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                {profile.fullName}
              </h1>
              {isLoadingProfile && (
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Đang tải dữ liệu tài khoản...
                </p>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-200/50 shadow-sm">
                  <Briefcase size={16} className="text-blue-500" /> Giáo viên
                  Tiếng Anh
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-red-500" />{" "}
                  {profile.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-green-500" /> Tham gia:{" "}
                  {profile.joinDate}
                </span>
              </div>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving || isLoadingProfile}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95
                ${
                  isEditing
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
            >
              {isSaving ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              ) : (
                <>
                  <PenLine size={18} /> Chỉnh sửa hồ sơ
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR (Navigation) */}
          <div className="xl:col-span-3 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm sticky top-24">
              <MenuButton
                active={activeTab === "GENERAL"}
                onClick={() => setActiveTab("GENERAL")}
                icon={User}
                label="Thông tin chung"
              />
              <MenuButton
                active={activeTab === "SECURITY"}
                onClick={() => setActiveTab("SECURITY")}
                icon={Shield}
                label="Bảo mật tài khoản"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="xl:col-span-9 space-y-6">
            {/* TAB: GENERAL INFO */}
            {activeTab === "GENERAL" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <User size={20} className="text-blue-500" /> Thông tin cá
                      nhân
                    </h3>
                    {isEditing && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        Đang chỉnh sửa...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputGroup
                      label="Họ và tên"
                      value={profile.fullName}
                      disabled={!isEditing}
                      onChange={(v: string) =>
                        setProfile((prev) => ({ ...prev, fullName: v }))
                      }
                    />
                    <InputGroup
                      label="Số điện thoại"
                      value={profile.phone}
                      disabled={!isEditing}
                      icon={Phone}
                      onChange={(v: string) =>
                        setProfile((prev) => ({ ...prev, phone: v }))
                      }
                    />
                    <InputGroup
                      label="Email đăng nhập"
                      value={profile.email}
                      disabled={true}
                      icon={Mail}
                      helpText="Liên hệ Admin để thay đổi email."
                    />
                    <InputGroup
                      label="Địa chỉ thường trú"
                      value={profile.address}
                      disabled={!isEditing}
                      icon={MapPin}
                      onChange={(v: string) =>
                        setProfile((prev) => ({ ...prev, address: v }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "SECURITY" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Shield size={20} className="text-slate-800" /> Bảo mật tài khoản
                </h3>
                <div className="space-y-5">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2">Thay đổi mật khẩu</h4>
                    <p className="text-sm text-slate-600 mb-4">Cập nhật mật khẩu của bạn thường xuyên để bảo đảm tài khoản an toàn.</p>
                    <button
                      onClick={() => setOpenChangePasswordModal(true)}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md active:scale-95"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2">Cập nhật thông tin cá nhân</h4>
                    <p className="text-sm text-slate-600 mb-4">Cập nhật họ tên, số điện thoại, địa chỉ và thông tin khác.</p>
                    <button
                      onClick={() => setOpenUpdateProfileModal(true)}
                      className="bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition shadow-md active:scale-95"
                    >
                      Cập nhật thông tin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <ChangePasswordModal
        isOpen={openChangePasswordModal}
        onClose={() => setOpenChangePasswordModal(false)}
        onSuccess={() => {
          // Refresh profile or show success message
        }}
      />
      <UpdateProfileModal
        isOpen={openUpdateProfileModal}
        onClose={() => setOpenUpdateProfileModal(false)}
        initialData={{
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          avatar: profile.avatar,
        }}
        onSuccess={() => {
          // Refresh profile
        }}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

// --- SUB-COMPONENTS ---

function MenuButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group
        ${
          active
            ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 border border-transparent font-medium"
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={
            active
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }
        />
        {label}
      </div>
      {active && <ChevronRight size={16} className="text-blue-500" />}
    </button>
  );
}

function InputGroup({
  label,
  value,
  disabled,
  type = "text",
  placeholder,
  helpText,
  icon: Icon,
  className,
  onChange,
}: any) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full border rounded-xl p-3 pl-4 text-sm font-medium outline-none transition-all shadow-sm
            ${
              disabled
                ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800"
            }`}
        />
        {Icon && (
          <Icon
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        )}
      </div>
      {helpText && (
        <p className="text-[11px] text-slate-400 mt-1.5 ml-1 flex items-center gap-1">
          <AlertCircle size={10} /> {helpText}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Lock,
  Smartphone,
  Mail,
  Save,
  Eye,
  EyeOff,
  Shield,
  LogOut,
  Globe,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ParentSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "PROFILE" | "NOTIFICATIONS" | "SECURITY"
  >("PROFILE");
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock Data
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Văn Ba",
    email: "nguyenvanba@gmail.com",
    phone: "0909123456",
    avatar:
      "https://ui-avatars.com/api/?name=Nguyen+Van+Ba&background=0D8ABC&color=fff&bold=true",
  });

  const [notifications, setNotifications] = useState({
    email_learning: true,
    email_payment: true,
    push_message: true,
    push_system: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
      alert("Đã lưu cài đặt thành công!");
    }, 800);
  };

  const toggleNoti = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* 1. HEADER (Sticky) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center transition-all">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Cài đặt tài khoản
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Quản lý thông tin cá nhân và bảo mật.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-sm
            ${
              isDirty
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span className="hidden sm:inline">
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </span>
        </button>
      </div>

      <div className="mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 2. SIDEBAR MENU */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-28">
              <MenuButton
                active={activeTab === "PROFILE"}
                onClick={() => setActiveTab("PROFILE")}
                icon={User}
                label="Thông tin cá nhân"
                desc="Avatar, tên, liên hệ"
              />
              <MenuButton
                active={activeTab === "NOTIFICATIONS"}
                onClick={() => setActiveTab("NOTIFICATIONS")}
                icon={Bell}
                label="Thông báo"
                desc="Email & Push notification"
              />
              <MenuButton
                active={activeTab === "SECURITY"}
                onClick={() => setActiveTab("SECURITY")}
                icon={Shield}
                label="Bảo mật"
                desc="Mật khẩu & 2FA"
              />

              <div className="h-px bg-slate-100 my-2 mx-2"></div>

              <button className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-500 hover:bg-red-50 font-bold transition-all text-sm group">
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                  <LogOut size={18} />
                </div>
                Đăng xuất
              </button>
            </div>
          </div>

          {/* 3. MAIN CONTENT AREA */}
          <div className="lg:col-span-9">
            {/* --- TAB: PROFILE --- */}
            {activeTab === "PROFILE" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="px-8 pb-8">
                  {/* Avatar Upload */}
                  <div className="relative -mt-12 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                    <div className="relative group">
                      <img
                        src={profile.avatar}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md object-cover bg-white"
                      />
                      <button className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-black transition-colors shadow-sm border-2 border-white">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="mb-2">
                      <h2 className="text-xl font-black text-slate-800">
                        {profile.fullName}
                      </h2>
                      <p className="text-slate-500 font-medium text-sm flex items-center justify-center sm:justify-start gap-1">
                        <User size={14} /> Phụ huynh
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Họ và tên"
                      value={profile.fullName}
                      onChange={(v: string) => {
                        setProfile({ ...profile, fullName: v });
                        setIsDirty(true);
                      }}
                    />
                    <InputGroup
                      label="Số điện thoại"
                      value={profile.phone}
                      icon={Smartphone}
                      onChange={(v: string) => {
                        setProfile({ ...profile, phone: v });
                        setIsDirty(true);
                      }}
                    />
                    <InputGroup
                      label="Email (Tên đăng nhập)"
                      value={profile.email}
                      icon={Mail}
                      disabled
                      helpText="Liên hệ Admin để thay đổi email đăng nhập."
                    />

                    <div className="md:col-span-2 pt-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Globe size={14} /> Ngôn ngữ hiển thị
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <LanguageOption
                          label="Tiếng Việt"
                          active={true}
                          flag="🇻🇳"
                        />
                        <LanguageOption
                          label="English"
                          active={false}
                          flag="🇺🇸"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeTab === "NOTIFICATIONS" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Mail className="text-indigo-500" size={20} /> Email Thông
                      báo
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Nhận email về các hoạt động quan trọng.
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <SwitchItem
                      label="Báo cáo học tập tuần"
                      desc="Tổng kết điểm số và nhận xét từ giáo viên mỗi cuối tuần."
                      checked={notifications.email_learning}
                      onChange={() => toggleNoti("email_learning")}
                    />
                    <div className="h-px bg-slate-100"></div>
                    <SwitchItem
                      label="Nhắc nhở đóng học phí"
                      desc="Thông báo trước 3 ngày khi gói học sắp hết hạn."
                      checked={notifications.email_payment}
                      onChange={() => toggleNoti("email_payment")}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Smartphone className="text-pink-500" size={20} /> Push
                      Notifications
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Thông báo tức thì trên ứng dụng điện thoại.
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <SwitchItem
                      label="Tin nhắn từ giáo viên"
                      desc="Nhận thông báo ngay khi giáo viên gửi phản hồi."
                      checked={notifications.push_message}
                      onChange={() => toggleNoti("push_message")}
                    />
                    <div className="h-px bg-slate-100"></div>
                    <SwitchItem
                      label="Tin tức & Ưu đãi"
                      desc="Cập nhật các chương trình khuyến mãi và tính năng mới."
                      checked={notifications.push_system}
                      onChange={() => toggleNoti("push_system")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: SECURITY --- */}
            {activeTab === "SECURITY" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-10">
                  <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
                    <Shield className="text-green-600" size={24} /> Đổi mật khẩu
                  </h3>

                  <div className="space-y-5">
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-500 outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Xác nhận
                        </label>
                        <input
                          type="password"
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-500 outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold w-full transition shadow-lg shadow-slate-200">
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-dashed border-slate-200">
                    <div className="flex gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                      <div className="p-2 bg-white rounded-full h-fit text-orange-500 shadow-sm shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-900 text-sm">
                          Bảo mật 2 lớp (2FA)
                        </h4>
                        <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                          Tăng cường bảo mật cho tài khoản thanh toán. Chúng tôi
                          sẽ gửi mã OTP qua SMS mỗi khi đăng nhập thiết bị lạ.
                        </p>
                        <button className="mt-3 text-xs font-bold bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition shadow-sm">
                          Kích hoạt ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuButton({ active, onClick, icon: Icon, label, desc }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-200 group
        ${active ? "bg-indigo-50 border-indigo-100" : "hover:bg-slate-50 border-transparent"}
      `}
    >
      <div
        className={`p-2 rounded-lg transition-colors ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm"}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p
          className={`text-sm font-bold ${active ? "text-indigo-900" : "text-slate-700"}`}
        >
          {label}
        </p>
        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
          {desc}
        </p>
      </div>
      {active && (
        <div className="ml-auto text-indigo-600">
          <CheckCircle2 size={16} />
        </div>
      )}
    </button>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  disabled,
  icon: Icon,
  helpText,
}: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          className={`w-full border rounded-xl p-3 text-sm font-medium outline-none transition-all shadow-sm
            ${
              disabled
                ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800"
            }
          `}
        />
        {Icon && (
          <Icon
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
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

function SwitchItem({ label, desc, checked, onChange }: any) {
  return (
    <div
      className="flex items-start justify-between group cursor-pointer"
      onClick={onChange}
    >
      <div className="pr-4">
        <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
          {label}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out mt-1 shrink-0 ${checked ? "bg-indigo-600" : "bg-slate-200 group-hover:bg-slate-300"}`}
      >
        <div
          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
        ></div>
      </div>
    </div>
  );
}

function LanguageOption({ label, active, flag }: any) {
  return (
    <button
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
      ${active ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}
    `}
    >
      <span className="text-xl shadow-sm rounded-full bg-white w-8 h-8 flex items-center justify-center border border-slate-100">
        {flag}
      </span>
      <span
        className={`text-sm font-bold ${active ? "text-indigo-700" : "text-slate-700"}`}
      >
        {label}
      </span>
      {active && <CheckCircle2 size={16} className="ml-auto text-indigo-600" />}
    </button>
  );
}

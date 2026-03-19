"use client";

import { useState } from "react";
import {
  User,
  FileText,
  CreditCard,
  Shield,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Award,
  ChevronRight,
  PenLine,
} from "lucide-react";

// --- TYPES ---
interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
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

// --- MOCK DATA ---
const MOCK_PROFILE: TeacherProfile = {
  id: "T001",
  fullName: "Cô Minh Anh",
  email: "minhanh@smartteach.com",
  phone: "0912.345.678",
  avatar: "https://i.pravatar.cc/150?img=9",
  bio: "Thạc sĩ Ngôn ngữ Anh với 5 năm kinh nghiệm luyện thi IELTS. Phương pháp dạy: Student-centered, tập trung vào tư duy phản biện.",
  address: "Quận 1, TP. Hồ Chí Minh",
  joinDate: "15/01/2023",
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
    "GENERAL" | "CONTRACT" | "SECURITY"
  >("GENERAL");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert("Đã cập nhật hồ sơ thành công!");
    }, 800);
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
              disabled={isSaving}
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
                active={activeTab === "CONTRACT"}
                onClick={() => setActiveTab("CONTRACT")}
                icon={FileText}
                label="Hợp đồng & Lương"
              />
              <MenuButton
                active={activeTab === "SECURITY"}
                onClick={() => setActiveTab("SECURITY")}
                icon={Shield}
                label="Bảo mật tài khoản"
              />
            </div>

            {/* Quick Stats (Optional) */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award size={20} />
                </div>
                <span className="font-bold text-sm opacity-90">
                  Hiệu suất tháng này
                </span>
              </div>
              <div className="text-3xl font-black mb-1">98%</div>
              <div className="text-xs text-blue-200">
                Đánh giá tích cực từ học sinh
              </div>
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
                    />
                    <InputGroup
                      label="Số điện thoại"
                      value={profile.phone}
                      disabled={!isEditing}
                      icon={Phone}
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
                    />

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                        Giới thiệu bản thân (Bio)
                      </label>
                      <textarea
                        className={`w-full border rounded-xl p-4 text-sm font-medium outline-none transition-all resize-none shadow-sm
                          ${
                            !isEditing
                              ? "bg-slate-50 border-slate-200 text-slate-500"
                              : "bg-white border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800"
                          }`}
                        rows={4}
                        disabled={!isEditing}
                        defaultValue={profile.bio}
                      />
                    </div>
                  </div>
                </div>

                {/* Certificates Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Award size={20} className="text-orange-500" /> Chứng chỉ
                      & Bằng cấp
                    </h3>
                    <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                      <Upload size={14} /> Upload mới
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.certificates.map((cert, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-red-500 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-sm text-slate-800 truncate pr-2">
                              {cert.name}
                            </p>
                            {cert.status === "VERIFIED" ? (
                              <CheckCircle2
                                size={16}
                                className="text-green-500 shrink-0"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="text-orange-500 shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            PDF • Đã tải lên 12/01/2023
                          </p>
                          <a
                            href="#"
                            className="text-[10px] font-bold text-blue-600 hover:underline mt-2 inline-block"
                          >
                            Xem tài liệu
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTRACT */}
            {activeTab === "CONTRACT" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Contract Digital Card */}
                <div className="relative bg-slate-900 text-white p-8 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

                  <div className="relative z-10 flex justify-between items-start mb-8">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                        Hợp đồng lao động
                      </p>
                      <p className="text-2xl font-mono font-black tracking-tight">
                        {profile.contract.code}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase border
                      ${profile.contract.status === "ACTIVE" ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400"}`}
                    >
                      {profile.contract.status}
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                        Loại hình
                      </p>
                      <p className="font-bold text-sm">
                        {profile.contract.type === "FULL_TIME"
                          ? "Toàn thời gian"
                          : "Part-time"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                        Ngày bắt đầu
                      </p>
                      <p className="font-bold text-sm">
                        {profile.contract.startDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                        Ngày kết thúc
                      </p>
                      <p className="font-bold text-sm">
                        {profile.contract.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                        Lương cơ bản
                      </p>
                      <p className="font-bold text-lg text-emerald-400">
                        {profile.contract.baseRate.toLocaleString()} ₫
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banking Info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-purple-500" /> Tài
                    khoản nhận lương
                  </h3>

                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 mb-6">
                    <AlertCircle
                      size={20}
                      className="text-yellow-600 shrink-0 mt-0.5"
                    />
                    <div className="text-sm text-yellow-800">
                      <span className="font-bold">Lưu ý quan trọng:</span> Thông
                      tin tài khoản ngân hàng cần trùng khớp với tên trên Hợp
                      đồng. Mọi thay đổi sẽ cần 2-3 ngày làm việc để bộ phận Kế
                      toán xác thực.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Ngân hàng thụ hưởng"
                      value={profile.banking.bankName}
                      disabled={!isEditing}
                    />
                    <InputGroup
                      label="Số tài khoản"
                      value={profile.banking.accountNumber}
                      disabled={!isEditing}
                    />
                    <div className="md:col-span-2">
                      <InputGroup
                        label="Tên chủ tài khoản (Viết hoa không dấu)"
                        value={profile.banking.accountName}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "SECURITY" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Shield size={20} className="text-slate-800" /> Đổi mật khẩu
                </h3>
                <div className="space-y-5">
                  <InputGroup
                    label="Mật khẩu hiện tại"
                    type="password"
                    placeholder="••••••••"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Mật khẩu mới"
                      type="password"
                      placeholder="••••••••"
                    />
                    <InputGroup
                      label="Xác nhận mật khẩu"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-2">
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                      Cập nhật mật khẩu
                    </button>
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
}: any) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          defaultValue={value}
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

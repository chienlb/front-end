"use client";

import { useState } from "react";
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Save,
  MessageSquare,
  Clock,
  Mail,
  Check,
  Zap,
  Laptop,
  Monitor,
} from "lucide-react";

export default function AdminSettingsPage() {
  // --- STATE ---
  const [settings, setSettings] = useState({
    // Notifications
    emailNotif_submission: true,
    emailNotif_message: false,
    emailNotif_system: true,
    pushNotif_message: true,
    pushNotif_reminder: true,

    // Preferences
    language: "vi",
    theme: "light",

    // Automation
    autoReply: false,
    autoReplyMessage:
      "Xin chào, hiện tôi đang bận. Tôi sẽ phản hồi lại tin nhắn của bạn sau 17:00 nhé!",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- HANDLERS ---
  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as boolean] }));
    setIsDirty(true);
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
      alert("Đã lưu cài đặt hệ thống thành công!");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-32 font-sans text-slate-800">
      {/* 1. HEADER (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center transition-all shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Cấu hình hệ thống
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Quản lý thông báo & tự động hóa.
          </p>
        </div>

        <div className="flex gap-3">
          {isDirty && (
            <button
              onClick={() => {
                setIsDirty(false);
                window.location.reload();
              }}
              className="hidden md:block px-4 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg transform active:scale-95
              ${
                isDirty
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }
            `}
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === LEFT COLUMN: PREFERENCES (4 cols) === */}
          <div className="lg:col-span-4 space-y-6">
            {/* Theme & Language Card */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <h3 className="font-bold text-slate-700">
                  Giao diện & Ngôn ngữ
                </h3>
              </div>

              <div className="p-5 space-y-6">
                {/* Language */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                    Ngôn ngữ hiển thị
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <LanguageOption
                      label="Tiếng Việt"
                      flag="🇻🇳"
                      active={settings.language === "vi"}
                      onClick={() => handleChange("language", "vi")}
                    />
                    <LanguageOption
                      label="English"
                      flag="🇺🇸"
                      active={settings.language === "en"}
                      onClick={() => handleChange("language", "en")}
                    />
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                    Chế độ hiển thị
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeOption
                      label="Sáng"
                      icon={Sun}
                      active={settings.theme === "light"}
                      onClick={() => handleChange("theme", "light")}
                    />
                    <ThemeOption
                      label="Tối"
                      icon={Moon}
                      active={settings.theme === "dark"}
                      onClick={() => handleChange("theme", "dark")}
                    />
                    <ThemeOption
                      label="Hệ thống"
                      icon={Monitor}
                      active={settings.theme === "system"}
                      onClick={() => handleChange("theme", "system")}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Tips / Support (Optional Filler) */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-2 mb-2 font-bold text-indigo-100">
                <Zap size={18} fill="currentColor" /> Mẹo Admin
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Bật tính năng "Tự động trả lời" vào cuối tuần để phụ huynh biết
                bạn đang nghỉ ngơi nhé!
              </p>
            </div>
          </div>

          {/* === RIGHT COLUMN: NOTIFICATIONS & AUTOMATION (8 cols) === */}
          <div className="lg:col-span-8 space-y-6">
            {/* Notification Settings */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Bell size={18} className="text-orange-500" />
                <h3 className="font-bold text-slate-700">
                  Cấu hình nhận thông báo
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                    <Mail size={16} className="text-slate-400" /> Qua Email
                  </h4>
                  <div className="space-y-4">
                    <SwitchItem
                      label="Nộp bài tập mới"
                      desc="Khi học sinh hoàn thành bài."
                      checked={settings.emailNotif_submission}
                      onChange={() => toggle("emailNotif_submission")}
                    />
                    <SwitchItem
                      label="Tin nhắn phụ huynh"
                      desc="Khi có tin nhắn chưa đọc > 30p."
                      checked={settings.emailNotif_message}
                      onChange={() => toggle("emailNotif_message")}
                    />
                    <SwitchItem
                      label="Cập nhật hệ thống"
                      desc="Tin tức bảo trì, tính năng mới."
                      checked={settings.emailNotif_system}
                      onChange={() => toggle("emailNotif_system")}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                    <Smartphone size={16} className="text-slate-400" /> Trên Ứng
                    dụng
                  </h4>
                  <div className="space-y-4">
                    <SwitchItem
                      label="Tin nhắn trực tiếp"
                      desc="Hiển thị popup khi có tin nhắn."
                      checked={settings.pushNotif_message}
                      onChange={() => toggle("pushNotif_message")}
                    />
                    <SwitchItem
                      label="Nhắc nhở lịch dạy"
                      desc="Thông báo trước 15 phút."
                      checked={settings.pushNotif_reminder}
                      onChange={() => toggle("pushNotif_reminder")}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Auto Reply Automation */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-green-500" />
                  <h3 className="font-bold text-slate-700">
                    Tự động trả lời tin nhắn
                  </h3>
                </div>
                <Switch
                  checked={settings.autoReply}
                  onChange={() => toggle("autoReply")}
                />
              </div>

              <div
                className={`transition-all duration-300 ease-in-out ${settings.autoReply ? "opacity-100" : "opacity-50 grayscale pointer-events-none"}`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Input Area */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Nội dung tin nhắn mẫu
                    </label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-slate-700"
                      rows={5}
                      value={settings.autoReplyMessage}
                      onChange={(e) =>
                        handleChange("autoReplyMessage", e.target.value)
                      }
                      placeholder="Nhập nội dung..."
                    />
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Clock size={12} />
                      <span>Kích hoạt sau 5 phút không hoạt động</span>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">
                      Xem trước (Phía Phụ huynh)
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                          Cô ơi, bé Bin hôm nay quên sách ạ?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white text-slate-600 text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm border border-slate-100">
                          {settings.autoReplyMessage || "..."}
                          <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                            <Laptop size={10} /> Tự động gửi
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none 
        ${checked ? "bg-indigo-600" : "bg-slate-200 hover:bg-slate-300"}
      `}
    >
      <span
        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

function SwitchItem({ label, desc, checked, onChange }: any) {
  return (
    <div
      className="flex items-start justify-between group cursor-pointer"
      onClick={onChange}
    >
      <div className="pr-4">
        <h4
          className={`text-sm font-bold transition-colors ${checked ? "text-slate-800" : "text-slate-500"}`}
        >
          {label}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-1">
        <Switch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

function LanguageOption({ label, flag, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
        ${
          active
            ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm"
            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <span className="text-xl">{flag}</span>
      <span
        className={`text-sm font-bold ${active ? "text-blue-700" : "text-slate-600"}`}
      >
        {label}
      </span>
      {active && <Check size={16} className="ml-auto text-blue-600" />}
    </button>
  );
}

function ThemeOption({ label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
        ${
          active
            ? "bg-slate-800 border-slate-800 text-white shadow-md transform scale-105"
            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <Icon
        size={20}
        className={active ? "text-yellow-400" : "text-slate-400"}
      />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

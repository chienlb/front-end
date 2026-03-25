"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Palette,
  UserCircle2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";

type SettingsTab = "APPEARANCE" | "ACCOUNT" | "SECURITY";

type ThemeOption = {
  id: string;
  label: string;
  value: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { id: "slate", label: "Slate", value: "#f8fafc" },
  { id: "blue", label: "Blue", value: "#eff6ff" },
  { id: "violet", label: "Violet", value: "#f5f3ff" },
  { id: "rose", label: "Rose", value: "#fff1f2" },
  { id: "amber", label: "Amber", value: "#fffbeb" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("APPEARANCE");

  const [bgTheme, setBgTheme] = useState<string>(THEME_OPTIONS[0].value);
  const [savingTheme, setSavingTheme] = useState(false);

  const [userId, setUserId] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawTheme = localStorage.getItem("admin_settings_bg_theme");
      if (rawTheme) setBgTheme(rawTheme);
      const rawUser = localStorage.getItem("currentUser");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const uid = String(u?._id || u?.id || "");
        setUserId(uid);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await userService.getProfile();
        const data = res?.data ?? res;
        setProfileForm({
          fullName: String(data?.fullName || data?.name || ""),
          email: String(data?.email || ""),
          phone: String(data?.phone || ""),
          avatar: String(data?.avatar || ""),
        });
        const uid = String(data?._id || data?.id || userId || "");
        if (uid) setUserId(uid);
      } catch {
        // keep current values
      }
    };
    fetchProfile();
  }, []);

  const activeTheme = useMemo(
    () => THEME_OPTIONS.find((x) => x.value === bgTheme) || THEME_OPTIONS[0],
    [bgTheme],
  );

  const handleSaveTheme = () => {
    setSavingTheme(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_settings_bg_theme", bgTheme);
    }
    setTimeout(() => {
      setSavingTheme(false);
      alert("Đã lưu giao diện nền.");
    }, 400);
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      setProfileMessage("Không xác định được user hiện tại. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setSavingProfile(true);
      setProfileMessage("");
      await userService.updateMyProfile(userId, {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
      });
      setProfileMessage("Đã cập nhật thông tin tài khoản.");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setProfileMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật tài khoản.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordMessage("Vui lòng nhập mật khẩu cũ và mật khẩu mới.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Mật khẩu mới phải từ 6 ký tự.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setChangingPassword(true);
      setPasswordMessage("");
      await authService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage("Đổi mật khẩu thành công.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setPasswordMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Không đổi được mật khẩu.");
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    {
      id: "APPEARANCE",
      label: "Giao diện",
      icon: <Palette size={18} />,
      desc: "Đổi nền trang admin",
    },
    {
      id: "ACCOUNT",
      label: "Tài khoản",
      icon: <UserCircle2 size={18} />,
      desc: "Thông tin cá nhân",
    },
    {
      id: "SECURITY",
      label: "Đổi mật khẩu",
      icon: <Lock size={18} />,
      desc: "Bảo mật tài khoản",
    },
  ] as const;

  return (
    <div
      className="h-[calc(100vh-100px)] flex flex-col space-y-6"
      style={{ backgroundColor: bgTheme }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCircle2 className="text-gray-600" /> Cài đặt tài khoản
          </h1>
          <p className="text-gray-500 text-sm">
            Tùy chỉnh nền giao diện, thông tin cá nhân và bảo mật.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
          Nền hiện tại: <span className="font-bold text-slate-700">{activeTheme.label}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* --- LEFT MENU --- */}
        <div className="w-64 flex flex-col gap-2 border-r pr-6 border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`text-left p-3 rounded-xl flex items-start gap-3 transition-all
                ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
            >
              <div
                className={`mt-0.5 ${
                  activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {tab.icon}
              </div>
              <div>
                <div className="font-bold text-sm">{tab.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {tab.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* --- RIGHT CONTENT FORM --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          {activeTab === "APPEARANCE" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Đổi nền giao diện admin
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBgTheme(theme.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      bgTheme === theme.value
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="h-14 rounded-lg border border-slate-200"
                      style={{ backgroundColor: theme.value }}
                    />
                    <div className="mt-2 text-sm font-bold text-slate-700">{theme.label}</div>
                  </button>
                ))}
              </div>
              <div
                className="rounded-2xl border border-slate-200 p-4"
                style={{ backgroundColor: bgTheme }}
              >
                <div className="text-sm font-semibold text-slate-700">Xem trước nền</div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-lg bg-white border border-slate-200" />
                  <div className="h-16 rounded-lg bg-white border border-slate-200" />
                  <div className="h-16 rounded-lg bg-white border border-slate-200" />
                </div>
              </div>
              <button
                onClick={handleSaveTheme}
                disabled={savingTheme}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
              >
                <Save size={18} /> {savingTheme ? "Đang lưu..." : "Lưu nền"}
              </button>
            </div>
          )}

          {activeTab === "ACCOUNT" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Cài đặt tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, fullName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Avatar URL</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={profileForm.avatar}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, avatar: e.target.value }))
                    }
                  />
                </div>
              </div>
              {!!profileForm.avatar && (
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200">
                  <img src={profileForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}
              {profileMessage && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  {profileMessage}
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
              >
                <Save size={18} /> {savingProfile ? "Đang lưu..." : "Lưu tài khoản"}
              </button>
            </div>
          )}

          {activeTab === "SECURITY" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Đổi mật khẩu
              </h3>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800 flex gap-2">
                <AlertTriangle size={20} className="flex-shrink-0" />
                <div>
                  Mật khẩu mới nên có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số để an toàn hơn.
                </div>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-xs font-bold text-gray-500 mb-1">Mật khẩu cũ</span>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      className="w-full border p-2 rounded-lg text-sm pr-10"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-gray-500 mb-1">Mật khẩu mới</span>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      className="w-full border p-2 rounded-lg text-sm pr-10"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-gray-500 mb-1">Xác nhận mật khẩu mới</span>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="w-full border p-2 rounded-lg text-sm pr-10"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                {passwordMessage && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    {passwordMessage}
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
                >
                  <Lock size={16} /> {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          )}

          {/* fallback hidden old tabs */}
          {false && (
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer"></div>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

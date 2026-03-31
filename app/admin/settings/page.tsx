"use client";

import { useEffect, useState } from "react";
import {
  UserCircle2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { adminService, type SystemFeature } from "@/services/admin.service";

type SettingsTab = "ACCOUNT" | "SECURITY" | "SYSTEM";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("ACCOUNT");

  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    return () => {
      if (profileForm.avatar.startsWith("blob:")) {
        URL.revokeObjectURL(profileForm.avatar);
      }
    };
  }, [profileForm.avatar]);

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

  const [systemFeatures, setSystemFeatures] = useState<SystemFeature[]>([]);
  const [loadingSystemFeatures, setLoadingSystemFeatures] = useState(false);
  const [togglingFeatureId, setTogglingFeatureId] = useState("");
  const [systemMessage, setSystemMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawUser = localStorage.getItem("currentUser");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const uid = String(u?._id || u?.id || "");
        const fullName = String(u?.fullName || u?.fullname || u?.name || "");
        setUserId(uid);
        if (fullName) setDisplayName(fullName);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await authService.getProfile();
        const data = res?.data ?? res;
        const fullName = String(data?.fullName || data?.fullname || data?.name || "");
        setProfileForm({
          fullName,
          email: String(data?.email || ""),
          phone: String(data?.phone || ""),
          avatar: String(data?.avatar || ""),
        });
        if (fullName) setDisplayName(fullName);
        const uid = String(data?._id || data?.id || "");
        if (uid) setUserId(uid);
      } catch {
        // keep current values
      }
    };

    void fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSystemFeatures = async () => {
      try {
        setLoadingSystemFeatures(true);
        const res: any = await adminService.getSystemFeatures();
        const payload = res?.data ?? res;
        const list: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : [];

        const mapped: SystemFeature[] = list.map((item) => ({
          _id: String(item?._id || item?.id || ""),
          id: String(item?.id || item?._id || ""),
          key: String(item?.key || item?.code || item?.name || ""),
          name: String(item?.name || item?.title || item?.key || "Tính năng"),
          description: String(item?.description || item?.desc || ""),
          isEnabled: Boolean(item?.isEnabled),
          flagName: String(item?.flagName || ""),
        }));

        setSystemFeatures(mapped);
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message;
        setSystemMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Không tải được danh sách tính năng.");
      } finally {
        setLoadingSystemFeatures(false);
      }
    };

    void fetchSystemFeatures();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setProfileMessage("");
      const payload: Record<string, unknown> = {
        fullname: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      };
      if (avatarFile) {
        payload.avatar = avatarFile;
      } else if (profileForm.avatar && !profileForm.avatar.startsWith("blob:")) {
        payload.avatar = profileForm.avatar.trim();
      }

      if (!userId) throw new Error("Không tìm thấy userId");
      await userService.updateMyProfile(userId, payload);
      setDisplayName(profileForm.fullName.trim());
      setProfileMessage("Đã cập nhật thông tin tài khoản.");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setProfileMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật tài khoản.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileMessage("Vui lòng chọn file ảnh hợp lệ.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setProfileForm((p) => ({ ...p, avatar: previewUrl }));
    setProfileMessage("");
    e.target.value = "";
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

  const handleToggleSystemFeature = async (feature: SystemFeature) => {
    const featureId = String(feature._id || feature.id || "");
    if (!featureId) return;

    try {
      setSystemMessage("");
      setTogglingFeatureId(featureId);
      const nextEnabled = !Boolean(feature.isEnabled);
      const res: any = await adminService.toggleSystemFeature(featureId, nextEnabled);
      const payload = res?.data ?? res;
      const updatedEnabled = Boolean(payload?.isEnabled ?? nextEnabled);

      setSystemFeatures((prev) =>
        prev.map((f) => {
          const id = String(f._id || f.id || "");
          return id === featureId ? { ...f, isEnabled: updatedEnabled } : f;
        }),
      );
      setSystemMessage("Đã cập nhật trạng thái tính năng hệ thống.");
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setSystemMessage(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật tính năng.");
    } finally {
      setTogglingFeatureId("");
    }
  };

  const tabs = [
    {
      id: "ACCOUNT",
      label: "Tài khoản",
      icon: <UserCircle2 size={18} />,
      desc: "Thông tin tài khoản",
    },
    {
      id: "SECURITY",
      label: "Đổi mật khẩu",
      icon: <Lock size={18} />,
      desc: "Bảo mật tài khoản",
    },
    {
      id: "SYSTEM",
      label: "Hệ thống",
      icon: <SlidersHorizontal size={18} />,
      desc: "Bật/tắt tính năng",
    },
  ] as const;

  return (
    <div className="relative h-[calc(100vh-100px)] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-1">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="relative h-full flex flex-col space-y-6 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
              <UserCircle2 className="text-sky-700" /> Cài đặt tài khoản
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Quản lý thông tin tài khoản và bảo mật đăng nhập.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 font-semibold">
            Tên: <span className="text-slate-800 font-black">{displayName || "Đang cập nhật"}</span>
            <span className="mx-2 text-slate-300">|</span>
            ID tài khoản: <span className="text-slate-800 font-black">{userId || "Đang cập nhật"}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 bg-white/90 p-4 md:p-6 rounded-3xl shadow-xl border border-white/80 overflow-hidden">
          <div className="md:w-72 shrink-0 md:border-r md:pr-6 border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`text-left p-3 rounded-2xl flex items-start gap-3 transition-all border ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center ${
                      activeTab === tab.id
                        ? "text-blue-700 bg-blue-100"
                        : "text-slate-400 bg-slate-100"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">{tab.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-3">
            {activeTab === "ACCOUNT" && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4">
                    Cài đặt tài khoản
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Họ và tên</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        placeholder="Nhập họ và tên"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Email</label>
                      <input
                        type="email"
                        className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        placeholder="Nhập email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Số điện thoại</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        placeholder="Nhập số điện thoại"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Avatar</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        onChange={handleAvatarFile}
                      />
                      {avatarFile ? (
                        <p className="text-[11px] text-blue-600 font-semibold mt-1.5">
                          Đã chọn ảnh: {avatarFile.name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {!!profileForm.avatar && (
                    <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-sky-200 ring-2 ring-sky-50">
                        <img src={profileForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold">Ảnh đại diện xem trước</div>
                        <div className="text-sm font-semibold text-slate-700">Tài khoản hiện tại</div>
                      </div>
                    </div>
                  )}

                  {profileMessage && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      {profileMessage}
                    </div>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl font-extrabold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
                  >
                    <Save size={18} /> {savingProfile ? "Đang lưu..." : "Lưu tài khoản"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "SECURITY" && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4">
                    Đổi mật khẩu
                  </h3>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 flex gap-2">
                    <AlertTriangle size={20} className="flex-shrink-0" />
                    <div>
                      Mật khẩu mới nên có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số để an toàn hơn.
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-500 mb-1.5">Mật khẩu cũ</span>
                      <div className="relative">
                        <input
                          type={showOld ? "text" : "password"}
                          className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
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
                      <span className="block text-xs font-bold text-slate-500 mb-1.5">Mật khẩu mới</span>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
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
                      <span className="block text-xs font-bold text-slate-500 mb-1.5">Xác nhận mật khẩu mới</span>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          className="w-full border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
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
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        {passwordMessage}
                      </div>
                    )}

                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl font-extrabold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
                    >
                      <Lock size={16} /> {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "SYSTEM" && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-4">
                    Bật/tắt chức năng hệ thống
                  </h3>

                  <div className="space-y-3">
                    {loadingSystemFeatures && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        Đang tải danh sách tính năng...
                      </div>
                    )}

                    {!loadingSystemFeatures && systemFeatures.length === 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        Chưa có dữ liệu tính năng từ hệ thống.
                      </div>
                    )}

                    {systemFeatures.map((item) => {
                      const enabled = Boolean(item.isEnabled);
                      const featureId = String(item._id || item.id || "");
                      const toggling = togglingFeatureId === featureId;
                      return (
                        <div
                          key={featureId || String(item.key || item.name)}
                          className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-extrabold text-slate-800">
                              {item.name || item.key || "Tính năng"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.description || "Không có mô tả"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Flag: {item.flagName || "Không có flagName"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleSystemFeature(item)}
                            disabled={toggling}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                              enabled ? "bg-emerald-500" : "bg-slate-300"
                            } ${toggling ? "opacity-60" : ""}`}
                            aria-pressed={enabled}
                            title={enabled ? "Đang bật" : "Đang tắt"}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                enabled ? "translate-x-8" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {systemMessage && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      {systemMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

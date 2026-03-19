"use client";

import { useState } from "react";
import {
  Globe,
  Smartphone,
  ShieldAlert,
  Share2,
  Database,
  Save,
  UploadCloud,
  Monitor,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [isSaving, setIsSaving] = useState(false);

  // Mock State
  const [formData, setFormData] = useState({
    appName: "SmartKids - Tiếng Anh cho bé",
    supportEmail: "support@smartkids.vn",
    supportPhone: "1900 1000",
    appLogo: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",

    maintenanceMode: false,
    maintenanceMessage:
      "Hệ thống đang bảo trì để nâng cấp tính năng mới. Bé quay lại sau nhé!",

    minIosVersion: "1.2.0",
    minAndroidVersion: "1.3.5",
    iosStoreLink: "https://apps.apple.com/...",
    androidStoreLink: "https://play.google.com/...",

    facebookUrl: "https://facebook.com/smartkids",
    youtubeUrl: "https://youtube.com/smartkids",
    gaMeasurementId: "G-XXXXXXXX",
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu cấu hình thành công! 💾");
    }, 1000);
  };

  const tabs = [
    {
      id: "GENERAL",
      label: "Thông tin chung",
      icon: <Globe size={18} />,
      desc: "Tên App, Logo, Liên hệ",
    },
    {
      id: "MOBILE",
      label: "Mobile App",
      icon: <Smartphone size={18} />,
      desc: "Phiên bản, Store Links",
    },
    {
      id: "SOCIAL",
      label: "Mạng xã hội & SEO",
      icon: <Share2 size={18} />,
      desc: "Facebook, Google Analytics",
    },
    {
      id: "SYSTEM",
      label: "Hệ thống & Bảo trì",
      icon: <ShieldAlert size={18} />,
      desc: "Bảo trì, Cache, Logs",
    },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Monitor className="text-gray-600" /> Cài đặt hệ thống
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý các thông số kỹ thuật và vận hành toàn bộ ứng dụng.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition disabled:opacity-70"
        >
          {isSaving ? (
            "Đang lưu..."
          ) : (
            <>
              <Save size={18} /> Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* --- LEFT MENU --- */}
        <div className="w-64 flex flex-col gap-2 border-r pr-6 border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
          {/* TAB 1: GENERAL */}
          {activeTab === "GENERAL" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Thông tin Ứng dụng
              </h3>

              <div className="flex items-start gap-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition relative overflow-hidden group">
                  <img
                    src={formData.appLogo}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold">
                    Đổi Logo
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Tên Ứng dụng (App Name)
                    </label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded-lg text-sm font-medium"
                      value={formData.appName}
                      onChange={(e) =>
                        setFormData({ ...formData, appName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Mô tả ngắn (Slogan)
                    </label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded-lg text-sm"
                      defaultValue="Học tiếng Anh vui nhộn cùng Mr. Lion"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Email hỗ trợ
                  </label>
                  <input
                    type="email"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={formData.supportEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, supportEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Hotline
                  </label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded-lg text-sm"
                    value={formData.supportPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, supportPhone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE APP */}
          {activeTab === "MOBILE" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Phiên bản & Store
              </h3>

              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800 flex gap-2">
                <AlertTriangle size={20} className="flex-shrink-0" />
                <p>
                  <strong>Lưu ý:</strong> Thay đổi "Phiên bản tối thiểu" sẽ bắt
                  buộc người dùng cập nhật ứng dụng. Nếu họ đang dùng bản thấp
                  hơn, họ sẽ không thể đăng nhập.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    🍎 iOS (Apple Store)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Min Version
                      </label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded-lg text-sm"
                        value={formData.minIosVersion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minIosVersion: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Store Link
                      </label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded-lg text-sm"
                        value={formData.iosStoreLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            iosStoreLink: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    🤖 Android (Google Play)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Min Version
                      </label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded-lg text-sm"
                        value={formData.minAndroidVersion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minAndroidVersion: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Store Link
                      </label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded-lg text-sm"
                        value={formData.androidStoreLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            androidStoreLink: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM */}
          {activeTab === "SYSTEM" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Bảo trì & Vận hành
              </h3>

              <div
                className={`p-4 rounded-xl border-2 transition-all flex justify-between items-center
                ${
                  formData.maintenanceMode
                    ? "border-red-500 bg-red-50"
                    : "border-green-500 bg-green-50"
                }`}
              >
                <div>
                  <h4
                    className={`font-bold ${
                      formData.maintenanceMode
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Chế độ Bảo trì (Maintenance Mode)
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Khi bật, chỉ Admin mới có thể truy cập hệ thống.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.maintenanceMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceMode: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {formData.maintenanceMode && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Thông báo hiển thị cho User
                  </label>
                  <textarea
                    className="w-full border p-3 rounded-lg text-sm text-red-600 font-medium bg-red-50/50"
                    rows={3}
                    value={formData.maintenanceMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceMessage: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="mt-8 pt-8 border-t">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Database size={16} /> Cache & Data
                </h4>
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 font-bold hover:bg-gray-100">
                    Xóa Cache Hệ thống
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 font-bold hover:bg-gray-100">
                    Reload AI Models
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL */}
          {activeTab === "SOCIAL" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                Kết nối & Theo dõi
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Facebook Fanpage
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded-lg text-sm"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Youtube Channel
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded-lg text-sm"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded-lg text-sm font-mono"
                  value={formData.gaMeasurementId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gaMeasurementId: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

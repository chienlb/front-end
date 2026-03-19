"use client";

import { useState } from "react";
import {
  X,
  Smartphone,
  Send,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

export default function PushComposerModal({ isOpen, onClose }: any) {
  const [step, setStep] = useState(1); // 1: Compose, 2: Schedule
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image: "",
    link: "",
    segment: "ALL_USERS",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* --- LEFT: FORM INPUT --- */}
        <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-slate-800">
              Soạn tin nhắn mới
            </h2>
          </div>

          <div className="space-y-5 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Tiêu đề (Nên &lt; 40 ký tự)
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg text-sm font-bold"
                placeholder="VD: 🎁 Quà tặng bí mật..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={50}
              />
              <div className="text-right text-[10px] text-gray-400">
                {formData.title.length}/50
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Nội dung (Ngắn gọn, hấp dẫn)
              </label>
              <textarea
                className="w-full border p-2 rounded-lg text-sm"
                rows={3}
                placeholder="VD: Mr. Lion đang đợi bạn đó..."
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                maxLength={150}
              />
              <div className="text-right text-[10px] text-gray-400">
                {formData.body.length}/150
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Gửi tới ai?
              </label>
              <select
                className="w-full border p-2 rounded-lg text-sm bg-white"
                value={formData.segment}
                onChange={(e) =>
                  setFormData({ ...formData, segment: e.target.value })
                }
              >
                <option value="ALL_USERS">Tất cả người dùng (12.5k)</option>
                <option value="FREE_USERS">Tài khoản miễn phí (10k)</option>
                <option value="PAID_USERS">Tài khoản trả phí (2.5k)</option>
                <option value="INACTIVE_3_DAYS">
                  Vắng mặt trên 3 ngày (500)
                </option>
              </select>
            </div>

            {/* Advanced: Image & Link */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
                Nâng cao
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Link ảnh (Rich Push)..."
                    className="flex-1 border p-1.5 rounded text-sm bg-white"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-gray-400" />
                  <select
                    className="flex-1 border p-1.5 rounded text-sm bg-white"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  >
                    <option value="">Mở App (Mặc định)</option>
                    <option value="/shop">Mở Cửa hàng</option>
                    <option value="/courses">Mở Danh sách bài học</option>
                    <option value="/vouchers">Mở Ví Voucher</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 flex items-center justify-center gap-2">
              <Clock size={16} /> Hẹn giờ gửi
            </button>
            <button className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <Send size={16} /> Gửi ngay
            </button>
          </div>
        </div>

        {/* --- RIGHT: PHONE PREVIEW --- */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Mockup Phone */}
          <div className="w-[300px] h-[600px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Lock Screen Wallpaper */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-800 opacity-80"></div>

            {/* Status Bar */}
            <div className="relative z-10 px-6 pt-3 flex justify-between text-white text-[10px] font-bold opacity-80">
              <span>9:41</span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Date */}
            <div className="relative z-10 text-center mt-8 text-white">
              <div className="text-5xl font-thin">09:41</div>
              <div className="text-sm mt-1 opacity-80">Monday, January 11</div>
            </div>

            {/* NOTIFICATION CARD */}
            <div className="relative z-10 mt-6 mx-3">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px]">
                      🦁
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      SMARTKIDS
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">now</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-black leading-tight mb-0.5">
                    {formData.title || "Tiêu đề tin nhắn..."}
                  </h4>
                  <p className="text-xs text-gray-700 leading-normal line-clamp-2">
                    {formData.body || "Nội dung tin nhắn sẽ hiện ở đây..."}
                  </p>
                </div>

                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden h-32 bg-gray-200">
                    <img
                      src={formData.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center pb-2">
              <div className="w-32 h-1 bg-white rounded-full opacity-50"></div>
            </div>
          </div>

          <div className="absolute bottom-4 text-xs text-gray-400 font-bold">
            PREVIEW: iOS Lock Screen
          </div>
        </div>
      </div>
    </div>
  );
}

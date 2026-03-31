"use client";

import { useState } from "react";
import {
  Send,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

type ComposePayload = {
  title: string;
  body: string;
  image?: string;
  link?: string;
  segment: "ALL_USERS" | "TEACHERS";
  type:
    | "system"
    | "message"
    | "reminder"
    | "alert"
    | "assignment"
    | "competition";
};

interface PushComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (payload: ComposePayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function PushComposerModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PushComposerModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image: "",
    link: "",
    segment: "ALL_USERS" as "ALL_USERS" | "TEACHERS",
    type: "system" as
      | "system"
      | "message"
      | "reminder"
      | "alert"
      | "assignment"
      | "competition",
  });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const title = formData.title.trim();
    const body = formData.body.trim();

    if (!title || !body) {
      setError("Vui lòng nhập tiêu đề và nội dung thông báo.");
      return;
    }

    setError("");
    await onSubmit?.({
      title,
      body,
      image: formData.image.trim() || undefined,
      link: formData.link || undefined,
      segment: formData.segment,
      type: formData.type,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        <div className="p-6 overflow-y-auto flex flex-col max-h-[85vh]">
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
                  setFormData({
                    ...formData,
                    segment: e.target.value as "ALL_USERS" | "TEACHERS",
                  })
                }
              >
                <option value="ALL_USERS">Tất cả người dùng</option>
                <option value="TEACHERS">Chỉ giáo viên</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Loại thông báo
              </label>
              <select
                className="w-full border p-2 rounded-lg text-sm bg-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | "system"
                      | "message"
                      | "reminder"
                      | "alert"
                      | "assignment"
                      | "competition",
                  })
                }
              >
                <option value="system">system</option>
                <option value="message">message</option>
                <option value="reminder">reminder</option>
                <option value="alert">alert</option>
                <option value="assignment">assignment</option>
                <option value="competition">competition</option>
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

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              disabled
              className="flex-1 py-2 bg-slate-300 text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Clock size={16} /> Hẹn giờ gửi
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60"
            >
              <Send size={16} /> {isSubmitting ? "Đang gửi..." : "Gửi ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

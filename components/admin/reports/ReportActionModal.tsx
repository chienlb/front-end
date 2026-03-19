"use client";

import { useState } from "react";
import { X, Trash2, Ban, MessageSquareOff, AlertTriangle } from "lucide-react";

export default function ReportActionModal({ isOpen, onClose, report }: any) {
  const [action, setAction] = useState("DELETE_CONTENT"); // DELETE_CONTENT, WARN_USER, BAN_USER
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Call API xử lý
    alert(`Đã thực hiện: ${action} cho báo cáo ${report.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-red-50">
          <h2 className="font-bold text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} /> Xử lý vi phạm
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-red-400 hover:text-red-700" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Review Evidence */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
              Bằng chứng vi phạm
            </label>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-slate-700 italic">
              "{report.snapshot.content}"
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Tác giả:{" "}
              <span className="font-bold text-slate-700">
                {report.snapshot.author}
              </span>
            </div>
          </div>

          {/* Select Action */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-3">
              Chọn hành động xử lý
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setAction("DELETE_CONTENT")}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 text-left transition
                 ${
                   action === "DELETE_CONTENT"
                     ? "border-orange-500 bg-orange-50"
                     : "border-gray-200 hover:border-orange-200"
                 }`}
              >
                <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    Xóa nội dung
                  </div>
                  <div className="text-xs text-gray-500">
                    Chỉ xóa comment/bài viết, không phạt user.
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("WARN_USER")}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 text-left transition
                 ${
                   action === "WARN_USER"
                     ? "border-blue-500 bg-blue-50"
                     : "border-gray-200 hover:border-blue-200"
                 }`}
              >
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <MessageSquareOff size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    Gửi Cảnh cáo
                  </div>
                  <div className="text-xs text-gray-500">
                    Gửi thông báo nhắc nhở user.
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("BAN_USER")}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 text-left transition
                 ${
                   action === "BAN_USER"
                     ? "border-red-500 bg-red-50"
                     : "border-gray-200 hover:border-red-200"
                 }`}
              >
                <div className="bg-red-100 text-red-600 p-2 rounded-full">
                  <Ban size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    Khóa tài khoản (BAN)
                  </div>
                  <div className="text-xs text-gray-500">
                    Cấm user đăng nhập (3 ngày / Vĩnh viễn).
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Note */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              Ghi chú nội bộ
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border p-2 rounded-lg text-sm"
              placeholder="VD: Vi phạm lần đầu, chỉ xóa bài..."
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 text-white font-bold rounded-lg shadow-lg transition
            ${
              action === "BAN_USER"
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : action === "WARN_USER"
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
            }`}
          >
            Xác nhận Xử lý
          </button>
        </div>
      </div>
    </div>
  );
}

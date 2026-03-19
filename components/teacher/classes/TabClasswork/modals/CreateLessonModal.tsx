"use client";
import { useState } from "react";
import {
  Video,
  PlayCircle,
  CheckSquare,
  Calendar,
  Clock,
  Link as LinkIcon,
} from "lucide-react";

export default function CreateLessonModal({ isOpen, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: "",
    type: "LIVE" as "LIVE" | "VIDEO" | "EXAM",
    date: "",
    time: "",
    duration: "90", // Mặc định 90 phút
    meetingLink: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Gộp date và time thành ISO string
    let startTime = new Date().toISOString();
    if (formData.date && formData.time) {
      startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    }

    onSubmit({
      title: formData.title,
      type: formData.type,
      startTime: startTime,
      duration: `${formData.duration} phút`,
      meetingLink: formData.meetingLink,
    });

    // Reset form (tuỳ chọn)
    setFormData({ ...formData, title: "", meetingLink: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="font-bold text-lg mb-4 text-slate-800">
          Thêm Bài Học Mới
        </h3>

        <div className="space-y-4">
          {/* 1. Tên bài học */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Tên bài học
            </label>
            <input
              className="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
              placeholder="VD: Unit 1 - Lesson 2: Grammar..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 2. Loại bài học */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Loại bài học
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "LIVE", icon: Video, label: "Live Class" },
                { id: "VIDEO", icon: PlayCircle, label: "Video" },
                { id: "EXAM", icon: CheckSquare, label: "Kiểm tra" },
              ].map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl transition ${formData.type === t.id ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-100" : "hover:bg-slate-50"}`}
                >
                  <t.icon size={20} className="mb-1" />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Setup Thời gian (Chỉ hiện khi không phải là Video tự do) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Ngày bắt đầu
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  className="w-full border p-2 pl-9 rounded-xl text-sm outline-none focus:border-blue-500"
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Giờ bắt đầu
              </label>
              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="time"
                  className="w-full border p-2 pl-9 rounded-xl text-sm outline-none focus:border-blue-500"
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 4. Thời lượng & Link (Dành cho Live) */}
          {formData.type === "LIVE" && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-xl text-sm outline-none focus:border-blue-500"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Link phòng học (Zoom/Meet)
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="w-full border p-2 pl-9 rounded-xl text-sm outline-none focus:border-blue-500"
                    placeholder="https://..."
                    value={formData.meetingLink}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingLink: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            Tạo Bài Học
          </button>
        </div>
      </div>
    </div>
  );
}

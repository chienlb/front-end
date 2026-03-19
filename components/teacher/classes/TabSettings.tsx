"use client";
import { useState, useRef } from "react";
import {
  Save,
  Shield,
  Hash,
  Bell,
  Copy,
  RefreshCw,
  Trash2,
  Archive,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
} from "lucide-react";

export default function TabSettings() {
  const [generalInfo, setGeneralInfo] = useState({
    className: "Tiếng Anh Giao Tiếp K12",
    description: "Khóa học tập trung vào kỹ năng nghe nói phản xạ...",
    room: "Online - Zoom",
    subject: "Ngoại ngữ",
    coverImage:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1000", // Ảnh mặc định
  });

  const [inviteCode, setInviteCode] = useState("ENG-2024-K12");
  const [permissions, setPermissions] = useState({
    studentCanPost: true,
    studentCanComment: true,
    showDeletedPost: false,
  });

  const [grading, setGrading] = useState([
    { category: "Bài tập về nhà", weight: 30 },
    { category: "Chuyên cần", weight: 10 },
    { category: "Kiểm tra giữa kỳ", weight: 20 },
    { category: "Thi cuối kỳ", weight: 40 },
  ]);

  // Ref cho input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  // Xử lý upload ảnh bìa
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralInfo((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    // Reset về ảnh mặc định hoặc null
    setGeneralInfo((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert("Đã sao chép mã lớp!");
  };

  const handleRegenerateCode = () => {
    if (confirm("Mã cũ sẽ không còn hiệu lực. Bạn chắc chắn muốn đổi?")) {
      setInviteCode(`NEW-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleWeightChange = (index: number, val: number) => {
    const newGrading = [...grading];
    newGrading[index].weight = val;
    setGrading(newGrading);
  };

  const totalWeight = grading.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 space-y-8">
      {/* 1. THÔNG TIN CHUNG & ẢNH BÌA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ImageIcon size={20} className="text-blue-600" /> Thông tin lớp học
        </h3>

        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Ảnh bìa khóa học
          </label>

          <div className="relative group w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50">
            {generalInfo.coverImage ? (
              <>
                <img
                  src={generalInfo.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/20 backdrop-blur text-white font-bold text-sm rounded-xl hover:bg-white/40 transition flex items-center gap-2"
                  >
                    <Upload size={16} /> Thay đổi
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500/80 backdrop-blur text-white font-bold text-sm rounded-xl hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Xóa ảnh
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition text-slate-400"
              >
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <span className="text-sm font-bold">Nhấn để tải ảnh lên</span>
                <span className="text-xs mt-1">PNG, JPG tối đa 5MB</span>
              </div>
            )}

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* --- FORM THÔNG TIN --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Tên lớp học
              </label>
              <input
                className="w-full border p-3 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                value={generalInfo.className}
                onChange={(e) =>
                  setGeneralInfo({ ...generalInfo, className: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Mô tả
              </label>
              <textarea
                className="w-full border p-3 rounded-xl text-sm text-slate-700 focus:border-blue-500 outline-none resize-none"
                rows={3}
                value={generalInfo.description}
                onChange={(e) =>
                  setGeneralInfo({
                    ...generalInfo,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Chủ đề / Môn học
              </label>
              <input
                className="w-full border p-3 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                value={generalInfo.subject}
                onChange={(e) =>
                  setGeneralInfo({ ...generalInfo, subject: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Phòng học
              </label>
              <input
                className="w-full border p-3 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                value={generalInfo.room}
                onChange={(e) =>
                  setGeneralInfo({ ...generalInfo, room: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MÃ MỜI & LINK (Giữ nguyên) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Hash size={20} className="text-purple-600" /> Mã mời tham gia
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Mã lớp hiện tại</p>
            <div className="text-2xl font-black text-slate-800 tracking-widest">
              {inviteCode}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 flex items-center gap-2 transition"
            >
              <Copy size={16} /> Sao chép
            </button>
            <button
              onClick={handleRegenerateCode}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-red-600 hover:border-red-200 flex items-center gap-2 transition"
            >
              <RefreshCw size={16} /> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* 3. CẤU HÌNH ĐIỂM SỐ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-orange-600" /> Cấu trúc điểm số
          </h3>
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${totalWeight === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            Tổng: {totalWeight}%
          </span>
        </div>

        <div className="space-y-3">
          {grading.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <input
                className="flex-1 border p-2 rounded-lg text-sm font-medium bg-slate-50"
                value={item.category}
                readOnly
              />
              <div className="w-32 relative">
                <input
                  type="number"
                  className="w-full border p-2 pr-8 rounded-lg text-sm font-bold text-right outline-none focus:border-blue-500"
                  value={item.weight}
                  onChange={(e) =>
                    handleWeightChange(idx, Number(e.target.value))
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
        {totalWeight !== 100 && (
          <p className="text-xs text-red-500 mt-2 italic">
            * Tổng trọng số phải bằng 100%.
          </p>
        )}
      </div>

      {/* 4. QUYỀN HẠN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-green-600" /> Quyền hạn trên Bảng tin
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <div>
              <p className="font-bold text-slate-700 text-sm">
                Học viên có thể đăng bài
              </p>
              <p className="text-xs text-slate-400">
                Cho phép học viên tạo bài viết mới trên bảng tin
              </p>
            </div>
            <button
              onClick={() =>
                setPermissions({
                  ...permissions,
                  studentCanPost: !permissions.studentCanPost,
                })
              }
            >
              {permissions.studentCanPost ? (
                <ToggleRight size={40} className="text-blue-600" />
              ) : (
                <ToggleLeft size={40} className="text-slate-300" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-700 text-sm">
                Học viên có thể bình luận
              </p>
              <p className="text-xs text-slate-400">
                Cho phép học viên bình luận vào bài viết của giáo viên
              </p>
            </div>
            <button
              onClick={() =>
                setPermissions({
                  ...permissions,
                  studentCanComment: !permissions.studentCanComment,
                })
              }
            >
              {permissions.studentCanComment ? (
                <ToggleRight size={40} className="text-blue-600" />
              ) : (
                <ToggleLeft size={40} className="text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. VÙNG NGUY HIỂM */}
      <div className="border border-red-200 bg-red-50 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-red-700 mb-4">Vùng nguy hiểm</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-600 hover:text-white flex items-center gap-2 transition">
            <Archive size={18} /> Lưu trữ lớp học
          </button>
          <button className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 flex items-center gap-2 transition shadow-lg shadow-red-200">
            <Trash2 size={18} /> Xóa vĩnh viễn
          </button>
        </div>
      </div>

      {/* FAB SAVE BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-blue-700 flex items-center gap-2 transition transform hover:scale-105">
          <Save size={20} /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import {
  UserPlus,
  MoreVertical,
  Edit3,
  Trash2,
  CreditCard,
  ShieldCheck,
  Mail,
  Calendar,
  CheckCircle,
  Copy,
  Search,
} from "lucide-react";

// --- TYPES ---
interface ChildProfile {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  dob: string;
  school?: string;
  packageType: "FREE" | "BASIC" | "PREMIUM";
  packageExpiry?: string;
  linkedDate: string;
}

// --- MOCK DATA ---
const MY_CHILDREN: ChildProfile[] = [
  {
    id: "C01",
    fullName: "Nguyễn Văn An",
    username: "an.nguyen2015",
    avatar: "https://i.pravatar.cc/150?img=12",
    dob: "15/05/2015",
    school: "Tiểu học Lê Văn Tám",
    packageType: "PREMIUM",
    packageExpiry: "20/12/2026",
    linkedDate: "01/01/2023",
  },
  {
    id: "C02",
    fullName: "Trần Bảo Ngọc",
    username: "ngoc.tran2018",
    avatar: "https://i.pravatar.cc/150?img=5",
    dob: "20/10/2018",
    school: "Mầm non Sao Mai",
    packageType: "FREE",
    linkedDate: "15/06/2023",
  },
];

export default function ParentChildrenPage() {
  const [children, setChildren] = useState(MY_CHILDREN);
  const [isAdding, setIsAdding] = useState(false);
  const [linkCode, setLinkCode] = useState("");

  const handleLinkChild = () => {
    // Call API to link child
    alert(`Đã gửi yêu cầu liên kết tới mã: ${linkCode}`);
    setIsAdding(false);
    setLinkCode("");
  };

  const getPackageBadge = (type: string) => {
    switch (type) {
      case "PREMIUM":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-black px-2 py-1 rounded border border-yellow-200 uppercase flex items-center gap-1">
            <ShieldCheck size={12} /> Premium
          </span>
        );
      case "BASIC":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-2 py-1 rounded border border-blue-200 uppercase">
            Basic
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 text-xs font-black px-2 py-1 rounded border border-slate-200 uppercase">
            Free
          </span>
        );
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Hồ sơ các con</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý tài khoản học sinh đã liên kết với bạn.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1"
        >
          <UserPlus size={20} /> Liên kết tài khoản con
        </button>
      </div>

      {/* CHILDREN LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group"
          >
            {/* Card Header */}
            <div className="p-6 flex items-start gap-5 relative">
              <div className="relative">
                <img
                  src={child.avatar}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                  {getPackageBadge(child.packageType)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 truncate">
                      {child.fullName}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      @{child.username}
                    </p>
                  </div>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />{" "}
                    {child.dob}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Đã liên
                    kết: {child.linkedDate}
                  </div>
                  {child.school && (
                    <div className="col-span-2 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-slate-400" />{" "}
                      {child.school}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="bg-slate-50/50 border-t border-slate-100 p-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition">
                <Edit3 size={16} /> Chỉnh sửa
              </button>
              {child.packageType === "PREMIUM" ? (
                <div className="flex items-center justify-center gap-2 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-green-700">
                  <CheckCircle size={16} /> Đang hiệu lực
                </div>
              ) : (
                <button className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition">
                  <CreditCard size={16} /> Nâng cấp gói
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty State / Add New Placeholder */}
        <div
          onClick={() => setIsAdding(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition cursor-pointer min-h-[200px]"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition">
            <UserPlus size={32} />
          </div>
          <p className="font-bold">Thêm tài khoản con khác</p>
          <p className="text-xs mt-1">Liên kết tối đa 5 tài khoản</p>
        </div>
      </div>

      {/* MODAL LINK ACCOUNT */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Liên kết tài khoản con
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Nhập mã học sinh hoặc email đã đăng ký của con để kết nối.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Mã học sinh / Email
                </label>
                <div className="relative">
                  <input
                    className="w-full border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:border-blue-500 outline-none font-medium"
                    placeholder="VD: HS123456 hoặc email@example.com"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    autoFocus
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                <div className="bg-white p-1 rounded border border-blue-100 shrink-0">
                  <Copy size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-800">Mẹo tìm mã:</p>
                  <p className="text-[10px] text-blue-600 leading-tight mt-0.5">
                    Mã học sinh nằm trong phần Hồ sơ (Profile) trên ứng dụng của
                    con.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleLinkChild}
                disabled={!linkCode}
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

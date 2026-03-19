"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  Video,
  MessageSquare,
  Clock,
  CalendarCheck,
  Send,
  X,
} from "lucide-react";

// --- TYPES ---
type RecruitmentStatus = "PENDING" | "INTERVIEW" | "HIRED" | "REJECTED";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  appliedDate: string;
  status: RecruitmentStatus;
  avatar: string;
  cvUrl: string;
  coverLetter: string;
  tags: string[];
  demoVideoUrl: string;
  notes: string;
}

// --- MOCK DATA ---
const CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: "Nguyễn Thị Thu Hà",
    email: "thuha.nguyen@gmail.com",
    phone: "0912.333.444",
    position: "Giáo viên Tiếng Anh (IELTS)",
    experience: "5 năm",
    appliedDate: "10:30, Hôm nay",
    status: "PENDING",
    avatar: "https://i.pravatar.cc/150?img=5",
    cvUrl: "#",
    coverLetter: "Tôi có kinh nghiệm dạy IELTS 5 năm, mong muốn hợp tác...",
    tags: ["IELTS 8.5", "TESOL", "ĐH Sư Phạm"],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Ví dụ link embed
    notes: "",
  },
  {
    id: 2,
    name: "Trần Văn Bình",
    email: "binhtran@gmail.com",
    phone: "0988.777.666",
    position: "Giáo viên Giao tiếp",
    experience: "2 năm",
    appliedDate: "Hôm qua",
    status: "INTERVIEW",
    avatar: "https://i.pravatar.cc/150?img=11",
    cvUrl: "#",
    coverLetter: "Tôi yêu thích phương pháp dạy phản xạ tự nhiên...",
    tags: ["TOEIC 900", "Nhiệt tình"],
    demoVideoUrl: "",
    notes: "Đã hẹn phỏng vấn lúc 14h chiều mai.",
  },
];

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<RecruitmentStatus>("PENDING");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal Phỏng vấn
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    link: "",
  });

  // --- LOGIC FILTER ---
  const filteredList = CANDIDATES.filter((c) => {
    const matchTab = c.status === activeTab;
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  // --- ACTIONS ---
  const handleStatusChange = (id: number, newStatus: RecruitmentStatus) => {
    // Call API update status here
    alert(`Đã cập nhật trạng thái: ${newStatus}`);

    // Giả lập update UI
    if (selectedCandidate) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }
  };

  const handleScheduleInterview = () => {
    // Call API gửi mail mời phỏng vấn
    console.log("Scheduling interview:", interviewData);
    handleStatusChange(selectedCandidate!.id, "INTERVIEW");
    setShowInterviewModal(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR: LIST */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header & Stats */}
        <div className="p-5 border-b border-slate-100">
          <h1 className="font-black text-xl text-slate-800 mb-1">Tuyển Dụng</h1>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
              <span className="block text-2xl font-black text-blue-600">
                12
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase">
                Hồ sơ mới
              </span>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
              <span className="block text-2xl font-black text-orange-600">
                5
              </span>
              <span className="text-[10px] text-orange-400 font-bold uppercase">
                Phỏng vấn
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-3 border-b border-slate-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition"
              placeholder="Tìm tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "PENDING", label: "Mới" },
              { id: "INTERVIEW", label: "Phỏng vấn" },
              { id: "HIRED", label: "Đã tuyển" },
              { id: "REJECTED", label: "Loại" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RecruitmentStatus)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredList.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCandidate(c)}
              className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition group ${
                selectedCandidate?.id === c.id
                  ? "bg-blue-50/60 border-l-4 border-l-blue-600"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={c.avatar}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  {c.demoVideoUrl && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Video size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4
                      className={`text-sm font-bold truncate ${selectedCandidate?.id === c.id ? "text-blue-800" : "text-slate-800"}`}
                    >
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {c.appliedDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{c.position}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RIGHT SIDEBAR: DETAILS */}
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
        {selectedCandidate ? (
          <>
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white z-10">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    selectedCandidate.status === "PENDING"
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : selectedCandidate.status === "INTERVIEW"
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : selectedCandidate.status === "HIRED"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {selectedCandidate.status}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedCandidate.status === "PENDING" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedCandidate.id, "REJECTED")
                      }
                      className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    >
                      Loại hồ sơ
                    </button>
                    <button
                      onClick={() => setShowInterviewModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
                    >
                      <CalendarCheck size={16} /> Mời phỏng vấn
                    </button>
                  </>
                )}
                {selectedCandidate.status === "INTERVIEW" && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedCandidate.id, "HIRED")
                    }
                    className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Duyệt & Gửi Offer
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile */}
                <div className="flex items-start gap-6">
                  <img
                    src={selectedCandidate.avatar}
                    className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-800">
                      {selectedCandidate.name}
                    </h2>
                    <p className="text-lg text-blue-600 font-bold mb-3">
                      {selectedCandidate.position}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Mail size={16} /> {selectedCandidate.email}
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Phone size={16} /> {selectedCandidate.phone}
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Briefcase size={16} /> {selectedCandidate.experience}{" "}
                        kinh nghiệm
                      </div>
                    </div>
                  </div>
                </div>

                {/* [NEW] VIDEO DEMO PLAYER */}
                {selectedCandidate.demoVideoUrl ? (
                  <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 flex items-center gap-2 text-white border-b border-white/10">
                      <Video size={20} className="text-red-500" />
                      <span className="font-bold text-sm">
                        Video Dạy Thử (Demo)
                      </span>
                    </div>
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                      {/* Trong thực tế dùng <iframe src={...} /> */}
                      <div className="text-center">
                        <Video
                          size={48}
                          className="text-slate-700 mx-auto mb-2"
                        />
                        <p className="text-slate-500">
                          Video Player Placeholder
                        </p>
                        <a
                          href={selectedCandidate.demoVideoUrl}
                          target="_blank"
                          className="text-blue-400 text-sm hover:underline mt-2 block"
                        >
                          Mở link gốc
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-xl border border-yellow-100 flex items-center gap-2">
                    <Clock size={16} /> Ứng viên này chưa nộp video demo.
                  </div>
                )}

                {/* Cover Letter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <User size={18} /> Giới thiệu bản thân
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                    {selectedCandidate.coverLetter}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare size={18} /> Ghi chú nội bộ
                  </h3>
                  <textarea
                    className="w-full p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-slate-700 outline-none focus:border-yellow-300 transition"
                    rows={3}
                    placeholder="Nhập đánh giá của admin về ứng viên này (Chỉ admin mới thấy)..."
                    defaultValue={selectedCandidate.notes}
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={18} /> Hồ sơ đính kèm
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer group">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-700 text-sm group-hover:text-blue-700">
                          CV_Full.pdf
                        </p>
                        <p className="text-xs text-slate-400">2.4 MB</p>
                      </div>
                      <button className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-blue-600">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <User size={48} className="opacity-50" />
            </div>
            <p className="font-bold text-lg text-slate-400">
              Chọn một hồ sơ để xem chi tiết
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL LÊN LỊCH PHỎNG VẤN --- */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">
                Mời phỏng vấn
              </h3>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Ngày phỏng vấn
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Giờ
                </label>
                <input
                  type="time"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Link Google Meet / Zoom
                </label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, link: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleScheduleInterview}
                className="flex-1 py-3 text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200"
              >
                Gửi lời mời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

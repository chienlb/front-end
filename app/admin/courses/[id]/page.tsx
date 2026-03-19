"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutList,
  Users,
  Settings,
  BarChart,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

// Import Components
import CourseSettingsTab from "@/components/admin/courses/CourseSettingsTab";
import CurriculumTab from "@/components/admin/courses/CurriculumTab";
import StudentsTab from "@/components/admin/courses/StudentsTab";
import AnalyticsTab from "@/components/admin/courses/AnalyticsTab";

// Types
type CourseStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState<
    "CURRICULUM" | "STUDENTS" | "SETTINGS" | "ANALYTICS"
  >("CURRICULUM");

  // State quản lý trạng thái khóa học (Giả lập ban đầu là PENDING - Chờ duyệt)
  const [status, setStatus] = useState<CourseStatus>("PENDING");

  // --- HANDLERS ---
  const handleApprove = () => {
    if (
      confirm(
        "Xác nhận duyệt khóa học này? Khóa học sẽ được công khai ngay lập tức.",
      )
    ) {
      setStatus("PUBLISHED");
    }
  };

  const handleReject = () => {
    const reason = prompt("Nhập lý do từ chối khóa học này:");
    if (reason) {
      setStatus("REJECTED");
      // Logic gửi API lý do từ chối...
    }
  };

  const handleRequestReview = () => {
    if (confirm("Gửi yêu cầu xét duyệt lại?")) {
      setStatus("PENDING");
    }
  };

  const handleUnpublish = () => {
    if (confirm("Gỡ khóa học này xuống? Học viên sẽ không thể mua mới.")) {
      setStatus("DRAFT");
    }
  };

  // --- RENDER HELPERS ---
  const renderStatusBadge = () => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-green-200">
            <CheckCircle2 size={12} /> ĐANG BÁN
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-200 animate-pulse">
            <Clock size={12} /> CHỜ DUYỆT
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-red-200">
            <XCircle size={12} /> BỊ TỪ CHỐI
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
            BẢN NHÁP
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 1. TOP HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/courses"
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {renderStatusBadge()}
              <p className="text-xs text-slate-400 font-mono">
                ID: {params.id}
              </p>
            </div>
            <h1 className="text-xl font-black text-slate-800">
              Tiếng Anh Giao Tiếp Cơ Bản
            </h1>
          </div>
        </div>

        {/* Action Buttons dựa trên Trạng thái */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition">
            <ExternalLink size={16} /> Xem trang học
          </button>

          {/* Logic hiển thị nút bấm */}
          {status === "PENDING" && (
            <>
              <button
                onClick={handleReject}
                className="px-5 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition shadow-sm"
              >
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                className="px-5 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition"
              >
                Duyệt khóa học
              </button>
            </>
          )}

          {status === "PUBLISHED" && (
            <button
              onClick={handleUnpublish}
              className="px-5 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-lg transition"
            >
              Gỡ xuống (Unpublish)
            </button>
          )}

          {(status === "DRAFT" || status === "REJECTED") && (
            <button
              onClick={handleRequestReview}
              className="px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2"
            >
              <RotateCcw size={16} /> Gửi duyệt lại
            </button>
          )}
        </div>
      </div>

      {/* 2. STATUS ALERT (Nếu bị từ chối) */}
      {status === "REJECTED" && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-800">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Khóa học bị từ chối</h4>
            <p className="text-sm mt-1">
              Lý do: Nội dung chương 2 chưa hoàn thiện, video bài 5 bị lỗi âm
              thanh. Vui lòng chỉnh sửa và gửi duyệt lại.
            </p>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="px-8 pt-6">
        <div className="flex border-b border-slate-200">
          {[
            { id: "CURRICULUM", label: "Chương trình học", icon: LayoutList },
            { id: "STUDENTS", label: "Học viên", icon: Users },
            { id: "ANALYTICS", label: "Báo cáo", icon: BarChart },
            { id: "SETTINGS", label: "Cấu hình & Giá", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. TAB CONTENT AREA */}
      <div className="p-8">
        {activeTab === "CURRICULUM" && <CurriculumTab />}
        {activeTab === "STUDENTS" && <StudentsTab />}
        {activeTab === "ANALYTICS" && <AnalyticsTab />}
        {activeTab === "SETTINGS" && <CourseSettingsTab />}
      </div>
    </div>
  );
}

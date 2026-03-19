"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Video,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import Component Form tách riêng
import HomeworkBuilder from "./HomeworkBuilder";

// --- MOCK DATA ---
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: "Bài tập về thì Hiện tại đơn",
    desc: "Hoàn thành 20 câu trắc nghiệm trong file đính kèm.",
    deadline: "2023-11-25T23:59",
    createdAt: "2023-11-20",
    submitted: 18,
    totalStudents: 20,
    status: "OPEN",
    type: "QUIZ",
    points: 10,
  },
  {
    id: 2,
    title: "Quay video giới thiệu bản thân",
    desc: "Quay video ngắn 2 phút nói về sở thích của em.",
    deadline: "2023-11-22T20:00",
    createdAt: "2023-11-18",
    submitted: 20,
    totalStudents: 20,
    status: "GRADED",
    type: "VIDEO",
    points: 100,
  },
];

export default function TabHomework() {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [showModal, setShowModal] = useState(false);

  // Xử lý khi tạo mới thành công
  const handleCreateNew = (data: HomeworkData) => {
    const newItem = {
      id: Date.now(),
      title: data.title,
      desc: data.desc,
      deadline: data.deadline,
      createdAt: new Date().toISOString().split("T")[0],
      submitted: 0,
      totalStudents: 20, // Giả sử sĩ số lớp là 20
      status: "OPEN",
      type: data.type,
      points: data.points,
    };

    setAssignments([newItem, ...assignments]);
    setShowModal(false);
  };

  // Helper UI Components
  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Quản lý Bài tập
          </h1>
          <p className="text-slate-500 text-sm">
            Lớp: Tiếng Anh 3A - Live Class
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition active:scale-95"
        >
          <Plus size={20} /> Tạo bài tập mới
        </button>
      </div>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="Tổng bài tập"
          value={assignments.length}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tỷ lệ nộp bài"
          value="85%"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Clock}
          label="Đang mở"
          value={assignments.filter((a) => a.status === "OPEN").length}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* 3. LIST */}
      <div className="space-y-4">
        <AnimatePresence>
          {assignments.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon based on Type */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition ${
                    item.type === "QUIZ"
                      ? "bg-purple-50 text-purple-600"
                      : item.type === "VIDEO"
                        ? "bg-pink-50 text-pink-600"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.type === "QUIZ" ? (
                    <CheckCircle2 size={24} />
                  ) : item.type === "VIDEO" ? (
                    <Video size={24} />
                  ) : (
                    <FileText size={24} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {item.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-1">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> Tạo: {item.createdAt}
                    </span>
                    <span className="flex items-center gap-1 text-orange-500">
                      <Clock size={14} /> Hạn:{" "}
                      {new Date(item.deadline).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4 hidden md:block">
                    <p className="text-xs font-bold text-slate-400">Đã nộp</p>
                    <p className="font-black text-indigo-600 text-lg">
                      {item.submitted}/{item.totalStudents}
                    </p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- RENDER MODAL SEPARATELY --- */}
      <AnimatePresence>
        {showModal && (
          <HomeworkBuilder
            onClose={() => setShowModal(false)}
            onSave={handleCreateNew}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

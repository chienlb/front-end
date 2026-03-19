"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  FileText,
  Users,
  Send,
  Copy,
  Edit,
  CheckSquare,
  X,
} from "lucide-react";

// --- TYPES ---
interface AssignmentTemplate {
  id: string;
  title: string;
  type: "QUIZ" | "ESSAY" | "HOMEWORK";
  questionCount: number;
  duration: number;
  createdAt: string;
  tags: string[];
  usageCount: number;
}

// --- MOCK DATA ---
const ASSIGNMENT_TEMPLATES: AssignmentTemplate[] = [
  {
    id: "AS-001",
    title: "Kiểm tra 15 phút - Unit 1 (New)",
    type: "QUIZ",
    questionCount: 15,
    duration: 15,
    createdAt: "10/11/2023",
    tags: ["Unit 1", "Grammar"],
    usageCount: 3,
  },
  {
    id: "AS-002",
    title: "Bài luận: My Hobby",
    type: "ESSAY",
    questionCount: 1,
    duration: 45,
    createdAt: "05/11/2023",
    tags: ["Writing", "Unit 2"],
    usageCount: 0,
  },
  {
    id: "AS-003",
    title: "Mid-term Test Semester 1",
    type: "QUIZ",
    questionCount: 50,
    duration: 60,
    createdAt: "01/11/2023",
    tags: ["Midterm", "General"],
    usageCount: 5,
  },
];

const MY_CLASSES = [
  { id: "C01", name: "Tiếng Anh 10A1", studentCount: 40 },
  { id: "C02", name: "Tiếng Anh 10A2", studentCount: 38 },
  { id: "C03", name: "Luyện thi IELTS K12", studentCount: 15 },
];

export default function AssignmentLibraryPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] =
    useState<AssignmentTemplate | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  // --- ACTIONS ---
  const handleToggleClass = (classId: string) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleBulkAssign = () => {
    if (selectedClasses.length === 0)
      return alert("Vui lòng chọn ít nhất 1 lớp!");
    if (!dueDate) return alert("Vui lòng chọn hạn nộp!");

    console.log(`Giao bài "${showAssignModal?.title}" cho:`, selectedClasses);
    alert(`Đã giao bài thành công cho ${selectedClasses.length} lớp!`);

    setShowAssignModal(null);
    setSelectedClasses([]);
    setDueDate("");
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Thư viện Đề & Bài tập
          </h1>
          <p className="text-slate-500 mt-1">
            Soạn thảo đề gốc và phân phối nhanh đến các lớp học.
          </p>
        </div>

        <button
          onClick={() => router.push("/teacher/assignments/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition"
        >
          <Plus size={20} /> Soạn đề mới
        </button>
      </div>

      {/* 2. LIBRARY LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Tìm tên bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Lọc
          </button>
        </div>

        {/* List */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Tên đề / Bài tập</th>
              <th className="p-4">Cấu trúc</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Đã sử dụng</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ASSIGNMENT_TEMPLATES.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText
                        size={16}
                        className={
                          item.type === "QUIZ"
                            ? "text-blue-500"
                            : "text-orange-500"
                        }
                      />
                      {item.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <p>{item.questionCount} câu hỏi</p>
                  <p className="text-xs text-slate-400">{item.duration} phút</p>
                </td>
                <td className="p-4 text-sm text-slate-500">{item.createdAt}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${item.usageCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item.usageCount} lớp
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAssignModal(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <Send size={14} /> Giao bài
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/teacher/assignments/${item.id}`)
                      }
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg"
                      title="Nhân bản"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. MODAL GIAO BÀI */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Phân phối bài tập
                </h3>
                <p className="text-sm text-slate-500">
                  Đang giao:{" "}
                  <span className="font-bold text-blue-600">
                    {showAssignModal.title}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase flex justify-between">
                  1. Chọn lớp muốn giao ({selectedClasses.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MY_CLASSES.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => handleToggleClass(cls.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                        selectedClasses.includes(cls.id)
                          ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          {cls.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Users size={12} /> {cls.studentCount} học viên
                        </p>
                      </div>
                      {selectedClasses.includes(cls.id) && (
                        <CheckSquare size={20} className="text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase">
                  2. Thiết lập thời gian
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 mb-1 block">
                      Ngày bắt đầu
                    </span>
                    <input
                      type="datetime-local"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 mb-1 block">
                      Hạn nộp bài
                    </span>
                    <input
                      type="datetime-local"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(null)}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-white rounded-xl transition border border-transparent hover:border-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkAssign}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
              >
                <Send size={18} /> Xác nhận giao bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

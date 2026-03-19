"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Edit2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// --- TYPES ---
type CourseStatus = "PUBLISHED" | "DRAFT" | "PENDING" | "REJECTED";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  price: number;
  students: number;
  rating: number;
  status: CourseStatus;
  image: string;
}

// --- MOCK DATA ---
const COURSES: Course[] = [
  {
    id: "C01",
    title: "Tiếng Anh Giao Tiếp Cơ Bản",
    category: "Ngoại ngữ",
    instructor: "Cô Lan Anh",
    price: 500000,
    students: 120,
    rating: 4.8,
    status: "PUBLISHED",
    image:
      "https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg",
  },
  {
    id: "C02",
    title: "Toán Tư Duy Lớp 3",
    category: "Toán học",
    instructor: "Thầy Hùng",
    price: 300000,
    students: 45,
    rating: 4.5,
    status: "DRAFT",
    image:
      "https://img.freepik.com/free-vector/mathematics-concept-illustration_114360-3972.jpg",
  },
  {
    id: "C03",
    title: "Lập trình Scratch cho trẻ em",
    category: "Lập trình",
    instructor: "TechKids",
    price: 1200000,
    students: 80,
    rating: 5.0,
    status: "PUBLISHED",
    image:
      "https://img.freepik.com/free-vector/programming-concept-illustration_114360-1351.jpg",
  },
  // Khóa học đang chờ duyệt
  {
    id: "C04",
    title: "Luyện thi IELTS 6.5+ Cấp tốc",
    category: "Ngoại ngữ",
    instructor: "Mr. David",
    price: 2500000,
    students: 0,
    rating: 0,
    status: "PENDING", // Trạng thái chờ duyệt
    image:
      "https://img.freepik.com/free-vector/online-test-concept-illustration_114360-5578.jpg",
  },
  // Khóa học bị từ chối
  {
    id: "C05",
    title: "Đầu tư chứng khoán cho người mới",
    category: "Tài chính",
    instructor: "Lê Văn Tiền",
    price: 99000,
    students: 0,
    rating: 0,
    status: "REJECTED", // Trạng thái bị từ chối
    image:
      "https://img.freepik.com/free-vector/finance-analysis-concept-illustration_114360-5500.jpg",
  },
];

export default function CoursesPage() {
  const [filter, setFilter] = useState<"ALL" | CourseStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Logic lọc dữ liệu
  const filteredCourses = COURSES.filter((course) => {
    const matchesFilter = filter === "ALL" || course.status === filter;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Tính toán thống kê
  const totalCourses = COURSES.length;
  const pendingCount = COURSES.filter((c) => c.status === "PENDING").length;
  const activeCount = COURSES.filter((c) => c.status === "PUBLISHED").length;

  // Helper render badge trạng thái
  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border border-green-200">
            <CheckCircle2 size={10} /> Đang bán
          </span>
        );
      case "DRAFT":
        return (
          <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border border-slate-200">
            <Edit2 size={10} /> Bản nháp
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border border-yellow-200 animate-pulse">
            <Clock size={10} /> Chờ duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border border-red-200">
            <XCircle size={10} /> Từ chối
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Quản lý Khóa học
          </h1>
          <p className="text-slate-500 text-sm">
            Danh sách các khóa học đang có trên hệ thống.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition">
            <Plus size={20} /> Tạo khóa học mới
          </button>
        </Link>
      </div>

      {/* Stats Cards - Cập nhật để hiển thị số lượng chờ duyệt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Tổng khóa học
            </p>
            <p className="text-2xl font-black text-slate-800">{totalCourses}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Card : Cần duyệt */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
          {pendingCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Cần duyệt ngay
            </p>
            <p className="text-2xl font-black text-yellow-600">
              {pendingCount}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Đang hoạt động
            </p>
            <p className="text-2xl font-black text-green-600">{activeCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "PUBLISHED", label: "Đang bán" },
              { id: "PENDING", label: "Chờ duyệt" },
              { id: "DRAFT", label: "Bản nháp" },
              { id: "REJECTED", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filter === tab.id
                    ? "bg-slate-800 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Khóa học</th>
                <th className="p-4">Giảng viên</th>
                <th className="p-4">Giá tiền</th>
                <th className="p-4">Học viên</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-slate-50/50 transition group"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.image}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                          {course.title}
                        </p>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                          {course.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {course.instructor}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(course.price)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Users size={14} /> {course.students}
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(course.status)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/courses/${course.id}`}>
                      <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition shadow-sm">
                        <MoreHorizontal size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCourses.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <p>Không tìm thấy khóa học nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

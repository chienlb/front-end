"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Baby,
  Link as LinkIcon,
  Eye,
  Trash2,
  UserPlus,
} from "lucide-react";

interface Child {
  id: string;
  name: string;
  class: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  children: Child[]; // Danh sách con cái đã liên kết
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
}

// --- MOCK DATA ---
const PARENTS: Parent[] = [
  {
    id: "PAR-001",
    name: "Phạm Thị Hương",
    email: "huong.pham@gmail.com",
    phone: "0988.123.456",
    avatar: "https://i.pravatar.cc/150?img=1",
    children: [
      { id: "STU-001", name: "Nguyễn Văn An", class: "Tiếng Anh K12" },
      { id: "STU-005", name: "Nguyễn Thị Bé", class: "Kids Starter" },
    ],
    status: "ACTIVE",
    joinedDate: "10/09/2023",
  },
  {
    id: "PAR-002",
    name: "Trần Đại Nghĩa",
    email: "nghia.tran@yahoo.com",
    phone: "0977.999.888",
    avatar: "https://i.pravatar.cc/150?img=11",
    children: [{ id: "STU-002", name: "Trần Bảo Ngọc", class: "IELTS Prep" }],
    status: "ACTIVE",
    joinedDate: "05/11/2023",
  },
];

export default function AdminParentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParents = PARENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.includes(searchTerm) ||
      p.phone.includes(searchTerm),
  );

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Danh sách Phụ huynh
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý tài khoản phụ huynh và liên kết con cái.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
          <UserPlus size={20} /> Thêm Phụ huynh
        </button>
      </div>

      {/* 2. MAIN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
              placeholder="Tìm theo tên, email, sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Bộ lọc
          </button>
        </div>

        {/* Table List */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 pl-6">Phụ huynh</th>
              <th className="p-4">Thông tin liên hệ</th>
              <th className="p-4">Con cái đã liên kết</th>
              <th className="p-4">Ngày tham gia</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredParents.map((parent) => (
              <tr
                key={parent.id}
                className="hover:bg-slate-50/50 transition group"
              >
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={parent.avatar}
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {parent.name}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${parent.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {parent.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />{" "}
                      {parent.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />{" "}
                      {parent.phone}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    {parent.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg w-fit"
                      >
                        <div className="w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center">
                          <Baby size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-900">
                            {child.name}
                          </p>
                          <p className="text-[10px] text-blue-600">
                            {child.class}
                          </p>
                        </div>
                      </div>
                    ))}
                    {parent.children.length === 0 && (
                      <span className="text-xs text-slate-400 italic">
                        Chưa liên kết
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {parent.joinedDate}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="Chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-orange-600 rounded-lg transition"
                      title="Quản lý liên kết"
                    >
                      <LinkIcon size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

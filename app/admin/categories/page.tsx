"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";

// --- MOCK DATA ---
const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "Ngoại ngữ",
    slug: "ngoai-ngu",
    count: 12,
    created: "20/10/2023",
  },
  {
    id: 2,
    name: "Toán tư duy",
    slug: "toan-tu-duy",
    count: 5,
    created: "21/10/2023",
  },
  {
    id: 3,
    name: "Lập trình nhí",
    slug: "lap-trinh-nhi",
    count: 8,
    created: "22/10/2023",
  },
  {
    id: 4,
    name: "Kỹ năng mềm",
    slug: "ky-nang-mem",
    count: 3,
    created: "25/10/2023",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "" });

  const handleAdd = () => {
    if (!newCat.name) return;
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: newCat.name,
        slug: newCat.slug || newCat.name.toLowerCase().replace(/ /g, "-"), // Auto slug đơn giản
        count: 0,
        created: new Date().toLocaleDateString("vi-VN"),
      },
    ]);
    setNewCat({ name: "", slug: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Tag className="text-indigo-600" /> Quản lý Danh mục
            </h1>
            <p className="text-slate-500 text-sm">
              Phân loại các khóa học để học viên dễ tìm kiếm.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2"
          >
            <Plus size={20} /> Thêm danh mục
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-5 pl-8">Tên danh mục</th>
                <th className="p-5">Đường dẫn (Slug)</th>
                <th className="p-5 text-center">Số khóa học</th>
                <th className="p-5">Ngày tạo</th>
                <th className="p-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition">
                  <td className="p-5 pl-8 font-bold text-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FolderOpen size={16} />
                    </div>
                    {cat.name}
                  </td>
                  <td className="p-5 text-slate-500 font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                      {cat.count}
                    </span>
                  </td>
                  <td className="p-5 text-slate-500 text-sm">{cat.created}</td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Thêm danh mục mới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Tên danh mục
                </label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  placeholder="VD: Toán học..."
                  value={newCat.name}
                  onChange={(e) =>
                    setNewCat({ ...newCat, name: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Slug (Tùy chọn)
                </label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  placeholder="vd: toan-hoc"
                  value={newCat.slug}
                  onChange={(e) =>
                    setNewCat({ ...newCat, slug: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 font-bold text-slate-600 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 bg-indigo-600 font-bold text-white rounded-xl shadow-lg"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

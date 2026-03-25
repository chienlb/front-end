"use client";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { postService } from "@/services/post.service";

// Load ReactQuill ở phía Client
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    isActive: true,
    isFeatured: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await postService.getAllAdmin();
      setPosts(res.data || res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleOpenModal = (post?: any) => {
    if (post) {
      setEditingId(post._id);
      setFormData({
        title: post.title,
        author: post.author || "",
        content: post.content,
        isActive: Boolean(post.isActive),
        isFeatured: Boolean(post.isFeatured),
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        author: "",
        content: "",
        isActive: true,
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;
    await postService.delete(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      alert("Vui lòng nhập đủ Tiêu đề, Tác giả và Nội dung.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await postService.update(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        await postService.create(formData);
        alert("Đăng bài thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi khi lưu bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản Lý Blog & Tin Tức
          </h1>
          <p className="text-slate-500">
            Soạn thảo bài viết, thông báo và bí quyết học tập.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
        >
          <Plus size={20} /> Viết Bài Mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b">
            <tr>
              <th className="p-4">Bài viết</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Nổi bật</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPosts.map((post) => (
              <tr key={post._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg grid place-items-center bg-slate-100 text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-xs text-slate-500">Slug: {post.slug || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-semibold text-slate-700">
                    {post.author || "—"}
                  </span>
                </td>
                <td className="p-4">
                  {post.isActive ? (
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-4 text-center font-bold text-slate-600">
                  {post.isFeatured ? (
                    <span className="text-amber-700 font-bold text-xs bg-amber-50 px-2 py-1 rounded">
                      Nổi bật
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded">
                      Thường
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(post)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL EDITOR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Sửa bài viết" : "Viết bài mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400 hover:text-red-500" />
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Cột trái: Thông tin cơ bản */}
                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">
                      Tiêu đề bài viết
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg text-sm font-bold"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">
                      Tác giả
                    </label>
                    <input
                      className="w-full border p-2 rounded-lg text-sm"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-blue-600"
                    />
                    <label className="text-sm font-bold text-slate-700">
                      Kích hoạt bài viết
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-amber-600"
                    />
                    <label className="text-sm font-bold text-slate-700">
                      Đánh dấu nổi bật
                    </label>
                  </div>
                </div>

                {/* Cột phải: Editor */}
                <div className="col-span-2 flex flex-col">
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Nội dung chi tiết
                  </label>
                  <div className="flex-1 bg-white">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(val) =>
                        setFormData({ ...formData, content: val })
                      }
                      className="h-[350px] mb-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {editingId ? "Lưu thay đổi" : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

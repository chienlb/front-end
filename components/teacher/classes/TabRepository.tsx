"use client";
import { useState } from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Plus,
  Upload,
  Search,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

// --- TYPES ---
type FileType = "FOLDER" | "PDF" | "DOC" | "IMG" | "ZIP" | "OTHER";

interface RepoItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  parentId: string | null; // null là thư mục gốc
}

// --- MOCK DATA ---
const INITIAL_DATA: RepoItem[] = [
  {
    id: "f1",
    name: "Tài liệu tham khảo Tuần 1",
    type: "FOLDER",
    updatedAt: new Date().toISOString(),
    parentId: null,
  },
  {
    id: "f2",
    name: "Đề thi các năm trước",
    type: "FOLDER",
    updatedAt: new Date().toISOString(),
    parentId: null,
  },
  {
    id: "d1",
    name: "Syllabus_Spring2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    updatedAt: new Date().toISOString(),
    parentId: null,
  },
  // Bên trong f1
  {
    id: "d2",
    name: "Tu_vung_nang_cao.docx",
    type: "DOC",
    size: "1.1 MB",
    updatedAt: new Date().toISOString(),
    parentId: "f1",
  },
  {
    id: "d3",
    name: "So_do_tu_duy.png",
    type: "IMG",
    size: "5.6 MB",
    updatedAt: new Date().toISOString(),
    parentId: "f1",
  },
];

export default function TabRepository() {
  const [items, setItems] = useState<RepoItem[]>(INITIAL_DATA);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<
    { id: string; name: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC ---

  // 1. Lọc item theo thư mục hiện tại
  const currentItems = items.filter(
    (item) =>
      item.parentId === currentFolderId &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 2. Điều hướng vào folder
  const handleEnterFolder = (folder: RepoItem) => {
    if (folder.type !== "FOLDER") return;
    setCurrentFolderId(folder.id);
    setFolderStack([...folderStack, { id: folder.id, name: folder.name }]);
  };

  // 3. Điều hướng quay lại (Breadcrumb)
  const handleNavigate = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderStack([]);
    } else {
      const newStack = folderStack.slice(0, index + 1);
      setCurrentFolderId(newStack[newStack.length - 1].id);
      setFolderStack(newStack);
    }
  };

  // 4. Tạo folder mới
  const handleCreateFolder = () => {
    const name = prompt("Nhập tên thư mục mới:");
    if (name) {
      const newFolder: RepoItem = {
        id: `f-${Date.now()}`,
        name,
        type: "FOLDER",
        updatedAt: new Date().toISOString(),
        parentId: currentFolderId,
      };
      setItems([...items, newFolder]);
    }
  };

  // 5. Upload File (Giả lập)
  const handleUpload = () => {
    // Thực tế sẽ mở file picker
    const fakeFile: RepoItem = {
      id: `file-${Date.now()}`,
      name: "Tai_lieu_moi_upload.pdf",
      type: "PDF",
      size: "1.5 MB",
      updatedAt: new Date().toISOString(),
      parentId: currentFolderId,
    };
    setItems([...items, fakeFile]);
  };

  // 6. Xóa item
  const handleDelete = (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa mục này?")) {
      setItems(items.filter((i) => i.id !== id && i.parentId !== id));
    }
  };

  // --- HELPER: ICON ---
  const getIcon = (type: FileType) => {
    switch (type) {
      case "FOLDER":
        return <Folder className="text-blue-500 fill-blue-100" size={24} />;
      case "PDF":
        return <FileText className="text-red-500" size={24} />;
      case "DOC":
        return <FileText className="text-blue-600" size={24} />;
      case "IMG":
        return <ImageIcon className="text-purple-500" size={24} />;
      default:
        return <File className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* --- HEADER ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-[300px] md:max-w-none">
            <button
              onClick={() => handleNavigate(-1)}
              className={`hover:text-blue-600 flex items-center gap-1 ${folderStack.length === 0 ? "text-blue-600" : ""}`}
            >
              <Home size={16} /> Kho tài liệu
            </button>
            {folderStack.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ChevronRight size={14} className="text-slate-400" />
                <button
                  onClick={() => handleNavigate(idx)}
                  className={`hover:text-blue-600 ${idx === folderStack.length - 1 ? "text-blue-600" : ""}`}
                >
                  {f.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 flex items-center gap-2"
          >
            <Plus size={18} />{" "}
            <span className="hidden sm:inline">Folder mới</span>
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <Upload size={18} />{" "}
            <span className="hidden sm:inline">Tải lên</span>
          </button>
        </div>
      </div>

      {/* --- FILE EXPLORER LIST --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6">Tên</div>
          <div className="col-span-3">Ngày sửa đổi</div>
          <div className="col-span-2">Kích thước</div>
          <div className="col-span-1 text-right">Tác vụ</div>
        </div>

        {/* Table Body */}
        <div className="flex-1">
          {currentItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-blue-50/50 transition cursor-pointer group"
                  onClick={() => handleEnterFolder(item)}
                >
                  {/* Name Column */}
                  <div className="col-span-6 flex items-center gap-3">
                    {getIcon(item.type)}
                    <span className="font-bold text-slate-700 text-sm truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Date Column */}
                  <div className="col-span-3 text-xs text-slate-500 font-medium">
                    {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")}
                  </div>

                  {/* Size Column */}
                  <div className="col-span-2 text-xs text-slate-500 font-medium">
                    {item.type === "FOLDER" ? "-" : item.size}
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      {item.type !== "FOLDER" && (
                        <button
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-100"
                          title="Tải xuống"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Folder
                size={48}
                strokeWidth={1}
                className="mb-2 text-slate-300"
              />
              <p className="text-sm">Thư mục trống</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 font-medium flex justify-between">
          <span>{currentItems.length} mục</span>
          <span>Dung lượng đã dùng: 245 MB / 5 GB</span>
        </div>
      </div>
    </div>
  );
}

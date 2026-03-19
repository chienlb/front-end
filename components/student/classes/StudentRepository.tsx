"use client";
import { useState } from "react";
import {
  Folder,
  FileText,
  Download,
  Search,
  File,
  Image as ImageIcon,
  Video,
} from "lucide-react";

// Mock Data
const FILES = [
  {
    id: 1,
    name: "Slide bài giảng Unit 1.pdf",
    type: "PDF",
    size: "2.5 MB",
    date: "20/10/2023",
  },
  {
    id: 2,
    name: "Bài tập về nhà.docx",
    type: "DOC",
    size: "1.2 MB",
    date: "21/10/2023",
  },
  {
    id: 3,
    name: "Video record buổi 1.mp4",
    type: "VIDEO",
    size: "150 MB",
    date: "20/10/2023",
  },
  {
    id: 4,
    name: "Tài liệu tham khảo thêm",
    type: "FOLDER",
    size: "-",
    date: "15/10/2023",
  },
];

export default function StudentRepository() {
  const [searchTerm, setSearchTerm] = useState("");

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText size={20} className="text-red-500" />;
      case "DOC":
        return <FileText size={20} className="text-blue-500" />;
      case "VIDEO":
        return <Video size={20} className="text-purple-500" />;
      case "FOLDER":
        return <Folder size={20} className="text-yellow-500 fill-yellow-100" />;
      default:
        return <File size={20} className="text-slate-400" />;
    }
  };

  const filteredFiles = FILES.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Folder className="text-blue-600" size={24} /> Kho tài liệu lớp học
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tài liệu được chia sẻ bởi giáo viên
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
            placeholder="Tìm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 flex items-center justify-between hover:bg-blue-50/30 transition group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${file.type === "FOLDER" ? "bg-yellow-50" : "bg-slate-50"}`}
                >
                  {getIcon(file.type)}
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {file.date} • {file.size}
                  </p>
                </div>
              </div>

              {file.type !== "FOLDER" && (
                <button
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  title="Tải xuống"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Đang tải: ${file.name}`);
                  }}
                >
                  <Download size={20} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Folder size={48} className="text-slate-200 mb-2" />
            <p className="text-sm">Không tìm thấy tài liệu nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}

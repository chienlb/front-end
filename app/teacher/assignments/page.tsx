"use client";

import { useEffect, useMemo, useState } from "react";
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
import { assignmentsService } from "@/services/assignments.service";
import { groupsService } from "@/services/groups.service";

// --- TYPES ---
interface AssignmentTemplate {
  id: string;
  title: string;
  type: string;
  questionCount: number | null;
  maxScore: number;
  createdAt: string;
  tags: string[];
  usageCount: number;
}

export default function AssignmentLibraryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [myClasses, setMyClasses] = useState<
    Array<{ id: string; name: string; studentCount: number }>
  >([]);
  const [showAssignModal, setShowAssignModal] =
    useState<AssignmentTemplate | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  const getCurrentUserId = (): string => {
    try {
      const raw = window.localStorage.getItem("currentUser");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return String(parsed?._id || parsed?.id || parsed?.data?._id || "");
    } catch {
      return "";
    }
  };

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const keys = ["data", "items", "results", "docs", "assignments", "groups", "rows"];
    for (const key of keys) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    for (const key of ["data", "result", "payload"]) {
      const nested = payload[key];
      if (!nested || typeof nested !== "object") continue;
      for (const k of keys) {
        if (Array.isArray(nested[k])) return nested[k];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const userId = getCurrentUserId();
        if (!userId) {
          setTemplates([]);
          setMyClasses([]);
          return;
        }

        const [assignmentRes, groupsRes] = await Promise.all([
          assignmentsService.getAssignmentsByUserId(userId, 1, 200),
          groupsService.getMyGroups({ page: 1, limit: 200 }),
        ]);

        const assignmentPayload = assignmentRes?.data ?? assignmentRes;
        const assignmentList = extractList(assignmentPayload);
        const mappedTemplates: AssignmentTemplate[] = assignmentList.map((it: any) => ({
          id: String(it?._id ?? it?.id ?? ""),
          title: String(it?.title ?? it?.name ?? "Bài tập chưa đặt tên"),
          type: String(it?.type || "quiz"),
          questionCount: Array.isArray(it?.questions) ? it.questions.length : null,
          maxScore: Number(it?.maxScore ?? 10) || 10,
          createdAt: it?.createdAt
            ? new Date(it.createdAt).toLocaleDateString("vi-VN")
            : "—",
          tags: Array.isArray(it?.tags) ? it.tags : [],
          usageCount: Number(it?.totalSubmissions ?? it?.submissionCount ?? 0) || 0,
        }));
        setTemplates(mappedTemplates.filter((t) => t.id));

        const groupsPayload = groupsRes?.data ?? groupsRes;
        const groups = extractList(groupsPayload);
        const mappedGroups = groups.map((g: any, idx: number) => ({
          id: String(g?._id ?? g?.id ?? `group-${idx}`),
          name: String(g?.name ?? g?.title ?? "Lớp học"),
          studentCount: Number(g?.totalMembers ?? g?.memberCount ?? g?.studentCount ?? 0) || 0,
        }));
        setMyClasses(mappedGroups.filter((g) => g.id));
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message;
        setLoadError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải dữ liệu.");
        setTemplates([]);
        setMyClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const filteredTemplates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) => t.title.toLowerCase().includes(q));
  }, [templates, searchTerm]);

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
            {filteredTemplates.map((item) => (
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
                  <p className="capitalize font-semibold">{item.type}</p>
                  <p className="text-xs text-slate-400">Điểm tối đa: {item.maxScore}</p>
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
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Đang tải danh sách bài tập...</div>
        ) : null}
        {!loading && loadError ? (
          <div className="p-6 text-sm text-red-600">{loadError}</div>
        ) : null}
        {!loading && !loadError && filteredTemplates.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Không có bài tập nào.</div>
        ) : null}
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
                  {myClasses.map((cls) => (
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

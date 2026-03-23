"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  PenTool,
  Trophy,
  ArrowUpRight,
  Video,
  Zap,
  Loader2,
} from "lucide-react";
import { assignmentsService } from "@/services/assignments.service";
import { type Assignment, type AssignmentSource } from "./data";

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<"TODO" | "DONE">("TODO");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | AssignmentSource>(
    "ALL",
  );
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const normalizeStatus = (raw: any): Assignment["status"] => {
    const s = String(raw || "").toUpperCase();
    if (["GRADED", "DONE", "COMPLETED"].includes(s)) return "GRADED";
    if (["SUBMITTED", "WAITING", "PENDING_REVIEW"].includes(s))
      return "SUBMITTED";
    if (["LATE", "OVERDUE"].includes(s)) return "LATE";
    return "PENDING";
  };

  const mapAssignment = (item: any): Assignment => {
    const status = normalizeStatus(item?.status);
    const source: AssignmentSource = item?.lessonId
      ? "COURSE"
      : item?.classId
        ? "LIVE_CLASS"
        : "SYSTEM";

    const lessonIdKey = String(
      item?.lessonId?._id || item?.lessonId?.id || item?.lessonId || "",
    );
    const classIdKey = String(
      item?.classId?._id || item?.classId?.id || item?.classId || "",
    );

    const firstAttachmentStringUrl =
      Array.isArray(item?.attachments) && typeof item?.attachments[0] === "string"
        ? item.attachments[0]
        : undefined;

    const attachmentUrl =
      item?.attachmentUrl ||
      item?.fileUrl ||
      item?.attachment?.url ||
      item?.attachment?.fileUrl ||
      item?.file?.url ||
      item?.file?.fileUrl ||
      firstAttachmentStringUrl ||
      (Array.isArray(item?.attachments) && item.attachments[0]?.url) ||
      (Array.isArray(item?.attachments) && item.attachments[0]?.fileUrl) ||
      undefined;

    const attachmentName =
      item?.attachmentName ||
      item?.fileName ||
      item?.attachment?.name ||
      item?.attachment?.fileName ||
      item?.file?.name ||
      item?.file?.fileName ||
      (firstAttachmentStringUrl ? firstAttachmentStringUrl.split("/").pop() : undefined) ||
      (Array.isArray(item?.attachments) && item.attachments[0]?.name) ||
      (Array.isArray(item?.attachments) && item.attachments[0]?.fileName) ||
      undefined;

    return {
      id: String(item?._id || item?.id || ""),
      title: item?.title || item?.name || "Bài tập chưa đặt tên",
      subject: item?.subject || item?.type || "Bài tập",
      source,
      sourceName:
        item?.classId?.name ||
        item?.classId?.title ||
        item?.lessonId?.title ||
        "Không rõ nguồn",
      teacher: item?.teacherId?.fullName || item?.teacherName || undefined,
      deadline: item?.deadline || item?.dueDate || "Chưa có hạn nộp",
      status,
      score:
        typeof item?.score === "number"
          ? item.score
          : typeof item?.grade === "number"
            ? item.grade
            : undefined,
      duration: item?.duration || item?.timeLimit || undefined,
      priority: item?.priority === "HIGH" ? "HIGH" : "NORMAL",
      content: item?.description || item?.content || undefined,
      requirements: Array.isArray(item?.requirements) ? item.requirements : [],
      attachmentUrl,
      attachmentName,

      classId: classIdKey || undefined,
      className: item?.classId?.name || item?.classId?.title || undefined,
      lessonId: lessonIdKey || undefined,
      lessonTitle: item?.lessonId?.title || item?.lessonId?.name || undefined,
    };
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const rawUser =
          typeof window !== "undefined"
            ? window.localStorage.getItem("currentUser")
            : null;
        let userId = "";
        if (rawUser) {
          try {
            const t = rawUser.trim();
            if (t) {
              const parsed = JSON.parse(t);
              userId =
                parsed?._id ||
                parsed?.id ||
                parsed?.data?._id ||
                "";
            }
          } catch {
            userId = "";
          }
        }
        if (!userId) {
          setAssignments([]);
          return;
        }

        /**
         * API mới: GET /user-assignments/:userId
         * -> trả về list bài tập của user (đã có status/score/lesson/class tùy backend).
         */
        const userRes: any = await assignmentsService.getUserAssignments(userId);
        const userPayload = userRes?.data || userRes;
        const userList: any[] = Array.isArray(userPayload)
          ? userPayload
          : Array.isArray(userPayload?.assignments)
            ? userPayload.assignments
            : Array.isArray(userPayload?.data)
              ? userPayload.data
              : [];

        setAssignments(userList.map(mapAssignment));
      } catch (e) {
        console.error("Lỗi tải assignments:", e);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const filteredList = assignments.filter((item) => {
    // 1. Filter by Tab (Status)
    const isTodo = item.status === "PENDING" || item.status === "LATE";
    if (activeTab === "TODO" && !isTodo) return false;
    if (activeTab === "DONE" && isTodo) return false;

    // 2. Filter by Search Query
    if (!item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;

    // 3. Filter by Source
    if (sourceFilter !== "ALL" && item.source !== sourceFilter) return false;

    return true;
  });

  const groupedAssignments = useMemo(() => {
    // groupId (classId) -> lessonId -> items
    const classGroups = new Map<string, Map<string, Assignment[]>>();

    for (const item of filteredList) {
      const groupKey = item.classId || "SYSTEM";
      const groupLabel =
        item.className ||
        item.sourceName ||
        (item.source === "SYSTEM" ? "Nhiệm vụ ngày" : "Nhóm học");

      const lessonKey = item.lessonId || "NO_LESSON";
      const lessonLabel = item.lessonTitle || "Bài học";

      // We keep groupKey/lessonKey as identity, but we render using the latest labels.
      if (!classGroups.has(groupKey)) classGroups.set(groupKey, new Map());
      const lessonGroups = classGroups.get(groupKey)!;

      if (!lessonGroups.has(lessonKey)) lessonGroups.set(lessonKey, []);
      lessonGroups.get(lessonKey)!.push(item);
    }

    return Array.from(classGroups.entries()).map(([groupKey, lessonsMap]) => {
      const firstItem = lessonsMap.values().next().value?.[0] as Assignment | undefined;
      const groupLabel =
        firstItem?.className ||
        firstItem?.sourceName ||
        (firstItem?.source === "SYSTEM" ? "Nhiệm vụ ngày" : "Nhóm học") ||
        groupKey;

      return {
        groupKey,
        groupLabel,
        lessons: Array.from(lessonsMap.entries()).map(([lessonKey, items]) => {
          const lessonFirst = items[0];
          const lessonTitle = lessonFirst?.lessonTitle || "Bài học";
          return { lessonKey, lessonTitle, items };
        }),
      };
    });
  }, [filteredList]);

  const totalPending = useMemo(
    () => assignments.filter((a) => a.status === "PENDING" || a.status === "LATE").length,
    [assignments],
  );
  const totalDone = useMemo(
    () => assignments.filter((a) => a.status === "GRADED" || a.status === "SUBMITTED").length,
    [assignments],
  );

  const getStatusBadge = (item: Assignment) => {
    switch (item.status) {
      case "PENDING":
        return item.priority === "HIGH" ? (
          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Sắp hết hạn
          </span>
        ) : (
          <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Còn hạn
          </span>
        );
      case "LATE":
        return (
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <AlertCircle size={12} /> Quá hạn
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={12} /> Đã nộp
          </span>
        );
      case "GRADED":
        return (
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Đã chấm
          </span>
        );
    }
  };

  const getSourceIcon = (source: AssignmentSource) => {
    switch (source) {
      case "LIVE_CLASS":
        return <BookOpen size={14} className="text-indigo-500" />;
      case "COURSE":
        return <Video size={14} className="text-blue-500" />;
      case "SYSTEM":
        return <Zap size={14} className="text-yellow-500" />;
    }
  };

  const getSourceLabel = (source: AssignmentSource) => {
    switch (source) {
      case "LIVE_CLASS":
        return "Nhóm học";
      case "COURSE":
        return "Khóa học Video";
      case "SYSTEM":
        return "Nhiệm vụ ngày";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* 1. HEADER SUMMARY */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <BookOpen size={32} /> Bài tập về nhà
          </h1>
          <p className="text-blue-100 font-medium mb-6">
            Danh sách bài tập từ lớp học và nhiệm vụ hàng ngày.
          </p>

          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-400 text-white rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-3xl font-black">
                  {totalPending}
                </p>
                <p className="text-xs text-blue-100 uppercase font-bold">
                  Cần làm ngay
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-3xl font-black">
                  {totalDone}
                </p>
                <p className="text-xs text-blue-100 uppercase font-bold">
                  Đã hoàn thành
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        {/* Controls */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("TODO")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "TODO" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Cần làm
            </button>
            <button
              onClick={() => setActiveTab("DONE")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "DONE" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Đã xong
            </button>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSourceFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition ${sourceFilter === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSourceFilter("SYSTEM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition flex items-center gap-1 ${sourceFilter === "SYSTEM" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <Zap size={12} /> Nhiệm vụ
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition"
              placeholder="Tìm tên bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ASSIGNMENT GROUPS (groupId + lessonId) */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">
                Đang tải danh sách bài tập...
              </p>
            </div>
          ) : groupedAssignments.length > 0 ? (
            groupedAssignments.map((group) => (
              <div
                key={group.groupKey}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Nhóm học
                    </p>
                    <h2 className="text-xl font-black text-slate-800 mt-1">
                      {group.groupLabel}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 font-bold">
                    {group.lessons.reduce((acc, l) => acc + l.items.length, 0)} bài
                  </div>
                </div>

                <div className="space-y-5">
                  {group.lessons.map((lesson, idx) => (
                    <div key={lesson.lessonKey} className="pt-2">
                      <p className="text-sm font-black text-slate-600 mb-3 flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-500" />
                        {lesson.lessonTitle}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition group flex flex-col h-full"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-2">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  {item.subject}
                                </span>
                                <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                  {getSourceIcon(item.source)}{" "}
                                  {getSourceLabel(item.source)}
                                </span>
                              </div>
                              {getStatusBadge(item)}
                            </div>

                            <div className="flex-1 mb-4">
                              <Link
                                href={`/assignments/${item.id}`}
                                className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition line-clamp-2 hover:underline underline-offset-4 block"
                              >
                                {item.title}
                              </Link>

                              <p className="text-xs text-slate-400 font-medium mb-3 line-clamp-1">
                                Từ:{" "}
                                <span className="text-slate-600">
                                  {item.sourceName}
                                </span>
                              </p>

                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                {item.teacher && (
                                  <span className="flex items-center gap-1">
                                    <PenTool size={12} /> {item.teacher}
                                  </span>
                                )}
                                {item.teacher && <span>•</span>}
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {item.duration}
                                </span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="text-xs">
                                <p className="text-slate-400 font-bold">
                                  Hạn nộp
                                </p>
                                <p
                                  className={`font-bold ${
                                    item.status === "LATE"
                                      ? "text-red-600"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.deadline}
                                </p>
                              </div>

                              {item.status === "PENDING" ||
                              item.status === "LATE" ? (
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/assignments/${item.id}`}
                                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                                  >
                                    Xem nội dung
                                  </Link>
                                  <Link
                                    href={`/assignments/${item.id}/submit`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-1"
                                  >
                                    Nộp file{" "}
                                    <ArrowUpRight size={14} />
                                  </Link>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  {item.score && (
                                    <span className="text-xl font-black text-green-600 flex items-center gap-1">
                                      {item.score}
                                      <span className="text-xs text-green-400 font-bold">
                                        đ
                                      </span>
                                    </span>
                                  )}
                                  <Link
                                    href={`/assignments/${item.id}/review`}
                                    className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                                  >
                                    Xem lại
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-blue-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                Không tìm thấy bài tập nào
              </h3>
              <p className="text-slate-500 text-sm">
                Bạn đã hoàn thành hết bài tập rồi. Tuyệt vời!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

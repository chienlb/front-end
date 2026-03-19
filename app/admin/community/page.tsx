"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  ShieldAlert,
  Pin,
  Loader2,
} from "lucide-react";
import { communityService } from "@/services/community.service";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"MODERATION" | "REPORTS" | "FEED">(
    "MODERATION"
  );
  const [loading, setLoading] = useState(false);

  // Data States
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "MODERATION") {
        const data: any = await communityService.getPosts("PENDING");
        setPendingPosts(data);
      } else if (activeTab === "FEED") {
        const data: any = await communityService.getPosts("APPROVED");
        setPosts(data);
      } else if (activeTab === "REPORTS") {
        const data: any = await communityService.getReports("OPEN");
        setReports(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Actions: Post Moderation
  const handleApprove = async (id: string) => {
    if (!confirm("Duyệt bài viết này?")) return;
    await communityService.approvePost(id);
    fetchData();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối bài viết này?")) return;
    await communityService.rejectPost(id);
    fetchData();
  };

  // Actions: Feed Management
  const handleDeletePost = async (id: string) => {
    if (!confirm("Xóa vĩnh viễn bài viết này?")) return;
    await communityService.deletePost(id);
    fetchData();
  };

  const handleFeaturePost = async (id: string) => {
    await communityService.toggleFeature(id);
    fetchData();
  };

  // Actions: Report Handling
  const handleResolveReport = async (
    id: string,
    action: "RESOLVED" | "DISMISSED"
  ) => {
    await communityService.resolveReport(id, action);
    fetchData();
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản trị Cộng đồng 🛡️
          </h1>
          <p className="text-gray-500 text-sm">
            Kiểm duyệt bài viết và báo cáo vi phạm.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-yellow-200">
            ⏳ {pendingPosts.length} Bài chờ duyệt
          </div>
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-200">
            <ShieldAlert size={16} /> {reports.length} Báo cáo mới
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab("MODERATION")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "MODERATION"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <CheckCircle size={18} /> Duyệt bài
        </button>
        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "REPORTS"
              ? "bg-red-600 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Flag size={18} /> Báo cáo
        </button>
        <button
          onClick={() => setActiveTab("FEED")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "FEED"
              ? "bg-gray-800 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <MessageSquare size={18} /> Tất cả bài viết
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* TAB 1: MODERATION */}
            {activeTab === "MODERATION" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingPosts.length === 0 && (
                  <p className="text-gray-500 italic col-span-2 text-center">
                    Không có bài viết nào cần duyệt.
                  </p>
                )}
                {pendingPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          User ID: {post.userId}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="ml-auto bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">
                        PENDING
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg text-sm text-slate-700 mb-4 border border-gray-100">
                      <p className="mb-2">{post.content}</p>
                      {post.images?.map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          className="h-32 rounded-lg object-cover border border-gray-200 mr-2"
                        />
                      ))}
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleReject(post._id)}
                        className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Từ chối
                      </button>
                      <button
                        onClick={() => handleApprove(post._id)}
                        className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 shadow-md"
                      >
                        <CheckCircle size={16} /> Duyệt bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: REPORTS */}
            {activeTab === "REPORTS" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 text-red-800 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Người báo cáo</th>
                      <th className="p-4">Lý do</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {report.type}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{report.reporterId}</td>
                        <td className="p-4 text-red-500 font-medium">
                          {report.reason}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleResolveReport(report._id, "DISMISSED")
                              }
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-xs font-bold"
                            >
                              Bỏ qua
                            </button>
                            <button
                              onClick={() =>
                                handleResolveReport(report._id, "RESOLVED")
                              }
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-bold shadow-sm"
                            >
                              Xử lý xong
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: FEED */}
            {activeTab === "FEED" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 relative"
                  >
                    {post.isFeatured && (
                      <Pin
                        size={16}
                        className="absolute -left-2 top-0 text-blue-500 fill-blue-500 rotate-45"
                      />
                    )}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      📝
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-sm text-slate-800">
                          User: {post.userId}{" "}
                          <span className="text-gray-400 font-normal text-xs">
                            • {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeaturePost(post._id)}
                            className={`hover:bg-gray-100 p-1.5 rounded ${
                              post.isFeatured
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                            title="Ghim"
                          >
                            <Pin size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.content}
                      </p>
                      {post.images?.length > 0 && (
                        <img
                          src={post.images[0]}
                          className="mt-2 h-20 rounded border"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

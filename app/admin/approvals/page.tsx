"use client";
import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Video,
  Clock,
  Filter,
  AlertCircle,
} from "lucide-react";

export default function ContentApprovalPage() {
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [selectedItem, setSelectedItem] = useState<any>(null); // Modal state
  const [rejectReason, setRejectReason] = useState("");

  // Mock Data
  const requests = [
    {
      id: 1,
      title: "Unit 5: Future Tense",
      teacher: "Cô Minh Anh",
      type: "LESSON",
      submittedAt: "10:30 AM, Hôm nay",
      status: "PENDING",
    },
    {
      id: 2,
      title: "Quiz: Vocabulary Unit 2",
      teacher: "Thầy John Doe",
      type: "QUIZ",
      submittedAt: "09:15 AM, Hôm qua",
      status: "PENDING",
    },
    {
      id: 3,
      title: "Video: Pronunciation /th/",
      teacher: "Cô Lan",
      type: "VIDEO",
      submittedAt: "2 ngày trước",
      status: "REJECTED",
      reason: "Video bị mất tiếng đoạn cuối",
    },
  ];

  const handleApprove = (id: number) => {
    alert(`Đã duyệt bài id: ${id}`);
    setSelectedItem(null);
  };

  const handleReject = (id: number) => {
    if (!rejectReason) return alert("Vui lòng nhập lý do từ chối");
    alert(`Đã từ chối bài id: ${id} với lý do: ${rejectReason}`);
    setSelectedItem(null);
    setRejectReason("");
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">Duyệt Nội Dung</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border">
          {["PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                activeTab === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab === "PENDING"
                ? "Chờ duyệt"
                : tab === "APPROVED"
                  ? "Đã duyệt"
                  : "Từ chối"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">Nội dung</th>
              <th className="p-4">Giáo viên</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Thời gian gửi</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests
              .filter((r) => r.status === activeTab)
              .map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">{item.title}</td>
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      GV
                    </div>
                    {item.teacher}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        item.type === "LESSON"
                          ? "bg-purple-100 text-purple-700"
                          : item.type === "QUIZ"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{item.submittedAt}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {requests.filter((r) => r.status === activeTab).length === 0 && (
          <div className="p-8 text-center text-slate-400">Không có dữ liệu</div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">
                Duyệt bài: {selectedItem.title}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-slate-200 rounded-full"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Content Simulation */}
              <div className="space-y-4">
                <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                  {selectedItem.type === "VIDEO" ? (
                    <Video size={48} />
                  ) : (
                    <FileText size={48} />
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nội
                  dung bài học sẽ hiển thị đầy đủ ở đây để admin kiểm tra chất
                  lượng...
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                  Lý do từ chối (Nếu có)
                </label>
                <textarea
                  className="w-full border p-3 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-red-100 outline-none"
                  placeholder="Nhập lý do để giáo viên sửa lại..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 font-bold rounded-xl transition shadow-lg shadow-green-200"
                  >
                    Chấp thuận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

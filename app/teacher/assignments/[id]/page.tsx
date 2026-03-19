"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import AssignmentEditor from "@/components/teacher/assignments/AssignmentEditor";
import { Question } from "@/components/teacher/assignments/types";

// Giả lập độ trễ mạng (Network Latency)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getAssignmentById = async (id: string) => {
  await delay(1000); // Giả vờ đợi 1 giây

  // Giả lập: Nếu ID = "error" thì trả về null để test case lỗi
  if (id === "error") return null;

  // Dữ liệu mẫu trả về (Khớp với interface AssignmentEditorProps)
  return {
    info: {
      title: `Bài kiểm tra Unit 1 - Mã đề ${id}`,
      description:
        "Kiểm tra kiến thức từ vựng và ngữ pháp Unit 1. Thời gian làm bài 45 phút.",
      duration: 45,
    },
    questions: [
      {
        id: 101,
        type: "MULTIPLE_CHOICE",
        text: "Từ nào sau đây có nghĩa là 'Quả táo'?",
        points: 2,
        options: [
          { id: 1, text: "Banana", isCorrect: false },
          { id: 2, text: "Apple", isCorrect: true },
          { id: 3, text: "Orange", isCorrect: false },
          { id: 4, text: "Grape", isCorrect: false },
        ],
      },
      {
        id: 102,
        type: "MATCHING",
        text: "Ghép từ vựng với nghĩa tiếng Việt tương ứng:",
        points: 3,
        pairs: [
          { id: 1, left: "Cat", right: "Con mèo" },
          { id: 2, left: "Dog", right: "Con chó" },
          { id: 3, left: "Bird", right: "Con chim" },
        ],
      },
      {
        id: 103,
        type: "ESSAY",
        text: "Viết một đoạn văn ngắn (50 từ) giới thiệu về bản thân em.",
        points: 5,
      },
    ] as Question[],
  };
};
export default function EditAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Gọi API lấy dữ liệu
        const assignmentData = await getAssignmentById(params.id);

        if (!assignmentData) {
          setError("Không tìm thấy bài tập này.");
        } else {
          setData(assignmentData);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // --- TRƯỜNG HỢP 1: ĐANG TẢI ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium">Đang tải dữ liệu bài tập...</p>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: LỖI ---
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-700 mb-1">Lỗi tải trang</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Quay về thư viện
          </button>
        </div>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 3: TẢI XONG -> HIỂN THỊ EDITOR ---
  return (
    <AssignmentEditor
      mode="edit"
      initialData={data} // Truyền dữ liệu cũ vào để Editor hiển thị
    />
  );
}

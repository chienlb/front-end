export type AssignmentStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
export type AssignmentSource = "LIVE_CLASS" | "COURSE" | "SYSTEM";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  source: AssignmentSource;
  sourceName?: string;
  teacher?: string;
  deadline: string;
  /** Timestamp hạn nộp (nếu parse được từ API) — dùng so sánh với thời gian thực */
  deadlineAt?: number | null;
  status: AssignmentStatus;
  score?: number;
  duration?: string;
  priority?: "HIGH" | "NORMAL";
  content?: string;
  requirements?: string[];
  attachmentUrl?: string;
  attachmentName?: string;
  // Dữ liệu hỗ trợ hiển thị theo nhóm học + lesson
  classId?: string;
  className?: string;
  lessonId?: string;
  lessonTitle?: string;
}

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "A1",
    title: "Bài tập thì hiện tại đơn",
    subject: "Ngữ pháp",
    source: "LIVE_CLASS",
    sourceName: "Lớp Tiếng Anh 3A - Cô Lan",
    teacher: "Cô Lan Anh",
    deadline: "Hôm nay, 20:00",
    status: "PENDING",
    duration: "15 phút",
    priority: "HIGH",
    content:
      "Viết 10 câu sử dụng thì hiện tại đơn về thói quen hằng ngày của em. Mỗi câu cần có chủ ngữ, động từ đúng dạng, và dấu câu đầy đủ.",
    requirements: [
      "Nộp 1 file duy nhất (pdf/doc/docx/zip).",
      "Đặt tên file theo mẫu: ho_ten_lop_baitap.pdf",
      "Trình bày rõ ràng, dễ đọc.",
    ],
    attachmentUrl: "/docs/assignment-sample-a1.pdf",
    attachmentName: "De-bai-thi-hien-tai-don.pdf",
  },
  {
    id: "A2",
    title: "Quiz: Video Lesson 5",
    subject: "Nghe hiểu",
    source: "COURSE",
    sourceName: "Khóa học: English for Kids (Level 1)",
    teacher: "Hệ thống",
    deadline: "Không giới hạn",
    status: "PENDING",
    duration: "10 phút",
    priority: "NORMAL",
    content:
      "Xem lại video Lesson 5 và làm bản tóm tắt ngắn các từ khóa chính. Có thể viết tay hoặc đánh máy rồi nộp file.",
    requirements: [
      "Nộp file tóm tắt nội dung (ưu tiên PDF).",
      "Nêu ít nhất 8 từ khóa và 3 câu ví dụ.",
    ],
    attachmentUrl: "/docs/assignment-sample-a2.pdf",
    attachmentName: "Huong-dan-quiz-lesson-5.pdf",
  },
  {
    id: "A3",
    title: "Thử thách từ vựng mỗi ngày",
    subject: "Từ vựng",
    source: "SYSTEM",
    sourceName: "Daily Challenge",
    deadline: "Hôm qua",
    status: "LATE",
    duration: "5 phút",
    priority: "HIGH",
    content:
      "Lập danh sách 20 từ vựng theo chủ đề Animals và viết nghĩa tiếng Việt tương ứng.",
    requirements: [
      "Nộp file danh sách từ vựng.",
      "Nếu quá hạn vẫn có thể nộp để giáo viên xem lại.",
    ],
    attachmentUrl: "/docs/assignment-sample-a3.pdf",
    attachmentName: "Mau-bai-lam-tu-vung.pdf",
  },
  {
    id: "A4",
    title: "Kiểm tra giữa kỳ Unit 1-3",
    subject: "Tổng hợp",
    source: "LIVE_CLASS",
    sourceName: "Lớp Gia sư 1-1",
    teacher: "Thầy John",
    deadline: "10/11/2023",
    status: "GRADED",
    score: 9.5,
    duration: "45 phút",
    content:
      "Bài kiểm tra tổng hợp các kỹ năng ngữ pháp, từ vựng và đọc hiểu trong Unit 1-3.",
    requirements: ["Đã chấm điểm, xem lại để rút kinh nghiệm."],
  },
];


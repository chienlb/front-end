export interface Question {
  id: string;
  text: string;
  options: string[]; // Danh sách đáp án A, B, C, D
  correctAnswer: number; // Index của đáp án đúng (0, 1, 2...)
  point: number; // Điểm số của câu này
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number; // Thời gian làm bài
  passingScore: number; // Điểm đạt
  questions: Question[];
}

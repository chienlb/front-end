export type MaterialType = "PDF" | "VIDEO" | "LINK" | "DOC";
export type ExerciseType = "QUIZ" | "GAME" | "SPEAKING";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  url: string;
  size?: string;
}

export interface Exercise {
  id: string;
  title: string;
  type: ExerciseType;
  questionsCount: number;
  completedCount: number;
  totalStudents: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: "LIVE" | "VIDEO" | "EXAM";
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  startTime?: string;
  duration?: string;
  meetingLink?: string;
  recordingUrl?: string;
  materials: Material[];
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

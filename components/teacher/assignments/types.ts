export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "ESSAY"
  | "MATCHING"
  | "SPEAKING";

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Pair {
  id: number;
  left: string;
  right: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  points: number;
  options?: Option[];
  pairs?: Pair[];
  audioText?: string;
}

export interface AssignmentInfo {
  title: string;
  description: string;
  duration: number;
}

export interface QuestionFormState {
  _id: string;
  type: string;
  topic: string;
  topicImage?: string;
  level: number;
  content: string;
  mediaUrl: string;
  options: string[];
  correctAnswer: string;
  pairs: { left: string; right: string }[];
  rewardGold: number; // Thưởng vàng
  rewardXP: number; // Thưởng XP
}

export interface SubFormProps {
  form: QuestionFormState;
  setForm: (form: QuestionFormState) => void;
}

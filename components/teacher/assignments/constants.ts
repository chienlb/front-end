import { CheckCircle, FileText, Shuffle, Mic } from "lucide-react";

export const TYPE_CONFIG = {
  MULTIPLE_CHOICE: {
    label: "Trắc nghiệm",
    color: "border-orange-500",
    bg: "bg-orange-50",
    icon: CheckCircle,
    text: "text-orange-600",
  },
  ESSAY: {
    label: "Tự luận",
    color: "border-blue-500",
    bg: "bg-blue-50",
    icon: FileText,
    text: "text-blue-600",
  },
  MATCHING: {
    label: "Ghép nối",
    color: "border-purple-500",
    bg: "bg-purple-50",
    icon: Shuffle,
    text: "text-purple-600",
  },
  SPEAKING: {
    label: "Phát âm",
    color: "border-pink-500",
    bg: "bg-pink-50",
    icon: Mic,
    text: "text-pink-600",
  },
};

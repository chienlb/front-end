import { LucideIcon } from "lucide-react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export default function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
        ${
          active
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
        }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

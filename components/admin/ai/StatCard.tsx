import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color: string; 
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-1">{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-2 py-0.5 rounded">
        {sub}
      </p>
    </div>
  );
}
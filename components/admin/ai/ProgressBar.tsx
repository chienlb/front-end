interface ProgressBarProps {
  label: string;
  percent: number;
  color: string;
}

export default function ProgressBar({
  label,
  percent,
  color,
}: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

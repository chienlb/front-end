import {
  DollarSign,
  Cpu,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";
import ProgressBar from "./ProgressBar";

// --- MOCK DATA FOR CHART ---
const COST_DATA = [
  { date: "01/10", cost: 12.5 },
  { date: "05/10", cost: 18.2 },
  { date: "10/10", cost: 15.0 },
  { date: "15/10", cost: 22.4 },
  { date: "20/10", cost: 28.6 },
  { date: "25/10", cost: 25.1 },
  { date: "30/10", cost: 35.8 },
];

interface DashboardViewProps {
  stats: {
    totalCost: number;
    totalRequests: number;
    errorRate: number;
    creditsRemaining: number;
  };
}

export default function DashboardView({ stats }: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. KPI CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Chi phí tháng này"
          value={`$${stats.totalCost}`}
          sub="Tăng 12% so với tháng trước"
          icon={DollarSign}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Tổng Request"
          value={stats.totalRequests.toLocaleString()}
          sub="Trung bình 400 req/ngày"
          icon={Cpu}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Tỉ lệ lỗi"
          value={`${stats.errorRate}%`}
          sub="Hệ thống ổn định"
          icon={AlertTriangle}
          color="text-orange-600 bg-orange-50"
        />
        <StatCard
          label="Ngân sách còn lại"
          value={`$${stats.creditsRemaining}`}
          sub="Dự kiến hết trong 20 ngày"
          icon={CreditCard}
          color="text-purple-600 bg-purple-50"
        />
      </div>

      {/* 2. CHARTS & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Cost Trend using Recharts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[320px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Biểu đồ chi phí (30 ngày)
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="font-medium text-green-600">+8.5%</span> so với
                tháng trước
              </p>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="flex-1 w-full h-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={COST_DATA}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
                  formatter={(value: number) => [`$${value}`, "Chi phí"]}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCost)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-1">
            Phân bổ chi phí
          </h3>
          <p className="text-sm text-slate-500 mb-6">Theo tính năng sử dụng</p>

          <div className="space-y-6 flex-1">
            <ProgressBar
              label="Chấm điểm tự động (GPT-4)"
              percent={60}
              color="bg-indigo-600"
            />
            <ProgressBar
              label="Trợ lý ảo Chat (GPT-3.5)"
              percent={30}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Tạo nội dung bài học (Gemini)"
              percent={10}
              color="bg-emerald-500"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Tổng ước tính cuối tháng</span>
              <span className="font-black text-slate-800">$68.50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

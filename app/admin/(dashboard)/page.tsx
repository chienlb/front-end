"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CreditCard,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
  Users,
  UserPlus,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { downloadDashboardExcel } from "@/lib/export-dashboard-excel";

function pickArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const keys = ["data", "items", "results", "rows", "list", "payments", "users"];
  for (const key of keys) {
    if (Array.isArray(raw[key])) return raw[key];
    if (raw[key] && typeof raw[key] === "object") {
      const nested = pickArray(raw[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function pickNumber(raw: any, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const v = raw?.[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return fallback;
}

function formatMoney(value: number, currency = "VND") {
  const safeCurrency = String(currency || "VND").toUpperCase();
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: safeCurrency === "USD" ? "USD" : "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactNumber(value: number) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

type DashboardState = {
  dashboardData: any;
  revenueData: any;
  userActivity: any;
  unitStatistics: any;
  groupStatistics: any;
  recentPayments: any[];
  recentUsers: any[];
  revenueByMonth: any[];
  userByMonth: any[];
};

const EMPTY_STATE: DashboardState = {
  dashboardData: {},
  revenueData: {},
  userActivity: {},
  unitStatistics: {},
  groupStatistics: {},
  recentPayments: [],
  recentUsers: [],
  revenueByMonth: [],
  userByMonth: [],
};

export default function AdminDashboardPage() {
  const [state, setState] = useState<DashboardState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        dashboardData,
        revenueData,
        userActivity,
        unitStatistics,
        groupStatistics,
        recentPayments,
        recentUsers,
        revenueByMonth,
        userByMonth,
      ] = await Promise.all([
        adminService.getDashboardData(),
        adminService.getRevenueData(),
        adminService.getUserActivity(),
        adminService.getUnitStatistics(),
        adminService.getGroupStatistics(),
        adminService.getRecentPayments(),
        adminService.getRecentUsers(),
        adminService.getRevenueByMonth(),
        adminService.getUserByMonth(),
      ]);

      setState({
        dashboardData,
        revenueData,
        userActivity,
        unitStatistics,
        groupStatistics,
        recentPayments: pickArray(recentPayments),
        recentUsers: pickArray(recentUsers),
        revenueByMonth: pickArray(revenueByMonth),
        userByMonth: pickArray(userByMonth),
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không tải được dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = useMemo(() => {
    const totalRevenue = pickNumber(state.revenueData, ["totalRevenue", "revenue", "amount"]);
    const totalUsers = pickNumber(state.dashboardData, ["totalUsers", "users", "userCount"]);
    const activeUsers = pickNumber(state.userActivity, ["activeUsers", "active", "online"]);
    const totalUnits = pickNumber(state.unitStatistics, ["totalUnits", "units", "count"]);
    const totalGroups = pickNumber(state.groupStatistics, ["totalGroups", "groups", "count"]);
    return { totalRevenue, totalUsers, activeUsers, totalUnits, totalGroups };
  }, [state]);

  const chartData = useMemo(() => {
    const revenueMap = new Map<string, number>();
    const userMap = new Map<string, number>();

    for (const row of state.revenueByMonth) {
      const key = String(row?.month || row?.name || row?.label || "N/A");
      revenueMap.set(
        key,
        pickNumber(row, ["revenue", "value", "amount", "totalRevenue"], 0),
      );
    }
    for (const row of state.userByMonth) {
      const key = String(row?.month || row?.name || row?.label || "N/A");
      userMap.set(key, pickNumber(row, ["users", "totalUsers", "value", "count"], 0));
    }

    const keys = Array.from(new Set([...revenueMap.keys(), ...userMap.keys()]));
    return keys.map((month) => ({
      month,
      revenue: revenueMap.get(month) ?? 0,
      users: userMap.get(month) ?? 0,
    }));
  }, [state.revenueByMonth, state.userByMonth]);

  const userLookup = useMemo(() => {
    const map = new Map<string, any>();
    for (const u of state.recentUsers) {
      const id = String(u?._id ?? u?.id ?? u?.userId ?? "").trim();
      if (id) map.set(id, u);
    }
    return map;
  }, [state.recentUsers]);

  const successfulPayments = useMemo(() => {
    return state.recentPayments
      .filter((row: any) => {
        const status = String(row?.status ?? "").toLowerCase();
        return status === "success" || status === "succeeded" || status === "paid";
      })
      .sort((a: any, b: any) => {
        const ta = new Date(a?.paidAt || a?.createdAt || 0).getTime();
        const tb = new Date(b?.paidAt || b?.createdAt || 0).getTime();
        return tb - ta;
      });
  }, [state.recentPayments]);

  const getPaymentUserLabel = (row: any) => {
    const directName = row?.user?.fullName || row?.user?.name || row?.userName;
    if (directName) return String(directName);

    const userIdField = row?.userId;
    if (userIdField && typeof userIdField === "object") {
      return (
        userIdField?.fullName ||
        userIdField?.name ||
        userIdField?.email ||
        String(userIdField?._id || userIdField?.id || "N/A")
      );
    }

    const uid = String(
      userIdField ?? row?.user?._id ?? row?.user?.id ?? row?.studentId ?? "",
    ).trim();
    if (!uid) return row?.email || "N/A";

    const user = userLookup.get(uid);
    if (!user) return row?.email || uid;
    return (
      user?.fullName ||
      user?.name ||
      user?.email ||
      user?.username ||
      row?.email ||
      uid
    );
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    const date = new Date().toISOString().slice(0, 10);
    const defaultFileName = `admin-dashboard-${date}.xlsx`;

    const runClientExport = () => {
      downloadDashboardExcel({
        fileName: defaultFileName,
        kpis,
        monthly: chartData,
        users: state.recentUsers.map((u: any) => ({
          id: String(u?._id || u?.id || u?.userId || ""),
          name: String(u?.fullName || u?.name || u?.email || "Người dùng"),
          email: String(u?.email || ""),
          role: String(u?.role?.name ?? u?.role ?? "N/A"),
          status: String(u?.status || u?.accountStatus || "N/A"),
          phone: String(u?.phone || u?.phoneNumber || ""),
          createdAt: u?.createdAt
            ? new Date(u.createdAt).toLocaleString("vi-VN")
            : "N/A",
        })),
        payments: successfulPayments.map((row: any) => ({
          paymentId: String(
            row?._id ||
              row?.id ||
              row?.paymentId ||
              row?.orderId ||
              row?.transactionId ||
              "",
          ),
          user: getPaymentUserLabel(row),
          amount: pickNumber(row, ["amount", "totalAmount", "value"]),
          currency: String(row?.currency || "VND"),
          method: String(row?.paymentMethod || row?.method || "N/A"),
          status: String(row?.status || "N/A"),
          time:
            row?.paidAt || row?.createdAt
              ? new Date(row.paidAt || row.createdAt).toLocaleString("vi-VN")
              : "N/A",
          note: String(row?.note || row?.description || row?.packageName || ""),
        })),
      });
    };

    try {
      // Ưu tiên xuất trực tiếp từ dữ liệu dashboard đang hiển thị để luôn có file.
      runClientExport();
    } catch (e: any) {
      setError(e?.message || "Xuất file thất bại");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            <Sparkles size={14} /> Bảng điều khiển trung tâm
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Dashboard Quản trị
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tổng quan doanh thu, người dùng, bài học và nhóm học.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDashboard}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 flex items-center gap-2 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2 shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
          >
            <Download size={16} /> {exporting ? "Đang xuất file..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          {
            label: "Tổng doanh thu",
            value: formatMoney(kpis.totalRevenue),
            icon: CreditCard,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Tổng người dùng",
            value: kpis.totalUsers,
            icon: Users,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
          },
          {
            label: "Người dùng hoạt động",
            value: kpis.activeUsers,
            icon: Activity,
            iconColor: "text-violet-600",
            iconBg: "bg-violet-100",
          },
          {
            label: "Tổng unit",
            value: kpis.totalUnits,
            icon: Layers,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100",
          },
          {
            label: "Tổng nhóm học",
            value: kpis.totalGroups,
            icon: UserPlus,
            iconColor: "text-rose-600",
            iconBg: "bg-rose-100",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <span className={`w-9 h-9 rounded-xl grid place-items-center ${item.iconBg}`}>
                <item.icon size={17} className={item.iconColor} />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Doanh thu và người dùng theo tháng
          </h2>
          <div className="h-80">
            {loading ? (
              <div className="h-full grid place-items-center text-sm text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-slate-500">
                Chưa có dữ liệu biểu đồ
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 8, bottom: 12 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    minTickGap={20}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => formatCompactNumber(Number(value))}
                    width={56}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => formatCompactNumber(Number(value))}
                    width={42}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <Tooltip
                    wrapperStyle={{ zIndex: 20 }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
                      background: "rgba(255,255,255,0.96)",
                    }}
                  />
                  <Legend verticalAlign="top" height={30} iconType="circle" />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                    name="Doanh thu"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#7c3aed" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Người dùng"
                    dot={{ r: 2, strokeWidth: 0, fill: "#f97316" }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#f97316" }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    stroke="transparent"
                    fill="url(#userGradient)"
                    fillOpacity={0.5}
                    legendType="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
            Người dùng mới gần đây
          </h2>
          <div className="space-y-3 max-h-72 overflow-auto">
            {state.recentUsers.length === 0 ? (
              <p className="text-sm text-slate-500">Không có dữ liệu</p>
            ) : (
              state.recentUsers.slice(0, 10).map((u: any, idx) => (
                <div
                  key={u?._id || u?.id || idx}
                  className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {u?.fullName || u?.name || u?.email || "Người dùng"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {u?.email || "Không có email"} - {u?.role?.name || u?.role || "N/A"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Thanh toán gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2.5">Người dùng</th>
                <th className="py-2.5">Số tiền</th>
                <th className="py-2.5">Phương thức</th>
                <th className="py-2.5">Trạng thái</th>
                <th className="py-2.5">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {successfulPayments.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                successfulPayments.slice(0, 10).map((row: any, idx) => (
                  <tr
                    key={row?._id || row?.id || idx}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2 text-slate-800">
                      {getPaymentUserLabel(row)}
                    </td>
                    <td className="py-2 text-slate-800">
                      {formatMoney(
                        pickNumber(row, ["amount", "totalAmount", "value"]),
                        row?.currency || "VND",
                      )}
                    </td>
                    <td className="py-2 text-slate-600">
                      {row?.paymentMethod || row?.method || "N/A"}
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {row?.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-600">
                      {(row?.paidAt || row?.createdAt)
                        ? new Date(row?.paidAt || row?.createdAt).toLocaleString("vi-VN")
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

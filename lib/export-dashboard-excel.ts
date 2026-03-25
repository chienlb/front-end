import * as XLSX from "xlsx";

export type DashboardExcelKpis = {
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  totalUnits: number;
  totalGroups: number;
};

export type DashboardExcelMonthlyRow = {
  month: string;
  revenue: number;
  users: number;
};

export type DashboardExcelUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  createdAt: string;
};

export type DashboardExcelPaymentRow = {
  paymentId: string;
  user: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  time: string;
  note: string;
};

function formatMoneyCell(value: number, currency = "VND") {
  const safe = String(currency || "VND").toUpperCase();
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: safe === "USD" ? "USD" : "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function autoFitColumns(rows: Record<string, unknown>[]) {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    let width = key.length;
    for (const row of rows) {
      const text = String(row[key] ?? "");
      width = Math.max(width, text.length);
    }
    return { wch: Math.min(Math.max(width + 2, 12), 42) };
  });
}

/**
 * Tạo file .xlsx từ dữ liệu dashboard đang hiển thị (không phụ thuộc API export).
 */
export function downloadDashboardExcel(params: {
  kpis: DashboardExcelKpis;
  monthly: DashboardExcelMonthlyRow[];
  users: DashboardExcelUserRow[];
  payments: DashboardExcelPaymentRow[];
  fileName?: string;
}) {
  const { kpis, monthly, users, payments } = params;
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const fileName = params.fileName ?? `admin-dashboard-${date}.xlsx`;

  const wb = XLSX.utils.book_new();

  const reportRows = [
    { "Thuộc tính": "Tên báo cáo", "Giá trị": "Dashboard quản trị" },
    { "Thuộc tính": "Ngày xuất", "Giá trị": now.toLocaleString("vi-VN") },
    { "Thuộc tính": "Nguồn", "Giá trị": "Client dashboard fallback export" },
    { "Thuộc tính": "Tổng số dòng người dùng", "Giá trị": users.length },
    { "Thuộc tính": "Tổng số dòng thanh toán", "Giá trị": payments.length },
  ];
  const wsReport = XLSX.utils.json_to_sheet(reportRows);
  wsReport["!cols"] = autoFitColumns(reportRows);
  wsReport["!autofilter"] = { ref: "A1:B1" };
  XLSX.utils.book_append_sheet(wb, wsReport, "Thông tin báo cáo");

  const overviewRows = [
    {
      "Chỉ số": "Tổng doanh thu",
      "Giá trị số": kpis.totalRevenue,
      "Giá trị hiển thị": formatMoneyCell(kpis.totalRevenue),
    },
    { "Chỉ số": "Tổng người dùng", "Giá trị số": kpis.totalUsers, "Giá trị hiển thị": kpis.totalUsers },
    {
      "Chỉ số": "Người dùng hoạt động",
      "Giá trị số": kpis.activeUsers,
      "Giá trị hiển thị": kpis.activeUsers,
    },
    { "Chỉ số": "Tổng unit", "Giá trị số": kpis.totalUnits, "Giá trị hiển thị": kpis.totalUnits },
    { "Chỉ số": "Tổng nhóm học", "Giá trị số": kpis.totalGroups, "Giá trị hiển thị": kpis.totalGroups },
  ];
  const wsOverview = XLSX.utils.json_to_sheet(overviewRows);
  wsOverview["!cols"] = autoFitColumns(overviewRows);
  wsOverview["!autofilter"] = { ref: "A1:C1" };
  XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");

  const monthlyRows = monthly.map((r) => ({
    Tháng: r.month,
    "Doanh thu": r.revenue,
    "Doanh thu hiển thị": formatMoneyCell(r.revenue),
    "Người dùng": r.users,
  }));
  const wsMonthly = XLSX.utils.json_to_sheet(
    monthlyRows.length
      ? monthlyRows
      : [{ Tháng: "", "Doanh thu": "", "Doanh thu hiển thị": "", "Người dùng": "" }],
  );
  wsMonthly["!cols"] = autoFitColumns(
    monthlyRows.length
      ? monthlyRows
      : [{ Tháng: "", "Doanh thu": "", "Doanh thu hiển thị": "", "Người dùng": "" }],
  );
  wsMonthly["!autofilter"] = { ref: "A1:D1" };
  XLSX.utils.book_append_sheet(wb, wsMonthly, "Theo tháng");

  const userRows = users.map((u) => ({
    ID: u.id,
    "Họ tên": u.name,
    Email: u.email,
    "Vai trò": u.role,
    "Trạng thái": u.status,
    "Số điện thoại": u.phone,
    "Thời gian tạo": u.createdAt,
  }));
  const wsUsers = XLSX.utils.json_to_sheet(
    userRows.length
      ? userRows
      : [
          {
            ID: "",
            "Họ tên": "",
            Email: "",
            "Vai trò": "",
            "Trạng thái": "",
            "Số điện thoại": "",
            "Thời gian tạo": "",
          },
        ],
  );
  wsUsers["!cols"] = autoFitColumns(
    userRows.length
      ? userRows
      : [
          {
            ID: "",
            "Họ tên": "",
            Email: "",
            "Vai trò": "",
            "Trạng thái": "",
            "Số điện thoại": "",
            "Thời gian tạo": "",
          },
        ],
  );
  wsUsers["!autofilter"] = { ref: "A1:G1" };
  XLSX.utils.book_append_sheet(wb, wsUsers, "Người dùng mới");

  const paymentRows = payments.map((p) => ({
    "Mã giao dịch": p.paymentId,
    "Người dùng": p.user,
    "Số tiền số": p.amount,
    "Số tiền": formatMoneyCell(p.amount, p.currency),
    "Tiền tệ": p.currency,
    "Phương thức": p.method,
    "Trạng thái": p.status,
    "Thời gian": p.time,
    "Ghi chú": p.note,
  }));
  const wsPay = XLSX.utils.json_to_sheet(
    paymentRows.length
      ? paymentRows
      : [
          {
            "Mã giao dịch": "",
            "Người dùng": "",
            "Số tiền số": "",
            "Số tiền": "",
            "Tiền tệ": "",
            "Phương thức": "",
            "Trạng thái": "",
            "Thời gian": "",
            "Ghi chú": "",
          },
        ],
  );
  wsPay["!cols"] = autoFitColumns(
    paymentRows.length
      ? paymentRows
      : [
          {
            "Mã giao dịch": "",
            "Người dùng": "",
            "Số tiền số": "",
            "Số tiền": "",
            "Tiền tệ": "",
            "Phương thức": "",
            "Trạng thái": "",
            "Thời gian": "",
            "Ghi chú": "",
          },
        ],
  );
  wsPay["!autofilter"] = { ref: "A1:I1" };
  XLSX.utils.book_append_sheet(wb, wsPay, "Thanh toán");

  XLSX.writeFile(wb, fileName);
}

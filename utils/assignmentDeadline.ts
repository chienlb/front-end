/** Parse deadline từ API (ISO, timestamp s/ms, hoặc chuỗi Date.parse được). */
export function parseAssignmentDeadline(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") {
    const ms = raw < 1e12 ? raw * 1000 : raw;
    const t = new Date(ms).getTime();
    return Number.isNaN(t) ? null : t;
  }
  const s = String(raw).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (
    lower.includes("chưa có") ||
    lower.includes("không giới hạn") ||
    lower === "-"
  ) {
    return null;
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return t;
  return null;
}

/** Hiển thị: 01/04/2026, 23:59 */
export function formatDeadlineVi(ms: number): string {
  return new Date(ms).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function deadlineDisplayLabel(
  raw: unknown,
  deadlineAt: number | null,
): string {
  if (deadlineAt != null) return formatDeadlineVi(deadlineAt);
  const s = String(raw ?? "").trim();
  return s || "Chưa có hạn nộp";
}

/** Đã nộp / đã chấm → không khóa xem; chỉ khóa nộp khi quá hạn và chưa hoàn thành. */
export function isAssignmentSubmitLocked(
  deadlineAt: number | null,
  status: string,
): boolean {
  const done = status === "SUBMITTED" || status === "GRADED";
  if (done) return false;
  if (deadlineAt == null) return false;
  return Date.now() > deadlineAt;
}

export function isAssignmentOverdue(
  deadlineAt: number | null,
  status: string,
): boolean {
  const done = status === "SUBMITTED" || status === "GRADED";
  if (done) return false;
  if (deadlineAt == null) return false;
  return Date.now() > deadlineAt;
}

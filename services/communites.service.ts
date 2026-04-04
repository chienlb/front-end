import api from "@/utils/api";

/** Backend Heroku — upload thường dùng chung origin (điều chỉnh nếu API của bạn khác) */
export const COMMUNITE_API_ORIGIN =
  "https://teach-english-3786e536fe68.herokuapp.com";

/**
 * Phản hồi GET /communites có thể là:
 * - mảng gốc: `[{ _id, content, ... }]`
 * - hoặc bọc: `{ data: [...] }`, `{ communites: [...] }`, v.v.
 */
export function parseCommunitesList(raw: unknown): any[] {
  if (raw == null) return [];
  /** Một số server trả body dạng text/json — axios không parse → raw là string */
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    try {
      return parseCommunitesList(JSON.parse(s));
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object") return [];

  const res = raw as Record<string, unknown>;
  const tryKeys = [
    "data",
    "communites",
    "communities",
    "items",
    "docs",
    "results",
    "result",
    "list",
    "records",
    "rows",
    "payload",
  ];

  for (const key of tryKeys) {
    const v = res[key];
    if (Array.isArray(v)) return v;
  }

  if (Array.isArray((res as any)?.data?.data)) return (res as any).data.data;
  if (Array.isArray((res as any)?.data?.communites))
    return (res as any).data.communites;
  if (Array.isArray((res as any)?.data?.communities))
    return (res as any).data.communities;
  if (Array.isArray((res as any)?.data?.docs)) return (res as any).data.docs;

  if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    const nested = parseCommunitesList(res.data);
    if (nested.length > 0) return nested;
  }

  return [];
}

/** POST/PATCH trả về có thể bọc { data: document } */
export function unwrapCommuniteDoc(raw: any): any {
  if (raw == null) return raw;
  const d = raw?.data ?? raw?.communite ?? raw?.payload;
  if (d && typeof d === "object" && !Array.isArray(d)) return d;
  return raw;
}

export function communiteImageUrl(image?: string | null): string {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${COMMUNITE_API_ORIGIN}/uploads/${image}`;
}

/**
 * Body giống Postman: Body → form-data
 * - `content`: Text (chuỗi)
 * - `file`: File (ảnh), optional — tên field phải là `file` (trùng FileInterceptor('file'))
 * Nest/class-validator cần `content` là string → luôn append bằng String().
 */
function appendMultipartCommuniteBody(
  formData: FormData,
  content: string,
  file?: File | null,
) {
  const text = String((content ?? "").trim() || " ");
  formData.append("content", text);
  if (file) formData.append("file", file);
}

export const communitesService = {
  /** GET /communites — luôn trả về mảng bài viết */
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get("/communites", { params });
    return parseCommunitesList(res);
  },

  /** GET /communites/:id */
  getOne: async (id: string) => {
    return api.get(`/communites/${id}`);
  },

  /**
   * GET /communites/:user/fullname — trả về chuỗi hiển thị (username / fullname tùy backend).
   * Khớp @Get(':user/fullname') trên CommunitesController.
   */
  getFullname: async (userId: string): Promise<string> => {
    const res: any = await api.get(
      `/communites/${encodeURIComponent(userId)}/fullname`,
    );
    if (typeof res === "string") return res.trim();
    if (res != null && typeof res === "object") {
      const s = res.data ?? res.fullname ?? res.fullName ?? res.name;
      if (typeof s === "string") return s.trim();
    }
    return String(res ?? "").trim();
  },

  /**
   * POST /communites — multipart: `content` + optional `file`.
   * Không gửi userId (server gán từ JWT).
   * Không set Content-Type thủ công — axios/browser gắn boundary cho FormData.
   */
  create: async (payload: { content: string; file?: File | null }) => {
    const formData = new FormData();
    appendMultipartCommuniteBody(formData, payload.content, payload.file);
    return api.post("/communites", formData);
  },

  /** PATCH /communites/:id — JSON (chỉ đổi nội dung) */
  update: async (id: string, data: Record<string, unknown>) => {
    return api.patch(`/communites/${id}`, data);
  },

  /**
   * Cập nhật bài: có file mới → multipart giống create; không → JSON { content }.
   */
  updatePost: async (
    id: string,
    payload: { content: string; file?: File | null },
  ) => {
    if (payload.file) {
      const formData = new FormData();
      appendMultipartCommuniteBody(formData, payload.content, payload.file);
      return api.patch(`/communites/${id}`, formData);
    }
    return api.patch(`/communites/${id}`, {
      content: String((payload.content ?? "").trim() || " "),
    });
  },

  /** DELETE /communites/:id */
  remove: async (id: string) => {
    return api.delete(`/communites/${id}`);
  },

  /**
   * POST /communites/:id/comment — luôn multipart: `content` + optional `file`
   * (khớp Nest: FileInterceptor('file') trên route comment).
   */
  comment: async (
    id: string,
    payload: { content: string; file?: File | null },
  ) => {
    const formData = new FormData();
    appendMultipartCommuniteBody(formData, payload.content, payload.file);
    return api.post(`/communites/${id}/comment`, formData);
  },

  /** POST /communites/:id/like */
  like: async (id: string) => {
    return api.post(`/communites/${id}/like`);
  },
};

import api from "@/utils/api";

type CreateGroupPayload = {
  groupName: string;
  description?: string;
  type: "class" | "subject" | "custom";
  visibility: "public" | "private" | "hidden";
  owner?: string;
  members?: string[];
};

export const groupsService = {
  // POST /groups/admin/create (multipart): payload + avatar/background file upload
  // Fallback: POST /groups
  createGroup: async (
    payload: CreateGroupPayload,
    files?: { avatar?: File | null; background?: File | null },
  ) => {
    const hasFiles = Boolean(files?.avatar || files?.background);
    const normalizedPayload: Record<string, any> = {
      groupName: String(payload.groupName || "").trim(),
      type: payload.type,
      visibility: payload.visibility,
    };
    if (payload.description?.trim()) normalizedPayload.description = payload.description.trim();
    if (payload.owner?.trim()) normalizedPayload.owner = payload.owner.trim();
    if (Array.isArray(payload.members)) {
      normalizedPayload.members = payload.members
        .map((m) => String(m || "").trim())
        .filter(Boolean);
    }

    let body: any = normalizedPayload;
    if (hasFiles) {
      const fd = new FormData();
      Object.entries(normalizedPayload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => fd.append(key, String(v)));
        } else {
          fd.append(key, String(value));
        }
      });
      if (files?.avatar) fd.append("avatar", files.avatar);
      if (files?.background) fd.append("background", files.background);
      body = fd;
    }

    try {
      return await api.post("/groups/admin/create", body);
    } catch {
      return api.post("/groups", body);
    }
  },

  // Admin endpoint:
  // - GET /groups
  getAllGroupsForAdmin: async (params?: { page?: number; limit?: number }) => {
    const { page = 1, limit = 100 } = params ?? {};
    return api.get("/groups", { params: { page, limit } });
  },

  // Lấy toàn bộ group cho admin (gom qua nhiều trang)
  getAllGroupsForAdminAll: async (params?: { limit?: number; maxPages?: number }) => {
    const limit = Math.max(1, params?.limit ?? 100);
    const maxPages = Math.max(1, params?.maxPages ?? 50);

    const collectItems = (payload: any): any[] => {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== "object") return [];
      const keys = ["items", "data", "results", "docs", "rows", "groups"];
      for (const key of keys) {
        if (Array.isArray(payload[key])) return payload[key];
      }
      for (const key of ["data", "result", "payload"]) {
        const nested = payload[key];
        if (!nested || typeof nested !== "object") continue;
        for (const k of keys) {
          if (Array.isArray(nested[k])) return nested[k];
        }
      }
      return [];
    };

    const all: any[] = [];
    let page = 1;

    while (page <= maxPages) {
      const res: any = await api.get("/groups", { params: { page, limit } });
      const payload = res?.data ?? res;
      const items = collectItems(payload);

      if (!items.length) break;
      all.push(...items);

      const totalPages = Number(
        payload?.totalPages ?? payload?.data?.totalPages ?? payload?.meta?.totalPages ?? 0,
      );
      const hasNextPage = Boolean(
        payload?.hasNextPage ?? payload?.data?.hasNextPage ?? payload?.meta?.hasNextPage,
      );

      if (totalPages > 0) {
        if (page >= totalPages) break;
      } else if (!hasNextPage && items.length < limit) {
        break;
      }

      page += 1;
    }

    return { data: { items: all } };
  },

  // Backend từ bạn paste:
  // - GET /groups/name/:groupName
  searchGroups: async (params: { keyword?: string }) => {
    const groupName = params.keyword?.trim();
    if (!groupName) return { data: { items: [] } };
    return api.get(`/groups/name/${encodeURIComponent(groupName)}`);
  },

  // Backend:
  // - GET /groups/join-code/:joinCode
  getGroupByJoinCode: async (joinCode: string) => {
    const code = joinCode.trim();
    return api.get(`/groups/join-code/${encodeURIComponent(code)}`);
  },

  // Backend:
  // - GET /groups/:id
  getGroupById: async (id: string) => {
    return api.get(`/groups/${encodeURIComponent(id.trim())}`);
  },

  // Backend:
  // - PUT /groups/:id
  updateGroup: async (id: string, payload: Record<string, any>) => {
    return api.put(`/groups/${encodeURIComponent(id.trim())}`, payload);
  },

  // Khóa nhóm (set isActive = false)
  lockGroup: async (id: string) => {
    return api.put(`/groups/${encodeURIComponent(id.trim())}`, { isActive: false });
  },

  // Mở khóa nhóm (ưu tiên update, fallback restore)
  unlockGroup: async (id: string) => {
    try {
      return await api.put(`/groups/${encodeURIComponent(id.trim())}`, { isActive: true });
    } catch {
      return api.post(`/groups/${encodeURIComponent(id.trim())}/restore`, {});
    }
  },

  // Backend:
  // - POST /groups/:groupId/join
  joinGroup: async (groupId: string) => {
    const id = groupId.trim();
    // Controller tự lấy userId từ JWT, nên body không cần thiết.
    return api.post(`/groups/${encodeURIComponent(id)}/join`, {});
  },

  // Backend:
  // - POST /groups/join-code/:joinCode
  joinByInvitationCode: async (code: string) => {
    const joinCode = code.trim();
    return api.post(
      `/groups/join-code/${encodeURIComponent(joinCode)}`,
      {},
    );
  },

  // Backend endpoint (theo bạn cung cấp):
  // GET /groups/user  -> danh sách group của user hiện tại
  getMyGroups: async (params?: { page?: number; limit?: number }) => {
    const { page = 1, limit = 50 } = params ?? {};
    try {
      return await api.get("/groups/user", {
        params: { page, limit },
      });
    } catch {
      try {
        return await api.get("/groups/user/get-all-groups");
      } catch {
        return api.get("/groups", {
          params: { page, limit },
        });
      }
    }
  },

  // Lấy toàn bộ group của user hiện tại (gom qua nhiều trang)
  getMyGroupsAll: async (params?: { limit?: number; maxPages?: number }) => {
    const limit = Math.max(1, params?.limit ?? 100);
    const maxPages = Math.max(1, params?.maxPages ?? 50);

    const collectItems = (payload: any): any[] => {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== "object") return [];
      const keys = ["items", "data", "results", "docs", "rows", "groups"];
      for (const key of keys) {
        if (Array.isArray(payload[key])) return payload[key];
      }
      for (const key of ["data", "result", "payload"]) {
        const nested = payload[key];
        if (!nested || typeof nested !== "object") continue;
        for (const k of keys) {
          if (Array.isArray(nested[k])) return nested[k];
        }
      }
      return [];
    };

    const all: any[] = [];
    let page = 1;
    let pageRequestFailed = false;

    while (page <= maxPages) {
      let payload: any = null;
      try {
        const res: any = await api.get("/groups/user", { params: { page, limit } });
        payload = res?.data ?? res;
      } catch {
        pageRequestFailed = true;
        break;
      }

      const items = collectItems(payload);

      if (!items.length) break;
      all.push(...items);

      const totalPages = Number(
        payload?.totalPages ?? payload?.data?.totalPages ?? payload?.meta?.totalPages ?? 0,
      );
      const hasNextPage = Boolean(
        payload?.hasNextPage ?? payload?.data?.hasNextPage ?? payload?.meta?.hasNextPage,
      );

      if (totalPages > 0) {
        if (page >= totalPages) break;
      } else if (!hasNextPage && items.length < limit) {
        break;
      }

      page += 1;
    }

    if (all.length === 0 || pageRequestFailed) {
      try {
        const r1: any = await api.get("/groups/user/get-all-groups");
        const p1 = r1?.data ?? r1;
        const i1 = collectItems(p1);
        if (i1.length) {
          return { data: { items: i1 } };
        }
      } catch {
        // fallback tiếp
      }

      try {
        const r2: any = await api.get("/groups/user", { params: { page: 1, limit } });
        const p2 = r2?.data ?? r2;
        const i2 = collectItems(p2);
        if (i2.length) {
          return { data: { items: i2 } };
        }
      } catch {
        // fallback cuối
      }
    }

    return { data: { items: all } };
  },

  // Backend endpoint bạn vừa cung cấp:
  // GET /groups/user/members -> danh sách học viên trong nhóm của giáo viên hiện tại
  getMyGroupMembers: async (params?: { page?: number; limit?: number }) => {
    const { page = 1, limit = 100 } = params ?? {};
    return api.get("/groups/user/members", {
      params: { page, limit },
    });
  },

  // Backend endpoint mới (controller bạn cung cấp):
  // GET /groups/user/get-all-groups
  getAllGroupsForTeacher: async () => {
    return api.get("/groups/user/get-all-groups");
  },

  // Backend endpoint mới (controller bạn cung cấp):
  // GET /groups/user/get-all-members
  getAllMembersInTeacherGroups: async () => {
    return api.get("/groups/user/get-all-members");
  },

  // Backend endpoint mới (controller bạn cung cấp):
  // GET /groups/user/get-all-members/:groupId
  getAllMembersInGroupForTeacher: async (groupId: string) => {
    return api.get(`/groups/user/get-all-members/${encodeURIComponent(groupId.trim())}`);
  },
};


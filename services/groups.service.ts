import api from "@/utils/api";

export const groupsService = {
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
    return api.get("/groups/user", {
      params: { page, limit },
    });
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

    while (page <= maxPages) {
      const res: any = await api.get("/groups/user", { params: { page, limit } });
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


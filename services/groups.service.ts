import api from "@/utils/api";

export const groupsService = {
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


"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Paperclip, Search, Send, Users } from "lucide-react";
import { groupsService } from "@/services/groups.service";
import { groupMessagesService } from "@/services/group-messages.service";
import { adminService } from "@/services/admin.service";
import { userService } from "@/services/user.service";
import api from "@/utils/api";

type GroupItem = {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
};

type ChatMessage = {
  id: string;
  groupId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  type: string;
  attachments: string[];
};

type MemberItem = {
  id: string;
  fullName: string;
  avatar?: string;
  email?: string;
};
type UploadedFileItem = {
  id: string;
  name: string;
  url: string;
  createdAt?: string;
};

export default function TeacherGroupMessagesPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);

  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [memberNameMap, setMemberNameMap] = useState<Record<string, string>>({});
  const [profileNameMap, setProfileNameMap] = useState<Record<string, string>>({});

  const getCurrentUser = () => {
    if (typeof window === "undefined") {
      return { id: "", fullName: "Bạn" };
    }
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return { id: "", fullName: "Bạn" };
      const parsed = JSON.parse(raw);
      return {
        id: String(parsed?._id ?? parsed?.id ?? parsed?.data?._id ?? ""),
        fullName: String(parsed?.fullName ?? parsed?.name ?? "Bạn"),
      };
    } catch {
      return { id: "", fullName: "Bạn" };
    }
  };

  const extractList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const keys = [
      "data",
      "items",
      "results",
      "docs",
      "groups",
      "messages",
      "members",
      "rows",
    ];
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

  const extractEntityId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);
    if (typeof value === "object") {
      const direct =
        value?._id ??
        value?.id ??
        value?.$oid ??
        value?.userId?._id ??
        value?.userId?.id ??
        value?.userId?.$oid ??
        value?.user?._id ??
        value?.user?.id ??
        value?.user?.$oid ??
        value?.author?._id ??
        value?.author?.id ??
        value?.from?._id ??
        value?.from?.id ??
        value?.owner?._id ??
        value?.owner?.id;
      if (typeof direct === "string" && direct.trim()) return direct.trim();
      if (typeof direct === "number") return String(direct);
      return "";
    }
    return "";
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      setGroupError("");
      const res: any = await groupsService.getAllGroupsForTeacher();
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped = list.map((g: any, idx: number) => ({
        id: String(g?._id ?? g?.id ?? `group-${idx}`),
        name: String(g?.groupName ?? g?.name ?? g?.title ?? "Nhóm học"),
        memberCount: Number(
          g?.memberCount ??
            g?.totalMembers ??
            g?.studentCount ??
            (Array.isArray(g?.members) ? g.members.length : 0),
        ) || 0,
        avatar: String(g?.avatar ?? g?.thumbnail ?? ""),
      }));

      setGroups(mapped);
      if (mapped.length > 0) {
        setSelectedGroupId((prev) => prev || mapped[0].id);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setGroupError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải danh sách nhóm.");
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchMessages = async (groupId: string) => {
    if (!groupId) {
      setMessages([]);
      return;
    }
    try {
      setLoadingMessages(true);
      setMessageError("");
      const res: any = await groupMessagesService.getMessagesByGroupId(groupId, {
        page: 1,
        limit: 100,
      });
      const payload = res?.data ?? res;
      const list = extractList(payload);

      const mapped = list
        .map((m: any, idx: number) => ({
          id: String(m?._id ?? m?.id ?? `${groupId}-${idx}`),
          groupId: String(m?.groupId?._id ?? m?.groupId ?? groupId),
          content: String(m?.content ?? ""),
          senderId: extractEntityId(
            m?.senderId ?? m?.sender ?? m?.createdBy ?? m?.userId ?? m?.author ?? m?.from ?? m?.owner,
          ),
          senderName: String(
            m?.senderName ??
              m?.sender?.fullName ??
              m?.sender?.name ??
              m?.senderId?.fullName ??
              m?.senderId?.name ??
              m?.createdBy?.fullName ??
              m?.createdBy?.name ??
              m?.userId?.fullName ??
              m?.userId?.name ??
              m?.author?.fullName ??
              m?.author?.name ??
              m?.from?.fullName ??
              m?.from?.name ??
              m?.owner?.fullName ??
              m?.owner?.name ??
              "Thành viên",
          ),
          createdAt: String(m?.createdAt ?? ""),
          type: String(m?.type ?? "text"),
          attachments: Array.isArray(m?.attachments)
            ? m.attachments.filter((x: any) => typeof x === "string")
            : [],
        }))
        .sort((a, b) => {
          const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return t1 - t2;
        });

      setMessages(mapped);

      // Force resolve sender names via profile API for all senderIds in current message list.
      const senderIds = Array.from(new Set(mapped.map((m) => m.senderId).filter(Boolean)));
      if (senderIds.length > 0) {
        const resolveNameByProfileApi = async (id: string): Promise<string> => {
          const encodedId = encodeURIComponent(id);
          try {
            // Prefer profile endpoint with senderId query so it is clearly visible in Network.
            const res: any = await api.get(`/auths/profile`, {
              params: { senderId: id, _t: Date.now() },
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
            });
            const payload = res?.data ?? res;
            const data =
              payload?.user ??
              payload?.data?.user ??
              payload?.result?.user ??
              payload?.profile ??
              payload?.data?.profile ??
              payload?.result?.profile ??
              payload;
            return String(data?.fullName ?? data?.name ?? data?.username ?? "").trim();
          } catch {
            try {
              // Fallback 1: profile/:id
              const profileById: any = await api.get(`/auths/profile/${encodedId}`, {
                params: { _t: Date.now() },
                headers: {
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                },
              });
              const payload = profileById?.data ?? profileById;
              const data =
                payload?.user ??
                payload?.data?.user ??
                payload?.result?.user ??
                payload?.profile ??
                payload?.data?.profile ??
                payload?.result?.profile ??
                payload;
              const fullName = String(
                data?.fullName ?? data?.name ?? data?.username ?? "",
              ).trim();
              if (fullName) return fullName;
            } catch {
              // ignore and fallback to users/:id
            }
            try {
              const profile: any = await userService.getUserById(id);
              const payload = profile?.data ?? profile;
              const data =
                payload?.user ??
                payload?.data?.user ??
                payload?.result?.user ??
                payload;
              return String(data?.fullName ?? data?.name ?? data?.username ?? "").trim();
            } catch {
              return "";
            }
          }
        };

        const entries = await Promise.all(
          senderIds.map(async (id) => {
            try {
              const fullName = await resolveNameByProfileApi(id);
              return [id, fullName] as const;
            } catch {
              return [id, ""] as const;
            }
          }),
        );
        const patch: Record<string, string> = {};
        entries.forEach(([id, name]) => {
          if (id && name) patch[id] = name;
        });
        if (Object.keys(patch).length > 0) {
          setProfileNameMap((prev) => ({ ...prev, ...patch }));
          setMessages((prev) =>
            prev.map((msg) =>
              patch[msg.senderId]
                ? { ...msg, senderName: patch[msg.senderId] }
                : msg,
            ),
          );
        }
      }

      const filesFromMessages: UploadedFileItem[] = mapped
        .filter((m) => m.type === "file" && m.attachments.length > 0)
        .map((m, idx) => ({
          id: `${m.id}-${idx}`,
          name: m.content || m.attachments[0].split("/").pop() || "Tài liệu",
          url: m.attachments[0],
          createdAt: m.createdAt,
        }));
      setUploadedFiles(filesFromMessages);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setMessageError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải tin nhắn nhóm.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchGroupDocuments = async (groupId: string) => {
    if (!groupId) {
      setUploadedFiles([]);
      return;
    }
    try {
      const res: any = await groupsService.getGroupById(groupId);
      const payload = res?.data ?? res;
      const detail = payload?.data ?? payload?.result ?? payload;
      const docs = Array.isArray(detail?.documents)
        ? detail.documents
        : Array.isArray(detail?.data?.documents)
          ? detail.data.documents
          : [];

      const mapped: UploadedFileItem[] = docs
        .map((d: any, idx: number) => {
          const url =
            d?.url ??
            d?.fileUrl ??
            d?.path ??
            d?.link ??
            (typeof d === "string" ? d : "");
          const name =
            d?.name ??
            d?.fileName ??
            (typeof url === "string" ? url.split("/").pop() : "") ??
            `Tài liệu ${idx + 1}`;
          return {
            id: String(d?._id ?? d?.id ?? `${groupId}-doc-${idx}`),
            name: String(name || `Tài liệu ${idx + 1}`),
            url: String(url || ""),
            createdAt: d?.createdAt ? String(d.createdAt) : undefined,
          };
        })
        .filter((x: UploadedFileItem) => x.url);

      if (mapped.length > 0) {
        setUploadedFiles(mapped);
      }
    } catch {
      // fallback giữ danh sách từ tin nhắn nếu endpoint documents lỗi
    }
  };

  const fetchMembers = async (groupId: string) => {
    if (!groupId) {
      setMembers([]);
      return;
    }
    try {
      setLoadingMembers(true);
      setMemberError("");
      const res: any = await groupsService.getAllMembersInGroupForTeacher(groupId);
      const payload = res?.data ?? res;
      const list = extractList(payload);
      const mapped: MemberItem[] = list.map((m: any, idx: number) => {
        const user = m?.userId ?? m?.user ?? m;
        return {
          id: extractEntityId(user) || extractEntityId(m) || `${groupId}-m-${idx}`,
          fullName: String(user?.fullName ?? user?.name ?? "Thành viên"),
          avatar: String(user?.avatar ?? ""),
          email: String(user?.email ?? ""),
        };
      });
      setMembers(mapped);
      const mapObj: Record<string, string> = {};
      list.forEach((raw: any, idx: number) => {
        const user = raw?.userId ?? raw?.user ?? raw?.member ?? raw;
        const fullName = String(
          user?.fullName ?? user?.name ?? raw?.fullName ?? raw?.name ?? mapped[idx]?.fullName ?? "",
        ).trim();
        if (!fullName) return;
        const ids = [
          extractEntityId(raw),
          extractEntityId(user),
          extractEntityId(raw?.userId),
          extractEntityId(raw?.senderId),
          String(raw?.userId ?? "").trim(),
          String(raw?.senderId ?? "").trim(),
        ].filter(Boolean);
        ids.forEach((id) => {
          mapObj[id] = fullName;
        });
      });
      setMemberNameMap(mapObj);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setMemberError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải thành viên nhóm.");
      setMembers([]);
      setMemberNameMap({});
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMessages(selectedGroupId);
      fetchMembers(selectedGroupId);
      fetchGroupDocuments(selectedGroupId);
    }
  }, [selectedGroupId]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const currentUser = getCurrentUser();

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !selectedGroupId) return;
    try {
      setSending(true);
      await groupMessagesService.sendMessage({
        groupId: selectedGroupId,
        content,
        type: "text",
      });
      setText("");
      await fetchMessages(selectedGroupId);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const handleUploadFile = async (file: File | null) => {
    if (!file || !selectedGroupId) return;
    try {
      setUploadingFile(true);
      const res: any = await adminService.uploadDocument(selectedGroupId, file);
      const payload = res?.data ?? res;
      const directUrl =
        payload?.url ??
        payload?.fileUrl ??
        payload?.data?.url ??
        payload?.data?.fileUrl ??
        "";
      if (typeof directUrl === "string" && directUrl.trim()) {
        setUploadedFiles((prev) => [
          {
            id: `${Date.now()}`,
            name: file.name,
            url: directUrl,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      await fetchMessages(selectedGroupId);
      await fetchGroupDocuments(selectedGroupId);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể upload file.");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="grid min-h-[78vh] grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/70 xl:grid-cols-[320px_1fr_320px]">
        <aside className="border-r border-slate-200 bg-slate-50/70">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-black text-slate-800">Tin nhắn nhóm</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn nhóm để xem cuộc trò chuyện</p>
            <div className="relative mt-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm nhóm..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="max-h-[calc(78vh-120px)] overflow-y-auto p-3">
            {loadingGroups ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Đang tải nhóm...
              </div>
            ) : groupError ? (
              <p className="text-sm text-red-600">{groupError}</p>
            ) : filteredGroups.length === 0 ? (
              <p className="text-sm text-slate-500">Không có nhóm phù hợp.</p>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const active = selectedGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
                          {group.avatar ? (
                            <img src={group.avatar} alt={group.name} className="h-full w-full object-cover" />
                          ) : (
                            group.name.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{group.name}</p>
                          <p className="text-xs text-slate-500">{group.memberCount} thành viên</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[78vh] flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {selectedGroup ? selectedGroup.name : "Chưa chọn nhóm"}
                </h3>
                {selectedGroup ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Users size={12} /> {selectedGroup.memberCount} thành viên
                  </p>
                ) : null}
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                {uploadingFile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Paperclip size={14} />
                )}
                Upload
                <input
                  type="file"
                  className="hidden"
                  disabled={!selectedGroupId || uploadingFile || sending}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    void handleUploadFile(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
            {loadingMessages ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Đang tải tin nhắn...
              </div>
            ) : messageError ? (
              <p className="text-sm text-red-600">{messageError}</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500">Nhóm chưa có tin nhắn nào.</p>
            ) : (
              messages.map((message) => {
                const mine = currentUser.id && message.senderId === currentUser.id;
                const senderName =
                  message.senderName && message.senderName !== "Thành viên"
                    ? message.senderName
                    : memberNameMap[message.senderId] ||
                      profileNameMap[message.senderId] ||
                      (message.senderId ? `User ${message.senderId.slice(-6)}` : "Người dùng");
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        mine
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      <p
                        className={`mb-1 text-[11px] font-bold ${
                          mine ? "text-emerald-100" : "text-slate-500"
                        }`}
                      >
                        {senderName}
                      </p>
                      {message.type === "file" && message.attachments.length > 0 ? (
                        <a
                          href={message.attachments[0]}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                            mine
                              ? "bg-emerald-500/40 text-white hover:bg-emerald-500/55"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <Download size={14} />
                          {message.content || "Tải file"}
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={selectedGroupId ? "Nhập tin nhắn..." : "Chọn nhóm để nhắn tin"}
                disabled={!selectedGroupId || sending}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                onClick={handleSend}
                disabled={!selectedGroupId || !text.trim() || sending || uploadingFile}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Gửi
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-slate-200 bg-slate-50/60 xl:flex xl:flex-col">
          <div className="border-b border-slate-200 p-4">
            <h4 className="text-sm font-black text-slate-800">Thành viên nhóm</h4>
            {selectedGroup ? (
              <p className="mt-1 text-xs text-slate-500">{selectedGroup.name}</p>
            ) : null}

            <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              {uploadingFile ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              Upload tài liệu
              <input
                type="file"
                className="hidden"
                disabled={!selectedGroupId || uploadingFile || sending}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  void handleUploadFile(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-black text-slate-700 uppercase">File đã upload</p>
              {uploadedFiles.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">Chưa có tài liệu nào.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.slice(0, 10).map((f) => (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs hover:bg-slate-100"
                    >
                      <span className="truncate pr-2 font-semibold text-slate-700">{f.name}</span>
                      <Download size={13} className="shrink-0 text-slate-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            {loadingMembers ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" /> Đang tải thành viên...
              </div>
            ) : memberError ? (
              <p className="text-sm text-red-600">{memberError}</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-slate-500">Nhóm chưa có thành viên.</p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.fullName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{m.fullName}</p>
                        {m.email ? <p className="truncate text-[11px] text-slate-500">{m.email}</p> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

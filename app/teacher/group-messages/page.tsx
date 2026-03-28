"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Send, Users } from "lucide-react";
import { groupsService } from "@/services/groups.service";
import { groupMessagesService } from "@/services/group-messages.service";

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
};

export default function TeacherGroupMessagesPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");

  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

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
    const keys = ["data", "items", "results", "docs", "groups", "messages", "rows"];
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
          senderId: String(m?.senderId?._id ?? m?.senderId ?? ""),
          senderName: String(
            m?.senderId?.fullName ?? m?.senderId?.name ?? m?.senderName ?? "Thành viên",
          ),
          createdAt: String(m?.createdAt ?? ""),
          type: String(m?.type ?? "text"),
        }))
        .sort((a, b) => {
          const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return t1 - t2;
        });

      setMessages(mapped);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setMessageError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải tin nhắn nhóm.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMessages(selectedGroupId);
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

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="grid min-h-[78vh] grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/70 lg:grid-cols-[320px_1fr]">
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
            <h3 className="text-base font-black text-slate-800">
              {selectedGroup ? selectedGroup.name : "Chưa chọn nhóm"}
            </h3>
            {selectedGroup ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Users size={12} /> {selectedGroup.memberCount} thành viên
              </p>
            ) : null}
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
                      {!mine ? (
                        <p className="mb-1 text-[11px] font-bold text-slate-500">{message.senderName}</p>
                      ) : null}
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
                disabled={!selectedGroupId || !text.trim() || sending}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Gửi
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

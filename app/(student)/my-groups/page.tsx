"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Users, ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { groupsService } from "@/services/groups.service";
import { groupMessagesService } from "@/services/group-messages.service";

type Group = {
  id: string;
  name: string;
  topic?: string;
  description?: string;
  membersCount?: number;
};

type GroupMessage = {
  id?: string;
  senderName?: string;
  senderId?: string;
  content?: string;
  createdAt?: string;
  pending?: boolean;
};

export default function MyGroupsPage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Group[]>([]);

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loadingMyGroups, setLoadingMyGroups] = useState(false);
  const [myGroupsError, setMyGroupsError] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("Bạn");

  const activeGroup = useMemo(
    () => myGroups.find((g) => g.id === activeGroupId) ?? null,
    [myGroups, activeGroupId],
  );

  const [invitationCode, setInvitationCode] = useState("");
  const [joining, setJoining] = useState(false);

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const senderNameMapRef = useRef<Record<string, string>>({});

  const toTimeValue = (value?: string) => {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const getSenderNameFromRaw = (raw: any, isMe = false) => {
    const senderId: string =
      typeof raw?.senderId === "string"
        ? raw.senderId
        : typeof raw?.sender?._id === "string"
          ? raw.sender._id
          : "";

    const candidates = [
      raw?.senderName,
      raw?.sender?.fullName,
      raw?.sender?.name,
      raw?.sender?.username,
      raw?.senderId?.fullName,
      raw?.senderId?.name,
      raw?.senderId?.username,
      senderId ? senderNameMapRef.current[senderId] : "",
    ];

    for (const c of candidates) {
      const v = String(c ?? "").trim();
      if (v) {
        if (senderId) senderNameMapRef.current[senderId] = v;
        return v;
      }
    }

    if (isMe) return currentUserName || "Bạn";

    if (senderId) return `User ${senderId.slice(-6)}`;
    return "Người dùng";
  };

  const normalizeMessages = (items: any[]): GroupMessage[] => {
    const list = Array.isArray(items) ? items : [];

    return list
      .map((raw, idx) => {
        const senderId: string =
          typeof raw?.senderId === "string"
            ? raw.senderId
            : typeof raw?.sender?._id === "string"
              ? raw.sender._id
              : "";
        const isMe = Boolean(currentUserId && senderId && currentUserId === senderId);
        return {
          id: String(raw?.id ?? raw?._id ?? `msg-${idx}-${raw?.createdAt ?? ""}`),
          senderId,
          senderName: getSenderNameFromRaw(raw, isMe),
          content: String(raw?.content ?? raw?.message ?? raw?.text ?? ""),
          createdAt: String(raw?.createdAt ?? raw?.timestamp ?? raw?.time ?? ""),
          pending: false,
        } as GroupMessage;
      })
      .sort((a, b) => {
        const ta = toTimeValue(a.createdAt);
        const tb = toTimeValue(b.createdAt);
        if (ta !== tb) return ta - tb;
        return String(a.id ?? "").localeCompare(String(b.id ?? ""));
      });
  };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior }), 0);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingMyGroups(true);
        setMyGroupsError("");
        const normalize = (source: any[]): Group[] =>
          (source || [])
            .map((g) => ({
              id: g?.id ?? g?._id ?? "",
              name: g?.groupName ?? g?.name ?? "",
              topic: g?.topic,
              description: g?.description,
              membersCount: g?.membersCount ?? g?.members?.length,
            }))
            .filter((g) => Boolean(g.id) && Boolean(g.name));

        const res = await groupsService.getMyGroupsAll({ limit: 100, maxPages: 50 });
        const payload: any = (res as any)?.data ?? res;
        const raw = payload?.items ?? payload?.data ?? payload;
        let items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as any[];

        if (!items.length) {
          const fallbackRes = await groupsService.getMyGroups({ page: 1, limit: 100 });
          const fallbackPayload: any = (fallbackRes as any)?.data ?? fallbackRes;
          const fallbackRaw =
            fallbackPayload?.items ??
            fallbackPayload?.data ??
            fallbackPayload?.groups ??
            fallbackPayload;
          items = (Array.isArray(fallbackRaw) ? fallbackRaw : fallbackRaw ? [fallbackRaw] : []) as any[];
        }

        const normalized: Group[] = normalize(items);

        setMyGroups(normalized);
        if (!activeGroupId && normalized.length) {
          setActiveGroupId(normalized[0].id);
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message;
        setMyGroups([]);
        setMyGroupsError(
          Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tải danh sách nhóm.",
        );
      } finally {
        setLoadingMyGroups(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Xác định "tôi" để căn phải/trái tin nhắn.
    try {
      const stored = window.localStorage.getItem("currentUser");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const id =
        parsed?.id ??
        parsed?._id ??
        parsed?.userId ??
        parsed?.user?.userId ??
        null;
      if (typeof id === "string" && id.trim()) setCurrentUserId(id.trim());
      const name =
        parsed?.fullName ??
        parsed?.name ??
        parsed?.username ??
        parsed?.user?.fullName ??
        parsed?.user?.name ??
        "Bạn";
      setCurrentUserName(String(name));
    } catch {
      // ignore
    }
  }, []);

  const formatTime = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string) => {
    const n = (name ?? "").trim();
    if (!n) return "?";
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase();
  };

  useEffect(() => {
    if (!activeGroupId) return;

    const loadMessages = async (silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const res = await groupMessagesService.getMessagesByGroupId(activeGroupId, {
          page: 1,
          limit: 100,
        });
        const data = res?.data ?? res;
        const items = (data?.items ?? data?.data ?? data ?? []) as any[];
        setMessages(normalizeMessages(items));
      } catch {
        if (!silent) setMessages([]);
      } finally {
        if (!silent) {
          setLoadingMessages(false);
          scrollToBottom("auto");
        }
      }
    };

    loadMessages(false);
    const interval = window.setInterval(() => {
      void loadMessages(true);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [activeGroupId, currentUserId, currentUserName]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    try {
      const res = await groupsService.searchGroups({
        keyword: keyword.trim(),
      });
      const data = res?.data ?? res;
      const raw = data?.items ?? data?.data ?? data;
      const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as any[];
      const normalized: Group[] = items.map((g) => ({
        id: g?.id ?? g?._id ?? "",
        name: g?.groupName ?? g?.name ?? "",
        topic: g?.topic,
        description: g?.description,
        membersCount: g?.membersCount ?? g?.members?.length,
      }));
      setSearchResults(normalized.filter((x) => x.id));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoining(true);
    try {
      await groupsService.joinGroup(groupId);

      const gRes = await groupsService.getGroupById(groupId);
      const gData = gRes?.data ?? gRes?.data?.data ?? gRes;

      const group: Group = {
        id: gData?.id ?? gData?._id ?? groupId,
        name: gData?.groupName ?? gData?.name ?? "",
        topic: gData?.topic,
        description: gData?.description,
        membersCount: gData?.membersCount ?? gData?.members?.length,
      };

      setMyGroups((prev) => {
        const exists = prev.some((x) => x.id === group.id);
        if (exists) return prev;
        return [group, ...prev];
      });
      setActiveGroupId(groupId);
      setSearchResults((prev) => prev.filter((g) => g.id !== groupId));
    } catch {
      // noop: UI sẽ hiển thị danh sách trống
    } finally {
      setJoining(false);
    }
  };

  const handleJoinByInvitationCode = async () => {
    const code = invitationCode.trim();
    if (!code) return;
    setJoining(true);
    try {
      await groupsService.joinByInvitationCode(code);

      const gRes = await groupsService.getGroupByJoinCode(code);
      const gData = gRes?.data ?? gRes?.data?.data ?? gRes;

      const group: Group = {
        id: gData?.id ?? gData?._id ?? "",
        name: gData?.groupName ?? gData?.name ?? "",
        topic: gData?.topic,
        description: gData?.description,
        membersCount: gData?.membersCount ?? gData?.members?.length,
      };

      if (group.id) {
        setMyGroups((prev) => {
          const exists = prev.some((x) => x.id === group.id);
          if (exists) return prev;
          return [group, ...prev];
        });
        setActiveGroupId(group.id);
      }
      setInvitationCode("");
    } catch {
      // noop
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async () => {
    if (!activeGroupId) return;
    const content = input.trim();
    if (!content) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: GroupMessage = {
      id: tempId,
      senderId: currentUserId ?? undefined,
      senderName: currentUserName || "Bạn",
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage].sort((a, b) => toTimeValue(a.createdAt) - toTimeValue(b.createdAt)));
    setInput("");
    scrollToBottom("smooth");

    setSending(true);
    try {
      await groupMessagesService.sendMessage({
        groupId: activeGroupId,
        content,
        type: "text",
        attachments: [],
        mentions: [],
        replyTo: null,
      });

      const res = await groupMessagesService.getMessagesByGroupId(activeGroupId, {
        page: 1,
        limit: 100,
      });
      const data = res?.data ?? res;
      const items = (data?.items ?? data?.data ?? data ?? []) as any[];
      setMessages(normalizeMessages(items));
    } catch {
      // rollback optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      scrollToBottom("smooth");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_top,_var(--tw-gradient-stops))] from-[#EEF4FF] via-white to-white flex flex-col">
      <div className="container mx-auto px-4 lg:px-6 py-6 flex-1">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/70 transition border border-slate-200"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Nhóm của tôi</h1>
              <p className="text-slate-500 text-sm">Tìm kiếm, tham gia và nhắn tin theo nhóm.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4">
          {/* Left: search + my groups */}
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-3xl shadow-primary-card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Search size={18} />
                </div>
                <h2 className="font-bold text-slate-800">Tìm kiếm nhóm</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên nhóm hoặc chủ đề..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !keyword.trim()}
                  className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-sm"
                >
                  <Search size={16} />
                  Tìm
                </button>
              </div>
            </div>

            {/* Search results */}
            <div className="p-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Users size={16} /> Kết quả tìm kiếm
              </h3>
              {searching ? (
                <div className="text-slate-500 text-sm">Đang tìm...</div>
              ) : searchResults?.length ? (
                <div className="space-y-3 max-h-[220px] overflow-auto pr-1 custom-scrollbar">
                  {searchResults.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{g.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {g.topic ?? g.description ?? "—"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(g.id)}
                        disabled={joining}
                        className="shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold disabled:opacity-50 hover:bg-indigo-700"
                      >
                        {joining ? "..." : "Tham gia"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Chưa có nhóm phù hợp.</div>
              )}

              {/* Join by invitation code */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">Tham gia bằng mã</h3>
                <div className="flex gap-2">
                  <input
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="VD: INVITE"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleJoinByInvitationCode}
                    disabled={joining || !invitationCode.trim()}
                    className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Nhập
                  </button>
                </div>
              </div>
            </div>

            {/* My groups */}
            <div className="p-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Nhóm của bạn</h3>
              {loadingMyGroups ? (
                <div className="text-slate-500 text-sm">Đang tải nhóm...</div>
              ) : myGroupsError ? (
                <div className="text-red-600 text-sm">{myGroupsError}</div>
              ) : myGroups?.length ? (
                <div className="space-y-2 max-h-[220px] overflow-auto pr-1 custom-scrollbar">
                  {myGroups.map((g) => {
                    const isActive = g.id === activeGroupId;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setActiveGroupId(g.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition ${
                          isActive
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-white/90"
                        }`}
                      >
                        <div className="font-bold text-slate-900 truncate">{g.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {g.topic ?? g.description ?? "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Bạn chưa tham gia nhóm nào.</div>
              )}
            </div>
          </div>

          {/* Right: chat */}
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-3xl shadow-primary-card overflow-hidden flex flex-col">
            {!activeGroup ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-xl">
                  <Users size={20} />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-900">Chọn một nhóm để nhắn tin</h2>
                <p className="text-slate-500 mt-1 text-sm">Ở cột trái, chọn nhóm của bạn hoặc tìm và tham gia nhóm mới.</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 text-lg truncate">{activeGroup.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {activeGroup.topic ?? activeGroup.description ?? "—"}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {activeGroup.membersCount ? `${activeGroup.membersCount} thành viên` : "Nhóm chat"}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] custom-scrollbar">
                  {loadingMessages ? (
                    <div className="text-slate-500 text-sm">Đang tải tin nhắn...</div>
                  ) : messages?.length ? (
                    messages.map((m, idx) => {
                      const anyMsg = m as any;
                      const content =
                        m.content ?? anyMsg?.message ?? anyMsg?.text ?? "";

                      const senderId: string | null =
                        typeof anyMsg?.senderId === "string"
                          ? anyMsg.senderId
                          : typeof anyMsg?.sender?._id === "string"
                            ? anyMsg.sender._id
                            : null;

                      const isMe =
                        Boolean(
                          currentUserId && senderId && currentUserId === senderId,
                        );

                      const senderName: string =
                        m.senderName ??
                        anyMsg?.sender?.name ??
                        anyMsg?.sender?.fullName ??
                        (isMe ? currentUserName || "Bạn" : "Người dùng");

                      const timeLabel = formatTime(
                        anyMsg?.createdAt ?? anyMsg?.timestamp ?? anyMsg?.time,
                      );

                      return (
                        <div
                          key={m.id ?? `${activeGroupId}-${idx}`}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs shrink-0">
                              {getInitials(senderName)}
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm border shadow-sm ${
                              isMe
                                ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                                : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between gap-3 mb-1 ${
                                isMe ? "opacity-95" : "opacity-90"
                              }`}
                            >
                              <div className="font-bold text-xs truncate">
                                {senderName}
                              </div>
                              {timeLabel ? (
                                <div
                                  className={`text-[10px] ${
                                    isMe ? "text-blue-100" : "text-slate-400"
                                  }`}
                                >
                                  {timeLabel}
                                </div>
                              ) : (
                                <div className="text-[10px] opacity-0">.</div>
                              )}
                            </div>

                            <div className="break-words whitespace-pre-wrap leading-relaxed">
                              {content}
                            </div>
                          </div>

                          {isMe && (
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-xs shrink-0">
                              {getInitials(senderName)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-slate-500 text-sm mt-6">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</div>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-2 items-center">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                      }}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


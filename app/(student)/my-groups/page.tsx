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
};

export default function MyGroupsPage() {
  const router = useRouter();

  const CACHE_KEY = "my-groups-cache-v1";

  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Group[]>([]);

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

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

  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const raw =
          typeof window !== "undefined"
            ? window.localStorage.getItem(CACHE_KEY)
            : null;
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;

        const normalized: Group[] = parsed
          .map((g: any) => ({
            id: g?.id ?? g?._id ?? "",
            name: g?.name ?? g?.groupName ?? "",
            topic: g?.topic,
            description: g?.description,
            membersCount: g?.membersCount ?? g?.members?.length,
          }))
          .filter((g: Group) => Boolean(g.id) && Boolean(g.name));

        setMyGroups(normalized);
        if (!activeGroupId && normalized.length) {
          setActiveGroupId(normalized[0].id);
        }
      } catch {
        // ignore
      }
    };

    const load = async () => {
      try {
        const res = await groupsService.getMyGroups({ page: 1, limit: 50 });
        const data = res?.data ?? res;
        const raw = data?.items ?? data?.data ?? data;
        const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as any[];

        const normalized: Group[] = items
          .map((g) => ({
            id: g?.id ?? g?._id ?? "",
            name: g?.groupName ?? g?.name ?? "",
            topic: g?.topic,
            description: g?.description,
            membersCount: g?.membersCount ?? g?.members?.length,
          }))
          .filter((g) => Boolean(g.id) && Boolean(g.name));

        setMyGroups(normalized);
        if (!activeGroupId && normalized.length) {
          setActiveGroupId(normalized[0].id);
        }
      } catch {
        // API chưa sẵn hoặc backend chưa trả đúng, fallback localStorage
        loadFromLocalStorage();
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(myGroups));
    } catch {
      // ignore
    }
  }, [myGroups]);

  useEffect(() => {
    if (!activeGroupId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await groupMessagesService.getMessagesByGroupId(activeGroupId, {
          page: 1,
          limit: 50,
        });
        const data = res?.data ?? res;
        const items = (data?.items ?? data?.data ?? data ?? []) as GroupMessage[];
        setMessages(items);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
        // Scroll to bottom after render
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
      }
    };

    loadMessages();
  }, [activeGroupId]);

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

    setSending(true);
    try {
      // DTO backend thường có: groupId, nội dung, type, attachments..., mentions..., replyTo...
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
        limit: 50,
      });
      const data = res?.data ?? res;
      const items = (data?.items ?? data?.data ?? data ?? []) as GroupMessage[];
      setMessages(items);
      setInput("");
    } catch {
      // noop
    } finally {
      setSending(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
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
              {myGroups?.length ? (
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
                      const content = m.content ?? (m as any)?.message ?? (m as any)?.text ?? "";
                      const sender = m.senderName ?? (m as any)?.sender?.name ?? (m as any)?.senderId ?? "Bạn";
                      const isMe = (() => {
                        // Không có thông tin user hiện tại ở đây nên mặc định "Bạn" là me.
                        // Nếu API trả senderId thì bạn có thể so sánh để đổi màu bubble.
                        return sender === "Bạn" || sender === "ME";
                      })();

                      return (
                        <div
                          key={m.id ?? `${activeGroupId}-${idx}`}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} `}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm border ${
                              isMe
                                ? "bg-blue-600 text-white border-blue-700 rounded-tr-none"
                                : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                            }`}
                          >
                            <div className="font-bold text-xs opacity-80 mb-1">{isMe ? "Bạn" : sender}</div>
                            <div className="break-words whitespace-pre-wrap">{content}</div>
                          </div>
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


"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Sparkles,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  MoreHorizontal,
  Clock,
  Rocket,
  Zap,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { userService } from "@/services/user.service";
import {
  communitesService,
  communiteImageUrl,
  unwrapCommuniteDoc,
} from "@/services/communites.service";
import { showAlert } from "@/utils/dialog";

// --- TYPES ---

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  /** Ảnh đính kèm comment (URL đầy đủ) */
  imageUrl?: string;
  time: string;
  isLiked: boolean;
}

interface Post {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
  time: string;
  isFeatured: boolean;
}

type UsernameMap = Record<string, string>;

const FALLBACK_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Student";

function timeAgo(iso?: string | null): string {
  if (!iso) return "Vừa xong";
  try {
    return formatDistanceToNow(new Date(iso), {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return "—";
  }
}

/** Lấy username từ object user (populate) hoặc null */
function pickUsername(u: any): string | null {
  if (!u || typeof u !== "object") return null;
  const candidates = [
    u.username,
    u.userName,
    u.user_name,
    u.login,
  ];
  for (const v of candidates) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Khi không có username: hiển thị mã ngắn từ id (không dùng nhãn "Thành viên") */
function fallbackDisplayForId(id: string | null | undefined): string {
  if (!id || !String(id).trim()) return "Người dùng";
  const s = String(id).trim();
  return `user_${s.slice(-6)}`;
}

/** Chuẩn hoá id để tra map (Mongo id không phân biệt hoa thường) */
function normalizeUserIdKey(id: string | null | undefined): string {
  return String(id ?? "").trim().toLowerCase();
}

function lookupUsername(
  map: UsernameMap,
  id: string | null | undefined,
): string | undefined {
  const k = normalizeUserIdKey(id);
  if (!k) return undefined;
  return map[k];
}

/** Username / handle / tên hiển thị từ object user (API list hoặc GET /users/:id) */
function pickDisplayHandle(u: any): string | null {
  const un = pickUsername(u);
  if (un) return un;
  for (const k of ["nickName", "nickname", "slug"] as const) {
    const v = u?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  if (typeof u?.email === "string" && u.email.includes("@")) {
    const local = u.email.split("@")[0]?.trim();
    if (local) return local;
  }
  if (typeof u?.fullName === "string" && u.fullName.trim()) return u.fullName.trim();
  if (typeof u?.name === "string" && u.name.trim()) return u.name.trim();
  return null;
}

/**
 * Họ tên / tên hiển thị khi không có username (populate object).
 */
function formatPersonName(u: any, idFallback: string): string {
  if (!u || typeof u !== "object") return idFallback;

  const full =
    (typeof u.fullName === "string" && u.fullName.trim()) ||
    (typeof u.name === "string" && u.name.trim()) ||
    (typeof u.displayName === "string" && u.displayName.trim()) ||
    (typeof u.authorName === "string" && u.authorName.trim()) ||
    "";

  if (full) return full.trim();
  return idFallback;
}

/** Tên từ document phẳng (API có thể lưu sẵn authorName / username) */
function nameFromFlatDoc(d: any): string | null {
  if (!d || typeof d !== "object") return null;
  const a =
    typeof d.authorName === "string" && d.authorName.trim()
      ? d.authorName.trim()
      : typeof d.fullName === "string" && d.fullName.trim()
        ? d.fullName.trim()
        : typeof d.username === "string" && d.username.trim()
          ? d.username.trim()
          : typeof d.userName === "string" && d.userName.trim()
            ? d.userName.trim()
            : null;
  return a || null;
}

function extractUserId(value: any): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return null;
  const id = value?._id ?? value?.id;
  if (typeof id === "string" && id.trim()) return id.trim();
  if (id && typeof id === "object" && typeof (id as any).$oid === "string") {
    return String((id as any).$oid).trim();
  }
  return null;
}

function collectUserIdsFromCommunites(list: any[]): string[] {
  const ids = new Set<string>();

  for (const item of list) {
    const authorId = extractUserId(item?.userId);
    if (authorId) ids.add(authorId);

    const comments = Array.isArray(item?.comments)
      ? item.comments
      : Array.isArray(item?.commentList)
        ? item.commentList
        : [];

    for (const comment of comments) {
      const commentUserId = extractUserId(comment?.userId);
      if (commentUserId) ids.add(commentUserId);
    }
  }

  return Array.from(ids);
}

/**
 * Map userId -> tên hiển thị qua GET /communites/:user/fullname (backend).
 * Key map: normalizeUserIdKey(id).
 */
async function fetchUsernameMapForIds(ids: string[]): Promise<UsernameMap> {
  const map: UsernameMap = {};
  if (ids.length === 0) return map;

  const unique = [
    ...new Set(ids.map((id) => normalizeUserIdKey(id)).filter(Boolean)),
  ];
  const chunkSize = 10;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const settled = await Promise.allSettled(
      chunk.map(async (key) => {
        const name = await communitesService.getFullname(key);
        return { key, name };
      }),
    );
    settled.forEach((r) => {
      if (r.status !== "fulfilled") return;
      const { key, name } = r.value;
      if (name && name.trim()) map[key] = name.trim();
    });
  }

  return map;
}

/** Chuẩn hoá 1 document Communite từ API (linh hoạt field) */
function normalizeCommunite(
  raw: any,
  currentUserId?: string | null,
  usernameMap: UsernameMap = {},
): Post {
  const id = String(raw?._id ?? raw?.id ?? "");
  const author = raw?.userId;
  const authorIdStr =
    typeof author === "string" && author.length > 0
      ? author
      : extractUserId(author);

  let name = fallbackDisplayForId(authorIdStr);
  let avatar = FALLBACK_AVATAR;
  let level = 1;

  const fromFlat = nameFromFlatDoc(raw);

  if (author && typeof author === "object") {
    name =
      pickUsername(author) ??
      lookupUsername(usernameMap, authorIdStr) ??
      pickDisplayHandle(author) ??
      fromFlat ??
      formatPersonName(author, fallbackDisplayForId(authorIdStr));
    avatar = author.avatar || avatar;
    level =
      author.stats?.level ??
      author.level ??
      (typeof author.xp === "number" ? Math.floor(author.xp / 100) + 1 : level);
  } else if (typeof author === "string" && author.length > 0) {
    name = fromFlat ?? lookupUsername(usernameMap, author) ?? fallbackDisplayForId(author);
  }

  const content =
    raw?.content ??
    raw?.title ??
    raw?.text ??
    raw?.body ??
    raw?.description ??
    "";

  const img = raw?.image ?? raw?.images?.[0];
  const images: string[] = [];
  if (img) {
    const url = communiteImageUrl(typeof img === "string" ? img : img?.path);
    if (url) images.push(url);
  }
  if (Array.isArray(raw?.images)) {
    raw.images.forEach((x: any) => {
      const u = communiteImageUrl(typeof x === "string" ? x : x?.url ?? x?.path);
      if (u && !images.includes(u)) images.push(u);
    });
  }

  let likes = 0;
  if (typeof raw?.totalLikes === "number") likes = raw.totalLikes;
  else if (typeof raw?.likesCount === "number") likes = raw.likesCount;
  else if (typeof raw?.likeCount === "number") likes = raw.likeCount;
  else if (Array.isArray(raw?.likes)) likes = raw.likes.length;
  else if (typeof raw?.likes === "number") likes = raw.likes;

  let isLiked = Boolean(raw?.isLiked);
  if (currentUserId) {
    if (Array.isArray(raw?.likedBy) && raw.likedBy.some((x: any) => String(x) === String(currentUserId)))
      isLiked = true;
    if (Array.isArray(raw?.likes) && raw.likes.every((x: any) => typeof x === "string"))
      isLiked = raw.likes.includes(String(currentUserId));
  }

  const rawComments = raw?.comments ?? raw?.commentList ?? [];
  const comments: Comment[] = (Array.isArray(rawComments) ? rawComments : []).map(
    (c: any, idx: number) => {
      const cu = c?.userId;
      const commentUserIdStr =
        typeof cu === "string" && cu.length > 0
          ? cu
          : extractUserId(cu);

      let cname = fallbackDisplayForId(commentUserIdStr);
      let cavatar = FALLBACK_AVATAR;
      const cFlat = nameFromFlatDoc(c);

      if (cu && typeof cu === "object") {
        cname =
          pickUsername(cu) ??
          lookupUsername(usernameMap, commentUserIdStr) ??
          pickDisplayHandle(cu) ??
          cFlat ??
          formatPersonName(cu, fallbackDisplayForId(commentUserIdStr));
        cavatar = cu.avatar || cavatar;
      } else if (typeof cu === "string" && cu.length > 0) {
        cname = cFlat ?? lookupUsername(usernameMap, cu) ?? fallbackDisplayForId(cu);
      } else if (cFlat) {
        cname = cFlat;
      }
      const cImg = c?.image ? communiteImageUrl(c.image) : "";
      const text =
        c?.content ?? c?.message ?? c?.text ?? "";
      return {
        id: String(c?._id ?? c?.id ?? `c_${idx}`),
        user: cname,
        avatar: cavatar,
        content: text.trim(),
        imageUrl: cImg || undefined,
        time: timeAgo(c?.createdAt ?? c?.created_at),
    isLiked: false,
      };
    },
  );

  const commentsCount =
    typeof raw?.totalComments === "number"
      ? raw.totalComments
      : typeof raw?.commentsCount === "number"
        ? raw.commentsCount
        : comments.length;

  return {
    id,
    userId: String(
      typeof author === "object" && author?._id
        ? author._id
        : author ?? raw?.userId ?? "",
    ),
    user: { name, avatar, level },
    content,
    images,
    likes,
    isLiked,
    commentsCount,
    comments,
    createdAt: raw?.createdAt ?? raw?.created_at ?? new Date().toISOString(),
    time: timeAgo(raw?.createdAt ?? raw?.created_at),
    isFeatured: Boolean(raw?.isFeatured ?? raw?.featured),
  };
}

// --- ANIMATION ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [usernameMap, setUsernameMap] = useState<UsernameMap>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const commentFileRef = useRef<HTMLInputElement>(null);

  const [newPostPreviewUrl, setNewPostPreviewUrl] = useState<string | null>(
    null,
  );
  const [commentPreviewUrl, setCommentPreviewUrl] = useState<string | null>(
    null,
  );

  const loadPosts = useCallback(async () => {
    try {
      const list = await communitesService.list({ page: 1, limit: 30 });
      setPosts(
        list.map((item) => normalizeCommunite(item, currentUserId, usernameMap)),
      );
    } catch (e: any) {
      console.error(e);
      await showAlert(
        e?.response?.data?.message?.[0] ??
          e?.message ??
          "Không tải được bảng tin cộng đồng.",
      );
      setPosts([]);
    }
  }, [currentUserId, usernameMap]);

  /** Preview ảnh đính kèm khi tạo bài */
  useEffect(() => {
    if (!newPostFile) {
      setNewPostPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newPostFile);
    setNewPostPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newPostFile]);

  /** Preview ảnh bình luận */
  useEffect(() => {
    if (!commentFile) {
      setCommentPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(commentFile);
    setCommentPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [commentFile]);

  /** Đổi bài đang mở comment — reset ô nhập + file */
  useEffect(() => {
    setCommentInput("");
    setCommentFile(null);
    if (commentFileRef.current) commentFileRef.current.value = "";
  }, [expandedPostId]);

  /** Tải profile + bảng tin trong một luồng (tránh race: feed gọi trước khi state ổn định) */
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
        setLoading(true);
      try {
        const [profileOutcome, listOutcome] = await Promise.allSettled([
          userService.getProfile(),
          communitesService.list({ page: 1, limit: 30 }),
        ]);
        if (cancelled) return;

        let uidStr: string | null = null;
        const baseUsernameMap: UsernameMap = {};
        if (profileOutcome.status === "fulfilled") {
          const profileRes = profileOutcome.value as any;
          const profile = profileRes?.data ?? profileRes;
          const uid = profile?._id ?? profile?.id ?? null;
          uidStr = uid ? String(uid) : null;
          const currentUsername =
            pickUsername(profile) ?? pickDisplayHandle(profile);
          if (uidStr && currentUsername) {
            baseUsernameMap[normalizeUserIdKey(uidStr)] = currentUsername;
          }
          setCurrentUserId(uidStr);
          const displayName =
            pickUsername(profile) ??
            pickDisplayHandle(profile) ??
            formatPersonName(profile, "Bạn");
          setCurrentUser({
            fullName: profile?.fullName ?? "Bạn",
            displayName,
            avatar: profile?.avatar ?? FALLBACK_AVATAR,
            stats: { level: profile?.stats?.level ?? profile?.level ?? 1 },
          });
        } else {
          setCurrentUser({
          fullName: "Bạn",
            displayName: "Bạn",
            avatar: FALLBACK_AVATAR,
            stats: { level: 1 },
          });
        }

        if (listOutcome.status === "fulfilled") {
          const list = listOutcome.value;
          let nextUsernameMap = { ...baseUsernameMap };

          try {
            const neededIds = collectUserIdsFromCommunites(list);
            if (neededIds.length > 0) {
              const fetchedMap = await fetchUsernameMapForIds(neededIds);
              nextUsernameMap = { ...nextUsernameMap, ...fetchedMap };
            }
          } catch (err) {
            console.error("Không tải được username người dùng:", err);
          }

          setUsernameMap(nextUsernameMap);
          setPosts(
            list.map((item) => normalizeCommunite(item, uidStr, nextUsernameMap)),
          );
        } else {
          console.error(listOutcome.reason);
          setPosts([]);
          await showAlert(
            listOutcome.reason?.response?.data?.message?.[0] ??
              listOutcome.reason?.message ??
              "Không tải được bảng tin cộng đồng.",
          );
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          await showAlert(
            e?.response?.data?.message?.[0] ??
              e?.message ??
              "Không tải được bảng tin cộng đồng.",
          );
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLike = async (postId: string) => {
    const prev = posts;
    setPosts((p) =>
      p.map((x) =>
        x.id === postId
          ? {
              ...x,
              likes: x.isLiked ? Math.max(0, x.likes - 1) : x.likes + 1,
              isLiked: !x.isLiked,
            }
          : x,
      ),
    );
    try {
      const updated: any = await communitesService.like(postId);
      const doc = unwrapCommuniteDoc(updated);
      setPosts((p) =>
        p.map((x) =>
          x.id === postId ? normalizeCommunite(doc, currentUserId, usernameMap) : x,
        ),
      );
    } catch (e: any) {
      setPosts(prev);
      await showAlert(
        e?.response?.data?.message?.[0] ??
          e?.message ??
          "Không thể thích bài viết.",
      );
    }
  };

  const handleToggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const handleSendComment = async (postId: string) => {
    if (!commentInput.trim() && !commentFile) return;
    try {
      const updated: any = await communitesService.comment(postId, {
        content: commentInput.trim() || " ",
        file: commentFile ?? undefined,
      });
      const doc = unwrapCommuniteDoc(updated);
    setCommentInput("");
      setCommentFile(null);
      if (commentFileRef.current) commentFileRef.current.value = "";
      setPosts((p) =>
        p.map((x) =>
          x.id === postId ? normalizeCommunite(doc, currentUserId, usernameMap) : x,
        ),
      );
    } catch (e: any) {
      await showAlert(
        e?.response?.data?.message?.[0] ??
          e?.message ??
          "Không gửi được bình luận.",
      );
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostFile) return;
    setIsPosting(true);
    try {
      const created: any = await communitesService.create({
        content: newPostContent.trim() || " ",
        file: newPostFile,
      });
      const createdDoc = unwrapCommuniteDoc(created);
      const meHandle =
        pickUsername(currentUser) ??
        pickDisplayHandle(currentUser) ??
        (typeof currentUser?.displayName === "string"
          ? currentUser.displayName.trim()
          : null);
      const meKey = currentUserId ? normalizeUserIdKey(currentUserId) : "";
      if (meKey && meHandle) {
        setUsernameMap((prev) => ({
          ...prev,
          [meKey]: meHandle,
        }));
      }
      const post = normalizeCommunite(
        createdDoc,
        currentUserId,
        {
          ...usernameMap,
          ...(meKey && meHandle ? { [meKey]: meHandle } : {}),
        },
      );
      setPosts((p) => [post, ...p]);
    setNewPostContent("");
      setNewPostFile(null);
      if (createFileRef.current) createFileRef.current.value = "";
    setShowCreateModal(false);
    } catch (e: any) {
      await showAlert(
        e?.response?.data?.message?.[0] ??
          e?.message ??
          "Đăng bài thất bại.",
      );
    } finally {
    setIsPosting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F9FF] text-slate-500 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="font-bold text-indigo-400 animate-pulse">
          Đang tải bảng tin...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-32 font-sans text-slate-900 selection:bg-indigo-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-10 rotate-12 text-indigo-300">
          <Rocket size={64} />
        </div>
        <div className="absolute top-40 right-20 text-6xl opacity-10 -rotate-12 text-yellow-400">
          <Zap size={64} fill="currentColor" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-16 text-center px-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-black text-slate-800 mb-3 tracking-tight drop-shadow-sm flex items-center justify-center gap-3"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Cộng Đồng
          </span>
          Học Tập 🌟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 font-medium max-w-xl mx-auto"
        >
          Nơi chia sẻ thành tích, kiến thức và niềm vui mỗi ngày!
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-20 -mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-2 rounded-[2rem] shadow-xl shadow-indigo-900/5 border border-white hover:border-indigo-100 transition-all group cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-50 p-0.5 bg-white shrink-0 overflow-hidden">
              <img
                src={currentUser?.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition rounded-full px-5 py-3 text-slate-400 text-sm font-medium border border-transparent group-hover:border-indigo-100 truncate">
              {currentUser?.displayName
                ? `Hi ${currentUser.displayName}, `
                : ""}
              bạn
              đang nghĩ gì thế?
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-2 mt-1">
            <div className="flex gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-xs font-bold">
                <ImageIcon size={16} /> Ảnh
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-600 text-xs font-bold">
                <Smile size={16} /> Cảm xúc
              </span>
            </div>
            <button
              type="button"
              className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md"
            >
              Đăng bài
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white/80 rounded-[2rem] border border-dashed border-indigo-100">
                <p className="text-slate-500 font-medium">
                  Chưa có bài viết nào. Hãy là người đầu tiên đăng bài nhé!
                </p>
              </div>
            ) : (
              posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                  initial={false}
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-white shadow-sm overflow-hidden p-0.5">
                        <img
                          src={post.user.avatar}
                            alt=""
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-md border-2 border-white shadow-sm flex items-center gap-0.5">
                        <Zap size={8} fill="currentColor" /> {post.user.level}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        {post.user.name}
                        {post.user.level >= 10 && (
                          <Crown
                            size={14}
                            className="text-yellow-500 fill-yellow-500 animate-pulse"
                          />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {post.time}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Globe size={10} /> Công khai
                        </span>
                      </div>
                    </div>
                  </div>
                    <button
                      type="button"
                      className="text-slate-300 hover:text-indigo-500 p-2 rounded-xl hover:bg-indigo-50 transition"
                    >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="text-slate-700 mb-4 leading-relaxed whitespace-pre-wrap text-[15px] pl-1">
                  {post.content}
                </div>

                {post.isFeatured && (
                  <div className="mb-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-orange-200">
                      <Sparkles size={14} fill="currentColor" /> BÀI VIẾT NỔI
                      BẬT
                  </div>
                )}

                {post.images && post.images.length > 0 && (
                  <div className="w-full relative rounded-2xl overflow-hidden mb-5 border-2 border-white shadow-sm">
                    <img
                      src={post.images[0]}
                        alt=""
                      className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition duration-700"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 pb-2 border-b border-slate-50">
                  <motion.button
                      type="button"
                    whileTap={{ scale: 0.9 }}
                      onClick={() => void handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      post.isLiked
                        ? "text-pink-500 bg-pink-50 border border-pink-100"
                        : "text-slate-500 bg-slate-50 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={post.isLiked ? "currentColor" : "none"}
                      className={post.isLiked ? "animate-bounce" : ""}
                    />
                    {post.likes > 0 ? post.likes : "Thích"}
                  </motion.button>

                  <motion.button
                      type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent
                      ${expandedPostId === post.id ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600"}`}
                  >
                    <MessageCircle size={18} />
                      {post.commentsCount > 0
                        ? post.commentsCount
                        : "Bình luận"}
                  </motion.button>

                  <motion.button
                      type="button"
                    whileTap={{ scale: 0.95 }}
                    className="w-12 flex items-center justify-center py-2.5 rounded-xl text-slate-400 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <Share2 size={18} />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {expandedPostId === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-4"
                    >
                      <div className="flex gap-3 mb-5">
                        <img
                          src={currentUser?.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full border border-slate-200 bg-white shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="relative flex gap-2 items-center">
                              <input
                                ref={commentFileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setCommentFile(e.target.files?.[0] ?? null)
                                }
                              />
                          <input
                            type="text"
                                placeholder="Viết bình luận hoặc gửi ảnh..."
                                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 pr-[4.75rem] text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition"
                            value={commentInput}
                                onChange={(e) =>
                                  setCommentInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    void handleSendComment(post.id);
                                  }
                                }}
                          />
                          <button
                                type="button"
                                onClick={() =>
                                  commentFileRef.current?.click()
                                }
                                className="absolute right-11 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                title="Đính ảnh"
                              >
                                <ImageIcon size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleSendComment(post.id)
                                }
                                disabled={
                                  !commentInput.trim() && !commentFile
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 p-1 disabled:opacity-30"
                          >
                            <Send size={16} />
                          </button>
                            </div>
                            {commentPreviewUrl && (
                              <div className="relative inline-block max-w-[200px]">
                                <img
                                  src={commentPreviewUrl}
                                  alt=""
                                  className="rounded-xl border border-slate-200 max-h-28 w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCommentFile(null);
                                    if (commentFileRef.current)
                                      commentFileRef.current.value = "";
                                  }}
                                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-slate-700 text-white text-[10px]"
                                  aria-label="Gỡ ảnh"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment, idx) => (
                            <div
                              key={comment.id || idx}
                              className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                              <img
                                src={comment.avatar}
                                  alt=""
                                className="w-8 h-8 rounded-full border border-slate-100 mt-1"
                              />
                              <div className="flex-1">
                                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-100 inline-block min-w-[150px]">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-sm text-slate-800">
                                      {comment.user}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {comment.time}
                                    </span>
                                  </div>
                                    {comment.content ? (
                                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                                    ) : null}
                                    {comment.imageUrl ? (
                                      <img
                                        src={comment.imageUrl}
                                        alt=""
                                        className="mt-2 rounded-xl max-h-48 w-full object-cover border border-slate-100"
                                      />
                                    ) : null}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm italic flex flex-col items-center">
                            <MessageCircle
                              size={24}
                              className="mb-2 opacity-20"
                            />
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        <div className="text-center pt-8 pb-4">
          <p className="text-slate-400 text-sm font-medium bg-white/50 inline-block px-4 py-2 rounded-full">
            Đã hiển thị tin mới nhất
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-white ring-4 ring-indigo-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-xl text-slate-800">
                  Tạo bài viết
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPostFile(null);
                    if (createFileRef.current) createFileRef.current.value = "";
                  }}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={currentUser?.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base">
                      {currentUser?.displayName || currentUser?.fullName || "Bạn"}
                    </p>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold mt-1 inline-block">
                      🌏 Công khai
                    </span>
                  </div>
                </div>
                <textarea
                  className="w-full h-40 resize-none text-slate-700 text-lg placeholder:text-slate-300 focus:outline-none bg-transparent"
                  placeholder="Chia sẻ thành tích hoặc câu hỏi của bạn..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  autoFocus
                />

                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setNewPostFile(e.target.files?.[0] ?? null)
                  }
                />

                <div className="border border-slate-200 rounded-2xl p-2 flex items-center justify-between mt-4 bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 pl-3 uppercase tracking-wider">
                    Đính kèm
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => createFileRef.current?.click()}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-green-500 transition"
                    >
                      <ImageIcon size={22} />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-yellow-500 transition"
                    >
                      <Smile size={22} />
                    </button>
                  </div>
                </div>
                {newPostPreviewUrl && (
                  <div className="relative mt-3 inline-block max-w-full">
                    <img
                      src={newPostPreviewUrl}
                      alt=""
                      className="max-h-56 rounded-2xl border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostFile(null);
                        if (createFileRef.current)
                          createFileRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-800 text-white shadow-md hover:bg-slate-700"
                      aria-label="Gỡ ảnh"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => void handleCreatePost()}
                  disabled={
                    (!newPostContent.trim() && !newPostFile) || isPosting
                  }
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 text-lg"
                >
                  {isPosting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} /> Đăng bài
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Layers3,
  RefreshCw,
  CheckCircle2,
  Clock3,
  X,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { lessonService } from "@/services/lessons.service";
import { unitService } from "@/services/units.service";
import { showAlert, showConfirm } from "@/utils/dialog";

type LessonStatus = "ACTIVE" | "INACTIVE";
type LessonRow = {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  unitName: string;
  type: string;
  status: LessonStatus;
  orderIndex: number;
  duration: number;
  updatedAt: string;
};

type UnitOption = { id: string; name: string };

type VocabWord = { word: string; definition: string; ipa?: string };
type VocabularyContent = {
  type: "vocabulary";
  description: string;
  words: VocabWord[];
  tags?: string[];
};
type GenericContentField = {
  key: string;
  value: string;
};
type QaPair = { question: string; answer: string };
type GrammarExample = { example: string; translation: string };
type CreateTypedContentState = {
  grammar: {
    description: string;
    rule: string;
    explanation_vi: string;
    explanation_en: string;
    examples: GrammarExample[];
    commonMistakesText: string;
    tagsText: string;
  };
  dialogue: {
    description: string;
    script: string;
    audio: string;
    translation: string;
    tagsText: string;
  };
  reading: {
    description: string;
    passage: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  listening: {
    description: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  speaking: {
    description: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  writing: {
    description: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  quiz: {
    description: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  review: {
    description: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
  song: {
    description: string;
    lyrics: string;
    translation: string;
    audio: string;
    video: string;
    vocabularyText: string;
    questionsAndAnswers: QaPair[];
    tagsText: string;
  };
};

const normalizeSkillFocusByType = (type: string): string => {
  if (type === "song") return "listening";
  return type;
};

const normalizeApiLessonType = (type: string): string => {
  if (type === "song") return "listening";
  return type;
};

const tinymceInit: any = {
  menubar: false,
  height: 220,
  plugins: "lists link table code autolink",
  toolbar:
    "undo redo | blocks | bold italic underline | bullist numlist | link table | removeformat | code",
  branding: false,
  statusbar: false,
  entity_encoding: "raw",
  content_style: "body { font-family: Inter, Arial, sans-serif; font-size: 14px; }",
};

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | LessonStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonRow[]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState("");
  const [editForm, setEditForm] = useState({
    id: "",
    unitId: "",
    title: "",
    description: "",
    type: "vocabulary",
    level: "A1",
    skillFocus: "vocabulary",
    orderIndex: "1",
    duration: "30",
    isActive: "active",
  });
  const [lessonForm, setLessonForm] = useState({
    unitId: "",
    title: "",
    description: "",
    type: "vocabulary",
    level: "A1",
    skillFocus: "vocabulary",
    orderIndex: "1",
    duration: "30",
    isActive: "active",
  });

  const defaultVocabularyContent = (): VocabularyContent => ({
    type: "vocabulary",
    description: "",
    words: [{ word: "", definition: "", ipa: "" }],
    tags: [],
  });

  const defaultQaPairs = (): QaPair[] => [{ question: "", answer: "" }];

  const defaultCreateTypedContent = (): CreateTypedContentState => ({
    grammar: {
      description: "",
      rule: "",
      explanation_vi: "",
      explanation_en: "",
      examples: [{ example: "", translation: "" }],
      commonMistakesText: "",
      tagsText: "",
    },
    dialogue: {
      description: "",
      script: "",
      audio: "",
      translation: "",
      tagsText: "",
    },
    reading: {
      description: "",
      passage: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    listening: {
      description: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    speaking: {
      description: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    writing: {
      description: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    quiz: {
      description: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    review: {
      description: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
    song: {
      description: "",
      lyrics: "",
      translation: "",
      audio: "",
      video: "",
      vocabularyText: "",
      questionsAndAnswers: defaultQaPairs(),
      tagsText: "",
    },
  });

  const defaultGenericContentFields = (): GenericContentField[] => [{ key: "", value: "" }];

  const decodeHtmlEntitiesDeep = (value: string): string => {
    if (!value || typeof document === "undefined") return value;

    let current = value;
    // Decode 2-3 rounds to handle payloads like "&amp;agrave;".
    for (let i = 0; i < 3; i += 1) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = current;
      const next = textarea.value;
      if (next === current) break;
      current = next;
    }
    return current;
  };

  const normalizeIncomingHtml = (input: unknown): string => {
    const raw = String(input ?? "");
    if (!raw.trim() || typeof document === "undefined") return raw;

    const decoded = decodeHtmlEntitiesDeep(raw);

    // Let browser parser repair malformed HTML structure.
    const wrapper = document.createElement("div");
    wrapper.innerHTML = decoded;
    return wrapper.innerHTML;
  };

  const normalizeShortDescription = (input: unknown): string => {
    const raw = String(input ?? "");
    if (!raw.trim() || typeof document === "undefined") return raw;

    const decoded = decodeHtmlEntitiesDeep(raw);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = decoded;
    const text = (wrapper.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text;
  };

  const objectToFields = (obj: any): GenericContentField[] => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return defaultGenericContentFields();
    }
    const entries = Object.entries(obj);
    if (!entries.length) return defaultGenericContentFields();
    return entries.map(([key, value]) => ({
      key,
      value:
        typeof value === "string"
          ? normalizeIncomingHtml(value)
          : typeof value === "number" || typeof value === "boolean"
            ? String(value)
            : JSON.stringify(value),
    }));
  };

  const parseFieldValue = (raw: string): any => {
    const text = raw.trim();
    if (!text) return "";
    if (text === "true") return true;
    if (text === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
      try {
        return JSON.parse(text);
      } catch {
        return raw;
      }
    }
    return raw;
  };

  const parseTagsText = (raw: string): string[] =>
    String(raw || "")
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const cleanQaPairs = (pairs: QaPair[]): QaPair[] =>
    (pairs || [])
      .map((x) => ({ question: String(x.question || "").trim(), answer: String(x.answer || "").trim() }))
      .filter((x) => x.question && x.answer);

  const fieldsToObject = (fields: GenericContentField[]): Record<string, any> => {
    const out: Record<string, any> = {};
    fields.forEach((item) => {
      const key = item.key.trim();
      if (!key) return;
      out[key] = parseFieldValue(item.value);
    });
    return out;
  };

  const normalizeContentBySchema = (lessonType: string, rawContent: any, apiData: any) => {
    const content = rawContent && typeof rawContent === "object" ? rawContent : {};
    const tags = Array.isArray(content?.tags) ? content.tags : Array.isArray(apiData?.tags) ? apiData.tags : [];

    if (lessonType === "vocabulary") {
      return {
        type: "vocabulary",
        description: normalizeIncomingHtml(content?.description || apiData?.description || ""),
        words: Array.isArray(content?.words) ? content.words : [],
        tags,
      };
    }

    if (lessonType === "grammar") {
      return {
        type: "grammar",
        description: normalizeIncomingHtml(content?.description || ""),
        rule: String(content?.rule || ""),
        explanation_vi: String(content?.explanation_vi || ""),
        explanation_en: String(content?.explanation_en || ""),
        examples: Array.isArray(content?.examples) ? content.examples : [],
        commonMistakes: Array.isArray(content?.commonMistakes) ? content.commonMistakes : [],
        tags,
      };
    }

    if (lessonType === "dialogue") {
      return {
        type: "dialogue",
        description: normalizeIncomingHtml(content?.description || ""),
        script: String(content?.script || ""),
        audio: String(content?.audio || ""),
        translation: String(content?.translation || ""),
        tags,
      };
    }

    if (lessonType === "reading") {
      return {
        type: "reading",
        description: normalizeIncomingHtml(content?.description || ""),
        passage: String(content?.passage || ""),
        questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
          ? content.questionsAndAnswers
          : [],
        tags,
      };
    }

    if (["listening", "speaking", "writing"].includes(lessonType)) {
      return {
        type: "exercises",
        exerciseType: String(content?.exerciseType || lessonType),
        description: normalizeIncomingHtml(content?.description || ""),
        questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
          ? content.questionsAndAnswers
          : [],
        tags,
      };
    }

    if (lessonType === "quiz") {
      return {
        type: "quizzes",
        description: normalizeIncomingHtml(content?.description || ""),
        questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
          ? content.questionsAndAnswers
          : [],
        tags,
      };
    }

    if (lessonType === "review") {
      return {
        type: "reviews",
        description: normalizeIncomingHtml(content?.description || ""),
        questionsAndAnswers: Array.isArray(content?.questionsAndAnswers)
          ? content.questionsAndAnswers
          : [],
        tags,
      };
    }

    return {
      ...(content || {}),
      description: normalizeIncomingHtml(content?.description || ""),
      tags,
    };
  };

  const getImageFromClipboardData = (data: DataTransfer | null): File | null => {
    if (!data) return null;
    const items = Array.from(data.items || []);
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
    return null;
  };


  const [createContent, setCreateContent] = useState<VocabularyContent>(defaultVocabularyContent());
  const [editContent, setEditContent] = useState<VocabularyContent>(defaultVocabularyContent());
  const [createTypedContent, setCreateTypedContent] = useState<CreateTypedContentState>(
    defaultCreateTypedContent(),
  );
  const [createContentFields, setCreateContentFields] = useState<GenericContentField[]>(
    defaultGenericContentFields(),
  );
  const [editContentFields, setEditContentFields] = useState<GenericContentField[]>(
    defaultGenericContentFields(),
  );

  const fetchLessons = async (filterStatus?: "ALL" | LessonStatus) => {
    try {
      setLoading(true);
      const statusToFetch = filterStatus ?? status;
      let res: any;

      if (statusToFetch === "ALL") {
        res = await lessonService.getAllLessons({ page: 1, limit: 500 });
      } else {
        const statusParam = statusToFetch === "ACTIVE" ? "active" : "inactive";
        res = await lessonService.getLessonsByStatus(statusParam);
      }

      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const mapped: LessonRow[] = list.map((l) => {
        // Backend có thể trả `isActive` kiểu enum string ("active"/"inactive")
        // hoặc trả ở field `status`. Ưu tiên lấy đúng dữ liệu thay vì default "" -> active.
        const statusRaw = String(l?.isActive ?? l?.status ?? "").toLowerCase();
        const lessonStatus: LessonStatus =
          statusRaw === "inactive" ||
          statusRaw === "blocked" ||
          statusRaw === "deleted" ||
          statusRaw === "false" ||
          statusRaw === "0"
            ? "INACTIVE"
            : "ACTIVE";
        const updatedIso = l?.updatedAt || l?.createdAt || "";
        const unitId = String(
          l?.unitId?._id || l?.unitId?.id || l?.unit?._id || l?.unit?.id || l?.unitId || "",
        );
        return {
          id: String(l?._id || l?.id || ""),
          unitId,
          name: String(l?.title || l?.name || "Bài học chưa đặt tên"),
          description: normalizeShortDescription(l?.description || ""),
          descriptionHtml: normalizeIncomingHtml(l?.description || ""),
          unitName: String(
            l?.unitId?.name || l?.unit?.name || l?.unitName || "Không rõ chủ đề",
          ),
          type: String(l?.type || "N/A"),
          status: lessonStatus,
          orderIndex: Number(l?.orderIndex || 0),
          duration: Number(l?.duration || l?.timeLimit || 0),
          updatedAt: updatedIso
            ? new Date(updatedIso).toLocaleDateString("vi-VN")
            : "—",
        };
      });
      setLessons(mapped.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error) {
      console.error("Lỗi lấy danh sách bài học:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsForSelect = async () => {
    try {
      const res: any = await unitService.getAllUnits({ page: 1, limit: 500 });
      const payload = res?.data ?? res;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setUnitOptions(
        list.map((u) => ({
          id: String(u?._id || u?.id || ""),
          name: String(u?.name || u?.title || "Chủ đề"),
        })),
      );
    } catch {
      setUnitOptions([]);
    }
  };

  useEffect(() => {
    fetchUnitsForSelect();
  }, []);

  useEffect(() => {
    fetchLessons(status);
  }, [status]);

  useEffect(() => {
    // ensure defaults for create form content
    setCreateContent(defaultVocabularyContent());
  }, []);

  const resetLessonForm = () => {
    setLessonForm({
      unitId: "",
      title: "",
      description: "",
      type: "vocabulary",
      level: "A1",
      skillFocus: "vocabulary",
      orderIndex: "1",
      duration: "30",
      isActive: "active",
    });
    setCreateContent(defaultVocabularyContent());
    setCreateTypedContent(defaultCreateTypedContent());
    setCreateContentFields(defaultGenericContentFields());
    setThumbnailFile(null);
    setThumbnailUrl("");
    setCreateError("");
    setCreateSuccess("");
  };

  const resetEditForm = () => {
    setEditForm({
      id: "",
      unitId: "",
      title: "",
      description: "",
      type: "vocabulary",
      level: "A1",
      skillFocus: "vocabulary",
      orderIndex: "1",
      duration: "30",
      isActive: "active",
    });
    setEditContent(defaultVocabularyContent());
    setEditContentFields(defaultGenericContentFields());
    setEditThumbnailFile(null);
    setEditThumbnailUrl("");
    setEditError("");
  };

  const buildCreateContentByType = (): any | null => {
    switch (lessonForm.type) {
      case "grammar": {
        const data = createTypedContent.grammar;
        if (!data.rule.trim()) {
          setCreateError("Vui lòng nhập quy tắc ngữ pháp.");
          return null;
        }
        return {
          type: "grammar",
          description: data.description,
          rule: data.rule,
          explanation_vi: data.explanation_vi,
          explanation_en: data.explanation_en,
          examples: data.examples
            .map((x) => ({ example: x.example.trim(), translation: x.translation.trim() }))
            .filter((x) => x.example && x.translation),
          commonMistakes: data.commonMistakesText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          tags: parseTagsText(data.tagsText),
        };
      }
      case "dialogue": {
        const data = createTypedContent.dialogue;
        if (!data.script.trim()) {
          setCreateError("Vui lòng nhập hội thoại (script).");
          return null;
        }
        return {
          type: "dialogue",
          description: data.description,
          script: data.script,
          audio: data.audio,
          translation: data.translation,
          tags: parseTagsText(data.tagsText),
        };
      }
      case "reading": {
        const data = createTypedContent.reading;
        if (!data.passage.trim()) {
          setCreateError("Vui lòng nhập đoạn đọc.");
          return null;
        }
        return {
          type: "reading",
          description: data.description,
          passage: data.passage,
          questionsAndAnswers: cleanQaPairs(data.questionsAndAnswers),
          tags: parseTagsText(data.tagsText),
        };
      }
      case "listening":
      case "speaking":
      case "writing": {
        const data = createTypedContent[lessonForm.type];
        const qa = cleanQaPairs(data.questionsAndAnswers);
        if (!qa.length) {
          setCreateError("Vui lòng nhập ít nhất 1 câu hỏi và đáp án.");
          return null;
        }
        return {
          type: "exercises",
          description: data.description,
          exerciseType: lessonForm.type,
          questionsAndAnswers: qa,
          tags: parseTagsText(data.tagsText),
        };
      }
      case "quiz": {
        const data = createTypedContent.quiz;
        const qa = cleanQaPairs(data.questionsAndAnswers);
        if (!qa.length) {
          setCreateError("Vui lòng nhập ít nhất 1 câu hỏi và đáp án cho quiz.");
          return null;
        }
        return {
          type: "quizzes",
          description: data.description,
          questionsAndAnswers: qa,
          tags: parseTagsText(data.tagsText),
        };
      }
      case "review": {
        const data = createTypedContent.review;
        const qa = cleanQaPairs(data.questionsAndAnswers);
        if (!qa.length) {
          setCreateError("Vui lòng nhập ít nhất 1 câu hỏi và đáp án cho phần ôn tập.");
          return null;
        }
        return {
          type: "reviews",
          description: data.description,
          questionsAndAnswers: qa,
          tags: parseTagsText(data.tagsText),
        };
      }
      case "song": {
        const data = createTypedContent.song;
        if (!data.lyrics.trim()) {
          setCreateError("Vui lòng nhập lời bài hát.");
          return null;
        }
        const qa = cleanQaPairs(data.questionsAndAnswers);
        const vocabulary = String(data.vocabularyText || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [word = "", definition = "", ipa = ""] = line.split("|").map((x) => x.trim());
            return { word, definition, ...(ipa ? { ipa } : {}) };
          })
          .filter((x) => x.word && x.definition);

        return {
          type: "songs",
          description: data.description,
          lyrics: data.lyrics,
          translation: data.translation,
          audio: data.audio,
          video: data.video,
          vocabulary,
          questionsAndAnswers: qa,
          tags: parseTagsText(data.tagsText),
        };
      }
      default:
        setCreateError("Loại bài học chưa được hỗ trợ trong form tạo mới.");
        return null;
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.unitId.trim()) {
      setCreateError("Vui lòng chọn chủ đề (unit).");
      return;
    }
    if (!lessonForm.title.trim()) {
      setCreateError("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");

      let contentObj: any = {};
      if (lessonForm.type === "vocabulary") {
        const vocabContent: VocabularyContent = {
          ...createContent,
          type: "vocabulary",
          words: (createContent.words || []).filter(
            (w) => String(w.word || "").trim() && String(w.definition || "").trim(),
          ),
        };
        if (!vocabContent.words.length) {
          setCreateError("Vui lòng nhập ít nhất 1 từ vựng (word + definition).");
          return;
        }
        contentObj = vocabContent;
      } else {
        const built = buildCreateContentByType();
        if (!built) return;
        contentObj = built;
      }

      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("unit", lessonForm.unitId.trim());
        fd.append("title", lessonForm.title.trim());
        fd.append("description", normalizeShortDescription(lessonForm.description));
        fd.append("type", normalizeApiLessonType(lessonForm.type));
        fd.append("level", lessonForm.level);
        fd.append("orderIndex", lessonForm.orderIndex || "0");
        fd.append("estimatedDuration", lessonForm.duration || "0");
        fd.append("skillFocus", lessonForm.skillFocus || normalizeSkillFocusByType(lessonForm.type));
        fd.append("isActive", lessonForm.isActive);
        fd.append("thumbnail", thumbnailFile);
        fd.append("content", JSON.stringify(contentObj));
        await lessonService.createLesson(fd);
      } else {
        await lessonService.createLesson({
          unit: lessonForm.unitId.trim(),
          title: lessonForm.title.trim(),
          description: normalizeShortDescription(lessonForm.description),
          type: normalizeApiLessonType(lessonForm.type),
          level: lessonForm.level,
          orderIndex: Number(lessonForm.orderIndex || 0),
          estimatedDuration: Number(lessonForm.duration || 0),
          skillFocus: lessonForm.skillFocus || normalizeSkillFocusByType(lessonForm.type),
          isActive: lessonForm.isActive,
          ...(thumbnailUrl.trim() ? { thumbnail: thumbnailUrl.trim() } : {}),
          content: contentObj,
        } as any);
      }
      setCreateSuccess("Tạo bài học thành công.");
      await fetchLessons(status);
      setTimeout(() => {
        setOpenCreate(false);
        resetLessonForm();
      }, 600);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setCreateError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không thể tạo bài học.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    const ok = await showConfirm("Bạn có chắc muốn xóa bài học này?", "Xóa bài học");
    if (!ok) return;
    const prevLessons = lessons;
    setLessons((prev) => prev.filter((l) => l.id !== id));
    try {
      await lessonService.deleteLesson(id);
      await showAlert("Đã xóa bài học thành công.", "Thành công");
    } catch (error: any) {
      setLessons(prevLessons);
      await showAlert(
        error?.response?.data?.message || "Không thể xóa bài học.",
        "Xóa thất bại",
      );
    }
  };

  const handleRestoreLesson = async (id: string) => {
    const ok = await showConfirm("Bạn có chắc muốn khôi phục bài học này?", "Khôi phục bài học");
    if (!ok) return;

    const prevLessons = lessons;
    setLessons((prev) => prev.filter((l) => l.id !== id));

    try {
      await lessonService.restoreLesson(id);
      await fetchLessons(status);
      await showAlert("Đã khôi phục bài học thành công.", "Thành công");
    } catch (error: any) {
      setLessons(prevLessons);
      await showAlert(
        error?.response?.data?.message || "Không thể khôi phục bài học.",
        "Khôi phục thất bại",
      );
    }
  };

  const handleOpenEdit = async (row: LessonRow) => {
    setEditError("");
    setEditThumbnailFile(null);
    setEditThumbnailUrl("");
    try {
      const res: any = await lessonService.getLessonById(row.id);
      const detail = res?.data ?? res;
      const rawContentType = String(detail?.content?.type || "").toLowerCase();
      const normalizedType =
        rawContentType === "song" || rawContentType === "songs"
          ? "song"
          : String(detail?.type || row.type || "vocabulary").toLowerCase();

      const rawContent = detail?.content && typeof detail.content === "object" ? detail.content : null;
      const normalizedContent = normalizeContentBySchema(normalizedType, rawContent, detail);
      const rawWords = Array.isArray(rawContent?.words) ? rawContent.words : [];
      const mappedWords: VocabWord[] = rawWords
        .map((w: any) => ({
          word: String(w?.word || ""),
          definition: String(w?.definition || ""),
          ipa: String(w?.ipa || ""),
        }))
        .filter((w: VocabWord) => w.word || w.definition || w.ipa);

      setEditForm({
        id: row.id,
        unitId: String(
          detail?.unitId?._id ||
            detail?.unitId?.id ||
            detail?.unit?._id ||
            detail?.unit?.id ||
            detail?.unitId ||
            detail?.unit ||
            row.unitId ||
            "",
        ),
        title: String(detail?.title || detail?.name || row.name || ""),
        description: normalizeShortDescription(detail?.description || row.description || ""),
        type: normalizedType,
        level: String(detail?.level || "A1"),
        skillFocus: String(detail?.skillFocus || normalizeSkillFocusByType(normalizedType)),
        orderIndex: String(detail?.orderIndex ?? row.orderIndex ?? 0),
        duration: String(detail?.estimatedDuration ?? detail?.duration ?? row.duration ?? 0),
        isActive: String(detail?.isActive || (row.status === "ACTIVE" ? "active" : "inactive")).toLowerCase(),
      });

      setEditContent({
        type: "vocabulary",
        description: normalizeIncomingHtml(normalizedContent?.description || detail?.description || ""),
        words: mappedWords.length ? mappedWords : [{ word: "", definition: "", ipa: "" }],
        tags: Array.isArray(normalizedContent?.tags) ? normalizedContent.tags : [],
      });
      setEditThumbnailUrl(String(detail?.thumbnail || detail?.thumbnailUrl || ""));
      setEditContentFields(objectToFields(normalizedContent));
      setOpenEdit(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      await showAlert(
        Array.isArray(msg) ? msg.join(", ") : msg || "Không tải được chi tiết bài học.",
        "Không thể mở chỉnh sửa",
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    if (!editForm.unitId.trim()) {
      setEditError("Vui lòng chọn chủ đề (unit).");
      return;
    }
    if (!editForm.title.trim()) {
      setEditError("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    try {
      setSavingEdit(true);
      setEditError("");

      let contentObj: any = {};
      if (editForm.type === "vocabulary") {
        const vocabContent: VocabularyContent = {
          ...editContent,
          type: "vocabulary",
          words: (editContent.words || []).filter(
            (w) => String(w.word || "").trim() && String(w.definition || "").trim(),
          ),
        };
        if (!vocabContent.words.length) {
          setEditError("Vui lòng nhập ít nhất 1 từ vựng (word + definition).");
          return;
        }
        contentObj = vocabContent;
      } else {
        contentObj = fieldsToObject(editContentFields);
      }

      if (editThumbnailFile) {
        const fd = new FormData();
        fd.append("unit", editForm.unitId.trim());
        fd.append("title", editForm.title.trim());
        fd.append("description", normalizeShortDescription(editForm.description));
        fd.append("type", normalizeApiLessonType(editForm.type));
        fd.append("level", editForm.level);
        fd.append("orderIndex", editForm.orderIndex || "0");
        fd.append("estimatedDuration", editForm.duration || "0");
        fd.append("skillFocus", editForm.skillFocus || normalizeSkillFocusByType(editForm.type));
        fd.append("isActive", editForm.isActive);
        fd.append("thumbnail", editThumbnailFile);
        fd.append("content", JSON.stringify(contentObj));
        await lessonService.updateLesson(editForm.id, fd);
      } else {
        await lessonService.updateLesson(editForm.id, {
          unit: editForm.unitId.trim(),
          title: editForm.title.trim(),
          description: normalizeShortDescription(editForm.description),
          type: normalizeApiLessonType(editForm.type),
          level: editForm.level,
          orderIndex: Number(editForm.orderIndex || 0),
          estimatedDuration: Number(editForm.duration || 0),
          skillFocus: editForm.skillFocus || normalizeSkillFocusByType(editForm.type),
          isActive: editForm.isActive,
          ...(editThumbnailUrl.trim() ? { thumbnail: editThumbnailUrl.trim() } : {}),
          content: contentObj,
        });
      }
      setOpenEdit(false);
      resetEditForm();
      await fetchLessons(status);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message;
      setEditError(Array.isArray(msg) ? msg.join(", ") : msg || "Không thể cập nhật bài học.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const okText =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.unitName.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase());
      return okText;
    });
  }, [search, lessons]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const activeCount = lessons.filter((x) => x.status === "ACTIVE").length;
  const inactiveCount = lessons.filter((x) => x.status === "INACTIVE").length;

  const statusBadge = (s: LessonStatus) => {
    if (s === "ACTIVE") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          Hoạt động
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Ngừng hoạt động
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              Quản lý bài học
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dữ liệu đồng bộ từ API lấy danh sách bài học.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLessons(status)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
            <button
              type="button"
              onClick={() => {
                resetLessonForm();
                setOpenCreate(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus size={18} /> Tạo bài học
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Tổng bài học</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{lessons.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Đang hoạt động</p>
            <p className="text-2xl font-black text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs uppercase text-slate-500 font-bold">Ngừng hoạt động</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{inactiveCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bài học / chủ đề..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-slate-500" />
            {([
              { value: "ALL", label: "Tất cả" },
              { value: "ACTIVE", label: "Đang hoạt động" },
              { value: "INACTIVE", label: "Ngừng hoạt động" },
            ] as const).map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  status === s.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4 pl-6">Bài học</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Chủ đề</th>
                <th className="p-4 text-center">Thứ tự</th>
                <th className="p-4 text-center">Thời lượng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Cập nhật</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedLessons.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{l.name}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {l.id}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-md">
                    {l.descriptionHtml ? (
                      <div
                        className="line-clamp-2 [&_p]:m-0 [&_img]:hidden"
                        dangerouslySetInnerHTML={{ __html: l.descriptionHtml }}
                      />
                    ) : (
                      <span className="line-clamp-2">{l.description || "—"}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{l.unitName}</td>
                  <td className="p-4 text-center text-slate-600">{l.orderIndex}</td>
                  <td className="p-4 text-center text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} /> {l.duration || 0}m
                    </span>
                  </td>
                  <td className="p-4 text-center">{statusBadge(l.status)}</td>
                  <td className="p-4 text-slate-500">{l.updatedAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        <Pencil size={13} /> Sửa
                      </button>
                      {l.status === "INACTIVE" && (
                        <button
                          onClick={() => handleRestoreLesson(l.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 inline-flex items-center gap-1"
                        >
                          <RotateCcw size={13} /> Khôi phục
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLesson(l.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-10 text-center text-slate-500">Đang tải dữ liệu bài học...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={24} />
              Không có bài học phù hợp bộ lọc.
            </div>
          ) : null}

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Trang {currentPage}/{totalPages} • Tổng {filtered.length} bài học
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {openCreate && (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(980px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">Tạo bài học mới</h2>
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto [&_input]:text-base [&_select]:text-base [&_textarea]:text-base [&_input]:py-3 [&_select]:py-3 [&_textarea]:py-3">
                {createError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 font-semibold">
                    {createSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-bold text-slate-600">
                    Chủ đề *
                    <select
                      value={lessonForm.unitId}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, unitId: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white"
                    >
                      <option value="">— Chọn chủ đề —</option>
                      {unitOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề bài học *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Mô tả ngắn"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={lessonForm.type}
                      onChange={(e) =>
                        setLessonForm((p) => ({
                          ...p,
                          type: e.target.value,
                          skillFocus: normalizeSkillFocusByType(e.target.value),
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="vocabulary">Từ vựng</option>
                      <option value="grammar">Ngữ pháp</option>
                      <option value="reading">Đọc hiểu</option>
                      <option value="listening">Nghe</option>
                      <option value="speaking">Nói</option>
                      <option value="writing">Viết</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="song">Bài hát</option>
                      <option value="quiz">Quiz</option>
                      <option value="review">Ôn tập</option>
                    </select>
                    <select
                      value={lessonForm.level}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          Trình độ {lv}
                        </option>
                      ))}
                    </select>
                    <select
                      value={lessonForm.isActive}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, isActive: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                    <input
                      type="number"
                      value={lessonForm.orderIndex}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, orderIndex: e.target.value }))
                      }
                      placeholder="Thứ tự"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      placeholder="Thời lượng (phút)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-bold text-slate-600 mb-2">
                      {lessonForm.type === "vocabulary" ? "Nội dung (Từ vựng)" : "Nội dung (Các trường dữ liệu)"}
                    </div>
                    {lessonForm.type === "vocabulary" ? (
                      <>
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
                            Mô tả nội dung (tuỳ chọn)
                          </div>
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                            value={createContent.description}
                            onEditorChange={(content) =>
                              setCreateContent((c) => ({
                                ...c,
                                description: normalizeIncomingHtml(content),
                              }))
                            }
                            init={tinymceInit}
                          />
                        </div>
                        <div className="mt-3 space-y-2">
                          {createContent.words.map((w, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                              <input
                                value={w.word}
                                onChange={(e) =>
                                  setCreateContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, word: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Từ vựng"
                                className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={w.definition}
                                onChange={(e) =>
                                  setCreateContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, definition: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Nghĩa"
                                className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={w.ipa || ""}
                                onChange={(e) =>
                                  setCreateContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, ipa: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Phiên âm (IPA)"
                                className="sm:col-span-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <div className="sm:col-span-6 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCreateContent((c) => ({
                                      ...c,
                                      words:
                                        c.words.length <= 1
                                          ? c.words
                                          : c.words.filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                >
                                  Xóa dòng
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setCreateContent((c) => ({
                                ...c,
                                words: [...c.words, { word: "", definition: "", ipa: "" }],
                              }))
                            }
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                          >
                            + Thêm từ
                          </button>
                        </div>
                      </>
                    ) : (
                      (() => {
                        if (lessonForm.type === "grammar") {
                          const data = createTypedContent.grammar;
                          return (
                            <div className="space-y-2">
                              <input
                                value={data.rule}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, rule: e.target.value } }))
                                }
                                placeholder="Quy tắc chính *"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={data.explanation_vi}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, explanation_vi: e.target.value } }))
                                }
                                placeholder="Giải thích tiếng Việt"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={data.explanation_en}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, explanation_en: e.target.value } }))
                                }
                                placeholder="Giải thích tiếng Anh"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">Mô tả</div>
                                <Editor
                                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                                  value={data.description}
                                  onEditorChange={(content) =>
                                    setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, description: normalizeIncomingHtml(content) } }))
                                  }
                                  init={{ ...tinymceInit, height: 160 }}
                                />
                              </div>
                              <textarea
                                value={data.commonMistakesText}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, commonMistakesText: e.target.value } }))
                                }
                                placeholder="Lỗi thường gặp (mỗi dòng 1 lỗi)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-20"
                              />
                              <input
                                value={data.tagsText}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, grammar: { ...p.grammar, tagsText: e.target.value } }))
                                }
                                placeholder="Tags (cách nhau bởi dấu phẩy)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                            </div>
                          );
                        }

                        if (lessonForm.type === "dialogue") {
                          const data = createTypedContent.dialogue;
                          return (
                            <div className="space-y-2">
                              <textarea
                                value={data.script}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, dialogue: { ...p.dialogue, script: e.target.value } }))
                                }
                                placeholder="Nội dung hội thoại (script) *"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                              />
                              <input
                                value={data.translation}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, dialogue: { ...p.dialogue, translation: e.target.value } }))
                                }
                                placeholder="Bản dịch"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={data.audio}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, dialogue: { ...p.dialogue, audio: e.target.value } }))
                                }
                                placeholder="Link audio"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={data.tagsText}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, dialogue: { ...p.dialogue, tagsText: e.target.value } }))
                                }
                                placeholder="Tags (cách nhau bởi dấu phẩy)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                            </div>
                          );
                        }

                        if (lessonForm.type === "song") {
                          const data = createTypedContent.song;
                          return (
                            <div className="space-y-2">
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">Mô tả bài hát</div>
                                <Editor
                                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                                  value={data.description}
                                  onEditorChange={(content) =>
                                    setCreateTypedContent((p) => ({ ...p, song: { ...p.song, description: normalizeIncomingHtml(content) } }))
                                  }
                                  init={{ ...tinymceInit, height: 140 }}
                                />
                              </div>
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">Lời bài hát *</div>
                                <Editor
                                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                                  value={data.lyrics}
                                  onEditorChange={(content) =>
                                    setCreateTypedContent((p) => ({ ...p, song: { ...p.song, lyrics: normalizeIncomingHtml(content) } }))
                                  }
                                  init={{ ...tinymceInit, height: 180 }}
                                />
                              </div>
                              <textarea
                                value={data.translation}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, song: { ...p.song, translation: e.target.value } }))
                                }
                                placeholder="Bản dịch"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-20"
                              />
                              <input
                                value={data.audio}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, song: { ...p.song, audio: e.target.value } }))
                                }
                                placeholder="Link audio"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={data.video}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, song: { ...p.song, video: e.target.value } }))
                                }
                                placeholder="Link video"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <textarea
                                value={data.vocabularyText}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, song: { ...p.song, vocabularyText: e.target.value } }))
                                }
                                placeholder="Từ vựng theo dòng: tu|nghia|ipa (ipa tùy chọn)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-20"
                              />
                              <div className="space-y-2">
                                {data.questionsAndAnswers.map((qa, idx) => (
                                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <input
                                      value={qa.question}
                                      onChange={(e) =>
                                        setCreateTypedContent((p) => ({
                                          ...p,
                                          song: {
                                            ...p.song,
                                            questionsAndAnswers: p.song.questionsAndAnswers.map((x, i) =>
                                              i === idx ? { ...x, question: e.target.value } : x,
                                            ),
                                          },
                                        }))
                                      }
                                      placeholder="Câu hỏi"
                                      className="sm:col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                                    />
                                    <input
                                      value={qa.answer}
                                      onChange={(e) =>
                                        setCreateTypedContent((p) => ({
                                          ...p,
                                          song: {
                                            ...p.song,
                                            questionsAndAnswers: p.song.questionsAndAnswers.map((x, i) =>
                                              i === idx ? { ...x, answer: e.target.value } : x,
                                            ),
                                          },
                                        }))
                                      }
                                      placeholder="Đáp án"
                                      className="sm:col-span-6 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCreateTypedContent((p) => ({
                                          ...p,
                                          song: {
                                            ...p.song,
                                            questionsAndAnswers:
                                              p.song.questionsAndAnswers.length <= 1
                                                ? p.song.questionsAndAnswers
                                                : p.song.questionsAndAnswers.filter((_, i) => i !== idx),
                                          },
                                        }))
                                      }
                                      className="sm:col-span-1 px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCreateTypedContent((p) => ({
                                      ...p,
                                      song: {
                                        ...p.song,
                                        questionsAndAnswers: [...p.song.questionsAndAnswers, { question: "", answer: "" }],
                                      },
                                    }))
                                  }
                                  className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                                >
                                  + Thêm câu hỏi
                                </button>
                              </div>
                              <input
                                value={data.tagsText}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, song: { ...p.song, tagsText: e.target.value } }))
                                }
                                placeholder="Tags (cách nhau bởi dấu phẩy)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                            </div>
                          );
                        }

                        const key = lessonForm.type as "reading" | "listening" | "speaking" | "writing" | "quiz" | "review";
                        const data = createTypedContent[key];
                        return (
                          <div className="space-y-2">
                            {lessonForm.type === "reading" ? (
                              <textarea
                                value={createTypedContent.reading.passage}
                                onChange={(e) =>
                                  setCreateTypedContent((p) => ({ ...p, reading: { ...p.reading, passage: e.target.value } }))
                                }
                                placeholder="Đoạn văn đọc *"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                              />
                            ) : null}
                            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                              <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">Mô tả</div>
                              <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                                value={data.description}
                                onEditorChange={(content) =>
                                  setCreateTypedContent((p) => ({ ...p, [key]: { ...p[key], description: normalizeIncomingHtml(content) } }))
                                }
                                init={{ ...tinymceInit, height: 140 }}
                              />
                            </div>
                            <div className="space-y-2">
                              {data.questionsAndAnswers.map((qa, idx) => (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                  <input
                                    value={qa.question}
                                    onChange={(e) =>
                                      setCreateTypedContent((p) => ({
                                        ...p,
                                        [key]: {
                                          ...p[key],
                                          questionsAndAnswers: p[key].questionsAndAnswers.map((x, i) =>
                                            i === idx ? { ...x, question: e.target.value } : x,
                                          ),
                                        },
                                      }))
                                    }
                                    placeholder="Câu hỏi"
                                    className="sm:col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                                  />
                                  <input
                                    value={qa.answer}
                                    onChange={(e) =>
                                      setCreateTypedContent((p) => ({
                                        ...p,
                                        [key]: {
                                          ...p[key],
                                          questionsAndAnswers: p[key].questionsAndAnswers.map((x, i) =>
                                            i === idx ? { ...x, answer: e.target.value } : x,
                                          ),
                                        },
                                      }))
                                    }
                                    placeholder="Đáp án"
                                    className="sm:col-span-6 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCreateTypedContent((p) => ({
                                        ...p,
                                        [key]: {
                                          ...p[key],
                                          questionsAndAnswers:
                                            p[key].questionsAndAnswers.length <= 1
                                              ? p[key].questionsAndAnswers
                                              : p[key].questionsAndAnswers.filter((_, i) => i !== idx),
                                        },
                                      }))
                                    }
                                    className="sm:col-span-1 px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() =>
                                  setCreateTypedContent((p) => ({
                                    ...p,
                                    [key]: {
                                      ...p[key],
                                      questionsAndAnswers: [...p[key].questionsAndAnswers, { question: "", answer: "" }],
                                    },
                                  }))
                                }
                                className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                              >
                                + Thêm câu hỏi
                              </button>
                            </div>
                            <input
                              value={data.tagsText}
                              onChange={(e) =>
                                setCreateTypedContent((p) => ({ ...p, [key]: { ...p[key], tagsText: e.target.value } }))
                              }
                              placeholder="Tags (cách nhau bởi dấu phẩy)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                            />
                          </div>
                        );
                      })()
                    )}
                  </div>
                  <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Ảnh đại diện (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setThumbnailFile(file);
                        if (file) setThumbnailUrl("");
                      }}
                      className="mt-1 block w-full text-sm"
                    />
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => {
                        setThumbnailUrl(e.target.value);
                        if (e.target.value.trim()) setThumbnailFile(null);
                      }}
                      onPaste={(e) => {
                        const pasted = getImageFromClipboardData(e.clipboardData);
                        if (!pasted) return;
                        e.preventDefault();
                        setThumbnailFile(pasted);
                        setThumbnailUrl("");
                      }}
                      placeholder="Dán link ảnh hoặc dán ảnh trực tiếp (Ctrl+V)"
                      className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    {thumbnailFile ? (
                      <p className="text-xs text-emerald-700">Đang dùng file: {thumbnailFile.name}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreateLesson}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo bài học"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openEdit && (
        <div className="fixed inset-0 z-[130] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
          <div className="min-h-full w-full flex justify-center p-3 md:p-6">
            <div className="w-[min(980px,calc(100vw-1.5rem))] mt-16 md:mt-20 mb-4 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800">Chỉnh sửa bài học</h2>
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                    resetEditForm();
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto [&_input]:text-base [&_select]:text-base [&_textarea]:text-base [&_input]:py-3 [&_select]:py-3 [&_textarea]:py-3">
                {editError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-bold text-slate-600">
                    Chủ đề *
                    <select
                      value={editForm.unitId}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, unitId: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white"
                    >
                      <option value="">— Chọn chủ đề —</option>
                      {unitOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Tiêu đề bài học *"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Mô tả ngắn"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 min-h-24"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          type: e.target.value,
                          skillFocus: normalizeSkillFocusByType(e.target.value),
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="vocabulary">Từ vựng</option>
                      <option value="grammar">Ngữ pháp</option>
                      <option value="reading">Đọc hiểu</option>
                      <option value="listening">Nghe</option>
                      <option value="speaking">Nói</option>
                      <option value="writing">Viết</option>
                      <option value="dialogue">Hội thoại</option>
                      <option value="song">Bài hát</option>
                      <option value="quiz">Quiz</option>
                      <option value="review">Ôn tập</option>
                    </select>
                    <select
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, level: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          Trình độ {lv}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.isActive}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, isActive: e.target.value }))
                      }
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                    <input
                      type="number"
                      value={editForm.orderIndex}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, orderIndex: e.target.value }))
                      }
                      placeholder="Thứ tự"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      placeholder="Thời lượng (phút)"
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-bold text-slate-600 mb-2">
                      {editForm.type === "vocabulary" ? "Nội dung (Từ vựng)" : "Nội dung (Các trường dữ liệu)"}
                    </div>
                    {editForm.type === "vocabulary" ? (
                      <>
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-200">
                            Mô tả nội dung (tuỳ chọn)
                          </div>
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                            value={editContent.description}
                            onEditorChange={(content) =>
                              setEditContent((c) => ({
                                ...c,
                                description: normalizeIncomingHtml(content),
                              }))
                            }
                            init={tinymceInit}
                          />
                        </div>
                        <div className="mt-3 space-y-2">
                          {editContent.words.map((w, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                              <input
                                value={w.word}
                                onChange={(e) =>
                                  setEditContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, word: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Từ vựng"
                                className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={w.definition}
                                onChange={(e) =>
                                  setEditContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, definition: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Nghĩa"
                                className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <input
                                value={w.ipa || ""}
                                onChange={(e) =>
                                  setEditContent((c) => ({
                                    ...c,
                                    words: c.words.map((x, i) =>
                                      i === idx ? { ...x, ipa: e.target.value } : x,
                                    ),
                                  }))
                                }
                                placeholder="Phiên âm (IPA)"
                                className="sm:col-span-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <div className="sm:col-span-6 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditContent((c) => ({
                                      ...c,
                                      words:
                                        c.words.length <= 1
                                          ? c.words
                                          : c.words.filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                >
                                  Xóa dòng
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setEditContent((c) => ({
                                ...c,
                                words: [...c.words, { word: "", definition: "", ipa: "" }],
                              }))
                            }
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                          >
                            + Thêm từ
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-slate-500 mb-2">
                          Chỉnh các trường nội dung theo dạng tên trường - giá trị. Bạn có thể thêm/bớt trường tùy loại bài.
                        </p>
                        <div className="space-y-2">
                          {editContentFields.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <input
                                value={item.key}
                                onChange={(e) =>
                                  setEditContentFields((prev) =>
                                    prev.map((row, i) =>
                                      i === idx ? { ...row, key: e.target.value } : row,
                                    ),
                                  )
                                }
                                placeholder="Tên trường"
                                className="sm:col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400"
                              />
                              <div className="sm:col-span-7 rounded-lg border border-slate-200 overflow-hidden bg-white">
                                <Editor
                                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                                  value={item.value}
                                  onEditorChange={(content) =>
                                    setEditContentFields((prev) =>
                                      prev.map((row, i) =>
                                        i === idx
                                          ? { ...row, value: normalizeIncomingHtml(content) }
                                          : row,
                                      ),
                                    )
                                  }
                                  init={{
                                    ...tinymceInit,
                                    height: 160,
                                    toolbar:
                                      "undo redo | bold italic underline | bullist numlist | link | removeformat | code",
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditContentFields((prev) =>
                                    prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
                                  )
                                }
                                className="sm:col-span-1 px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setEditContentFields((prev) => [...prev, { key: "", value: "" }])
                            }
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                          >
                            + Thêm trường
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Cập nhật ảnh đại diện (tuỳ chọn)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditThumbnailFile(file);
                        if (file) setEditThumbnailUrl("");
                      }}
                      className="mt-1 block w-full text-sm"
                    />
                    <input
                      type="text"
                      value={editThumbnailUrl}
                      onChange={(e) => {
                        setEditThumbnailUrl(e.target.value);
                        if (e.target.value.trim()) setEditThumbnailFile(null);
                      }}
                      onPaste={(e) => {
                        const pasted = getImageFromClipboardData(e.clipboardData);
                        if (!pasted) return;
                        e.preventDefault();
                        setEditThumbnailFile(pasted);
                        setEditThumbnailUrl("");
                      }}
                      placeholder="Dán link ảnh hoặc dán ảnh trực tiếp (Ctrl+V)"
                      className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    {editThumbnailFile ? (
                      <p className="text-xs text-emerald-700">Đang dùng file: {editThumbnailFile.name}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                    resetEditForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


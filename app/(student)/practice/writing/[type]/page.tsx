"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { practiceService } from "@/services/practice.service";

const WRITING_DETAIL_CONFIG = {
  sentence: {
    title: "Viết Câu",
    subtitle: "Luyện viết câu đúng ngữ pháp, đủ ý, tự nhiên.",
    aiPromptIdea: "Tạo 5 bài tập viết câu theo từ khóa gần gũi với học sinh.",
    objectives: [
      "Viết câu ngắn đúng trật tự từ.",
      "Dùng từ nối cơ bản để câu rõ nghĩa hơn.",
      "Giảm lỗi chính tả và dấu câu.",
    ],
    flow: [
      "AI tạo đề theo chủ đề và độ khó phù hợp.",
      "Học sinh viết câu theo từng yêu cầu.",
      "AI chấm nhanh, gợi ý sửa từng câu.",
      "Làm lại bản cải thiện để nâng điểm.",
    ],
  },
  essay: {
    title: "Viết Luận",
    subtitle: "Luyện tư duy lập luận, bố cục và triển khai ý mạch lạc.",
    aiPromptIdea: "Tạo đề viết luận 250-350 từ kèm khung dàn ý 3 phần.",
    objectives: [
      "Xây dựng mở bài, thân bài, kết bài rõ ràng.",
      "Phát triển luận điểm có ví dụ minh họa.",
      "Tăng khả năng liên kết giữa các đoạn.",
    ],
    flow: [
      "AI tạo đề và gợi ý dàn ý ban đầu.",
      "Học sinh viết bản nháp theo khung.",
      "AI phản hồi về bố cục, logic và diễn đạt.",
      "Chỉnh sửa và nộp bản hoàn thiện.",
    ],
  },
  letter: {
    title: "Viết Thư",
    subtitle: "Luyện cách viết thư đúng văn phong và đúng mục đích.",
    aiPromptIdea: "Tạo đề viết thư theo bối cảnh cảm ơn/xin lỗi/thăm hỏi.",
    objectives: [
      "Viết lời chào, nội dung chính và lời kết đúng chuẩn.",
      "Giữ giọng điệu lịch sự, phù hợp người nhận.",
      "Biết nhấn ý quan trọng trong từng đoạn thư.",
    ],
    flow: [
      "AI tạo tình huống và yêu cầu cụ thể.",
      "Học sinh viết thư theo mục tiêu giao tiếp.",
      "AI sửa câu chữ và đề xuất cách diễn đạt lịch sự hơn.",
      "Xuất bản bản thư cuối cùng.",
    ],
  },
} as const;

type WritingType = keyof typeof WRITING_DETAIL_CONFIG;

/** Axios đã trả `response.data`; backend có thể bọc thêm `{ data: ... }`. */
function unwrapCreatedPracticeResponse(raw: unknown): any {
  let o: any = raw;
  for (let i = 0; i < 4; i++) {
    if (o && typeof o === "object" && "data" in o && o.data != null) o = o.data;
    else break;
  }
  return o;
}

function pickPracticeId(doc: any): string {
  if (!doc || typeof doc !== "object") return "";
  return String(
    doc._id ??
      doc.id ??
      doc.practiceId ??
      doc.practice?._id ??
      doc.practice?.id ??
      "",
  ).trim();
}

/** Gom text đề từ nhiều kiểu document practice (Nest / AI khác nhau). */
function collectTopicLinesFromPracticeDoc(doc: any): string[] {
  if (!doc || typeof doc !== "object") return [];
  const lines: string[] = [];
  const add = (label: string, val: unknown) => {
    if (val == null) return;
    const s = typeof val === "string" ? val.trim() : String(val).trim();
    if (s) lines.push(`${label}: ${s}`);
  };

  add("Đề bài", doc.prompt ?? doc.topic ?? doc.question);
  add("Tiêu đề", doc.title);
  add("Tình huống", doc.situation);
  add("Yêu cầu", doc.instruction);
  if (typeof doc.content === "string" && doc.content.trim()) {
    add("Nội dung", doc.content);
  }
  add("Mô tả", doc.description);

  /** API `type: sentences` — `exercise.items[]` có `sentence_vi` / `sentence_en`. */
  const listItems =
    (Array.isArray(doc.exercise?.items) && doc.exercise.items) ||
    (Array.isArray(doc.items) ? doc.items : null);
  if (listItems && listItems.length > 0) {
    const head = listItems[0];
    if (
      head &&
      typeof head === "object" &&
      (typeof (head as any).sentence_vi === "string" ||
        typeof (head as any).sentence_en === "string")
    ) {
      const out: string[] = [
        "Viết câu tiếng Anh tương ứng với các câu tiếng Việt sau:",
      ];
      listItems.forEach((it: any, i: number) => {
        const vi =
          typeof it?.sentence_vi === "string" ? it.sentence_vi.trim() : "";
        const en =
          typeof it?.sentence_en === "string" ? it.sentence_en.trim() : "";
        const one = vi || en;
        if (one) out.push(`${i + 1}. ${one}`);
      });
      return out.filter((l) => l.trim().length > 0);
    }
  }

  const item =
    doc.exercise?.items?.[0] ??
    (Array.isArray(doc.exercise) ? doc.exercise[0] : undefined) ??
    doc.items?.[0] ??
    doc.exercises?.[0] ??
    doc.exerciseItem;

  if (item && typeof item === "object") {
    add("Tiêu đề", item.title);
    add("Tình huống", item.situation);
    add("Yêu cầu", item.instruction ?? item.prompt);
    add("Đề bài", item.prompt ?? item.question);
    if (typeof item.content === "string" && item.content.trim()) {
      add("Chi tiết", item.content);
    }
    if (Array.isArray(item.requirements) && item.requirements.length > 0) {
      lines.push(`Cần có: ${item.requirements.join("; ")}`);
    }
    if (typeof item.minimum_sentences === "number") {
      lines.push(`Số câu tối thiểu: ${item.minimum_sentences}`);
    }
  }

  // exercise là chuỗi (một số API)
  if (
    lines.length === 0 &&
    typeof doc.exercise === "string" &&
    doc.exercise.trim()
  ) {
    lines.push(`Đề bài: ${doc.exercise.trim()}`);
  }

  const out = lines.filter((l) => l.trim().length > 0);
  if (out.length === 0 && doc.practice && typeof doc.practice === "object") {
    return collectTopicLinesFromPracticeDoc(doc.practice);
  }
  return out;
}

/** Gỡ ký hiệu markdown (**) trong phản hồi API để không hiển thị dấu sao. */
function sanitizeAiFeedbackDisplay(text: string): string {
  return String(text).replace(/\*\*/g, "");
}

export default function WritingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = params.type as string;
  const [studentId, setStudentId] = useState<string>("");
  const [practiceId, setPracticeId] = useState<string>("");
  const [generatedTopic, setGeneratedTopic] = useState<string>("");
  const [studentDraft, setStudentDraft] = useState<string>("");
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const content = useMemo(() => {
    if (type in WRITING_DETAIL_CONFIG) {
      return WRITING_DETAIL_CONFIG[type as WritingType];
    }
    return null;
  }, [type]);

  useEffect(() => {
    const idFromQuery = searchParams.get("practiceId");
    if (idFromQuery) setPracticeId(idFromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) return;
    try {
      const parsed = JSON.parse(rawUser);
      const id = parsed?._id || parsed?.id || parsed?.data?._id || "";
      if (id) setStudentId(id);
    } catch {
      // noop
    }
  }, []);

  const topicPool: Record<WritingType, string[]> = {
    sentence: [
      "Viết 5 câu mô tả một buổi sáng đi học của em.",
      "Viết 5 câu có dùng từ nối: và, nhưng, vì vậy.",
      "Viết 6 câu kể về hoạt động cuối tuần cùng gia đình.",
    ],
    essay: [
      "Viết bài luận ngắn: Vì sao nên đọc sách mỗi ngày?",
      "Viết bài luận: Một thói quen tốt em muốn duy trì trong năm nay.",
      "Viết bài luận: Công nghệ giúp việc học của em như thế nào?",
    ],
    letter: [
      "Viết thư cảm ơn thầy/cô đã giúp em tiến bộ trong học tập.",
      "Viết thư thăm hỏi một người bạn lâu ngày chưa gặp.",
      "Viết thư xin lỗi vì đã làm phiền người khác và nêu cách khắc phục.",
    ],
  };

  const handleGenerateTopic = async () => {
    if (!content) return;
    if (!studentId.trim()) {
      setAiFeedback(["Vui lòng nhập Student ID để tạo bài viết."]);
      setAiScore(0);
      return;
    }

    const currentType = type as WritingType;
    try {
      setGenerating(true);
      const res: any = await practiceService.createWritingPractice(
        studentId.trim(),
        currentType,
      );
      const payload = unwrapCreatedPracticeResponse(res);
      const createdId = pickPracticeId(payload);
      if (createdId) setPracticeId(createdId);

      const lines = collectTopicLinesFromPracticeDoc(payload);
      if (lines.length > 0) {
        setGeneratedTopic(lines.join("\n"));
      } else {
        const list = topicPool[currentType];
        const picked = list[Math.floor(Math.random() * list.length)];
        setGeneratedTopic(picked);
      }

      setAiFeedback([]);
      setAiScore(null);
    } catch (e: any) {
      const message =
        e?.response?.data?.message || "Không thể tạo đề từ AI. Vui lòng thử lại.";
      setAiScore(0);
      setAiFeedback([String(message)]);
    } finally {
      setGenerating(false);
    }
  };

  const handleGetAiFeedback = () => {
    const text = studentDraft.trim();
    if (!text) {
      setAiFeedback(["Hãy viết nội dung trước khi nhận góp ý AI."]);
      setAiScore(0);
      return;
    }

    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const words = text.split(/\s+/).filter(Boolean);
    const hasParagraph = text.includes("\n");
    const hasPunctuation = /[.!?]/.test(text);

    let score = 50;
    if (words.length >= 40) score += 20;
    if (sentences.length >= 3) score += 15;
    if (hasPunctuation) score += 10;
    if (hasParagraph) score += 5;
    score = Math.min(score, 100);

    const feedback: string[] = [];
    if (words.length < 30) {
      feedback.push("Bài viết còn ngắn, em nên bổ sung thêm ý để làm rõ nội dung.");
    } else {
      feedback.push("Độ dài bài viết khá ổn, em đã triển khai được nội dung chính.");
    }

    if (!hasPunctuation) {
      feedback.push("Cần thêm dấu câu (., !, ?) để câu văn rõ ràng hơn.");
    } else {
      feedback.push("Em đã dùng dấu câu, giúp bài viết dễ đọc hơn.");
    }

    if (type === "essay" && !hasParagraph) {
      feedback.push("Với bài luận, nên tách đoạn mở bài - thân bài - kết bài.");
    }
    if (type === "letter" && !/thân|kính|chào/i.test(text)) {
      feedback.push("Bài thư nên có lời chào hoặc cách xưng hô phù hợp người nhận.");
    }
    if (type === "sentence" && sentences.length < 5) {
      feedback.push("Dạng Viết Câu nên có ít nhất 5 câu riêng biệt.");
    }

    feedback.push("Gợi ý cải thiện: viết lại 1-2 câu theo cách ngắn gọn và tự nhiên hơn.");
    setAiFeedback(feedback);
    setAiScore(score);
  };

  const handleGradeWriting = async () => {
    const text = studentDraft.trim();
    if (!practiceId.trim()) {
      setAiScore(0);
      setAiFeedback(["Vui lòng nhập Practice ID trước khi chấm bài."]);
      return;
    }
    if (!text) {
      setAiScore(0);
      setAiFeedback(["Vui lòng nhập bài viết trước khi chấm bài."]);
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await practiceService.submitWriting(practiceId.trim(), text);
      const payload = res?.data ? res.data : res;
      const ai = payload?.AIFeedback || {};

      const feedback: string[] = [];
      if (ai?.comments) feedback.push(ai.comments);
      if (ai?.encouragement) feedback.push(ai.encouragement);
      if (typeof ai?.relevance_score === "number") {
        feedback.push(`Mức bám đề: ${ai.relevance_score}/1`);
      }
      if (typeof ai?.language_score === "number") {
        feedback.push(`Ngôn ngữ: ${ai.language_score}/1`);
      }
      if (typeof ai?.completeness_score === "number") {
        feedback.push(`Độ đầy đủ: ${ai.completeness_score}/1`);
      }
      if (ai?.off_topic) {
        feedback.push("AI nhận diện bài có dấu hiệu lệch đề.");
      }

      setAiScore(typeof ai?.score === "number" ? ai.score : null);
      setAiFeedback(
        feedback.length > 0
          ? feedback
          : ["Đã chấm bài thành công nhưng chưa có nhận xét chi tiết."],
      );
    } catch (e: any) {
      const message =
        e?.response?.data?.message || "Không thể chấm bài lúc này. Vui lòng thử lại.";
      setAiScore(0);
      setAiFeedback([String(message)]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center shadow-primary-card">
          <h1 className="text-2xl font-black text-slate-800">Không tìm thấy dạng viết</h1>
          <p className="mt-2 text-slate-600">Vui lòng quay lại trang luyện tập để chọn lại.</p>
          <Link
            href="/practice"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} /> Quay lại luyện tập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-10 font-sans text-slate-800">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <div className="mb-6">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[2.2rem] border border-[#CAE7FF] bg-[linear-gradient(135deg,#E8F4FF_0%,#ECF8FF_35%,#F2FBFF_70%,#F2FFF8_100%)] p-7 shadow-primary-card md:p-10">
          <div className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
          <div className="pointer-events-none absolute right-6 top-5 h-24 w-24 rounded-full bg-[#D9EDFF]/80 blur-2xl" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#CAE7FF] bg-white px-4 py-1.5 text-sm font-black text-[#0369A1] shadow-sm">
            <Sparkles size={16} /> Chi tiết dạng viết
          </div>
          <h1 className="text-3xl font-black md:text-5xl">{content.title}</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-slate-700 md:text-base">
            {content.subtitle}
          </p>
          <div className="mt-6 inline-flex items-start gap-3 rounded-[1.2rem] border border-[#CAE7FF] bg-white px-4 py-4 shadow-sm">
            <Wand2 className="mt-0.5 text-[#0369A1]" size={18} />
            <div className="text-sm font-bold text-slate-700">
              <span className="font-black text-slate-900">Prompt AI gợi ý:</span> {content.aiPromptIdea}
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-[1.8rem] border border-[#CAE7FF] bg-[#EEF8FF] p-6 shadow-primary-card">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0369A1]">
              <Lightbulb size={14} /> Mục tiêu luyện tập
            </div>
            <div className="space-y-3">
              {content.objectives.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-slate-700">
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-[#C8F3DE] bg-[#EEFFF7] p-6 shadow-primary-card">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0F766E]">
              <Sparkles size={14} /> Quy trình AI hỗ trợ
            </div>
            <div className="space-y-3">
              {content.flow.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-slate-700">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9FDF4] text-xs font-black text-[#0F766E]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-primary-card">
          <h2 className="text-2xl font-black text-slate-900">Luyện viết ngay với AI</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Bấm tạo đề, viết bài vào khung bên dưới, sau đó nhận góp ý AI tức thì.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateTopic}
              className="rounded-xl bg-[#0369A1] px-4 py-2.5 text-sm font-black text-white"
              disabled={generating}
            >
              {generating ? "Đang tạo đề..." : "Tạo đề bằng AI"}
            </button>
            <button
              onClick={handleGetAiFeedback}
              className="rounded-xl border border-[#CAE7FF] bg-[#E8F4FF] px-4 py-2.5 text-sm font-black text-[#0369A1]"
            >
              Nhận góp ý AI
            </button>
          </div>

          {generatedTopic && (
            <div className="mt-4 rounded-2xl border border-[#CAE7FF] bg-[#EEF8FF] p-4 md:p-5">
              <div className="mb-3 inline-flex items-center rounded-full border border-[#B7DDFB] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0369A1]">
                Đề AI vừa tạo
              </div>
              <div className="space-y-2.5 text-sm">
                {generatedTopic
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => {
                    const [labelRaw, ...rest] = line.split(":");
                    const label = labelRaw?.trim();
                    const value = rest.join(":").trim();
                    if (!label || !value) {
                      return (
                        <div
                          key={line}
                          className="rounded-xl border border-white/80 bg-white px-3.5 py-2.5 font-semibold text-slate-700"
                        >
                          {line}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={line}
                        className="rounded-xl border border-white/80 bg-white px-3.5 py-2.5"
                      >
                        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0369A1]">
                          {label}
                        </div>
                        <div className="mt-0.5 font-semibold leading-6 text-slate-700">
                          {value}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-2 block text-sm font-black text-slate-700">Bài viết của em</label>
            <textarea
              value={studentDraft}
              onChange={(e) => setStudentDraft(e.target.value)}
              rows={8}
              placeholder="Nhập bài viết tại đây..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-700 outline-none ring-0 focus:border-slate-500"
            />
            <div className="mt-3 flex justify-start">
              <button
                onClick={handleGradeWriting}
                className="rounded-xl bg-[#7C3AED] px-6 py-2.5 text-sm font-black text-white shadow-[0_8px_18px_rgba(124,58,237,0.35)] transition hover:brightness-110"
                disabled={submitting}
              >
                {submitting ? "Đang chấm..." : "Chấm bài"}
              </button>
            </div>
          </div>

          {(aiScore !== null || aiFeedback.length > 0) && (
            <div className="mt-4 rounded-xl border border-[#C8F3DE] bg-[#EEFFF7] p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#0F766E]">
                Phản hồi AI
              </div>
              {aiScore !== null && (
                <div className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-base font-black text-[#0F766E]">
                  Điểm AI: {aiScore}
                </div>
              )}
              {aiFeedback.length > 0 && (
                <div className="mt-3 space-y-2">
                  {aiFeedback.map((note, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 whitespace-pre-wrap"
                    >
                      {sanitizeAiFeedbackDisplay(note)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lightbulb, Sparkles, Wand2 } from "lucide-react";

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

export default function WritingDetailPage() {
  const params = useParams();
  const type = params.type as string;
  const [generatedTopic, setGeneratedTopic] = useState<string>("");
  const [studentDraft, setStudentDraft] = useState<string>("");
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [aiScore, setAiScore] = useState<number | null>(null);

  const content = useMemo(() => {
    if (type in WRITING_DETAIL_CONFIG) {
      return WRITING_DETAIL_CONFIG[type as WritingType];
    }
    return null;
  }, [type]);

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

  const handleGenerateTopic = () => {
    if (!content) return;
    const currentType = type as WritingType;
    const list = topicPool[currentType];
    const picked = list[Math.floor(Math.random() * list.length)];
    setGeneratedTopic(picked);
    setAiFeedback([]);
    setAiScore(null);
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

  const handleGradeWriting = () => {
    handleGetAiFeedback();
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
            >
              Tạo đề bằng AI
            </button>
            <button
              onClick={handleGetAiFeedback}
              className="rounded-xl border border-[#CAE7FF] bg-[#E8F4FF] px-4 py-2.5 text-sm font-black text-[#0369A1]"
            >
              Nhận góp ý AI
            </button>
          </div>

          {generatedTopic && (
            <div className="mt-4 rounded-xl border border-[#CAE7FF] bg-[#EEF8FF] p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#0369A1]">
                Đề AI vừa tạo
              </div>
              <p className="mt-1 text-sm font-bold text-slate-700">{generatedTopic}</p>
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
              >
                Chấm bài
              </button>
            </div>
          </div>

          {(aiScore !== null || aiFeedback.length > 0) && (
            <div className="mt-4 rounded-xl border border-[#C8F3DE] bg-[#EEFFF7] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#0F766E]">
                  Phản hồi AI
                </div>
                {aiScore !== null && (
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#0F766E]">
                    Điểm gợi ý: {aiScore}/100
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {aiFeedback.map((note) => (
                  <div key={note} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

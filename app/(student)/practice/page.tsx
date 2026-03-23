"use client";

import Link from "next/link";
import { FilePenLine, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

const SKILL_PRACTICE_CONFIG = [
  {
    id: "writing-sentence",
    slug: "sentence",
    title: "Viết Câu",
    desc: "Bắt đầu từ câu ngắn, luyện diễn đạt rõ ràng và đúng trọng tâm.",
    icon: FilePenLine,
    color: "from-[#ECF8FF] via-[#F3FBFF] to-[#EEF7FF]",
    border: "border-[#CAE7FF]",
    accent: "text-[#0369A1]",
    badge: "Dạng câu",
    tip: "AI chỉ ra lỗi nhanh, gợi ý viết câu mượt và tự nhiên hơn.",
  },
  {
    id: "writing-letter",
    slug: "letter",
    title: "Viết Thư",
    desc: "Viết thư đúng giọng điệu, đúng ngữ cảnh và giàu cảm xúc hơn.",
    icon: FilePenLine,
    color: "from-[#EEFDF6] via-[#F5FFF9] to-[#EFFFF7]",
    border: "border-[#C8F3DE]",
    accent: "text-[#0F766E]",
    badge: "Dạng thư",
    tip: "AI hướng dẫn từ lời chào đến lời kết theo chuẩn từng dạng thư.",
  },
  {
    id: "writing-essay",
    slug: "essay",
    title: "Viết Luận",
    desc: "Rèn tư duy lập luận, triển khai ý sâu và thuyết phục hơn.",
    icon: FilePenLine,
    color: "from-[#F3F0FF] via-[#F8F5FF] to-[#F4F2FF]",
    border: "border-[#DDD5FF]",
    accent: "text-[#5B4BC4]",
    badge: "Dạng luận",
    tip: "AI gợi ý luận điểm mạnh, ví dụ đắt và mạch đoạn chặt chẽ.",
  },
];

export default function PracticePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white pb-36 font-sans text-slate-800">
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 md:px-6">
        <motion.div
          className="pt-28 pb-10"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[2.25rem] border border-[#CFE3FF] bg-[linear-gradient(135deg,#E8F4FF_0%,#ECF8FF_35%,#F2FBFF_70%,#F2FFF8_100%)] p-6 shadow-primary-card md:p-8 lg:p-10">
            <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/45 blur-2xl" />
            <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-full bg-[#D9EDFF]/70 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-40 rounded-full bg-white/35 blur-2xl" />

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl text-left text-slate-900">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#CAE7FF] bg-white px-4 py-1.5 text-sm font-extrabold text-[#075985] shadow-[0_4px_0_rgba(7,89,133,0.12),0_10px_24px_rgba(7,89,133,0.10)]">
                  <Sparkles size={16} /> Smart Writing Studio
                </div>
                <h1 className="text-[2.35rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-slate-800 md:text-[3.15rem]">
                  Viết Hay Hơn Sau Mỗi Lần Luyện
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-slate-700 md:text-[17px]">
                  Từ viết câu đến viết luận, AI đồng hành từ lúc ra đề đến lúc chấm bài - giúp bạn viết rõ ý, chắc cấu trúc và tiến bộ thấy rõ.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#E6F6FF] px-3 py-1.5 text-sm font-bold text-[#0369A1] shadow-sm">
                    Đề ra đúng trình độ
                  </span>
                  <span className="rounded-full bg-[#F0ECFF] px-3 py-1.5 text-sm font-bold text-[#5B4BC4] shadow-sm">
                    Dẫn dắt từng bước
                  </span>
                  <span className="rounded-full bg-[#E9FDF4] px-3 py-1.5 text-sm font-bold text-[#0F766E] shadow-sm">
                    Chấm nhanh - sửa trúng
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[360px]">
                <div className="rounded-[1.5rem] border border-[#CAE7FF] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(3,105,161,0.12),0_14px_30px_rgba(3,105,161,0.08)]">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0369A1]">
                    Dạng viết
                  </div>
                  <div className="mt-1 text-[2rem] leading-none font-extrabold text-slate-900">3</div>
                </div>
                <div className="rounded-[1.5rem] border border-[#DDD5FF] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(91,75,196,0.12),0_14px_30px_rgba(91,75,196,0.08)]">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#5B4BC4]">
                    Trạng thái
                  </div>
                  <div className="mt-1 text-[1.55rem] leading-[1.15] font-extrabold text-slate-900">Đang hoạt động</div>
                </div>
                <div className="rounded-[1.5rem] border border-[#C8F3DE] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(15,118,110,0.12),0_14px_30px_rgba(15,118,110,0.08)]">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0F766E]">
                    Tiến độ
                  </div>
                  <div className="mt-1 text-[2rem] leading-none font-extrabold text-slate-900">Sẵn sàng</div>
                </div>
                <div className="rounded-[1.5rem] border border-[#CAE7FF] bg-white px-4 py-4 text-center shadow-[0_6px_0_rgba(3,105,161,0.12),0_14px_30px_rgba(3,105,161,0.08)]">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0369A1]">
                    Ưu tiên
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[1.55rem] leading-[1.1] font-extrabold text-slate-900">
                    <Star size={18} className="fill-[#FACC15] text-[#FACC15]" />
                    Viết
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mb-8 max-w-[1320px] rounded-[2rem] border border-[#E5E7EB] bg-white p-4 shadow-primary-card lg:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45 }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-[#0369A1]">
                Danh sách dạng viết
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                Chọn dạng luyện bạn muốn chinh phục
              </div>
            </div>
            <span className="w-fit rounded-full border border-[#CAE7FF] bg-[#E8F4FF] px-4 py-2 text-sm font-black text-[#0369A1] shadow-sm">
              AI ra đề - AI kèm - AI chấm
            </span>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SKILL_PRACTICE_CONFIG.map((skill, index) => {
            const SkillIcon = skill.icon;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={{ y: -6 }}
                className="h-full"
              >
                <Link
                  href={`/practice/writing/${skill.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-[1.8rem] border ${skill.border} bg-gradient-to-br ${skill.color} p-5 shadow-primary-card transition-all duration-300 hover:shadow-[0_10px_0_rgba(15,23,42,0.08),0_28px_68px_rgba(15,23,42,0.12)]`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                      {skill.badge}
                    </span>
                    <span className="rounded-full border border-[#CAE7FF] bg-[#E8F4FF] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#0369A1] shadow-sm">
                      AI hướng dẫn
                    </span>
                  </div>

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white shadow-sm">
                    <SkillIcon className={skill.accent} size={26} />
                  </div>

                  <h3 className="text-[1.35rem] font-black leading-tight text-slate-800">
                    {skill.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm font-semibold leading-6 text-slate-600">
                    {skill.desc}
                  </p>

                  <div className="mt-4 rounded-[1.1rem] border border-white/70 bg-white/70 px-3.5 py-3 text-sm font-bold text-slate-700 shadow-sm">
                    {skill.tip}
                  </div>

                  <div className="mt-4 inline-flex w-fit items-center rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white">
                    Bắt đầu chinh phục
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

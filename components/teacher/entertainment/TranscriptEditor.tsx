"use client";

import { useState, useRef } from "react";
import {
  Play,
  Plus,
  Trash2,
  Wand2,
  Save,
  Video,
  Upload,
  FileText,
  Download,
  Sparkles,
  Languages,
} from "lucide-react";

// --- HELPER: Parse SRT ---
const parseSRT = (text: string) => {
  const regex =
    /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n\n|\n$|$)/g;
  const parts = [];
  let match;
  const timeToSeconds = (t: string) => {
    const [h, m, s] = t.split(":");
    const [sec, ms] = s.split(",");
    return (
      parseInt(h) * 3600 +
      parseInt(m) * 60 +
      parseInt(sec) +
      parseInt(ms) / 1000
    );
  };
  while ((match = regex.exec(text)) !== null) {
    parts.push({
      start: timeToSeconds(match[2]),
      end: timeToSeconds(match[3]),
      text: match[4].replace(/\n/g, " ").trim(),
    });
  }
  return parts;
};

export default function TranscriptEditor({ videoId }: { videoId?: string }) {
  // State data
  const [transcript, setTranscript] = useState<any[]>([
    { start: 0, end: 5, en: "Hello everyone!", vi: "Chào mọi người!" },
  ]);

  // State loading
  const [loadingAI_Full, setLoadingAI_Full] = useState(false); // Tạo mới từ đầu
  const [loadingAI_Trans, setLoadingAI_Trans] = useState(false); // Chỉ dịch

  const fileInputRefEn = useRef<HTMLInputElement>(null);
  const fileInputRefVi = useRef<HTMLInputElement>(null);

  // --- 1. XỬ LÝ UPLOAD FILE SRT ---
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    lang: "en" | "vi",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSRT(content);

      if (lang === "en") {
        // Nếu upload EN: Ghi đè toàn bộ Timeline + Text EN
        const newTrans = parsed.map((p, idx) => ({
          start: p.start,
          end: p.end,
          en: p.text,
          vi: transcript[idx]?.vi || "",
        }));
        setTranscript(newTrans);
      } else {
        // Nếu upload VI: Chỉ map text vào các dòng hiện có
        const newTrans = transcript.map((item, idx) => ({
          ...item,
          vi: parsed[idx]?.text || item.vi,
        }));
        setTranscript(newTrans);
      }
    };
    reader.readAsText(file);
    // Reset input để chọn lại file cùng tên vẫn chạy
    e.target.value = "";
  };

  // --- 2. GỌI AI: FULL GENERATE (Whisper -> Text) ---
  const handleAIFullGenerate = async () => {
    if (!videoId) return alert("Cần lưu video trước khi dùng AI!");
    if (
      !confirm(
        "AI sẽ nghe và tạo lại toàn bộ phụ đề từ đầu. Dữ liệu hiện tại sẽ bị mất. Bạn đồng ý chứ?",
      )
    )
      return;

    setLoadingAI_Full(true);
    try {
      // Giả lập gọi API Backend (NestJS gọi OpenAI Whisper)
      // const res = await api.post(`/ai/transcribe/${videoId}`);
      // setTranscript(res.data);

      setTimeout(() => {
        // Mock data
        setTranscript([
          {
            start: 0,
            end: 3,
            en: "Welcome back to Peppa Pig.",
            vi: "Chào mừng quay lại với Peppa Pig.",
          },
          {
            start: 3,
            end: 8,
            en: "Today, we are going to learn colors.",
            vi: "Hôm nay chúng ta sẽ học về màu sắc.",
          },
          {
            start: 8,
            end: 12,
            en: "Look at this red balloon.",
            vi: "Hãy nhìn quả bóng màu đỏ này.",
          },
        ]);
        setLoadingAI_Full(false);
      }, 2000);
    } catch (e) {
      alert("Lỗi gọi AI");
      setLoadingAI_Full(false);
    }
  };

  // --- 3. GỌI AI: TRANSLATE ONLY (Gemini Dịch) ---
  const handleAITranslate = async () => {
    if (transcript.length === 0)
      return alert("Chưa có nội dung tiếng Anh để dịch!");
    setLoadingAI_Trans(true);

    try {
      // Gửi mảng tiếng Anh lên, AI trả về mảng tiếng Việt
      // const res = await api.post('/ai/translate', { texts: transcript.map(t => t.en) });

      setTimeout(() => {
        const newTrans = transcript.map((t) => ({
          ...t,
          vi: `(AI Dịch) ${t.en}`, // Mock dịch
        }));
        setTranscript(newTrans);
        setLoadingAI_Trans(false);
      }, 1500);
    } catch (e) {
      alert("Lỗi dịch");
      setLoadingAI_Trans(false);
    }
  };

  // --- CÁC HÀM CRUD CƠ BẢN ---
  const updateLine = (index: number, field: string, value: any) => {
    const newTrans = [...transcript];
    newTrans[index] = { ...newTrans[index], [field]: value };
    setTranscript(newTrans);
  };
  const removeLine = (i: number) =>
    setTranscript(transcript.filter((_, idx) => idx !== i));
  const addLine = () =>
    setTranscript([...transcript, { start: 0, end: 0, en: "", vi: "" }]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      {/* --- THANH CÔNG CỤ (TOOLBAR) --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Video size={20} className="text-blue-600" /> Biên tập Phụ đề
          </h3>
          <p className="text-xs text-gray-500">
            Kết hợp AI và Chỉnh sửa thủ công
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Nhóm 1: AI Tools */}
          <div className="flex gap-2 bg-purple-50 p-1 rounded-lg border border-purple-100">
            <button
              onClick={handleAIFullGenerate}
              disabled={loadingAI_Full}
              className="flex items-center gap-1.5 bg-white text-purple-700 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-purple-100 transition disabled:opacity-50"
              title="Dùng AI nghe và tạo lại từ đầu"
            >
              {loadingAI_Full ? (
                <Sparkles className="animate-spin" size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              AI Tạo Full
            </button>
            <button
              onClick={handleAITranslate}
              disabled={loadingAI_Trans}
              className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-purple-700 transition disabled:opacity-50"
              title="Chỉ dịch tiếng Việt dựa trên cột tiếng Anh"
            >
              {loadingAI_Trans ? (
                <Sparkles className="animate-spin" size={14} />
              ) : (
                <Languages size={14} />
              )}
              AI Dịch Tiếng Việt
            </button>
          </div>

          {/* Nhóm 2: File Tools */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => fileInputRefEn.current?.click()}
              className="flex items-center gap-1.5 bg-white text-slate-600 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-gray-50 transition"
            >
              <Upload size={14} /> Import SRT (Anh)
            </button>
            <input
              type="file"
              ref={fileInputRefEn}
              className="hidden"
              accept=".srt"
              onChange={(e) => handleFileUpload(e, "en")}
            />

            <button
              onClick={() => fileInputRefVi.current?.click()}
              className="flex items-center gap-1.5 bg-white text-slate-600 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-gray-50 transition"
            >
              <Upload size={14} /> Import SRT (Việt)
            </button>
            <input
              type="file"
              ref={fileInputRefVi}
              className="hidden"
              accept=".srt"
              onChange={(e) => handleFileUpload(e, "vi")}
            />
          </div>

          {/* Save Button */}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 ml-2">
            <Save size={16} /> Lưu Lại
          </button>
        </div>
      </div>

      {/* --- EDITOR TABLE --- */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-inner">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-3 w-16 text-center border-b">#</th>
                <th className="p-3 w-24 text-center border-b">Bắt đầu</th>
                <th className="p-3 w-24 text-center border-b">Kết thúc</th>
                <th className="p-3 border-b border-l bg-blue-50/30 text-blue-600">
                  🇬🇧 Tiếng Anh (Gốc)
                </th>
                <th className="p-3 border-b border-l bg-green-50/30 text-green-600">
                  🇻🇳 Tiếng Việt (Dịch)
                </th>
                <th className="p-3 w-10 border-b text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transcript.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition group">
                  <td className="p-2 text-center text-xs text-gray-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-slate-50 border-transparent rounded px-2 py-1 font-mono text-center text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={line.start}
                      onChange={(e) =>
                        updateLine(idx, "start", parseFloat(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-slate-50 border-transparent rounded px-2 py-1 font-mono text-center text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={line.end}
                      onChange={(e) =>
                        updateLine(idx, "end", parseFloat(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2 border-l border-dashed border-gray-200">
                    <textarea
                      rows={1}
                      className="w-full border-0 bg-transparent p-1 text-slate-800 font-medium focus:ring-0 resize-none overflow-hidden h-auto"
                      value={line.en}
                      onChange={(e) => {
                        updateLine(idx, "en", e.target.value);
                        e.target.style.height = "auto"; // Auto resize
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      placeholder="English subtitle..."
                    />
                  </td>
                  <td className="p-2 border-l border-dashed border-gray-200">
                    <textarea
                      rows={1}
                      className="w-full border-0 bg-transparent p-1 text-slate-600 focus:ring-0 resize-none overflow-hidden h-auto"
                      value={line.vi}
                      onChange={(e) => {
                        updateLine(idx, "vi", e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      placeholder="Dịch tiếng Việt..."
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeLine(idx)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addLine}
          className="w-full py-3 bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition border-t text-xs uppercase tracking-wide flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Thêm dòng mới
        </button>
      </div>
    </div>
  );
}

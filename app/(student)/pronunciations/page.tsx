"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Send,
  Star,
  Type,
  FolderUp,
  Headphones,
} from "lucide-react";
import {
  pronunciationService,
  type PronunciationAssessResponse,
} from "@/services/pronunciation.service";

export default function PronunciationPractice() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  /** Nguồn âm thanh để chấm: ghi âm hoặc file tải lên */
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFileName, setAudioFileName] = useState("recording.wav");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sourceKind, setSourceKind] = useState<"record" | "upload" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PronunciationAssessResponse | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setSourceKind(null);
    setAudioFileName("recording.wav");
  }

  async function convertWebmToWavPCM(webmBlob: Blob): Promise<Blob> {
    const arrayBuffer = await webmBlob.arrayBuffer();

    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      1,
      audioBuffer.duration * 16000,
      16000,
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();

    return encodeWavPCM(renderedBuffer);
  }

  function encodeWavPCM(audioBuffer: AudioBuffer): Blob {
    const sampleRate = 16000;
    const channelData = audioBuffer.getChannelData(0);
    const buffer = new ArrayBuffer(44 + channelData.length * 2);
    const view = new DataView(buffer);

    let offset = 0;
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset++, s.charCodeAt(i));
      }
    };

    writeString("RIFF");
    view.setUint32(offset, 36 + channelData.length * 2, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * 2, true);
    offset += 4;
    view.setUint16(offset, 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, channelData.length * 2, true);
    offset += 4;

    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  const startRecording = async () => {
    setResult(null);
    clearAudio();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const webmBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const wavBlob = await convertWebmToWavPCM(webmBlob);

      setAudioBlob(wavBlob);
      setAudioFileName("recording.wav");
      setSourceKind("record");
      setAudioUrl(URL.createObjectURL(wavBlob));
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setResult(null);
    clearAudio();

    setSourceKind("upload");
    setAudioFileName(file.name || "upload.wav");

    const lower = file.name.toLowerCase();
    const isWav =
      file.type === "audio/wav" ||
      file.type === "audio/x-wav" ||
      lower.endsWith(".wav");

    if (isWav) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      return;
    }

    /** Định dạng khác (webm, mp3…) — decode rồi xuất WAV 16kHz mono */
    try {
      const wavBlob = await convertWebmToWavPCM(file);
      const base = file.name.replace(/\.[^.]+$/, "") || "recording";
      setAudioBlob(wavBlob);
      setAudioFileName(`${base}.wav`);
      setAudioUrl(URL.createObjectURL(wavBlob));
    } catch (err) {
      console.error(err);
      alert(
        "Không đọc được file âm thanh. Thử file .wav hoặc định dạng phổ biến (webm, mp3).",
      );
      clearAudio();
    }
  };

  const submitPronunciation = async () => {
    if (!audioBlob || !text.trim()) return;

    setLoading(true);

    try {
      const res = await pronunciationService.assessFromParams({
        audio: audioBlob,
        referenceText: text.trim(),
        language: "en-US",
        audioFileName,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scores = result?.scores;
  const canSubmit = Boolean(audioBlob && text.trim());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,207,232,0.22),transparent_55%)] px-4 pt-20 pb-16">
      <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-slate-100 bg-white/95 p-8 shadow-primary-card backdrop-blur md:p-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/x-wav,audio/*,.wav,.webm,.mp3,.m4a,.ogg"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mb-8">
          <label className="mb-3 flex items-center gap-2 font-black text-slate-700">
            <Type size={18} /> Câu muốn luyện đọc
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ví dụ: Good morning everyone"
            rows={3}
            className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg font-semibold transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <p className="mb-4 text-center text-sm font-semibold text-slate-500">
          Chọn cách cung cấp âm thanh
        </p>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!text.trim()}
              className={`flex items-center gap-3 rounded-full px-8 py-4 font-black shadow-lg transition ${
                text.trim()
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "cursor-not-allowed bg-slate-300 text-slate-500"
              }`}
            >
              <Mic /> Ghi âm trực tiếp
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-3 rounded-full bg-slate-800 px-8 py-4 font-black text-white shadow-lg"
            >
              <Square /> Dừng ghi
            </button>
          )}

          <button
            type="button"
            onClick={onPickFile}
            disabled={!text.trim() || recording}
            className={`flex items-center gap-3 rounded-full px-8 py-4 font-black shadow-lg transition ${
              text.trim() && !recording
                ? "border-2 border-violet-400 bg-violet-50 text-violet-800 hover:bg-violet-100"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            <FolderUp /> Tải file âm thanh
          </button>
        </div>

        <p className="mb-6 text-center text-xs text-slate-400">
          Khuyến nghị file <strong>.wav</strong>; các định dạng khác sẽ được chuyển
          sang WAV trước khi gửi.
        </p>

        {sourceKind && audioUrl && (
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            {sourceKind === "record" ? (
              <span className="text-red-600">Đã ghi âm</span>
            ) : (
              <span className="text-violet-600">File: {audioFileName}</span>
            )}
          </div>
        )}

        {audioUrl && (
          <div className="mb-8 flex flex-col items-center gap-6">
            <audio controls src={audioUrl} className="w-full rounded-xl" />

            <button
              type="button"
              onClick={submitPronunciation}
              disabled={loading || !canSubmit}
              className="flex items-center gap-3 rounded-full bg-blue-500 px-8 py-4 font-black text-white shadow-lg hover:bg-blue-600 disabled:opacity-60"
            >
              <Send size={20} />
              {loading ? "Đang chấm..." : "Chấm phát âm"}
            </button>
          </div>
        )}

        {result && (
          <div className="animate-fade-in rounded-3xl border-2 border-emerald-200 bg-emerald-50/90 p-6 md:p-8">
            <h3 className="mb-4 flex items-center gap-3 text-xl font-black text-emerald-800">
              <Star /> Kết quả luyện phát âm
            </h3>

            <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              {result.status && (
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  Trạng thái: {result.status}
                </span>
              )}
              {result.attemptId && (
                <span className="rounded-full bg-white px-3 py-1 font-mono shadow-sm">
                  ID: {result.attemptId}
                </span>
              )}
            </div>

            {result.recognizedText != null && result.recognizedText !== "" && (
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-white/80 p-4">
                <div className="mb-1 text-xs font-bold uppercase text-slate-500">
                  Nhận diện được
                </div>
                <p className="text-lg font-bold text-slate-800">
                  {result.recognizedText}
                </p>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 font-bold text-slate-700 md:grid-cols-3">
              <ScoreCell
                label="Tổng điểm"
                value={scores?.overallScore}
                highlight
              />
              <ScoreCell label="Phát âm" value={scores?.pronScore} />
              <ScoreCell label="Chính xác" value={scores?.accuracy} />
              <ScoreCell label="Trôi chảy" value={scores?.fluency} />
              <ScoreCell label="Ngữ điệu" value={scores?.prosody} />
              <ScoreCell label="Hoàn chỉnh" value={scores?.completeness} />
              <ScoreCell
                label="Độ tin cậy"
                value={
                  scores?.confidence != null
                    ? `${(scores.confidence * 100).toFixed(1)}%`
                    : undefined
                }
              />
            </div>

            {result.words && result.words.length > 0 && (
              <div className="mb-6 overflow-x-auto rounded-2xl border border-emerald-100 bg-white/90">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-100/50 text-emerald-900">
                      <th className="px-4 py-2 font-black">Từ</th>
                      <th className="px-4 py-2 font-black">Điểm</th>
                      <th className="px-4 py-2 font-black">Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.words.map((w, i) => (
                      <tr
                        key={`${w.Word}-${i}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-2 font-semibold text-slate-800">
                          {w.Word ?? "—"}
                        </td>
                        <td className="px-4 py-2">
                          {w.AccuracyScore != null ? w.AccuracyScore : "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          {w.ErrorType ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.aiAnalysis && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5">
                <div className="mb-3 flex items-center gap-2 font-black text-amber-900">
                  <Headphones size={18} />
                  Nhận xét AI
                </div>
                <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {result.aiAnalysis}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        highlight
          ? "border-blue-200 bg-blue-50 text-blue-900"
          : "border-slate-100 bg-white/90 text-slate-800"
      }`}
    >
      <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-black ${highlight ? "text-2xl" : ""}`}>
        {value != null && value !== "" ? value : "—"}
      </div>
    </div>
  );
}

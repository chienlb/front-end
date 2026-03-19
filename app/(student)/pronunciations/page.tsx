"use client";

import { useRef, useState } from "react";
import { Mic, Square, Upload, Star, Type } from "lucide-react";
import { pronunciationService } from "@/services/pronunciation.service";

export default function PronunciationPractice() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function convertWebmToWavPCM(webmBlob: Blob): Promise<Blob> {
    const arrayBuffer = await webmBlob.arrayBuffer();

    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      1,
      audioBuffer.duration * 16000,
      16000
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
    view.setUint32(offset, 36 + channelData.length * 2, true); offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * 2, true); offset += 4;
    view.setUint16(offset, 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString("data");
    view.setUint32(offset, channelData.length * 2, true); offset += 4;

    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  const startRecording = async () => {
    setResult(null);
    setAudioBlob(null);
    setAudioUrl(null);

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
      const webmBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const wavBlob = await convertWebmToWavPCM(webmBlob);

      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submitPronunciation = async () => {
    if (!audioBlob || !text.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "record.webm");
    formData.append("referenceText", text.trim());
    formData.append("language", "en-US");

    try {
      const res = await pronunciationService.assess(formData);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,207,232,0.22),transparent_55%)] px-4 pt-20 pb-16">
      <div className="max-w-2xl mx-auto bg-white/95 rounded-[2.5rem] shadow-primary-card p-8 md:p-10 border border-slate-100 backdrop-blur">

      <div className="mb-8">
        <label className="flex items-center gap-2 font-black text-slate-700 mb-3">
          <Type size={18} /> Câu muốn luyện đọc
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ví dụ: Good morning everyone"
          rows={3}
          className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
        />
      </div>

      <div className="flex justify-center gap-6 mb-8">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={!text.trim()}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black shadow-lg transition
              ${text.trim()
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
          >
            <Mic /> Ghi âm
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-full font-black shadow-lg"
          >
            <Square /> Dừng
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="flex flex-col items-center gap-6 mb-8">
          <audio controls src={audioUrl} className="w-full rounded-xl" />

          <button
            onClick={submitPronunciation}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-black shadow-lg disabled:opacity-60"
          >
            <Upload />
            {loading ? "Đang chấm..." : "Chấm phát âm"}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 animate-fade-in">
          <h3 className="text-xl font-black text-emerald-700 mb-6 flex items-center gap-3">
            <Star /> Kết quả luyện phát âm
          </h3>

          <div className="grid grid-cols-2 gap-4 font-bold text-slate-700">
            <div>Điểm phát âm</div>
            <div>{result.scores.pronScore}</div>

            <div>Độ chính xác</div>
            <div>{result.scores.accuracy}</div>

            <div>Độ lưu loát</div>
            <div>{result.scores.fluency}</div>

            <div>Điểm ngữ pháp</div>
            <div>{result.scores.prosody}</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
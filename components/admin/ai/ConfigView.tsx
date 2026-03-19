import { useState } from "react";
import {
  RefreshCw,
  Save,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Play,
  MessageSquare,
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  costPer1k: number;
}

interface AIFeature {
  id: string;
  name: string;
  model: string;
  temp: number;
  prompt: string;
  status: string;
  maxTokens?: number;
  topP?: number;
}

interface ConfigViewProps {
  features: AIFeature[];
  aiModels: AIModel[];
  selectedFeatureId: string;
  setSelectedFeatureId: (id: string) => void;
  handleUpdateConfig: (key: string, value: any) => void;
}

export default function ConfigView({
  features,
  aiModels,
  selectedFeatureId,
  setSelectedFeatureId,
  handleUpdateConfig,
}: ConfigViewProps) {
  const selectedFeature = features.find((f) => f.id === selectedFeatureId);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  if (!selectedFeature) return null;

  // Mock function to simulate AI testing
  const handleTestAI = () => {
    if (!testInput) return;
    setIsTesting(true);
    setTimeout(() => {
      setTestOutput(
        `[AI Response Simulation]\nBased on prompt settings:\n"${testInput}" -> This is a generated response using model ${selectedFeature.model} with temp ${selectedFeature.temp}.`,
      );
      setIsTesting(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. LEFT MENU: FEATURE LIST */}
      <div className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit sticky top-24">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-sm uppercase tracking-wide">
          Chọn tính năng
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {features.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFeatureId(f.id)}
              className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 flex justify-between items-center group
                ${
                  selectedFeatureId === f.id
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600 pl-[12px]"
                    : "text-slate-600 border-l-4 border-l-transparent"
                }`}
            >
              <span className="font-medium text-sm">{f.name}</span>
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-white ${f.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"}`}
              ></span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. RIGHT CONTENT: SETTINGS FORM */}
      <div className="col-span-12 md:col-span-9 space-y-6">
        {/* Main Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {selectedFeature.name}
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded border border-slate-200 uppercase font-mono">
                  {selectedFeature.id}
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Cấu hình tham số mô hình AI.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                onClick={() => alert("Đã khôi phục cài đặt gốc!")}
              >
                <RotateCcw size={16} />{" "}
                <span className="hidden sm:inline">Khôi phục</span>
              </button>
              <button
                className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition active:scale-95"
                onClick={() => alert("Đã lưu cấu hình!")}
              >
                <Save size={16} /> Lưu cấu hình
              </button>
            </div>
          </div>

          {/* Basic Params */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Mô hình (Model)
              </label>
              <select
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 transition font-medium text-sm text-slate-700"
                value={selectedFeature.model}
                onChange={(e) => handleUpdateConfig("model", e.target.value)}
              >
                {aiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}) - ${m.costPer1k}/1k tokens
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                Lựa chọn mô hình cân bằng giữa chi phí và độ thông minh.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">
                  Độ sáng tạo (Temperature)
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedFeature.temp}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                value={selectedFeature.temp}
                onChange={(e) =>
                  handleUpdateConfig("temp", parseFloat(e.target.value))
                }
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                <span>Chính xác (0.0)</span>
                <span>Cân bằng (0.5)</span>
                <span>Sáng tạo (1.0)</span>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                System Prompt (Chỉ thị cốt lõi)
              </label>
              <button className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <MessageSquare size={12} /> Xem thư viện mẫu
              </button>
            </div>
            <div className="relative group">
              <textarea
                className="w-full h-48 p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition font-mono text-sm leading-relaxed resize-none text-slate-700"
                value={selectedFeature.prompt}
                onChange={(e) => handleUpdateConfig("prompt", e.target.value)}
                placeholder="Nhập hướng dẫn cho AI..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded border border-slate-200 shadow-sm">
                {selectedFeature.prompt.length} chars
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>
                Lưu ý: Thay đổi prompt sẽ ảnh hưởng trực tiếp đến chất lượng câu
                trả lời của AI cho toàn bộ người dùng đang sử dụng tính năng
                này.
              </p>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              <Sliders size={16} />{" "}
              {showAdvanced
                ? "Ẩn cài đặt nâng cao"
                : "Hiển thị cài đặt nâng cao"}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Max Tokens (Giới hạn độ dài)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    placeholder="VD: 2048"
                    defaultValue={2048}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Giới hạn số token tối đa cho mỗi câu trả lời.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Top P (Nucleus Sampling)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="1"
                    min="0"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    placeholder="VD: 1.0"
                    defaultValue={1.0}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Thay thế cho Temperature (thường dùng 1 trong 2).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. TEST PLAYGROUND CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Play
              size={20}
              className="text-green-600 bg-green-50 p-1 rounded-md"
            />{" "}
            Test nhanh (Playground)
          </h3>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition"
              placeholder="Nhập câu hỏi thử nghiệm..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTestAI()}
            />
            <button
              onClick={handleTestAI}
              disabled={isTesting || !testInput}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {isTesting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                "Chạy thử"
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[100px] text-sm text-slate-700 font-medium">
            {testOutput ? (
              <p className="whitespace-pre-line animate-in fade-in">
                {testOutput}
              </p>
            ) : (
              <p className="text-slate-400 italic text-center mt-6">
                Kết quả chạy thử sẽ hiện tại đây...
              </p>
            )}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800">Trạng thái tính năng</h4>
            <p className="text-xs text-slate-500">
              Tạm dừng tính năng này nếu phát hiện lỗi hoặc chi phí quá cao.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleUpdateConfig("status", "ACTIVE")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedFeature.status === "ACTIVE" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => handleUpdateConfig("status", "PAUSED")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedFeature.status === "PAUSED" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Tạm dừng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Bot, Activity, Settings, History } from "lucide-react";

import DashboardView from "@/components/admin/ai/DashboardView";
import ConfigView from "@/components/admin/ai/ConfigView";
import LogsView from "@/components/admin/ai/LogsView";
import TabButton from "@/components/admin/ai/TabButton";

// --- MOCK DATA ---
const AI_MODELS = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    costPer1k: 0.01,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    costPer1k: 0.0015,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    costPer1k: 0.00025,
  },
];

const AI_FEATURES = [
  {
    id: "CHAT_BOT",
    name: "Trợ lý ảo học tập",
    model: "gpt-3.5-turbo",
    temp: 0.7,
    prompt:
      "Bạn là một gia sư tiếng Anh thân thiện, kiên nhẫn. Hãy giải thích ngắn gọn, dễ hiểu cho trẻ em...",
    status: "ACTIVE",
  },
  {
    id: "GRADING",
    name: "Chấm điểm tự động",
    model: "gpt-4-turbo",
    temp: 0.2,
    prompt:
      "Bạn là giám khảo chấm thi IELTS nghiêm khắc. Hãy chấm điểm dựa trên tiêu chí sau...",
    status: "ACTIVE",
  },
  {
    id: "CONTENT_GEN",
    name: "Tạo bài tập",
    model: "gemini-pro",
    temp: 0.8,
    prompt: "Tạo 5 câu hỏi trắc nghiệm về thì hiện tại đơn...",
    status: "PAUSED",
  },
];

const AI_LOGS = [
  {
    id: "log_1",
    feature: "Chatbot",
    user: "Nguyễn Văn A",
    tokens: 450,
    cost: 0.0006,
    time: "10:30:21",
    status: "SUCCESS",
  },
  {
    id: "log_2",
    feature: "Chấm điểm",
    user: "Trần Thị B",
    tokens: 2100,
    cost: 0.03,
    time: "10:28:15",
    status: "SUCCESS",
  },
  {
    id: "log_3",
    feature: "Tạo bài tập",
    user: "Admin",
    tokens: 0,
    cost: 0,
    time: "10:15:00",
    status: "ERROR",
  },
];

export default function AIConfigPage() {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "CONFIG" | "LOGS">(
    "DASHBOARD",
  );

  // State quản lý danh sách
  const [features, setFeatures] = useState(AI_FEATURES);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(
    AI_FEATURES[0].id,
  );

  // Stats (Dữ liệu thống kê giả lập)
  const stats = {
    totalCost: 45.2,
    totalRequests: 12540,
    errorRate: 0.5,
    creditsRemaining: 154.8,
  };

  // Hàm xử lý cập nhật cấu hình
  const handleUpdateConfig = (key: string, value: any) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === selectedFeatureId ? { ...f, [key]: value } : f,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-5 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Bot className="text-indigo-600" /> Quản trị AI Center
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Cấu hình mô hình, theo dõi chi phí và nhật ký hoạt động.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <TabButton
            active={activeTab === "DASHBOARD"}
            onClick={() => setActiveTab("DASHBOARD")}
            icon={Activity}
            label="Tổng quan"
          />
          <TabButton
            active={activeTab === "CONFIG"}
            onClick={() => setActiveTab("CONFIG")}
            icon={Settings}
            label="Cấu hình"
          />
          <TabButton
            active={activeTab === "LOGS"}
            onClick={() => setActiveTab("LOGS")}
            icon={History}
            label="Lịch sử (Logs)"
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto px-8 py-8">
        {activeTab === "DASHBOARD" && <DashboardView stats={stats} />}

        {activeTab === "CONFIG" && (
          <ConfigView
            features={features}
            aiModels={AI_MODELS}
            selectedFeatureId={selectedFeatureId}
            setSelectedFeatureId={setSelectedFeatureId}
            handleUpdateConfig={handleUpdateConfig}
          />
        )}

        {activeTab === "LOGS" && <LogsView logs={AI_LOGS} />}
      </div>
    </div>
  );
}

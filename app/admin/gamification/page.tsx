"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Save,
  Loader2,
  Gift,
  Star,
} from "lucide-react";
import { gamificationService } from "@/services/gamification.service";
import QuestEditorModal from "@/components/admin/gamification/QuestEditorModal";
import LevelEditorModal from "@/components/admin/gamification/LevelEditorModal";
import BadgeEditorModal from "@/components/admin/gamification/BadgeEditorModal";

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<"QUESTS" | "LEVELS" | "BADGES">(
    "QUESTS"
  );
  const [loading, setLoading] = useState(false);

  // Data States
  const [quests, setQuests] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  // Modal States
  const [questModal, setQuestModal] = useState({ open: false, data: null });
  const [levelModal, setLevelModal] = useState({ open: false, data: null });
  const [badgeModal, setBadgeModal] = useState({ open: false, data: null });

  // Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "QUESTS") {
        const res: any = await gamificationService.getQuests();
        setQuests(res);
      } else if (activeTab === "LEVELS") {
        const res: any = await gamificationService.getLevels();
        setLevels(res);
      } else if (activeTab === "BADGES") {
        const res: any = await gamificationService.getBadges();
        setBadges(res);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Delete Handlers
  const handleDelete = async (
    id: string,
    type: "QUEST" | "LEVEL" | "BADGE"
  ) => {
    if (!confirm("Bạn có chắc muốn xóa không?")) return;
    try {
      if (type === "QUEST") await gamificationService.deleteQuest(id);
      if (type === "LEVEL") await gamificationService.deleteLevel(id);
      if (type === "BADGE") await gamificationService.deleteBadge(id);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cấu hình Gamification 🎮
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý nhiệm vụ, cấp độ và phần thưởng.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab("QUESTS")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "QUESTS"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Target size={18} /> Nhiệm vụ ngày
        </button>
        <button
          onClick={() => setActiveTab("LEVELS")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "LEVELS"
              ? "bg-purple-600 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <TrendingUp size={18} /> Cấp độ & XP
        </button>
        <button
          onClick={() => setActiveTab("BADGES")}
          className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
            activeTab === "BADGES"
              ? "bg-yellow-500 text-white shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Trophy size={18} /> Huy hiệu
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <>
            {/* --- TAB 1: QUESTS --- */}
            {activeTab === "QUESTS" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-700">
                    Danh sách Nhiệm vụ
                  </h3>
                  <button
                    onClick={() => setQuestModal({ open: true, data: null })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
                  >
                    <Plus size={16} /> Thêm Nhiệm vụ
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                    <tr>
                      <th className="p-4 rounded-tl-lg">Tên</th>
                      <th className="p-4">Loại / Mục tiêu</th>
                      <th className="p-4">Phần thưởng</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 rounded-tr-lg text-right">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quests.map((q) => (
                      <tr key={q._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-slate-700">
                          {q.title}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-mono bg-gray-100 px-1 rounded text-xs">
                              {q.type}
                            </span>
                            <span>Target: {q.target}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
                              +{q.rewards?.gold || 0} G
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                              +{q.rewards?.xp || 0} XP
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              q.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {q.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() =>
                              setQuestModal({ open: true, data: q })
                            }
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id, "QUEST")}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- TAB 2: LEVELS --- */}
            {activeTab === "LEVELS" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-700">
                    Cấu hình Cấp độ
                  </h3>
                  <button
                    onClick={() => setLevelModal({ open: true, data: null })}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700"
                  >
                    <Plus size={16} /> Thêm Cấp độ
                  </button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                    <tr>
                      <th className="p-4">Level</th>
                      <th className="p-4">XP Yêu cầu</th>
                      <th className="p-4">Phần thưởng</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {levels.map((lvl) => (
                      <tr key={lvl._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-purple-600">
                          Lv {lvl.level}
                        </td>
                        <td className="p-4 font-mono">
                          {lvl.requiredXP.toLocaleString()} XP
                        </td>
                        <td className="p-4 flex gap-2">
                          {lvl.rewards?.gold > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded">
                              💰 {lvl.rewards.gold}
                            </span>
                          )}
                          {lvl.rewards?.diamonds > 0 && (
                            <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">
                              💎 {lvl.rewards.diamonds}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() =>
                              setLevelModal({ open: true, data: lvl })
                            }
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lvl._id, "LEVEL")}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- TAB 3: BADGES --- */}
            {activeTab === "BADGES" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => setBadgeModal({ open: true, data: null })}
                  className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition h-64"
                >
                  <Plus size={40} className="mb-2" />
                  <span className="font-bold">Tạo Huy hiệu mới</span>
                </button>
                {badges.map((badge) => (
                  <div
                    key={badge._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center relative group"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <button
                        onClick={() =>
                          setBadgeModal({ open: true, data: badge })
                        }
                        className="p-1.5 hover:bg-gray-100 rounded text-blue-500"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(badge._id, "BADGE")}
                        className="p-1.5 hover:bg-gray-100 rounded text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-4xl mb-4 shadow-inner">
                      {badge.icon}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 h-10 overflow-hidden">
                      {badge.description}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        badge.tier === "Gold"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : badge.tier === "Diamond"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {badge.tier} Tier
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <QuestEditorModal
        isOpen={questModal.open}
        onClose={() => setQuestModal({ ...questModal, open: false })}
        onSuccess={fetchData}
        initialData={questModal.data}
      />
      <LevelEditorModal
        isOpen={levelModal.open}
        onClose={() => setLevelModal({ ...levelModal, open: false })}
        onSuccess={fetchData}
        initialData={levelModal.data}
      />
      <BadgeEditorModal
        isOpen={badgeModal.open}
        onClose={() => setBadgeModal({ ...badgeModal, open: false })}
        onSuccess={fetchData}
        initialData={badgeModal.data}
      />
    </div>
  );
}

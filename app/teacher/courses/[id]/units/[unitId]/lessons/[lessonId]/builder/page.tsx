"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Trash2,
  Type,
  Video,
  HelpCircle,
  GripVertical,
  Loader2,
  FolderOpen,
  PlusCircle,
  Search,
  X,
  Puzzle,
  Mic,
  List,
  CheckCircle,
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import { courseService } from "@/services/course.service";
import { questionService } from "@/services/question.service";
import { mediaService } from "@/services/media.service";
import { practiceService } from "@/services/practice.service";
import ItemEditModal from "@/components/teacher/course/unit/ItemEditModal";

// --- 1. MODAL CHỌN TÀI NGUYÊN ---
const ResourcePickerModal = ({ isOpen, onClose, type, onSelect }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"PRACTICE" | "BANK" | "MEDIA">(
    "PRACTICE",
  );

  useEffect(() => {
    if (isOpen) {
      if (type === "MEDIA") setSource("MEDIA");
      else setSource("PRACTICE");
      setSearch("");
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [source, search, isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data: any = [];
      if (source === "PRACTICE") {
        data = await practiceService.getAll();
      } else if (source === "BANK") {
        data = await questionService.getAll({ search });
      } else if (source === "MEDIA") {
        data = await mediaService.getAll({ search });
      }

      if (source === "PRACTICE" && search) {
        data = data.filter(
          (d: any) =>
            (d.content &&
              d.content.toLowerCase().includes(search.toLowerCase())) ||
            (d.type && d.type.toLowerCase().includes(search.toLowerCase())),
        );
      }
      setItems(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {type === "QUESTION" ? "📚 Kho tài nguyên" : "🖼️ Thư viện Media"}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {type === "QUESTION" && (
          <div className="flex border-b">
            <button
              onClick={() => setSource("PRACTICE")}
              className={`flex-1 py-3 text-sm font-bold ${source === "PRACTICE" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50" : "text-gray-500"}`}
            >
              🏋️ Kho Luyện Tập
            </button>
            <button
              onClick={() => setSource("BANK")}
              className={`flex-1 py-3 text-sm font-bold ${source === "BANK" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50" : "text-gray-500"}`}
            >
              🏦 Ngân Hàng Câu Hỏi
            </button>
          </div>
        )}

        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="animate-spin inline mr-2" /> Đang tải...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Không có dữ liệu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item: any) => (
                <div
                  key={item._id}
                  className="bg-white border p-3 rounded-xl hover:shadow-md cursor-pointer flex gap-3 group"
                  onClick={() => {
                    onSelect({ ...item, _source: source });
                    onClose();
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${item.type?.includes("QUIZ") ? "bg-orange-500" : "bg-blue-500"}`}
                  >
                    {source === "MEDIA" ? (
                      <Mic size={18} />
                    ) : (
                      <List size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">
                      {item.content || item.title || "No Name"}
                    </p>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 2. ACTIVITY ITEM ---
const ActivityItem = ({
  index,
  activity,
  total,
  onChange,
  onDelete,
  onMove,
  onRequestMedia,
}: any) => {
  const handleChange = (field: string, value: any) => {
    onChange(index, {
      ...activity,
      data: { ...activity.data, [field]: value },
    });
  };

  // Helper cho Quiz
  const handleOptionChange = (i: number, val: string) => {
    const newOpts = [...(activity.data.options || [])];
    newOpts[i].text = val;
    handleChange("options", newOpts);
  };

  // Render Content
  const renderContent = () => {
    const type = activity.type?.toUpperCase();
    if (type === "VOCAB") {
      return (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            className="border p-2 rounded text-sm font-bold"
            value={activity.data?.word || ""}
            onChange={(e) => handleChange("word", e.target.value)}
            placeholder="Từ vựng (EN)"
          />
          <input
            className="border p-2 rounded text-sm"
            value={activity.data?.meaning || ""}
            onChange={(e) => handleChange("meaning", e.target.value)}
            placeholder="Nghĩa (VN)"
          />
          <div className="col-span-2 flex gap-2">
            <input
              className="w-full border p-2 rounded text-sm text-gray-500"
              value={activity.data?.image || ""}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="Link ảnh..."
            />
            <button
              onClick={() => onRequestMedia(index, "image")}
              className="bg-gray-100 px-3 rounded border"
            >
              <FolderOpen size={18} />
            </button>
          </div>
        </div>
      );
    }
    if (type === "VIDEO") {
      return (
        <div className="mt-2 flex gap-2">
          <input
            className="w-full border p-2 rounded text-sm text-blue-600"
            value={activity.data?.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="Youtube URL..."
          />
          <button
            onClick={() => onRequestMedia(index, "url")}
            className="bg-gray-100 px-3 rounded border"
          >
            <FolderOpen size={18} />
          </button>
        </div>
      );
    }
    if (type === "QUIZ" || type === "MULTIPLE_CHOICE") {
      const options = activity.data?.options || [];
      return (
        <div className="mt-2 space-y-2">
          <input
            className="w-full border p-2 rounded text-sm font-bold"
            value={activity.data?.question || ""}
            onChange={(e) => handleChange("question", e.target.value)}
            placeholder="Câu hỏi..."
          />
          {options.map((opt: any, idx: number) => (
            <div
              key={idx}
              className={`flex gap-2 items-center p-2 rounded border ${opt.isCorrect ? "bg-green-50 border-green-200" : "bg-white"}`}
            >
              <button
                onClick={() => {
                  const newOpts = options.map((o: any, i: number) => ({
                    ...o,
                    isCorrect: i === idx,
                  }));
                  handleChange("options", newOpts);
                }}
              >
                <CheckCircle
                  size={16}
                  className={opt.isCorrect ? "text-green-600" : "text-gray-300"}
                />
              </button>
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                value={opt.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Đáp án ${idx + 1}`}
              />
              <button
                onClick={() =>
                  handleChange(
                    "options",
                    options.filter((_: any, i: number) => i !== idx),
                  )
                }
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              handleChange("options", [
                ...options,
                { text: "", isCorrect: false },
              ])
            }
            className="text-xs text-blue-600 font-bold border border-dashed border-blue-300 p-2 rounded w-full"
          >
            + Thêm đáp án
          </button>
        </div>
      );
    }
    // Default
    return (
      <div className="mt-2 p-2 bg-gray-50 text-xs text-gray-400 font-mono">
        {JSON.stringify(activity.data)}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${activity.type?.includes("VOCAB") ? "bg-green-500" : "bg-blue-500"}`}
      ></div>

      <div className="flex justify-between items-start mb-2 pl-3">
        <div className="flex items-center gap-3 w-full">
          {/* THÊM NÚT DI CHUYỂN */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onMove(index, -1)}
              disabled={index === 0}
              className="text-gray-300 hover:text-blue-600 disabled:opacity-0"
            >
              <ArrowUp size={14} />
            </button>
            <GripVertical className="text-gray-200 cursor-move" size={14} />
            <button
              onClick={() => onMove(index, 1)}
              disabled={index === total - 1}
              className="text-gray-300 hover:text-blue-600 disabled:opacity-0"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 w-fit">
              {activity.type}
            </span>
            <input
              className="font-bold text-sm text-slate-700 outline-none mt-1 bg-transparent"
              value={activity.name}
              onChange={(e) =>
                onChange(index, { ...activity, name: e.target.value })
              }
              placeholder="Tên hoạt động..."
            />
          </div>
        </div>
        <button
          onClick={() => onDelete(index)}
          className="text-gray-300 hover:text-red-500 p-2"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="pl-8">{renderContent()}</div>
    </div>
  );
};

// --- 3. MAIN PAGE ---
export default function LessonBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const { lessonId } = params as { lessonId: string };

  const [activities, setActivities] = useState<any[]>([]);

  const [lessonData, setLessonData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [pickerConfig, setPickerConfig] = useState<any>({
    isOpen: false,
    type: "QUESTION",
  });
  const [settingModalOpen, setSettingModalOpen] = useState(false); // Modal Cấu hình

  useEffect(() => {
    if (!lessonId) return;
    const fetchLessonData = async () => {
      try {
        const lesson: any = await courseService.getLesson(lessonId);
        if (lesson) {
          setLessonData(lesson);
          setActivities(lesson.activities || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessonData();
  }, [lessonId]);

  // Actions CRUD
  const addActivity = (type: string) => {
    let initialData = {};
    if (type === "quiz")
      initialData = {
        question: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      };
    setActivities([
      ...activities,
      { type, name: `New ${type}`, data: initialData },
    ]);
  };

  const updateActivity = (index: number, val: any) => {
    const newActs = [...activities];
    newActs[index] = val;
    setActivities(newActs);
  };

  const deleteActivity = (index: number) => {
    if (confirm("Xóa hoạt động này?"))
      setActivities(activities.filter((_, i) => i !== index));
  };

  // ACTION DI CHUYỂN
  const moveActivity = (index: number, direction: number) => {
    const newActs = [...activities];
    const temp = newActs[index];
    newActs[index] = newActs[index + direction];
    newActs[index + direction] = temp;
    setActivities(newActs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await courseService.updateLessonContent(lessonId, activities);
      alert("Đã lưu nội dung bài học! 🎉");
    } catch (e) {
      alert("Lỗi lưu dữ liệu");
    } finally {
      setIsSaving(false);
    }
  };

  // Modal Handlers
  const handleResourceSelect = (item: any) => {
    // Logic map data từ ResourcePicker
    const type = item.type ? item.type.toUpperCase() : "UNKNOWN";
    const newAct = {
      name: item.content || `Game ${type}`,
      type: type,
      data: { ...item, refId: item._id },
    };

    if (
      pickerConfig.type === "MEDIA" &&
      typeof pickerConfig.targetIndex === "number"
    ) {
      const idx = pickerConfig.targetIndex;
      const field = pickerConfig.targetField || "url";
      const act = { ...activities[idx] };
      act.data = { ...act.data, [field]: item.url };
      updateActivity(idx, act);
    } else {
      // Thêm mới
      setActivities([...activities, newAct]);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between shadow-sm items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              {lessonData?.title}
              <button
                onClick={() => setSettingModalOpen(true)}
                className="text-gray-400 hover:text-blue-600"
              >
                <Settings size={16} />
              </button>
            </h1>
            <p className="text-xs text-gray-500">
              Lesson Builder • {activities.length} Activities
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex gap-2 hover:bg-blue-700 transition"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}{" "}
          Lưu bài
        </button>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto mt-8 px-4 space-y-4">
        {activities.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl text-gray-400 bg-white">
            Bài học trống. Hãy thêm hoạt động bên dưới.
          </div>
        )}

        {activities.map((act, index) => (
          <ActivityItem
            key={index}
            index={index}
            total={activities.length}
            activity={act}
            onChange={updateActivity}
            onDelete={deleteActivity}
            onMove={moveActivity} // 🔥 Truyền hàm move
            onRequestMedia={(idx: number, field: string) =>
              setPickerConfig({
                isOpen: true,
                type: "MEDIA",
                targetIndex: idx,
                targetField: field,
              })
            }
          />
        ))}
      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl p-2 rounded-2xl flex gap-2 z-20">
        <div className="flex gap-1 pr-2 border-r border-gray-200">
          <button
            onClick={() => addActivity("vocab")}
            className="w-14 h-14 hover:bg-green-50 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-green-600 transition"
          >
            <Type size={18} />
            <span className="text-[9px] font-bold mt-1">Từ vựng</span>
          </button>
          <button
            onClick={() => addActivity("video")}
            className="w-14 h-14 hover:bg-red-50 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-red-600 transition"
          >
            <Video size={18} />
            <span className="text-[9px] font-bold mt-1">Video</span>
          </button>
          <button
            onClick={() => addActivity("quiz")}
            className="w-14 h-14 hover:bg-yellow-50 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-yellow-600 transition"
          >
            <HelpCircle size={18} />
            <span className="text-[9px] font-bold mt-1">Quiz</span>
          </button>
        </div>
        <button
          onClick={() => setPickerConfig({ isOpen: true, type: "QUESTION" })}
          className="w-20 h-14 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100 transition"
        >
          <FolderOpen size={20} />
          <span className="text-[9px] font-bold mt-1 text-center">
            Kho Game
          </span>
        </button>
      </div>

      {/* RESOURCE PICKER MODAL */}
      <ResourcePickerModal
        isOpen={pickerConfig.isOpen}
        type={pickerConfig.type}
        onClose={() => setPickerConfig({ ...pickerConfig, isOpen: false })}
        onSelect={handleResourceSelect}
      />

      {/* SETTING MODAL */}
      {settingModalOpen && lessonData && (
        <ItemEditModal
          isOpen={true}
          type="lesson"
          data={lessonData}
          onClose={() => setSettingModalOpen(false)}
          onSave={() => {
            courseService
              .getLesson(lessonId)
              .then((res: any) => setLessonData(res));
          }}
        />
      )}
    </div>
  );
}

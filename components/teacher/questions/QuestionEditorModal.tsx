"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Plus,
  Trash2,
  Mic,
  Puzzle,
  Type,
  List,
  Circle,
  CheckCircle,
  BookOpen,
  Image as ImageIcon,
  Volume2,
  FolderOpen,
  Search,
  Loader2,
  Star,
  Coins,
} from "lucide-react";
import { questionService } from "@/services/question.service";
import { mediaService } from "@/services/media.service";

// --- MODAL CHỌN MEDIA ---
const MediaPicker = ({ isOpen, onClose, onSelect }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAll({ search });
      setItems(data as any[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-sm text-slate-800">
            🖼️ Chọn Media từ Kho
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-3 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              className="w-full pl-9 pr-3 py-1.5 border rounded-md text-xs focus:outline-blue-500"
              placeholder="Tìm kiếm file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-3 bg-gray-50">
          {loading ? (
            <div className="col-span-4 text-center py-10">
              <Loader2 className="animate-spin inline" />
            </div>
          ) : (
            items.map((item: any) => (
              <div
                key={item._id}
                onClick={() => {
                  onSelect(item.url);
                  onClose();
                }}
                className="aspect-square bg-white border rounded-lg overflow-hidden hover:ring-2 ring-blue-500 cursor-pointer relative group shadow-sm"
              >
                {item.type === "IMAGE" || item.type === "VIDEO" ? (
                  <img
                    src={item.thumbnail || item.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Volume2 size={24} />{" "}
                    <span className="text-[9px] mt-1 uppercase">
                      {item.type}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-bold">Chọn</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function QuestionEditorModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);

  // --- GLOBAL STATE ---
  const [type, setType] = useState("VOCAB");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [tags, setTags] = useState("");

  // --- CONFIG STATE ---
  const [pairs, setPairs] = useState([{ id: Date.now(), a: "", b: "" }]);

  // STATE PHẦN THƯỞNG
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardXP, setRewardXP] = useState(0);

  // Quiz Options (Nhiều đáp án)
  const [options, setOptions] = useState([
    { id: Date.now(), text: "", isCorrect: true },
    { id: Date.now() + 1, text: "", isCorrect: false },
    { id: Date.now() + 2, text: "", isCorrect: false },
  ]);

  const [fillAnswers, setFillAnswers] = useState("");
  const [fillHint, setFillHint] = useState("");

  // Vocab Data
  const [vocabData, setVocabData] = useState({
    word: "",
    meaning: "",
    partOfSpeech: "noun",
    image: "",
    audio: "",
    example: "",
  });

  // State cho Media Picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"image" | "audio" | null>(
    null,
  );

  // --- LOAD DATA ---
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setContent(initialData.content);
      setDifficulty(initialData.difficulty);
      setTags(initialData.tags?.join(", ") || "");

      setRewardGold(initialData.rewardGold || 0);
      setRewardXP(initialData.rewardXP || 0);

      const cfg = initialData.config || {};

      if (initialData.type === "MATCHING") {
        const loadedPairs =
          cfg.pairs?.map((p: any) => ({
            id: p.id || Date.now(),
            a: p.contentA,
            b: p.contentB,
          })) || [];
        setPairs(
          loadedPairs.length ? loadedPairs : [{ id: Date.now(), a: "", b: "" }],
        );
      } else if (initialData.type === "MULTIPLE_CHOICE")
        setOptions(cfg.options || []);
      else if (initialData.type === "FILL_IN_BLANK") {
        setFillAnswers(cfg.correctAnswers?.join(", ") || "");
        setFillHint(cfg.hint || "");
      } else if (initialData.type === "VOCAB") {
        setVocabData({
          word: cfg.word || initialData.content,
          meaning: cfg.meaning || "",
          partOfSpeech: cfg.partOfSpeech || "noun",
          image: cfg.image || "",
          audio: cfg.audio || "",
          example: cfg.example || "",
        });
      }
    } else {
      setContent("");
      setTags("");

      setRewardGold(5);
      setRewardXP(10);

      setPairs([{ id: Date.now(), a: "", b: "" }]);
      setOptions([
        { id: Date.now(), text: "", isCorrect: true },
        { id: Date.now() + 1, text: "", isCorrect: false },
        { id: Date.now() + 2, text: "", isCorrect: false },
      ]);
      setVocabData({
        word: "",
        meaning: "",
        partOfSpeech: "noun",
        image: "",
        audio: "",
        example: "",
      });
    }
  }, [initialData]);

  // --- XỬ LÝ CHỌN MEDIA ---
  const handleOpenPicker = (target: "image" | "audio") => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (pickerTarget === "image") setVocabData({ ...vocabData, image: url });
    else if (pickerTarget === "audio")
      setVocabData({ ...vocabData, audio: url });
  };

  // --- HÀM LƯU ---
  const handleSave = async () => {
    if (type === "VOCAB" && !vocabData.word.trim())
      return alert("Vui lòng nhập từ tiếng Anh!");
    if (type !== "VOCAB" && !content.trim())
      return alert("Vui lòng nhập nội dung câu hỏi!");

    setLoading(true);
    try {
      let configData = {};
      let finalContent = content;

      if (type === "MATCHING") {
        configData = {
          pairs: pairs.map((p) => ({
            id: p.id,
            contentA: p.a,
            typeA: "text",
            contentB: p.b,
            typeB: "text",
          })),
        };
      } else if (type === "MULTIPLE_CHOICE") {
        if (options.length < 2) return alert("Cần ít nhất 2 đáp án!");
        if (!options.some((o) => o.isCorrect))
          return alert("Phải chọn ít nhất 1 đáp án đúng!");
        configData = { options: options };
      } else if (type === "FILL_IN_BLANK") {
        configData = {
          correctAnswers: fillAnswers
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          hint: fillHint,
        };
      } else if (type === "VOCAB") {
        finalContent = vocabData.word;
        configData = vocabData;
      }

      const payload = {
        content: finalContent,
        type,
        difficulty,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        config: configData,
        rewardGold: Number(rewardGold),
        rewardXP: Number(rewardXP),
      };

      if (initialData?._id)
        await questionService.update(initialData._id, payload);
      else await questionService.create(payload);

      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi lưu dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {initialData ? "✏️ Chỉnh sửa" : "✨ Tạo hoạt động mới"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-white">
          {/* 1. Chọn loại */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              Loại Hoạt động
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                {
                  id: "VOCAB",
                  label: "Từ vựng / Flashcard",
                  icon: <BookOpen size={18} />,
                },
                {
                  id: "MULTIPLE_CHOICE",
                  label: "Trắc nghiệm",
                  icon: <List size={18} />,
                },
                {
                  id: "FILL_IN_BLANK",
                  label: "Điền từ",
                  icon: <Type size={18} />,
                },
                {
                  id: "MATCHING",
                  label: "Game Nối từ",
                  icon: <Puzzle size={18} />,
                },
                {
                  id: "PRONUNCIATION",
                  label: "Phát âm AI",
                  icon: <Mic size={18} />,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition h-20 text-center
                   ${
                     type === t.id
                       ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100 shadow-sm"
                       : "border-gray-100 text-gray-500 hover:bg-gray-50"
                   }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* 2. FORM CHÍNH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: Config */}
            <div className="md:col-span-2 space-y-4">
              {/* A. FORM TỪ ĐIỂN (Đã tích hợp Media Picker) */}
              {type === "VOCAB" && (
                <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        Từ vựng (English) *
                      </label>
                      <input
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-lg font-bold text-slate-800"
                        value={vocabData.word}
                        onChange={(e) =>
                          setVocabData({ ...vocabData, word: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        Nghĩa Tiếng Việt *
                      </label>
                      <input
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-lg font-medium"
                        value={vocabData.meaning}
                        onChange={(e) =>
                          setVocabData({
                            ...vocabData,
                            meaning: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        Loại từ
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white"
                        value={vocabData.partOfSpeech}
                        onChange={(e) =>
                          setVocabData({
                            ...vocabData,
                            partOfSpeech: e.target.value,
                          })
                        }
                      >
                        <option value="noun">Danh từ (n)</option>
                        <option value="verb">Động từ (v)</option>
                        <option value="adj">Tính từ (adj)</option>
                        <option value="adv">Trạng từ (adv)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        Ví dụ (Câu mẫu)
                      </label>
                      <input
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm italic"
                        value={vocabData.example}
                        onChange={(e) =>
                          setVocabData({
                            ...vocabData,
                            example: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Media Inputs có nút chọn */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                        <ImageIcon size={14} /> Ảnh minh họa
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-white text-gray-600"
                          placeholder="https://..."
                          value={vocabData.image}
                          onChange={(e) =>
                            setVocabData({
                              ...vocabData,
                              image: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleOpenPicker("image")}
                          className="bg-white border p-2 rounded-lg hover:bg-gray-100"
                          title="Chọn từ kho"
                        >
                          <FolderOpen size={16} className="text-blue-600" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                        <Volume2 size={14} /> Phát âm mẫu
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-white text-gray-600"
                          placeholder="https://..."
                          value={vocabData.audio}
                          onChange={(e) =>
                            setVocabData({
                              ...vocabData,
                              audio: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleOpenPicker("audio")}
                          className="bg-white border p-2 rounded-lg hover:bg-gray-100"
                          title="Chọn từ kho"
                        >
                          <FolderOpen size={16} className="text-orange-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {type !== "VOCAB" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    {type === "MATCHING"
                      ? "Tên trò chơi / Yêu cầu"
                      : "Nội dung câu hỏi"}
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 p-3 rounded-lg text-sm font-medium focus:border-blue-500 outline-none shadow-sm resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      type === "MATCHING"
                        ? "VD: Nối con vật với tên đúng"
                        : "VD: Con mèo tiếng Anh là gì?"
                    }
                  />
                </div>
              )}

              {/* B. MULTIPLE CHOICE */}
              {type === "MULTIPLE_CHOICE" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          opt.isCorrect
                            ? "bg-green-50 border-green-200 shadow-sm"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <button
                          onClick={() =>
                            setOptions(
                              options.map((o, i) => ({
                                ...o,
                                isCorrect: i === idx,
                              })),
                            )
                          }
                          className={`p-1 rounded-full transition-colors ${
                            opt.isCorrect
                              ? "text-green-600 bg-white shadow-sm"
                              : "text-gray-300 hover:text-gray-400"
                          }`}
                        >
                          {opt.isCorrect ? (
                            <CheckCircle
                              size={22}
                              fill="currentColor"
                              className="text-green-600"
                            />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>
                        <input
                          className={`flex-1 bg-transparent border-none outline-none text-sm ${
                            opt.isCorrect
                              ? "font-bold text-green-800"
                              : "text-slate-700"
                          }`}
                          value={opt.text}
                          onChange={(e) => {
                            const n = [...options];
                            n[idx].text = e.target.value;
                            setOptions(n);
                          }}
                          placeholder={`Nhập đáp án ${idx + 1}...`}
                        />
                        <button
                          onClick={() =>
                            setOptions(options.filter((_, i) => i !== idx))
                          }
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setOptions([
                        ...options,
                        { id: Date.now(), text: "", isCorrect: false },
                      ])
                    }
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Thêm đáp án gây nhiễu
                  </button>
                </div>
              )}

              {/* C. MATCHING */}
              {type === "MATCHING" && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="space-y-2">
                    {pairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">
                          {idx + 1}.
                        </span>
                        <input
                          placeholder="Vế A"
                          className="flex-1 border p-2 rounded text-sm"
                          value={pair.a}
                          onChange={(e) => {
                            const n = [...pairs];
                            n[idx].a = e.target.value;
                            setPairs(n);
                          }}
                        />
                        <span className="text-gray-300">↔</span>
                        <input
                          placeholder="Vế B"
                          className="flex-1 border p-2 rounded text-sm"
                          value={pair.b}
                          onChange={(e) => {
                            const n = [...pairs];
                            n[idx].b = e.target.value;
                            setPairs(n);
                          }}
                        />
                        <button
                          onClick={() =>
                            setPairs(pairs.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2
                            size={16}
                            className="text-gray-400 hover:text-red-500"
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setPairs([...pairs, { id: Date.now(), a: "", b: "" }])
                      }
                      className="text-xs text-blue-600 font-bold mt-2"
                    >
                      + Thêm cặp
                    </button>
                  </div>
                </div>
              )}

              {/* D. FILL BLANK */}
              {type === "FILL_IN_BLANK" && (
                <div className="space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <input
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Đáp án đúng (is, was...)"
                    value={fillAnswers}
                    onChange={(e) => setFillAnswers(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Gợi ý"
                    value={fillHint}
                    onChange={(e) => setFillHint(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cột phải: Settings */}
            <div className="space-y-4">
              {/* 🔥 5. THÊM UI NHẬP PHẦN THƯỞNG Ở ĐÂY */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <label className="text-xs font-bold text-yellow-800 mb-2 block uppercase flex items-center gap-2">
                  🎁 Phần thưởng
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Nhập Vàng */}
                  <div className="relative">
                    <span className="text-[10px] text-gray-500 uppercase font-bold absolute top-1 left-1">
                      Gold
                    </span>
                    <input
                      type="number"
                      className="w-full border border-yellow-300 p-2 pl-8 pt-4 rounded-lg font-bold text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      value={rewardGold}
                      onChange={(e) => setRewardGold(Number(e.target.value))}
                      min={0}
                    />
                    <Coins
                      size={16}
                      className="absolute left-2 top-4 text-yellow-600"
                    />
                  </div>

                  {/* Nhập XP */}
                  <div className="relative">
                    <span className="text-[10px] text-gray-500 uppercase font-bold absolute top-1 left-1">
                      XP
                    </span>
                    <input
                      type="number"
                      className="w-full border border-purple-300 p-2 pl-8 pt-4 rounded-lg font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                      value={rewardXP}
                      onChange={(e) => setRewardXP(Number(e.target.value))}
                      min={0}
                    />
                    <Star
                      size={16}
                      className="absolute left-2 top-4 text-purple-600"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Độ khó
                </label>
                <select
                  className="w-full border p-2.5 rounded-lg text-sm bg-white"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="EASY">🟢 Dễ (Easy)</option>
                  <option value="MEDIUM">🟡 Vừa (Medium)</option>
                  <option value="HARD">🔴 Khó (Hard)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Tags (Phân loại)
                </label>
                <textarea
                  className="w-full border p-2.5 rounded-lg text-sm h-32 resize-none"
                  placeholder="VD: unit1, animals, food, grammar..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Dùng dấu phẩy để ngăn cách các thẻ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <Check size={16} /> Lưu hoạt động
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Picker */}
      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

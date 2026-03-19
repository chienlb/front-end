"use client";

import { useState } from "react";
import {
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Calendar,
  Hash,
  Settings,
  UploadCloud,
  LayoutList,
  Check,
  AlertCircle,
  Video,
  Paperclip,
  Eye,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- TYPES ---
export type AssignmentType = "QUIZ" | "ESSAY" | "VIDEO";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // In a real app, this would be the file URL
  type: "PDF" | "IMAGE" | "VIDEO" | "OTHER";
}

export interface HomeworkData {
  title: string;
  description: string;
  type: AssignmentType;
  deadline: string;
  points: number;
  allowLate: boolean;
  // Common
  attachments: Attachment[]; // New: Reference materials for students
  // Quiz Specific
  questions: Question[];
  // Essay/Video Specific
  allowedFileTypes: string[];
  maxFileSize: number; // MB
  minDuration?: number; // Video specific (seconds)
  maxDuration?: number; // Video specific (seconds)
}

interface HomeworkBuilderProps {
  initialData?: HomeworkData;
  onSave: (data: HomeworkData) => void;
  onCancel: () => void;
}

// --- DEFAULT STATE ---
const DEFAULT_QUESTION: Question = {
  id: "q_1",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

export default function HomeworkBuilder({
  initialData,
  onSave,
  onCancel,
}: HomeworkBuilderProps) {
  // MAIN STATE
  const [data, setData] = useState<HomeworkData>(
    initialData || {
      title: "",
      description: "",
      type: "QUIZ",
      deadline: "",
      points: 100,
      allowLate: true,
      attachments: [],
      questions: [{ ...DEFAULT_QUESTION, id: `q_${Date.now()}` }],
      allowedFileTypes: ["PDF", "DOCX"],
      maxFileSize: 10,
      minDuration: 30,
      maxDuration: 180,
    },
  );

  // --- HANDLERS: QUIZ ---
  const addQuestion = () => {
    setData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { ...DEFAULT_QUESTION, id: `q_${Date.now()}` },
      ],
    }));
  };

  const removeQuestion = (qId: string) => {
    if (data.questions.length <= 1)
      return alert("Assignment must have at least 1 question!");
    setData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  const updateQuestionText = (qId: string, text: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qId ? { ...q, text } : q)),
    }));
  };

  const updateOptionText = (qId: string, optIndex: number, text: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = text;
        return { ...q, options: newOpts };
      }),
    }));
  };

  const setCorrectAnswer = (qId: string, index: number) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, correctIndex: index } : q,
      ),
    }));
  };

  // --- HANDLERS: CONFIG (ESSAY/VIDEO) ---
  const toggleFileType = (type: string) => {
    setData((prev) => {
      const types = prev.allowedFileTypes.includes(type)
        ? prev.allowedFileTypes.filter((t) => t !== type)
        : [...prev.allowedFileTypes, type];
      return { ...prev, allowedFileTypes: types };
    });
  };

  // --- HANDLERS: ATTACHMENTS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload functionality
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        url: "#",
        type: file.type.includes("pdf") ? "PDF" : "OTHER",
      };
      setData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment],
      }));
    }
  };

  const removeAttachment = (id: string) => {
    setData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  };

  // --- SUBMIT ---
  const handleSave = () => {
    if (!data.title) return alert("Please enter an assignment title!");
    if (!data.deadline) return alert("Please select a due date!");

    // Validate Quiz
    if (data.type === "QUIZ") {
      const invalidQ = data.questions.find(
        (q) => !q.text.trim() || q.options.some((o) => !o.trim()),
      );
      if (invalidQ)
        return alert("Please fill in all question content and answers!");
    }

    onSave(data);
  };

  return (
    <div className="bg-white w-full h-full flex flex-col font-sans">
      {/* 1. TOP BAR */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg ${
              data.type === "QUIZ"
                ? "bg-purple-100 text-purple-600"
                : data.type === "VIDEO"
                  ? "bg-pink-100 text-pink-600"
                  : "bg-blue-100 text-blue-600"
            }`}
          >
            {data.type === "QUIZ" ? (
              <LayoutList size={24} />
            ) : data.type === "VIDEO" ? (
              <Video size={24} />
            ) : (
              <FileText size={24} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {data.title || "New Untitled Assignment"}
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="uppercase tracking-wider">{data.type}</span>
              <span>•</span>
              <span className={!data.deadline ? "text-orange-500" : ""}>
                {data.deadline
                  ? `Due: ${new Date(data.deadline).toLocaleString("vi-VN")}`
                  : "No due date set"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition active:scale-95"
          >
            <Save size={18} /> Save & Publish
          </button>
        </div>
      </div>

      {/* 2. MAIN BUILDER AREA */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT PANEL: CONFIGURATION (30%) */}
        <div className="w-[350px] border-r border-slate-100 bg-slate-50 overflow-y-auto p-6 space-y-6">
          {/* General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} /> General Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assignment Type
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/50 rounded-xl">
                {(["QUIZ", "ESSAY", "VIDEO"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        type: t as AssignmentType,
                      }))
                    }
                    className={`py-2 text-[10px] font-bold rounded-lg transition ${
                      data.type === t
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <input
                value={data.title}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition"
                placeholder="Enter title..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Due Date (Deadline) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={data.deadline}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Max Points
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="number"
                  value={data.points}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      points: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full pl-9 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-600">
                Allow late submission?
              </span>
              <div
                onClick={() =>
                  setData((prev) => ({ ...prev, allowLate: !prev.allowLate }))
                }
                className={`w-10 h-5 rounded-full relative cursor-pointer transition ${
                  data.allowLate ? "bg-green-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${
                    data.allowLate ? "left-6" : "left-1"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Description & Materials */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Instructions
              </label>
              <textarea
                rows={4}
                value={data.description}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 outline-none resize-none focus:border-indigo-500"
                placeholder="Instructions for students..."
              />
            </div>

            {/* Reference Materials Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reference Materials
              </label>
              <div className="space-y-2">
                {data.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip size={14} className="text-slate-400" />
                      <span className="truncate max-w-[150px] font-medium text-slate-700">
                        {att.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition">
                  <UploadCloud size={16} /> Attach Files
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CONTENT BUILDER (70%) */}
        <div className="flex-1 bg-slate-100/50 overflow-y-auto p-8">
          {/* === A. QUIZ BUILDER === */}
          {data.type === "QUIZ" && (
            <div className="max-w-3xl mx-auto space-y-6">

              <div className="flex justify-between items-end">
                <h3 className="text-xl font-black text-slate-800">
                  Question List
                </h3>
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-purple-600 shadow-sm border border-purple-100">
                  {data.questions.length} questions •{" "}
                  {(data.points / data.questions.length).toFixed(1)}{" "}
                  points/question
                </span>
              </div>

              <AnimatePresence>
                {data.questions.map((q, qIdx) => (
                  <motion.div
                    key={q.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group relative"
                  >
                    {/* ... Question UI logic ... */}
                    <div className="absolute -left-3 top-6 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                      {qIdx + 1}
                    </div>
                    <div className="ml-4 mb-6">
                      <input
                        value={q.text}
                        onChange={(e) =>
                          updateQuestionText(q.id, e.target.value)
                        }
                        className="w-full text-lg font-bold text-slate-800 outline-none border-b-2 border-transparent focus:border-purple-500 transition pb-1"
                        placeholder="Enter question content..."
                      />
                    </div>
                    <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${q.correctIndex === oIdx ? "border-green-500 bg-green-50/30" : "border-slate-100"}`}
                        >
                          <button
                            onClick={() => setCorrectAnswer(q.id, oIdx)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${q.correctIndex === oIdx ? "border-green-500 bg-green-500 text-white" : "border-slate-300"}`}
                          >
                            <Check size={14} />
                          </button>
                          <input
                            value={opt}
                            onChange={(e) =>
                              updateOptionText(q.id, oIdx, e.target.value)
                            }
                            className="flex-1 bg-transparent outline-none text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                onClick={addQuestion}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add new question
              </button>
            </div>
          )}

          {/* === B. ESSAY BUILDER === */}
          {data.type === "ESSAY" && (
            <div className="max-w-2xl mx-auto space-y-8 pt-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <UploadCloud size={40} />
                </div>
                <h3 className="font-black text-2xl text-slate-800 mb-2">
                  Essay Submission
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                  Students will upload files here. Configure allowed formats
                  below.
                </p>
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 mx-auto max-w-sm">
                  <p className="text-sm font-bold text-blue-800">
                    Student Upload Area
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Supports: {data.allowedFileTypes.join(", ")}
                  </p>
                </div>
              </div>

              {/* Essay Config */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-blue-500" /> Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">
                      Allowed Formats
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["PDF", "DOCX", "TXT", "JPG/PNG"].map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleFileType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition ${
                            data.allowedFileTypes.includes(type)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* ... Max Size slider ... */}
                </div>
              </div>
            </div>
          )}

          {/* === C. VIDEO BUILDER === */}
          {data.type === "VIDEO" && (
            <div className="max-w-2xl mx-auto space-y-8 pt-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-rose-500"></div>
                <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Video size={40} />
                </div>
                <h3 className="font-black text-2xl text-slate-800 mb-2">
                  Video Submission
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                  Students will record or upload a video response.
                </p>
                <div className="border-2 border-dashed border-pink-200 bg-pink-50/50 rounded-xl p-6 mx-auto max-w-sm">
                  <div className="w-full h-32 bg-black/5 rounded-lg flex items-center justify-center mb-2">
                    <Video size={32} className="text-pink-300" />
                  </div>
                  <p className="text-xs text-pink-600 font-bold">
                    Video Player Preview
                  </p>
                </div>
              </div>

              {/* Video Config */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-pink-500" /> Video
                  Settings
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                        Min Duration (Sec)
                      </label>
                      <input
                        type="number"
                        value={data.minDuration}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            minDuration: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                        Max Duration (Sec)
                      </label>
                      <input
                        type="number"
                        value={data.maxDuration}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            maxDuration: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                      Allowed Formats
                    </label>
                    <div className="flex gap-2">
                      {["MP4", "MOV", "WEBM"].map((fmt) => (
                        <span
                          key={fmt}
                          className="px-3 py-1 bg-pink-50 text-pink-600 rounded-lg text-xs font-bold border border-pink-100"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

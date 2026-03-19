"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { Unit } from "./ts/types";
import LessonItem from "./LessonItem";

interface UnitAccordionProps {
  unit: Unit;
  classId: string;
  onEditUnit: () => void;
  onDeleteUnit: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export default function UnitAccordion({
  unit,
  classId,
  onEditUnit,
  onDeleteUnit,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: UnitAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* --- UNIT HEADER --- */}
      <div
        className="p-4 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition border-b border-slate-100 group/header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button className="text-slate-400 bg-white p-1 rounded border border-slate-200 shadow-sm">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <div>
            <h3 className="font-bold text-lg text-slate-800">{unit.title}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {unit.lessons.length} bài học
            </p>
          </div>
        </div>

        {/* Unit Actions (Edit/Delete/Add Lesson) */}
        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddLesson();
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700 mr-2"
          >
            <Plus size={14} /> Thêm bài
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditUnit();
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Sửa tên Unit"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteUnit();
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Xóa Unit"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* --- LESSON LIST --- */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 animate-in slide-in-from-top-2">
          {unit.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              classId={classId}
              unitId={unit.id}
              onEdit={() => onEditLesson(lesson.id)}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}
          {unit.lessons.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              Chưa có bài học nào trong Unit này.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

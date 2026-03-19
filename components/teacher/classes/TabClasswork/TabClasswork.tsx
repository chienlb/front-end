"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Unit, Lesson } from "./ts/types";
import { MOCK_UNITS } from "./ts/mock-data";

// Import components
import UnitAccordion from "./UnitAccordion";
import CreateUnitModal from "@/components/teacher/classes/TabClasswork/modals/CreateUnitModal";
import CreateLessonModal from "./modals/CreateLessonModal";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TabClasswork({
  units = MOCK_UNITS,
  classId,
}: {
  units?: Unit[] | any;
  classId: string;
}) {
  const [data, setData] = useState<Unit[]>(units || MOCK_UNITS);

  // Modal States
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // --- 1. UNIT CRUD ---

  const handleAddUnit = (title: string) => {
    const newUnit: Unit = { id: `U${Date.now()}`, title: title, lessons: [] };
    setData([...data, newUnit]);
    setIsUnitModalOpen(false);
  };

  const handleEditUnit = (unitId: string) => {
    // For a real app, you might use a modal here. Using prompt for quick demo.
    const newTitle = prompt("Nhập tên mới cho Unit:");
    if (newTitle) {
      setData(
        data.map((u) => (u.id === unitId ? { ...u, title: newTitle } : u)),
      );
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    if (
      confirm("Bạn có chắc muốn xóa Unit này và toàn bộ bài học bên trong?")
    ) {
      setData(data.filter((u) => u.id !== unitId));
    }
  };

  // --- 2. LESSON CRUD ---

  const handleAddLesson = (lessonData: any) => {
    if (!activeUnitId) return;
    const newLesson: Lesson = {
      id: `L${Date.now()}`,
      title: lessonData.title,
      type: lessonData.type,
      status: "UPCOMING",
      startTime: lessonData.startTime, // Nhận thời gian từ modal
      duration: lessonData.duration, // Nhận thời lượng
      meetingLink: lessonData.meetingLink, // Nhận link Zoom/Meet
      recordingUrl: "", // Mặc định chưa có record
      materials: [],
      exercises: [],
    };
    setData(
      data.map((u) =>
        u.id === activeUnitId
          ? { ...u, lessons: [...u.lessons, newLesson] }
          : u,
      ),
    );
    setIsLessonModalOpen(false);
  };

  const handleEditLesson = (unitId: string, lessonId: string) => {
    // For a real app, use a modal. Using prompt for demo.
    const newTitle = prompt("Nhập tên mới cho bài học:");
    if (newTitle) {
      setData(
        data.map((u) =>
          u.id === unitId
            ? {
                ...u,
                lessons: u.lessons.map((l) =>
                  l.id === lessonId ? { ...l, title: newTitle } : l,
                ),
              }
            : u,
        ),
      );
    }
  };

  const handleDeleteLesson = (unitId: string, lessonId: string) => {
    if (confirm("Xóa bài học này?")) {
      setData(
        data.map((u) =>
          u.id === unitId
            ? { ...u, lessons: u.lessons.filter((l) => l.id !== lessonId) }
            : u,
        ),
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in">
      {/* Header Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsUnitModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={18} /> Tạo Unit Mới
        </button>
      </div>

      {/* Render Units */}
      {data.map((unit) => (
        <UnitAccordion
          key={unit.id}
          unit={unit}
          classId={classId}
          // Unit Actions
          onEditUnit={() => handleEditUnit(unit.id)}
          onDeleteUnit={() => handleDeleteUnit(unit.id)}
          // Lesson Actions
          onAddLesson={() => {
            setActiveUnitId(unit.id);
            setIsLessonModalOpen(true);
          }}
          onEditLesson={(lessonId) => handleEditLesson(unit.id, lessonId)}
          onDeleteLesson={(lessonId) => handleDeleteLesson(unit.id, lessonId)}
        />
      ))}

      {/* --- MODALS --- */}
      <CreateUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSubmit={handleAddUnit}
      />
      <CreateLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSubmit={handleAddLesson}
      />
    </div>
  );
}

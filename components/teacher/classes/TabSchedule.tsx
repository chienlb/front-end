"use client";
import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import { vi } from "date-fns/locale"; 
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  CheckSquare,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";

// --- TYPES ---
type EventType = "LIVE" | "DEADLINE" | "EXAM" | "NOTE";

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  time?: string;
  duration?: string;
}

// --- MOCK DATA ---
const today = new Date();
const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: "1",
    title: "Live: Unit 2 - Grammar",
    type: "LIVE",
    date: new Date(today.getFullYear(), today.getMonth(), 5),
    time: "19:30",
    duration: "90p",
  },
  {
    id: "2",
    title: "Hạn nộp bài luận cuối khóa",
    type: "DEADLINE",
    date: new Date(today.getFullYear(), today.getMonth(), 10),
    time: "23:59",
  },
  {
    id: "3",
    title: "Kiểm tra giữa kỳ",
    type: "EXAM",
    date: new Date(today.getFullYear(), today.getMonth(), 15),
    time: "09:00",
    duration: "60p",
  },
  {
    id: "4",
    title: "Live: Luyện phát âm",
    type: "LIVE",
    date: new Date(today.getFullYear(), today.getMonth(), 15),
    time: "20:00",
    duration: "90p",
  },
  {
    id: "5",
    title: "Nghỉ lễ",
    type: "NOTE",
    date: new Date(today.getFullYear(), today.getMonth(), 20),
  },
];

export default function TabSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- LOGIC CALENDAR ---
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </h2>
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-px bg-slate-200 mx-1"></div>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setCurrentMonth(new Date());
            setSelectedDate(new Date());
          }}
          className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
        >
          Hôm nay
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-bold text-slate-400 uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((dayItem, idx) => {
          // Lấy sự kiện trong ngày này
          const dayEvents = MOCK_EVENTS.filter((e) =>
            isSameDay(e.date, dayItem),
          );
          const isSelected = isSameDay(dayItem, selectedDate);
          const isCurrentMonth = isSameMonth(dayItem, currentMonth);
          const isToday = isSameDay(dayItem, new Date());

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(dayItem)}
              className={`
                min-h-[100px] border rounded-xl p-2 cursor-pointer transition relative group
                ${isSelected ? "border-blue-500 ring-2 ring-blue-100 bg-white" : "border-slate-100 bg-white hover:border-blue-300"}
                ${!isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "text-slate-700"}
              `}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white shadow-md" : ""}`}
                >
                  {format(dayItem, dateFormat)}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Dots (Hiển thị tối đa 3 chấm) */}
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${getEventColor(ev.type)}`}
                  >
                    {ev.time && (
                      <span className="opacity-70 mr-1">{ev.time}</span>
                    )}
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-slate-400 text-center">
                    + {dayEvents.length - 3} nữa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper màu sắc sự kiện
  const getEventColor = (type: EventType) => {
    switch (type) {
      case "LIVE":
        return "bg-red-50 text-red-700 border border-red-100";
      case "DEADLINE":
        return "bg-orange-50 text-orange-700 border border-orange-100";
      case "EXAM":
        return "bg-purple-50 text-purple-700 border border-purple-100";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "LIVE":
        return <Video size={16} />;
      case "DEADLINE":
        return <Clock size={16} />;
      case "EXAM":
        return <CheckSquare size={16} />;
      default:
        return <CalendarIcon size={16} />;
    }
  };

  // --- RENDER SIDEBAR (Chi tiết ngày chọn) ---
  const selectedDayEvents = MOCK_EVENTS.filter((e) =>
    isSameDay(e.date, selectedDate),
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: CALENDAR GRID */}
        <div className="flex-1">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>

        {/* RIGHT: SIDEBAR DETAILS */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Header Sidebar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-4xl font-black text-slate-800">
                  {format(selectedDate, "d")}
                </h3>
                <p className="text-slate-500 font-bold capitalize">
                  {format(selectedDate, "EEEE, MMMM yyyy", { locale: vi })}
                </p>
              </div>
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition">
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="group relative pl-4 border-l-2 border-slate-200 hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span
                            className={`p-1 rounded ${getEventColor(ev.type)}`}
                          >
                            {getEventIcon(ev.type)}
                          </span>
                          <span>
                            {ev.time} {ev.duration ? `(${ev.duration})` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có sự kiện nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Mini List */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Clock size={18} /> Sắp diễn ra
            </h4>
            <div className="space-y-3">
              {MOCK_EVENTS.filter((e) => e.date > new Date())
                .slice(0, 3)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3"
                  >
                    <div
                      className={`w-2 h-10 rounded-full ${ev.type === "LIVE" ? "bg-red-500" : ev.type === "DEADLINE" ? "bg-orange-500" : "bg-blue-500"}`}
                    ></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {format(ev.date, "dd/MM")} • {ev.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  ToolbarProps,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import vi from "date-fns/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { liveClassService } from "@/services/live-class.service";
import {
  Loader2,
  User,
  Video,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  X,
  MapPin,
} from "lucide-react";

// --- CONFIG ---
const locales = { vi: vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Helper: Chọn màu ngẫu nhiên nhưng cố định theo tên lớp học
const getEventColor = (text: string) => {
  const colors = [
    "bg-blue-50 text-blue-700 border-l-4 border-blue-500 hover:bg-blue-100",
    "bg-purple-50 text-purple-700 border-l-4 border-purple-500 hover:bg-purple-100",
    "bg-green-50 text-green-700 border-l-4 border-green-500 hover:bg-green-100",
    "bg-orange-50 text-orange-700 border-l-4 border-orange-500 hover:bg-orange-100",
    "bg-pink-50 text-pink-700 border-l-4 border-pink-500 hover:bg-pink-100",
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++)
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface CalendarEvent {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  tutor: { fullName: string; avatar?: string };
  resource: { className: string; lessonName: string; liveRoomId?: string };
}

// --- MOCK DATA ---
const MOCK_EVENTS: CalendarEvent[] = [
  {
    _id: "mock_1",
    title: "Tiếng Anh K12 - Buổi 1",
    start: new Date(new Date().setHours(9, 0, 0, 0)), // 9:00 AM hôm nay
    end: new Date(new Date().setHours(10, 30, 0, 0)), // 10:30 AM hôm nay
    tutor: {
      fullName: "Ms. Lan Anh",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    resource: {
      className: "Tiếng Anh K12",
      lessonName: "Unit 1: Hello Friends!",
      liveRoomId: "room_123",
    },
  },
  {
    _id: "mock_2",
    title: "Toán Tư Duy - Buổi 5",
    start: new Date(new Date().setHours(14, 0, 0, 0)), // 2:00 PM hôm nay
    end: new Date(new Date().setHours(15, 30, 0, 0)), // 3:30 PM hôm nay
    tutor: { fullName: "Mr. Tuan", avatar: "https://i.pravatar.cc/150?img=12" },
    resource: {
      className: "Toán Tư Duy Lớp 3",
      lessonName: "Phép nhân và phép chia",
      liveRoomId: "room_456",
    },
  },
  {
    _id: "mock_3",
    title: "Luyện Viết - Buổi 2",
    start: new Date(new Date().setDate(new Date().getDate() + 1)), // Ngày mai
    end: new Date(new Date().setDate(new Date().getDate() + 1)), // Ngày mai
    tutor: { fullName: "Cô Mai", avatar: "https://i.pravatar.cc/150?img=9" },
    resource: {
      className: "Luyện chữ đẹp",
      lessonName: "Nét thanh nét đậm",
      liveRoomId: "room_789",
    },
  },
].map((ev) => ({
  ...ev,
  // Cập nhật lại giờ cho event ngày mai (do setDate làm mất giờ)
  start:
    ev._id === "mock_3" ? new Date(ev.start.setHours(10, 0, 0, 0)) : ev.start,
  end: ev._id === "mock_3" ? new Date(ev.end.setHours(11, 30, 0, 0)) : ev.end,
}));

// --- 1. CUSTOM TOOLBAR COMPONENT ---
const CustomToolbar = (toolbar: ToolbarProps) => {
  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  const label = () => {
    const date = toolbar.date;
    return (
      <span className="capitalize text-lg font-black text-slate-800">
        {format(date, "MMMM yyyy", { locale: vi })}
      </span>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 px-1">
      <div className="flex items-center gap-4">
        <h2 className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <CalendarIcon size={24} />
          </div>
          {label()}
        </h2>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={goToBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition uppercase"
          >
            Hôm nay
          </button>
          <button
            onClick={goToNext}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
        {["month", "week", "day"].map((view) => (
          <button
            key={view}
            onClick={() => toolbar.onView(view as any)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
              toolbar.view === view
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {view === "month" ? "Tháng" : view === "week" ? "Tuần" : "Ngày"}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- 2. CUSTOM EVENT COMPONENT ---
const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const colorClass = getEventColor(event.resource.className);

  return (
    <div
      className={`h-full w-full px-2 py-1.5 rounded-md text-xs font-medium flex flex-col justify-between transition-all duration-200 shadow-sm ${colorClass}`}
    >
      <div>
        <div className="font-bold truncate text-[11px] leading-tight mb-0.5 opacity-90">
          {event.resource.className}
        </div>
        <div className="truncate font-semibold text-xs leading-tight">
          {event.resource.lessonName}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1 opacity-80">
        <User size={10} strokeWidth={3} />
        <span className="truncate text-[10px] font-bold">
          {event.tutor.fullName}
        </span>
      </div>
    </div>
  );
};

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res: any = await liveClassService.getAdminCalendar();

        let parsedEvents = [];
        // Kiểm tra nếu API trả về mảng rỗng hoặc null thì dùng Mock Data
        if (
          !res ||
          (res.data && res.data.length === 0) ||
          (Array.isArray(res) && res.length === 0)
        ) {
          console.log("Using Mock Data");
          parsedEvents = MOCK_EVENTS;
        } else {
          parsedEvents = (res.data || res).map((ev: any) => ({
            ...ev,
            start: new Date(ev.start),
            end: new Date(ev.end),
          }));
        }

        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching schedule, using mock data", error);
        setEvents(MOCK_EVENTS); // Fallback to mock data on error
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Đang tải lịch trình...
        </p>
      </div>
    );

  return (
    <div className="p-4 bg-[#F8FAFC] h-[calc(100vh-60px)] font-sans flex flex-col">
      {/* CSS OVERRIDES */}
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 0;
          font-weight: 800;
          color: #64748b;
          font-size: 0.75rem;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .rbc-month-view {
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          background: white;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .rbc-time-view {
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          background: white;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .rbc-day-bg {
          background-color: white;
        }
        .rbc-off-range-bg {
          background-color: #f8fafc;
        }
        .rbc-today {
          background-color: #f0f9ff;
        }
        .rbc-event {
          background: transparent;
          padding: 2px 4px;
          outline: none;
          box-shadow: none;
        }
        .rbc-event:focus {
          outline: none;
        }
        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        /* Tùy chỉnh thanh cuộn */
        .rbc-time-content::-webkit-scrollbar {
          width: 6px;
        }
        .rbc-time-content::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>

      {/* MAIN CONTENT */}
      {/* 2. Bỏ max-w-7xl để full width */}
      <div className="w-full flex-1 flex flex-col min-h-0">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          culture="vi"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.WEEK}
          min={new Date(0, 0, 0, 7, 0, 0)} // Bắt đầu từ 7h sáng
          max={new Date(0, 0, 0, 22, 0, 0)} // Kết thúc lúc 22h tối
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          onSelectEvent={(event) => setSelectedEvent(event)}
          formats={{
            timeGutterFormat: (date, culture, localizer) =>
              localizer!.format(date, "HH:mm", culture),
            dayHeaderFormat: (date, culture, localizer) =>
              localizer!.format(date, "EEEE, dd/MM", culture),
          }}
        />
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              className={`h-28 p-6 relative flex flex-col justify-end ${getEventColor(selectedEvent.resource.className).replace("border-l-4", "")}`}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition text-slate-700"
              >
                <X size={20} />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                Lớp học
              </span>
              <h3 className="text-2xl font-black leading-tight tracking-tight text-slate-800">
                {selectedEvent.resource.className}
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <MapPin size={12} /> Nội dung bài học
                </label>
                <p className="text-slate-800 font-bold text-lg leading-snug">
                  {selectedEvent.resource.lessonName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <User size={12} /> Giáo viên
                  </label>
                  <p className="text-slate-700 font-bold text-sm truncate">
                    {selectedEvent.tutor?.fullName}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Clock size={12} /> Thời gian
                  </label>
                  <p className="text-slate-700 font-bold text-sm">
                    {format(selectedEvent.start, "HH:mm")} -{" "}
                    {format(selectedEvent.end, "HH:mm")}
                  </p>
                </div>
              </div>

              {selectedEvent.resource.liveRoomId ? (
                <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transform active:scale-95">
                  <Video size={20} /> Vào Lớp Ngay
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400 italic">
                  Chưa có link phòng học
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

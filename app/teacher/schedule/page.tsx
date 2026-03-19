// app/teacher/schedule/page.tsx
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

export default function TeacherSchedulePage() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  // Mock Schedule Data
  const scheduleData = [
    {
      day: 0,
      time: "08:00 - 09:30",
      class: "Tiếng Anh K12",
      room: "Online 01",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      day: 0,
      time: "14:00 - 15:30",
      class: "Luyện thi IELTS",
      room: "Online 03",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    {
      day: 2,
      time: "09:30 - 11:00",
      class: "Giao tiếp nâng cao",
      room: "Online 02",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      day: 4,
      time: "19:00 - 20:30",
      class: "Tiếng Anh K12",
      room: "Online 01",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[80vh]">
      {/* Header Calendar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <CalIcon className="text-blue-600" /> Tháng 10, 2023
        </h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200">
            <ChevronLeft size={20} />
          </button>
          <button className="px-4 py-2 font-bold text-sm bg-slate-100 rounded-lg hover:bg-slate-200">
            Hôm nay
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col gap-3">
            {/* Day Header */}
            <div
              className={`text-center p-3 rounded-2xl ${index === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-500"}`}
            >
              <p className="text-xs font-medium opacity-80">{day}</p>
              <p className="text-xl font-black">{23 + index}</p>
            </div>

            {/* Classes Slots */}
            <div className="space-y-3 min-h-[400px] border-t border-slate-100 pt-3">
              {scheduleData
                .filter((s) => s.day === index)
                .map((slot, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-left cursor-pointer hover:brightness-95 transition ${slot.color}`}
                  >
                    <p className="text-[10px] font-bold opacity-80 mb-1">
                      {slot.time}
                    </p>
                    <p className="font-bold text-sm leading-tight mb-2">
                      {slot.class}
                    </p>
                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm">
                      {slot.room}
                    </span>
                  </div>
                ))}
              {scheduleData.filter((s) => s.day === index).length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <span className="text-slate-200 text-xs font-bold">
                    Trống
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

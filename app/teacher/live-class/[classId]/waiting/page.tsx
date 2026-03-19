"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Users,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function TeacherWaitingRoom() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // Mock Students Waiting
  const students = [
    {
      name: "Bé Nana",
      status: "online",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      name: "Bé Tôm",
      status: "online",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "Bé Sóc",
      status: "offline",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: PREVIEW CAMERA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700 group">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              {isCamOn ? (
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                  alt="Camera Preview"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-700 mb-2">
                    <VideoOff size={32} />
                  </div>
                  <span className="font-bold">Camera is Off</span>
                </div>
              )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-4 rounded-xl transition ${isMicOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-4 rounded-xl transition ${isCamOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button className="p-4 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition">
                <Settings size={20} />
              </button>
            </div>

            {/* Sound Meter Simulation */}
            {isMicOn && (
              <div className="absolute top-4 right-4 flex gap-1">
                <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse delay-150"></div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-slate-400 text-sm px-2">
            <span>Microphone: Default - MacBook Pro Mic</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
              Connection Good
            </span>
          </div>
        </div>

        {/* RIGHT: CLASS INFO & ATTENDANCE */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white mb-1">
              Lớp Tiếng Anh K12
            </h2>
            <p className="text-slate-400 text-sm">
              Bắt đầu lúc: 19:30 PM (Còn 5 phút)
            </p>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} /> Danh sách lớp (2/30)
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {students.map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 border border-slate-700"
                >
                  <div className="relative">
                    <img
                      src={student.avatar}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-700 ${student.status === "online" ? "bg-green-500" : "bg-slate-500"}`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {student.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
            <button className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-900/20 transition transform active:scale-95 flex items-center justify-center gap-2 text-lg">
              <ExternalLink size={24} /> BẮT ĐẦU LỚP HỌC
            </button>
            <Link
              href="/teacher/schedule"
              className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-2xl text-center transition"
            >
              Quay lại lịch dạy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

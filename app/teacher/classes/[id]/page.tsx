"use client";
import { useState, use, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  Users,
  BarChart2,
  Folder,
  LineChart,
  Settings,
  CalendarIcon,
  ClipboardList,
} from "lucide-react";
import axios from "axios";

import Header from "@/components/teacher/classes/Header";
import TabStream from "@/components/teacher/classes/TabStream";
import TabClasswork from "@/components/teacher/classes/TabClasswork/TabClasswork";
import TabPeople from "@/components/teacher/classes/TabPeople/TabPeople";
import TabRepository from "@/components/teacher/classes/TabRepository";
import TabGrades from "@/components/teacher/classes/TabGrades";
import TabAnalytics from "@/components/teacher/classes/TabAnalytics";
import TabSettings from "@/components/teacher/classes/TabSettings";
import TabSchedule from "@/components/teacher/classes/TabSchedule";
import TabGroups from "@/components/teacher/classes/TabGroups";
import TabHomework from "@/components/teacher/classes/TabHomework/TabHomework";

// --- DỮ LIỆU MẪU ---
const CLASS_DATA = {
  id: "class_123",
  name: "Tiếng Anh Giao Tiếp K12",
  code: "ENG-K12-A",
  schedule: "Thứ 2 - 4 - 6",
  units: [
    {
      id: "u1",
      title: "Unit 1: Greeting & Introduction",
      lessons: [
        {
          id: "l1",
          title: "Lesson 1: Hello World (Live)",
          type: "LIVE",
          status: "COMPLETED",
          startTime: "2023-10-20T19:30:00",
          recordingUrl: "https://youtube.com/...",
          materials: [{ name: "Slide_U1_L1.pdf" }],
          homework: {
            title: "Quay video giới thiệu bản thân",
            submitted: 15,
            total: 20,
          },
        },
        {
          id: "l2",
          title: "Lesson 2: Daily Routine (Live)",
          type: "LIVE",
          status: "UPCOMING",
          startTime: "2023-10-22T19:30:00",
          meetingLink: "https://meet.google.com/...",
          materials: [{ name: "Slide_U1_L2_Draft.pptx" }],
        },
        {
          id: "quiz1",
          title: "Unit 1: Mini Test",
          type: "EXAM",
          status: "LOCKED",
        },
      ],
    },
  ],
};

interface UploadedFile {
  url: string;
  name: string;
}

export default function TeacherClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState<
    | "STREAM"
    | "CLASSWORK"
    | "HOMEWORK"
    | "PEOPLE"
    | "GRADES"
    | "REPOSITORY"
    | "ANALYTICS"
    | "SETTINGS"
    | "SCHEDULE"
    | "GROUPS"
  >("CLASSWORK");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (activeTab === "GROUPS") {
      fetchUploadedFiles();
    }
  }, [activeTab]);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get(`/api/groups/${id}/files`);
      setUploadedFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("groupId", id);
    formData.append("file", file);

    try {
      await axios.post(`/api/groups/upload-document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchUploadedFiles();
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 1. Header */}
      <Header classData={CLASS_DATA} />

      {/* 2. Tabs Navigation */}
      <div className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "STREAM", label: "Bảng tin", icon: MessageSquare },
            { id: "CLASSWORK", label: "Giáo án", icon: BookOpen }, // Đổi label để phân biệt
            { id: "HOMEWORK", label: "Bài tập", icon: ClipboardList }, // [NEW] Tab Bài tập
            { id: "SCHEDULE", label: "Lịch biểu", icon: CalendarIcon },
            { id: "PEOPLE", label: "Học viên", icon: Users },
            { id: "GROUPS", label: "Nhóm", icon: Users },
            { id: "REPOSITORY", label: "Tài liệu", icon: Folder },
            { id: "GRADES", label: "Sổ điểm", icon: BarChart2 },
            { id: "ANALYTICS", label: "Thống kê", icon: LineChart },
            { id: "SETTINGS", label: "Cài đặt", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-bold flex items-center gap-2 border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-6xl mx-auto p-6 mt-4 pb-20">
        {activeTab === "STREAM" && <TabStream />}

        {activeTab === "CLASSWORK" && (
          <TabClasswork units={CLASS_DATA.units} classId={id} />
        )}

        {activeTab === "HOMEWORK" && <TabHomework />}

        {activeTab === "PEOPLE" && <TabPeople />}
        {activeTab === "REPOSITORY" && <TabRepository />}
        {activeTab === "GRADES" && <TabGrades />}
        {activeTab === "ANALYTICS" && <TabAnalytics />}
        {activeTab === "SETTINGS" && <TabSettings />}
        {activeTab === "SCHEDULE" && <TabSchedule />}
        {activeTab === "GROUPS" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Group Files</h2>
            <div className="mb-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={handleFileUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
              >
                Upload File
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
            <ul className="list-disc pl-5">
              {uploadedFiles.map((file, index) => (
                <li key={index}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

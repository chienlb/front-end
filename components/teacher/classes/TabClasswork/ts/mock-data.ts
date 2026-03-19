import { Unit } from "./types";
export const MOCK_UNITS: Unit[] = [
  {
    id: "U1",
    title: "Unit 1: Hello World & Greetings",
    lessons: [
      {
        id: "L1",
        title: "Lesson 1: Live Class - Introduction",
        type: "LIVE",
        status: "COMPLETED",
        startTime: new Date().toISOString(),
        duration: "90 phút",
        recordingUrl: "https://youtube.com/demo",
        materials: [
          {
            id: "m1",
            name: "Slide_Unit1.pdf",
            type: "PDF",
            url: "#",
            size: "2.5MB",
          },
        ],
        exercises: [
          {
            id: "ex1",
            title: "Quiz Từ vựng",
            type: "QUIZ",
            questionsCount: 10,
            completedCount: 15,
            totalStudents: 20,
          },
        ],
      },
      {
        id: "L2",
        title: "Lesson 2: Grammar & Structure",
        type: "VIDEO",
        status: "UPCOMING",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        duration: "45 phút",
        materials: [],
        exercises: [],
      },
    ],
  },
  {
    id: "U2",
    title: "Unit 2: Family & Friends",
    lessons: [],
  },
];

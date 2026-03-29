import api from "@/utils/api";

const firstSuccessful = async <T,>(fns: Array<() => Promise<T>>): Promise<T> => {
  let lastErr: unknown;
  for (const fn of fns) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
};

export const assignmentsService = {
  createAssignment: async (payload: {
    title: string;
    description?: string;
    type: string;
    lessonId?: string;
    classId?: string;
    dueDate?: string;
    maxScore: number;
    isPublished: boolean;
    file?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("title", payload.title.trim());
    formData.append("description", (payload.description || "").trim());
    formData.append("type", payload.type.trim());
    if (payload.lessonId?.trim()) {
      formData.append("lessonId", payload.lessonId.trim());
    }
    if (payload.classId?.trim()) {
      formData.append("classId", payload.classId.trim());
    }
    if (payload.dueDate) {
      formData.append("dueDate", payload.dueDate);
    }
    formData.append("maxScore", String(payload.maxScore));
    formData.append("isPublished", String(Boolean(payload.isPublished)));
    if (payload.file) formData.append("file", payload.file);
    return api.post("/assignments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Backend upload endpoint không phải lúc nào cũng nằm trong /api/v1
    // (một số môi trường dùng thẳng http://localhost:4000/files/upload)
    const res: any = await api.post(
      "http://localhost:4000/files/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data ?? res;
  },

  submitFileOnly: async (assignmentId: string, fileUrl: string, note?: string) => {
    const id = assignmentId.trim();
    const payload = { fileUrl, note: note?.trim() || undefined };

    // Try common endpoint variants because backend implementation may vary.
    return firstSuccessful([
      () => api.post(`/assignments/${id}/submit`, payload),
      () => api.post(`/assignments/${id}/submit-file`, payload),
      () => api.post(`/assignments/${id}/submissions`, payload),
      () => api.post(`/homeworks/${id}/submit`, payload),
    ]);
  },

  /**
   * Nộp bài theo SubmissionsController: POST /submissions (multipart/form-data)
   * Field file: "files" (số lượng tối đa 10 ở backend)
   * Body: assignmentId, studentId, status, submittedAt, feedback...
   */
  submitWithSubmissions: async (
    assignmentId: string,
    studentId: string,
    file: File,
    note?: string,
  ) => {
    const formData = new FormData();
    formData.append("assignmentId", assignmentId.trim());
    formData.append("studentId", studentId.trim());
    formData.append("status", "submitted");
    formData.append("submittedAt", new Date().toISOString());

    const feedback = note?.trim();
    if (feedback) formData.append("feedback", feedback);

    // Backend: FilesInterceptor('files', 10)
    formData.append("files", file);

    return api.post("/submissions", formData);
  },

  getAssignmentsByClassId: async (
    classId: string,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = classId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/class/${id}`, { params });
  },

  getAssignmentsByLessonId: async (
    lessonId: string,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = lessonId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/lesson/${id}`, { params });
  },

  getAssignmentsByUserId: async (
    userId: string,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order: "asc" | "desc" = "desc",
  ) => {
    const id = userId.trim();
    const params = { page, limit, sort, order };
    return api.get(`/assignments/user/${id}`, { params });
  },

  /**
   * API mới: Lấy danh sách bài tập theo user.
   * Backend: GET /user-assignments/:userId
   */
  getUserAssignments: async (userId: string) => {
    const id = userId.trim();
    return api.get(`/assignments/user-assignments/${encodeURIComponent(id)}`);
  },

  getAssignmentById: async (assignmentId: string) => {
    const id = assignmentId.trim();
    return api.get(`/assignments/${id}`);
  },

  // ---- SUBMISSIONS APIs ----
  createSubmission: async (payload: {
    assignmentId: string;
    studentId: string;
    status?: string;
    score?: number;
    feedback?: string;
    submittedAt?: string;
    files?: File[];
    studentAnswers?: Record<string, any>;
    attachments?: string[];
  }) => {
    const formData = new FormData();
    formData.append("assignmentId", payload.assignmentId.trim());
    formData.append("studentId", payload.studentId.trim());
    if (payload.status) formData.append("status", payload.status);
    if (payload.score != null) formData.append("score", String(payload.score));
    if (payload.feedback) formData.append("feedback", payload.feedback);
    if (payload.submittedAt) formData.append("submittedAt", payload.submittedAt);
    if (payload.studentAnswers) {
      formData.append("studentAnswers", JSON.stringify(payload.studentAnswers));
    }
    if (payload.attachments?.length) {
      formData.append("attachments", JSON.stringify(payload.attachments));
    }
    (payload.files || []).forEach((f) => formData.append("files", f));
    return api.post("/submissions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getSubmissionById: async (submissionId: string) => {
    return api.get(`/submissions/${encodeURIComponent(submissionId.trim())}`);
  },

  getSubmissionsByAssignmentId: async (assignmentId: string) => {
    return api.get(
      `/submissions/assignment/${encodeURIComponent(assignmentId.trim())}`,
    );
  },

  // Backend endpoint bạn vừa cung cấp:
  // GET /submissions/user/student/assignment/:assignmentId
  getAllSubmissionsByAssignmentIdForTeacher: async (assignmentId: string) => {
    return api.get(
      `/submissions/user/student/assignment/${encodeURIComponent(
        assignmentId.trim(),
      )}`,
    );
  },

  getSubmissionsByStudentId: async (studentId: string) => {
    return api.get(`/submissions/student/${encodeURIComponent(studentId.trim())}`);
  },

  // Backend endpoint bạn vừa cung cấp:
  // GET /submissions/user/student/submissions/:studentId
  getAllSubmissionsByStudentIdForTeacher: async (studentId: string) => {
    return api.get(
      `/submissions/user/student/submissions/${encodeURIComponent(
        studentId.trim(),
      )}`,
    );
  },

  updateSubmission: async (submissionId: string, data: any) => {
    return api.put(`/submissions/${encodeURIComponent(submissionId.trim())}`, data);
  },

  deleteSubmission: async (submissionId: string) => {
    return api.delete(`/submissions/${encodeURIComponent(submissionId.trim())}`);
  },

  gradeSubmission: async (
    submissionId: string,
    payload: { gradedBy: string; score: number; feedback?: string },
  ) => {
    return api.put(
      `/submissions/${encodeURIComponent(submissionId.trim())}/grade`,
      payload,
    );
  },

  // API cuối lấy điểm theo assignment (graded submissions).
  // Vì snippet backend chưa có decorator route cho method này,
  // thử nhiều biến thể endpoint để tương thích.
  getGradedSubmissionsByAssignmentId: async (assignmentId: string) => {
    const id = encodeURIComponent(assignmentId.trim());
    return firstSuccessful([
      () => api.get(`/submissions/assignment/${id}/graded`),
      () => api.get(`/submissions/graded/assignment/${id}`),
      () => api.get(`/submissions/assignment/${id}?status=graded`),
    ]);
  },
};


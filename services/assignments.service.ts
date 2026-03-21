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
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
};


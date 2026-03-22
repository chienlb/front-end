import api from "@/utils/api";

/** Mặc định giống Postman: en-US */
export const DEFAULT_PRONUNCIATION_LANGUAGE = "en-US";

/**
 * POST /pronunciation/assess — multipart/form-data:
 * - `audio`: file .wav
 * - `referenceText`: text
 * - `language`: text (vd: en-US)
 */
export function buildPronunciationAssessFormData(params: {
  /** File ghi âm — nên là WAV (MIME audio/wav) */
  audio: Blob | File;
  referenceText: string;
  language?: string;
  /** Tên file gửi lên server (mặc định .wav) */
  audioFileName?: string;
}): FormData {
  const formData = new FormData();
  const name =
    params.audioFileName ??
    (params.audio instanceof File && params.audio.name
      ? params.audio.name
      : "recording.wav");
  formData.append("audio", params.audio, name);
  formData.append("referenceText", params.referenceText.trim());
  formData.append("language", params.language ?? DEFAULT_PRONUNCIATION_LANGUAGE);
  return formData;
}

/** Payload JSON từ POST /pronunciation/assess (sau interceptor axios = body). */
export type PronunciationAssessResponse = {
  attemptId?: string;
  /** Trạng thái nghiệp vụ, ví dụ "Success" — khác status HTTP */
  status?: string;
  recognizedText?: string;
  scores?: {
    pronScore?: number;
    accuracy?: number;
    fluency?: number;
    prosody?: number;
    completeness?: number;
    confidence?: number;
    overallScore?: number;
  };
  words?: Array<{
    Word?: string;
    AccuracyScore?: number;
    ErrorType?: string;
    Confidence?: number;
  }>;
  aiAnalysis?: string;
  raw?: unknown;
};

export const pronunciationService = {
  getAll: async (params?: { lessonId?: string; unitId?: string }) => {
    return api.get("/pronunciation/get-all", { params });
  },

  getById: async (id: string) => {
    return api.get("/pronunciation/get-by-id", {
      params: { id },
    });
  },

  create: async (data: any) => {
    return api.post("/pronunciation/create", data);
  },

  update: async (id: string, data: any) => {
    return api.put(`/pronunciation/update/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete("/pronunciation/delete", {
      params: { id },
    });
  },

  /**
   * Chấm điểm phát âm — body phải là FormData (multipart).
   * Hoặc dùng `assessFromParams` bên dưới.
   */
  assess: async (
    formData: FormData,
  ): Promise<PronunciationAssessResponse> => {
    /** Interceptor trả về `response.data`, nhưng kiểu Axios vẫn là AxiosResponse — ép qua unknown. */
    const data = await api.post("/pronunciation/assess", formData);
    return data as unknown as PronunciationAssessResponse;
  },

  assessFromParams: async (params: {
    audio: Blob | File;
    referenceText: string;
    language?: string;
    audioFileName?: string;
  }): Promise<PronunciationAssessResponse> => {
    return pronunciationService.assess(
      buildPronunciationAssessFormData(params),
    );
  },
};
export type DictionaryPhonetic = {
  text?: string;
  audio?: string;
};

export type DictionaryEntry = {
  word?: string;
  phonetics?: DictionaryPhonetic[];
};

const ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en";

export const dictionaryService = {
  async getWordEntries(word: string): Promise<DictionaryEntry[]> {
    const cleanWord = String(word || "").trim().toLowerCase();
    if (!cleanWord) return [];

    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(cleanWord)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getFirstAudioUrl(word: string): Promise<string> {
    try {
      const entries = await this.getWordEntries(word);
      for (const entry of entries) {
        const phonetics = Array.isArray(entry?.phonetics) ? entry.phonetics : [];
        for (const p of phonetics) {
          const audio = String(p?.audio || "").trim();
          if (audio) return audio;
        }
      }
      return "";
    } catch {
      return "";
    }
  },
};


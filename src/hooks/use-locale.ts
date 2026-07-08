import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectTimezone, type LanguageCode, t as translate } from "@/lib/i18n";

interface LocaleStore {
  language: LanguageCode;
  timezone: string;
  setLanguage: (l: LanguageCode) => void;
  setTimezone: (tz: string) => void;
}

export const useLocale = create<LocaleStore>()(
  persist(
    (set) => ({
      language: "en",
      timezone: detectTimezone(),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
    }),
    { name: "bloom-locale" },
  ),
);

export function useT() {
  const language = useLocale((s) => s.language);
  return (key: Parameters<typeof translate>[1]) => translate(language, key);
}

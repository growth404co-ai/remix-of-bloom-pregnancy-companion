import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type TrimesterTheme = "auto" | "1" | "2" | "3";

interface ThemeStore {
  mode: ThemeMode;
  trimesterTheme: TrimesterTheme;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  setTrimesterTheme: (t: TrimesterTheme) => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "light",
      trimesterTheme: "auto",
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === "light" ? "dark" : "light" })),
      setTrimesterTheme: (trimesterTheme) => set({ trimesterTheme }),
    }),
    { name: "bloom-theme" },
  ),
);

export function trimesterFromWeeks(weeks: number): "1" | "2" | "3" {
  return weeks <= 12 ? "1" : weeks <= 27 ? "2" : "3";
}

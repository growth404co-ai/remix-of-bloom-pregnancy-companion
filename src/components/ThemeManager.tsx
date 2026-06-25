import { useEffect } from "react";
import { useTheme, trimesterFromWeeks } from "@/hooks/use-theme";

export function ThemeManager({ weeksPregnant }: { weeksPregnant: number }) {
  const mode = useTheme((s) => s.mode);
  const trimesterTheme = useTheme((s) => s.trimesterTheme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    const resolved =
      trimesterTheme === "auto" ? trimesterFromWeeks(weeksPregnant) : trimesterTheme;
    root.setAttribute("data-trimester", resolved);
  }, [mode, trimesterTheme, weeksPregnant]);

  return null;
}

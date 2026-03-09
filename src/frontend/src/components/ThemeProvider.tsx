import { useEffect } from "react";
import { FONT_COLOR_KEY, applyTheme, getStoredThemeId } from "../lib/themes";

function applyFontColor(color: string | null) {
  if (color) {
    document.body.style.color = color;
  } else {
    document.body.style.color = "";
  }
}

export default function ThemeProvider({
  children,
}: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme
    const themeId = getStoredThemeId();
    applyTheme(themeId);

    // Apply stored font color
    const storedFontColor = localStorage.getItem(FONT_COLOR_KEY);
    applyFontColor(storedFontColor);

    // Listen for storage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === "srff_app_theme" && e.newValue) {
        applyTheme(e.newValue);
      }
      if (e.key === FONT_COLOR_KEY) {
        applyFontColor(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{children}</>;
}

import { useEffect } from "react";
import { applyTheme, getStoredThemeId } from "../lib/themes";

export default function ThemeProvider({
  children,
}: { children: React.ReactNode }) {
  useEffect(() => {
    const themeId = getStoredThemeId();
    applyTheme(themeId);

    // Listen for storage changes (when admin changes theme in same browser)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "srff_app_theme" && e.newValue) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{children}</>;
}

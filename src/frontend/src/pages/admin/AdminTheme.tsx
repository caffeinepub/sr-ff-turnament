import { Check, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APP_THEMES, applyTheme, getStoredThemeId } from "../../lib/themes";

export default function AdminTheme() {
  const [selected, setSelected] = useState<string>(getStoredThemeId());

  const handleSelect = (themeId: string) => {
    setSelected(themeId);
    applyTheme(themeId);
    const name = APP_THEMES.find((t) => t.id === themeId)?.name ?? themeId;
    toast.success(`Theme "${name}" applied!`);
  };

  return (
    <div className="space-y-5" data-ocid="admin-theme.page">
      <div className="flex items-center gap-3">
        <Palette
          className="w-6 h-6"
          style={{ color: "oklch(var(--primary))" }}
        />
        <h1 className="font-display font-bold text-2xl">App Theme</h1>
      </div>

      <p className="text-muted-foreground text-sm">
        Yahan se theme select karo -- yahi theme user panel par bhi dikhegi.
      </p>

      <div className="grid grid-cols-1 gap-4" data-ocid="admin-theme.list">
        {APP_THEMES.map((theme, i) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelect(theme.id)}
            data-ocid={`admin-theme.item.${i + 1}`}
            className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all ${
              selected === theme.id
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{theme.name}</p>
                <div className="flex gap-2 mt-2">
                  {theme.preview.map((color) => (
                    <span
                      key={color}
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {selected === theme.id && (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(var(--primary))" }}
                >
                  <Check className="w-4 h-4 text-black" />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Check, Palette, Pipette, Type } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  APP_THEMES,
  FONT_COLOR_KEY,
  applyTheme,
  getStoredThemeId,
} from "../../lib/themes";

const HEADER_COLORS_KEY = "srff_header_colors";

const PRESET_COLORS = [
  { label: "Orange (Default)", value: "#f97316" },
  { label: "Gold", value: "#eab308" },
  { label: "Cyan", value: "#22d3ee" },
  { label: "Red", value: "#ef4444" },
  { label: "Purple", value: "#a855f7" },
  { label: "Green", value: "#22c55e" },
  { label: "Pink", value: "#ec4899" },
  { label: "Blue", value: "#3b82f6" },
  { label: "White", value: "#ffffff" },
  { label: "Lime", value: "#84cc16" },
  { label: "Yellow", value: "#facc15" },
  { label: "Teal", value: "#14b8a6" },
];

function getStoredHeaderColors() {
  try {
    const data = JSON.parse(localStorage.getItem(HEADER_COLORS_KEY) || "null");
    if (data?.color1 && data.color2)
      return data as { color1: string; color2: string; color3: string };
  } catch {}
  return { color1: "#f97316", color2: "#eab308", color3: "#22d3ee" };
}

function getStoredFontColor(): string {
  return localStorage.getItem(FONT_COLOR_KEY) || "";
}

export default function AdminTheme() {
  const [selected, setSelected] = useState<string>(getStoredThemeId());
  const [headerColors, setHeaderColors] = useState(getStoredHeaderColors);
  const [fontColor, setFontColor] = useState<string>(getStoredFontColor);

  const handleSelect = (themeId: string) => {
    setSelected(themeId);
    applyTheme(themeId);
    const name = APP_THEMES.find((t) => t.id === themeId)?.name ?? themeId;
    toast.success(`Theme "${name}" applied!`);
  };

  const handleSaveHeaderColors = () => {
    localStorage.setItem(HEADER_COLORS_KEY, JSON.stringify(headerColors));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: HEADER_COLORS_KEY,
        newValue: JSON.stringify(headerColors),
      }),
    );
    toast.success("Header colors saved! User panel par dikh jaayenge.");
  };

  const handleSaveFontColor = () => {
    if (fontColor) {
      localStorage.setItem(FONT_COLOR_KEY, fontColor);
      document.body.style.color = fontColor;
    } else {
      localStorage.removeItem(FONT_COLOR_KEY);
      document.body.style.color = "";
    }
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: FONT_COLOR_KEY,
        newValue: fontColor || null,
      }),
    );
    toast.success(
      "Font color saved! User panel par text ka color change ho jaayega.",
    );
  };

  const handleResetFontColor = () => {
    setFontColor("");
    localStorage.removeItem(FONT_COLOR_KEY);
    document.body.style.color = "";
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: FONT_COLOR_KEY,
        newValue: null,
      }),
    );
    toast.success("Font color reset to theme default.");
  };

  return (
    <div className="space-y-6" data-ocid="admin-theme.page">
      <div className="flex items-center gap-3">
        <Palette
          className="w-6 h-6"
          style={{ color: "oklch(var(--primary))" }}
        />
        <h1 className="font-display font-bold text-2xl">App Theme</h1>
      </div>

      {/* Header Name Colors */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Pipette
            className="w-4 h-4"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h2 className="font-display font-semibold text-sm">
            Header App Name Colors
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          User panel ke top header mein app name ka gradient color yahan se set
          karo.
        </p>

        <div className="rounded-xl border border-border px-4 py-3 bg-background">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <span
            className="text-sm font-bold uppercase"
            style={{
              background: `linear-gradient(90deg, ${headerColors.color1}, ${headerColors.color2}, ${headerColors.color3})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.05em",
            }}
          >
            SR-FF-TURNAMENT
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["color1", "color2", "color3"] as const).map((key, idx) => (
            <div key={key} className="space-y-2">
              <p className="text-xs text-muted-foreground">Color {idx + 1}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-border flex-shrink-0"
                  style={{ backgroundColor: headerColors[key] }}
                />
                <input
                  type="color"
                  value={headerColors[key]}
                  onChange={(e) =>
                    setHeaderColors((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
                  data-ocid="admin-theme.header-color.input"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((pc) => (
                  <button
                    key={pc.value}
                    type="button"
                    title={pc.label}
                    onClick={() =>
                      setHeaderColors((prev) => ({ ...prev, [key]: pc.value }))
                    }
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      headerColors[key] === pc.value
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50"
                    }`}
                    style={{ backgroundColor: pc.value }}
                    data-ocid="admin-theme.header-preset.button"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSaveHeaderColors}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(90deg, ${headerColors.color1}, ${headerColors.color2})`,
          }}
          data-ocid="admin-theme.header-colors-save.button"
        >
          Save Header Colors
        </button>
      </div>

      {/* Font / Text Color */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Type
            className="w-4 h-4"
            style={{ color: "oklch(var(--primary))" }}
          />
          <h2 className="font-display font-semibold text-sm">
            Font / Text Color
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          App ke andar text/font ka color change karo. Yeh user panel aur admin
          panel dono par lagega.
        </p>

        {/* Live Preview */}
        <div className="rounded-xl border border-border px-4 py-3 bg-background space-y-1">
          <p className="text-xs text-muted-foreground">Preview:</p>
          <p
            className="text-base font-semibold"
            style={{ color: fontColor || undefined }}
          >
            SR-FF-TURNAMENT — Free Fire Tournament
          </p>
          <p className="text-sm" style={{ color: fontColor || undefined }}>
            Tournament join karo aur prizes jeeto!
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Custom Color:</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border-2 border-border flex-shrink-0"
              style={{ backgroundColor: fontColor || "#ffffff" }}
            />
            <input
              type="color"
              value={fontColor || "#ffffff"}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
              data-ocid="admin-theme.font-color.input"
            />
            <span className="text-xs text-muted-foreground font-mono">
              {fontColor || "(theme default)"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Preset Colors:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((pc) => (
              <button
                key={pc.value}
                type="button"
                title={pc.label}
                onClick={() => setFontColor(pc.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  fontColor === pc.value
                    ? "border-white scale-110 ring-2 ring-white/30"
                    : "border-transparent hover:border-white/50"
                }`}
                style={{ backgroundColor: pc.value }}
                data-ocid="admin-theme.font-preset.button"
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveFontColor}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: "oklch(var(--primary))",
              color: "oklch(var(--primary-foreground))",
            }}
            data-ocid="admin-theme.font-color-save.button"
          >
            Save Font Color
          </button>
          <button
            type="button"
            onClick={handleResetFontColor}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-border bg-muted hover:bg-muted/80 transition-all"
            data-ocid="admin-theme.font-color-reset.button"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Yahan se full app theme select karo -- yahi theme user panel par bhi
          dikhegi.
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
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {theme.preview.map((color) => (
                      <span
                        key={color}
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {selected === theme.id && (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
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
    </div>
  );
}

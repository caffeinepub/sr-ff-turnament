import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ExternalLink,
  ImagePlus,
  Megaphone,
  MessageSquare,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ANNOUNCEMENT_KEY = "srff_announcement";
const PROMO_LINKS_KEY = "srff_promo_links";
const WELCOME_NEW_KEY = "srff_welcome_new_lines";
const WELCOME_RETURNING_KEY = "srff_welcome_returning_lines";

const DEFAULT_ANNOUNCEMENT =
  "Welcome to SR-FF-TOURNAMENT! Join now and win big prizes! New Free Fire tournaments added daily! Top players get exclusive rewards! BR Per Kill tournament starting soon!";

const DEFAULT_NEW_WELCOME_LINES = [
  "🎮 Welcome to SR-FF-TOURNAMENT! 🎮",
  "🇮🇳 India ka #1 Free Fire Tournament Platform 🔥",
  "💰 Ab compete karo aur jeeto REAL CASH prizes! 💰",
  "🏆 Roz naye tournaments join karo... 🏆",
  "⚡ Top players ko milte hain EXCLUSIVE rewards! ⚡",
  "🤝 Apni team banao. Apna naam banao. 👑",
  "💥 The Battle Begins NOW! 🚀",
];

const DEFAULT_RETURNING_WELCOME_LINES = [
  "🌟 WELCOME BACK TO OUR PLATFORM! 🌟",
  "☀️ WISH YOU A VERY GOOD DAY! ☀️",
  "🍀 BEST OF LUCK, CHAMPION! 🍀",
  "🔥 Go Dominate The Battlefield! 🔥",
  "🏆 Today Is YOUR Victory Day! 🏆",
];

export interface PromoLink {
  id: string;
  photoUrl: string;
  link: string;
  label: string;
  active: boolean;
}

function loadAnnouncement(): string {
  return localStorage.getItem(ANNOUNCEMENT_KEY) ?? DEFAULT_ANNOUNCEMENT;
}

function loadPromoLinks(): PromoLink[] {
  try {
    return JSON.parse(
      localStorage.getItem(PROMO_LINKS_KEY) ?? "[]",
    ) as PromoLink[];
  } catch {
    return [];
  }
}

// Welcome Lines Editor
function WelcomeLinesEditor({
  storageKey,
  title,
  defaultLines,
  saveLabel,
  ocidPrefix,
}: {
  storageKey: string;
  title: string;
  defaultLines: string[];
  saveLabel: string;
  ocidPrefix: string;
}) {
  const [lines, setLines] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [...defaultLines];
      return JSON.parse(raw) as string[];
    } catch {
      return [...defaultLines];
    }
  });

  const updateLine = (i: number, val: string) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? val : l)));

  const addLine = () => setLines((prev) => [...prev, ""]);

  const removeLine = (i: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(lines));
    toast.success(`${title} saved!`);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Har line ek alag message hai jo typing effect ke saath dikhega. Emoji
        bhi add kar sakte ho.
      </p>
      {lines.map((line, i) => (
        <div
          key={`${ocidPrefix}-${i}-${line.slice(0, 8)}`}
          className="flex gap-2 items-start"
          data-ocid={`${ocidPrefix}.item.${i + 1}`}
        >
          <div className="flex-1">
            <Textarea
              value={line}
              onChange={(e) => updateLine(i, e.target.value)}
              rows={2}
              placeholder={`Line ${i + 1}...`}
              className="resize-none"
              data-ocid={`${ocidPrefix}.textarea.${i + 1}`}
            />
          </div>
          <button
            type="button"
            onClick={() => removeLine(i)}
            className="mt-1 text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
            data-ocid={`${ocidPrefix}.delete_button.${i + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        className="w-full gap-1"
        data-ocid={`${ocidPrefix}.add.button`}
      >
        <Plus className="w-3 h-3" /> Add Line
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        className="w-full gap-2"
        data-ocid={`${ocidPrefix}.save_button`}
      >
        <Save className="w-4 h-4" /> {saveLabel}
      </Button>
    </div>
  );
}

export default function AdminHomeContent() {
  const [announcement, setAnnouncement] = useState(loadAnnouncement);
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>(loadPromoLinks);
  const [newPhoto, setNewPhoto] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const saveAnnouncement = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, announcement);
    toast.success("Announcement saved!");
  };

  const addPromoLink = () => {
    if (!newPhoto.trim() || !newLink.trim()) {
      toast.error("Photo URL aur Link dono zaroori hain");
      return;
    }
    const item: PromoLink = {
      id: Date.now().toString(),
      photoUrl: newPhoto.trim(),
      link: newLink.trim(),
      label: newLabel.trim() || "Promo",
      active: true,
    };
    const updated = [...promoLinks, item];
    setPromoLinks(updated);
    localStorage.setItem(PROMO_LINKS_KEY, JSON.stringify(updated));
    setNewPhoto("");
    setNewLink("");
    setNewLabel("");
    toast.success("Promo photo added!");
  };

  const togglePromoLink = (id: string) => {
    const updated = promoLinks.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p,
    );
    setPromoLinks(updated);
    localStorage.setItem(PROMO_LINKS_KEY, JSON.stringify(updated));
  };

  const deletePromoLink = (id: string) => {
    const updated = promoLinks.filter((p) => p.id !== id);
    setPromoLinks(updated);
    localStorage.setItem(PROMO_LINKS_KEY, JSON.stringify(updated));
    toast.success("Promo photo removed");
  };

  return (
    <div className="space-y-6" data-ocid="admin-homecontent.page">
      <h1 className="font-display font-bold text-2xl">Home Content</h1>

      {/* Announcement Ticker */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-base">
            Announcement Ticker
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Yah text user panel ke upar scrolling ticker mein dikhega.
        </p>
        <div>
          <Label>Announcement Text</Label>
          <Textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="Welcome message, offers, updates..."
            data-ocid="admin-homecontent.announcement.textarea"
          />
        </div>
        <Button
          type="button"
          onClick={saveAnnouncement}
          className="gap-2 w-full"
          data-ocid="admin-homecontent.announcement.save.button"
        >
          <Save className="w-4 h-4" /> Save Announcement
        </Button>
      </div>

      {/* Promo Photo Links */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-base">
            Promo Photo Links
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Photo add karo aur uska link do. User jab photo click karega to us
          link par chala jaega.
        </p>

        {/* Add new */}
        <div className="space-y-3 border border-dashed border-border rounded-xl p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Naya Promo Add Karo
          </p>
          <div>
            <Label>Photo URL</Label>
            <Input
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1"
              data-ocid="admin-homecontent.photurl.input"
            />
          </div>
          <div>
            <Label>Link (click karne par kahan jaega)</Label>
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://example.com ya /tournaments"
              className="mt-1"
              data-ocid="admin-homecontent.link.input"
            />
          </div>
          <div>
            <Label>Label (optional)</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Promo name"
              className="mt-1"
              data-ocid="admin-homecontent.label.input"
            />
          </div>
          {newPhoto && (
            <div className="rounded-xl overflow-hidden border border-border">
              <img
                src={newPhoto}
                alt="Preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <Button
            type="button"
            onClick={addPromoLink}
            className="w-full gap-2"
            data-ocid="admin-homecontent.add.button"
          >
            <Plus className="w-4 h-4" /> Add Promo Photo
          </Button>
        </div>

        {/* List */}
        {promoLinks.length === 0 ? (
          <div
            className="text-center py-6 text-muted-foreground"
            data-ocid="admin-homecontent.promolinks.empty_state"
          >
            <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Koi promo photo nahi hai</p>
          </div>
        ) : (
          <div
            className="space-y-3"
            data-ocid="admin-homecontent.promolinks.list"
          >
            {promoLinks.map((item, i) => (
              <div
                key={item.id}
                className="flex gap-3 bg-background border border-border rounded-xl p-3"
                data-ocid={`admin-homecontent.promolink.item.${i + 1}`}
              >
                <img
                  src={item.photoUrl}
                  alt={item.label}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.label}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 truncate mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.link}</span>
                  </a>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={item.active}
                      onCheckedChange={() => togglePromoLink(item.id)}
                      data-ocid={`admin-homecontent.promolink.switch.${i + 1}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.active ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deletePromoLink(item.id)}
                  className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors shrink-0"
                  data-ocid={`admin-homecontent.promolink.delete.button.${i + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Welcome Messages Editor */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-base">
            Welcome Messages
          </h2>
        </div>

        {/* New User Welcome */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm">New User Welcome</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jab koi naya user register karta hai tab dikhne wala welcome
              message.
            </p>
          </div>
          <WelcomeLinesEditor
            storageKey={WELCOME_NEW_KEY}
            title="New User Welcome"
            defaultLines={DEFAULT_NEW_WELCOME_LINES}
            saveLabel="Save New User Welcome"
            ocidPrefix="admin-homecontent.new-welcome"
          />
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">Returning User Welcome</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jab koi user login karta hai tab dikhne wala welcome back message.
            </p>
          </div>
          <WelcomeLinesEditor
            storageKey={WELCOME_RETURNING_KEY}
            title="Returning User Welcome"
            defaultLines={DEFAULT_RETURNING_WELCOME_LINES}
            saveLabel="Save Returning Welcome"
            ocidPrefix="admin-homecontent.returning-welcome"
          />
        </div>
      </div>
    </div>
  );
}

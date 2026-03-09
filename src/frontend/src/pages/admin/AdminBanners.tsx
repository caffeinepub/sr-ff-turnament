import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Link2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}

const STORAGE_KEY = "srff_promo_banners";

function loadBanners(): PromoBanner[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBanners(banners: PromoBanner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
}

const EMPTY: Omit<PromoBanner, "id"> = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "Join Now",
  buttonLink: "/tournaments",
  active: true,
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>(loadBanners);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    saveBanners(banners);
  }, [banners]);

  const handleChange = (field: keyof typeof EMPTY, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Banner title is required");
      return;
    }
    if (editId) {
      setBanners((prev) =>
        prev.map((b) => (b.id === editId ? { ...form, id: editId } : b)),
      );
      toast.success("Banner updated!");
    } else {
      const newBanner: PromoBanner = {
        ...form,
        id: Date.now().toString(),
      };
      setBanners((prev) => [...prev, newBanner]);
      toast.success("Banner added!");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (b: PromoBanner) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      buttonText: b.buttonText,
      buttonLink: b.buttonLink,
      active: b.active,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Banner deleted");
  };

  const toggleActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const handleCancel = () => {
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Promotion Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage banners shown on the home page
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            data-ocid="banners.add.primary_button"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Banner
          </Button>
        )}
      </div>

      {showForm && (
        <div
          className="bg-card border border-border rounded-2xl p-5 space-y-4"
          data-ocid="banners.form.panel"
        >
          <h2 className="font-display font-semibold text-base">
            {editId ? "Edit Banner" : "New Banner"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-title">Banner Title *</Label>
              <Input
                id="b-title"
                placeholder="e.g. Grand Tournament 2026"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                data-ocid="banners.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-subtitle">Subtitle</Label>
              <Input
                id="b-subtitle"
                placeholder="e.g. Win ₹10,000 prize pool"
                value={form.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                data-ocid="banners.subtitle.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="b-image">
              <ImageIcon className="inline w-3.5 h-3.5 mr-1" />
              Image URL
            </Label>
            <Input
              id="b-image"
              placeholder="https://example.com/banner.jpg"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              data-ocid="banners.image.input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-btn-text">
                <Link2 className="inline w-3.5 h-3.5 mr-1" />
                Button Text
              </Label>
              <Input
                id="b-btn-text"
                placeholder="Join Now"
                value={form.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
                data-ocid="banners.button-text.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-btn-link">Button Link / URL</Label>
              <Input
                id="b-btn-link"
                placeholder="/tournaments or https://..."
                value={form.buttonLink}
                onChange={(e) => handleChange("buttonLink", e.target.value)}
                data-ocid="banners.button-link.input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button onClick={handleSave} data-ocid="banners.form.save_button">
              {editId ? "Update Banner" : "Save Banner"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              data-ocid="banners.form.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {banners.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded-2xl"
            data-ocid="banners.empty_state"
          >
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              No banners yet. Add your first promotion banner.
            </p>
          </div>
        ) : (
          banners.map((b, i) => (
            <div
              key={b.id}
              className={`bg-card border rounded-2xl overflow-hidden transition-opacity ${
                b.active ? "border-border" : "border-border opacity-50"
              }`}
              data-ocid={`banners.item.${i + 1}`}
            >
              <div className="flex items-stretch">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-24 h-20 object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-24 h-20 bg-muted/40 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {b.title}
                      </p>
                      {b.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {b.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">
                          <Link2 className="w-3 h-3" />
                          {b.buttonText || "Button"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {b.buttonLink}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(b.id)}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          b.active
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                        data-ocid={`banners.toggle.${i + 1}`}
                      >
                        {b.active ? "ON" : "OFF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(b)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Edit banner"
                        data-ocid={`banners.edit_button.${i + 1}`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <title>Edit</title>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        data-ocid={`banners.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

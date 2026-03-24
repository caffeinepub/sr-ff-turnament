import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAllPromoBanners,
  useDeletePromoBanner,
  useSavePromoBanner,
  useTogglePromoBanner,
  useUpdatePromoBanner,
} from "../../hooks/useQueries";

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}

const EMPTY = {
  title: "",
  subtitle: "",
  imageData: "",
  imageUrl: "",
  buttonText: "Join Now",
  buttonLink: "/tournaments",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminBanners() {
  const { data: backendBanners = [], isLoading } = useAllPromoBanners();
  const saveMutation = useSavePromoBanner();
  const updateMutation = useUpdatePromoBanner();
  const toggleMutation = useTogglePromoBanner();
  const deleteMutation = useDeletePromoBanner();

  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm((prev) => ({ ...prev, imageData: base64, imageUrl: "" }));
  };

  const handleUrlChange = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imageUrl: url,
      imageData: url ? url : prev.imageData,
    }));
  };

  // The effective imageData is the URL if set, else the base64 upload
  const effectiveImageData = form.imageUrl || form.imageData;

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Banner title is required");
      return;
    }
    try {
      if (editId !== null) {
        await updateMutation.mutateAsync({
          id: editId,
          title: form.title,
          subtitle: form.subtitle,
          imageData: effectiveImageData,
          buttonText: form.buttonText,
          buttonLink: form.buttonLink,
        });
        toast.success("Banner updated!");
      } else {
        await saveMutation.mutateAsync({
          title: form.title,
          subtitle: form.subtitle,
          imageData: effectiveImageData,
          buttonText: form.buttonText,
          buttonLink: form.buttonLink,
        });
        toast.success("Banner added!");
      }
      setForm({ ...EMPTY });
      setEditId(null);
      setShowForm(false);
    } catch (err: any) {
      if (
        err?.message?.includes("Unauthorized") ||
        err?.message?.includes("Not connected")
      ) {
        toast.error(
          "Admin token expire ho gaya. Page reload karo aur dobara try karo.",
        );
      } else {
        toast.error(
          `Banner save nahi hua: ${err?.message || "dobara try karo"}`,
        );
      }
    }
  };

  const handleEdit = (b: (typeof backendBanners)[0]) => {
    const isUrl = b.imageData && !b.imageData.startsWith("data:");
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      imageData: isUrl ? "" : b.imageData,
      imageUrl: isUrl ? b.imageData : "",
      buttonText: b.buttonText,
      buttonLink: b.buttonLink,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    toast.success("Banner deleted");
  };

  const handleCancel = () => {
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSaving = saveMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Promotion Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage banners shown on the home page (visible on all devices)
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
            {editId !== null ? "Edit Banner" : "New Banner"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-title">Banner Title *</Label>
              <Input
                id="b-title"
                placeholder="e.g. Grand Tournament 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="banners.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-subtitle">Subtitle</Label>
              <Input
                id="b-subtitle"
                placeholder="e.g. Win ₹10,000 prize pool"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                data-ocid="banners.subtitle.input"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              <ImageIcon className="inline w-3.5 h-3.5 mr-1" />
              Banner Image
            </Label>

            {/* URL input */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Option 1: Enter Image URL
              </p>
              <Input
                placeholder="https://example.com/banner.jpg"
                value={form.imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                data-ocid="banners.image-url.input"
              />
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Option 2: Upload Photo from Device
              </p>
              <input
                ref={fileInputRef}
                id="b-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                data-ocid="banners.upload_button"
              />
            </div>

            {/* Preview */}
            {effectiveImageData && (
              <img
                src={effectiveImageData}
                alt="Preview"
                className="mt-2 w-full rounded-lg border border-border"
                style={{ maxHeight: "none" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.3";
                }}
              />
            )}
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
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
                data-ocid="banners.button-text.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-btn-link">Button Link / URL</Label>
              <Input
                id="b-btn-link"
                placeholder="/tournaments or https://..."
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
                data-ocid="banners.button-link.input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="banners.form.save_button"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId !== null ? "Update Banner" : "Save Banner"}
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
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-40" />
            <p className="text-sm">Loading banners...</p>
          </div>
        ) : backendBanners.length === 0 ? (
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
          backendBanners.map((b, i) => (
            <div
              key={b.id}
              className={`bg-card border rounded-2xl overflow-hidden transition-opacity ${
                b.active ? "border-border" : "border-border opacity-50"
              }`}
              data-ocid={`banners.item.${i + 1}`}
            >
              <div className="flex items-stretch">
                {b.imageData ? (
                  <img
                    src={b.imageData}
                    alt={b.title}
                    className="w-24 shrink-0 object-cover"
                    style={{ minHeight: 80 }}
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
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                        b.active
                          ? "bg-green-500/15 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.active ? "Active" : "Off"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleEdit(b)}
                      data-ocid={`banners.edit_button.${i + 1}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => toggleMutation.mutate(b.id)}
                      data-ocid={`banners.toggle.${i + 1}`}
                    >
                      {b.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id)}
                      data-ocid={`banners.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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

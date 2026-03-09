import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "../../backend.d";
import { useSettings, useUpdateSettings } from "../../hooks/useQueries";

const DEFAULT_SETTINGS: AppSettings = {
  appName: "SR-FF-TOURNAMENT",
  minWithdraw: BigInt(100),
  referralBonus: BigInt(50),
  supportContact: "",
  upiDetails: "",
  privacyPolicy: "",
  termsAndConditions: "",
  refundPolicy: "",
  announcementText: "Welcome to SR-FF-TOURNAMENT!",
};

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const f = (key: keyof AppSettings, val: string) => {
    if (key === "minWithdraw" || key === "referralBonus") {
      setForm((prev) => ({ ...prev, [key]: BigInt(Number(val) || 0) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl">App Settings</h1>

      <form
        onSubmit={handleSave}
        className="space-y-4"
        data-ocid="admin-settings.form"
      >
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            General
          </h2>
          <div>
            <Label>App Name</Label>
            <Input
              value={form.appName}
              onChange={(e) => f("appName", e.target.value)}
              className="mt-1"
              data-ocid="admin-settings.appname.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min Withdrawal (₹)</Label>
              <Input
                type="number"
                value={Number(form.minWithdraw)}
                onChange={(e) => f("minWithdraw", e.target.value)}
                className="mt-1"
                data-ocid="admin-settings.minwithdraw.input"
              />
            </div>
            <div>
              <Label>Referral Bonus (₹)</Label>
              <Input
                type="number"
                value={Number(form.referralBonus)}
                onChange={(e) => f("referralBonus", e.target.value)}
                className="mt-1"
                data-ocid="admin-settings.referralbonus.input"
              />
            </div>
          </div>
          <div>
            <Label>Announcement Text</Label>
            <Input
              value={form.announcementText}
              onChange={(e) => f("announcementText", e.target.value)}
              className="mt-1"
              data-ocid="admin-settings.announcement.input"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Support & Payment
          </h2>
          <div>
            <Label>Support Contact</Label>
            <Input
              value={form.supportContact}
              onChange={(e) => f("supportContact", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="mt-1"
              data-ocid="admin-settings.support.input"
            />
          </div>
          <div>
            <Label>UPI Payment Details</Label>
            <Input
              value={form.upiDetails}
              onChange={(e) => f("upiDetails", e.target.value)}
              placeholder="yourname@upi"
              className="mt-1"
              data-ocid="admin-settings.upi.input"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Policies
          </h2>
          <div>
            <Label>Privacy Policy</Label>
            <Textarea
              value={form.privacyPolicy}
              onChange={(e) => f("privacyPolicy", e.target.value)}
              rows={4}
              className="mt-1"
              data-ocid="admin-settings.privacy.textarea"
            />
          </div>
          <div>
            <Label>Terms & Conditions</Label>
            <Textarea
              value={form.termsAndConditions}
              onChange={(e) => f("termsAndConditions", e.target.value)}
              rows={4}
              className="mt-1"
              data-ocid="admin-settings.terms.textarea"
            />
          </div>
          <div>
            <Label>Refund Policy</Label>
            <Textarea
              value={form.refundPolicy}
              onChange={(e) => f("refundPolicy", e.target.value)}
              rows={4}
              className="mt-1"
              data-ocid="admin-settings.refund.textarea"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full glow-orange gap-2"
          disabled={updateMutation.isPending}
          data-ocid="admin-settings.save.button"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </form>
    </div>
  );
}

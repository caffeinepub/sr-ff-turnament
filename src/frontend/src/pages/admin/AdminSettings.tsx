import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, KeyRound, Loader2, Save, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "../../backend.d";
import {
  parseAnnouncement,
  useSettings,
  useUpdateSettings,
} from "../../hooks/useQueries";

const MIN_DEPOSIT_KEY = "srff_min_deposit";
const ADMIN_PASSWORD_KEY = "srff_admin_password";
const FOOTER_TEXT_KEY = "srff_footer_text";
const SUPPORT_NUMBER_KEY = "srff_support_number";
const CONTACT_US_KEY = "srff_contact_us";
const FAIR_PLAY_KEY = "srff_fair_play_policy";
const MATCH_HISTORY_KEY = "srff_match_history_note";
const GAME_RULES_KEY = "srff_game_rules";
const DEFAULT_ADMIN_PASSWORD = "7477661867Ss";
const UPI_ID_KEY = "srff_upi_id";
const BANK_ACCOUNT_KEY = "srff_bank_account";
const BANK_HOLDER_KEY = "srff_bank_holder";
const BANK_NAME_KEY = "srff_bank_name";

const DEFAULT_SETTINGS: AppSettings = {
  appName: "SR-FF-TOURNAMENT",
  minDeposit: BigInt(10),
  minWithdraw: BigInt(100),
  referralBonus: BigInt(50),
  supportContact: "9104414372",
  upiDetails: "",
  privacyPolicy: "",
  termsAndConditions: "",
  refundPolicy: "",
  announcementText: "Welcome to SR-FF-TOURNAMENT!",
};

function getStoredMinDeposit(): number {
  try {
    const raw = localStorage.getItem(MIN_DEPOSIT_KEY);
    if (raw === null) return 10;
    const val = Number(raw);
    return Number.isNaN(val) ? 10 : val;
  } catch {
    return 20;
  }
}

function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

function getFooterText(): string {
  return (
    localStorage.getItem(FOOTER_TEXT_KEY) ||
    "SR-FF-TURNAMENT — Free Fire Tournament Platform"
  );
}

function AdminPasswordSection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = () => {
    const stored = getAdminPassword();
    if (currentPw !== stored) {
      toast.error("Current password galat hai");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password minimum 6 characters ka hona chahiye");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New password aur Confirm password match nahi karte");
      return;
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPw);
    toast.success("Admin password change ho gaya!");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-base">
          Admin Password Change
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Admin panel ka password yahan se change karo.
      </p>
      <div>
        <Label>Current Password</Label>
        <div className="relative mt-1">
          <Input
            type={showCurrent ? "text" : "password"}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Current password"
            className="pr-10"
            data-ocid="admin-settings.current-password.input"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showCurrent ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div>
        <Label>New Password</Label>
        <div className="relative mt-1">
          <Input
            type={showNew ? "text" : "password"}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password (min 6 chars)"
            className="pr-10"
            data-ocid="admin-settings.new-password.input"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showNew ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div>
        <Label>Confirm New Password</Label>
        <div className="relative mt-1">
          <Input
            type={showConfirm ? "text" : "password"}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Repeat new password"
            className="pr-10"
            data-ocid="admin-settings.confirm-password.input"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <Button
        type="button"
        onClick={handleChange}
        className="w-full gap-2"
        data-ocid="admin-settings.change-password.button"
      >
        <KeyRound className="w-4 h-4" /> Change Password
      </Button>
    </div>
  );
}

function FooterTextSection() {
  const [footerText, setFooterText] = useState(getFooterText);

  const handleSave = () => {
    localStorage.setItem(FOOTER_TEXT_KEY, footerText);
    toast.success("Footer text saved!");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Footer Text
      </h2>
      <div>
        <Label>Footer Text</Label>
        <Input
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          className="mt-1"
          placeholder="SR-FF-TURNAMENT — Free Fire Tournament Platform"
          data-ocid="admin-settings.footer-text.input"
        />
      </div>
      <Button
        type="button"
        onClick={handleSave}
        className="w-full gap-2"
        data-ocid="admin-settings.footer-text.save_button"
      >
        <Save className="w-4 h-4" /> Save Footer Text
      </Button>
    </div>
  );
}

const UI_FORM_SIZE_KEY = "srff_form_size";
const UI_MODAL_SIZE_KEY = "srff_modal_size";
const UI_NEW_WELCOME_KEY = "srff_new_welcome_lines";
const UI_LOGIN_WELCOME_KEY = "srff_login_welcome_lines";

const DEFAULT_NEW_WELCOME = [
  "🎮 Welcome to SR-FF-TURNAMENT!",
  "🔥 Ready for Free Fire action?",
  "💰 Win big prizes in tournaments!",
  "🏆 Best of luck, warrior!",
];

const DEFAULT_LOGIN_WELCOME = [
  "🎯 Welcome Back!",
  "🔥 Time to dominate the arena!",
  "💪 Your victories await!",
  "🏅 Let's go, champion!",
];

function UICustomizationSection() {
  const [formSize, setFormSize] = useState<string>(
    () => localStorage.getItem(UI_FORM_SIZE_KEY) || "large",
  );
  const [modalSize, setModalSize] = useState<string>(
    () => localStorage.getItem(UI_MODAL_SIZE_KEY) || "medium",
  );
  const [newWelcomeLines, setNewWelcomeLines] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(UI_NEW_WELCOME_KEY);
      const arr: string[] = raw
        ? (JSON.parse(raw) as string[])
        : DEFAULT_NEW_WELCOME;
      return arr.join("\n");
    } catch {
      return DEFAULT_NEW_WELCOME.join("\n");
    }
  });
  const [loginWelcomeLines, setLoginWelcomeLines] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(UI_LOGIN_WELCOME_KEY);
      const arr: string[] = raw
        ? (JSON.parse(raw) as string[])
        : DEFAULT_LOGIN_WELCOME;
      return arr.join("\n");
    } catch {
      return DEFAULT_LOGIN_WELCOME.join("\n");
    }
  });

  const handleSave = () => {
    localStorage.setItem(UI_FORM_SIZE_KEY, formSize);
    localStorage.setItem(UI_MODAL_SIZE_KEY, modalSize);
    const newLines = newWelcomeLines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const loginLines = loginWelcomeLines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    localStorage.setItem(UI_NEW_WELCOME_KEY, JSON.stringify(newLines));
    localStorage.setItem(UI_LOGIN_WELCOME_KEY, JSON.stringify(loginLines));
    toast.success("UI settings saved! Reload karke changes dekho.");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-base">
          UI Customization
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Login/Register form ka size, welcome modal ka size, aur welcome messages
        yahan se set karo.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Form Size (Login/Register)</Label>
          <Select value={formSize} onValueChange={setFormSize}>
            <SelectTrigger
              className="mt-1"
              data-ocid="admin-settings.form-size.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Welcome Modal Size</Label>
          <Select value={modalSize} onValueChange={setModalSize}>
            <SelectTrigger
              className="mt-1"
              data-ocid="admin-settings.modal-size.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>New User Welcome Lines</Label>
        <p className="text-xs text-muted-foreground mb-1">
          Ek line = ek welcome message. Emojis bhi likh sakte ho.
        </p>
        <Textarea
          value={newWelcomeLines}
          onChange={(e) => setNewWelcomeLines(e.target.value)}
          rows={5}
          placeholder="🎮 Welcome to SR-FF-TURNAMENT!&#10;🔥 Ready for action?"
          className="mt-1 font-mono text-sm"
          data-ocid="admin-settings.new-welcome-lines.textarea"
        />
      </div>

      <div>
        <Label>Returning User Welcome Lines (Login)</Label>
        <p className="text-xs text-muted-foreground mb-1">
          Ek line = ek message. Yeh login ke baad dikhega.
        </p>
        <Textarea
          value={loginWelcomeLines}
          onChange={(e) => setLoginWelcomeLines(e.target.value)}
          rows={5}
          placeholder="🎯 Welcome Back!&#10;🔥 Time to dominate!"
          className="mt-1 font-mono text-sm"
          data-ocid="admin-settings.login-welcome-lines.textarea"
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        className="w-full gap-2"
        data-ocid="admin-settings.ui-customization.save_button"
      >
        <Save className="w-4 h-4" /> Save UI Settings
      </Button>
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [minDeposit, setMinDeposit] = useState<number>(getStoredMinDeposit);

  // Local-only fields (not in AppSettings backend type)
  const [referEarn, setReferEarn] = useState<string>(
    () => localStorage.getItem("srff_refer_earn") || "",
  );
  const [contactUs, setContactUs] = useState<string>(
    () => localStorage.getItem(CONTACT_US_KEY) || "",
  );
  const [fairPlayPolicy, setFairPlayPolicy] = useState<string>(
    () => localStorage.getItem(FAIR_PLAY_KEY) || "",
  );
  const [matchHistoryNote, setMatchHistoryNote] = useState<string>(
    () => localStorage.getItem(MATCH_HISTORY_KEY) || "",
  );
  const [gameRules, setGameRules] = useState<string>(
    () => localStorage.getItem(GAME_RULES_KEY) || "",
  );

  useEffect(() => {
    if (settings) {
      const ext = parseAnnouncement(settings.announcementText);
      setForm({ ...settings, announcementText: ext.tick });
      // Populate ext policy fields from backend if they have values
      if (ext.fp) setFairPlayPolicy(ext.fp);
      if (ext.gr) setGameRules(ext.gr);
      if (ext.re) setReferEarn(ext.re);
      if (ext.cu) setContactUs(ext.cu);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save local-only fields FIRST so they always get persisted
    localStorage.setItem(MIN_DEPOSIT_KEY, String(minDeposit));
    localStorage.setItem("srff_refer_earn", referEarn);
    localStorage.setItem(CONTACT_US_KEY, contactUs);
    localStorage.setItem(FAIR_PLAY_KEY, fairPlayPolicy);
    localStorage.setItem(MATCH_HISTORY_KEY, matchHistoryNote);
    localStorage.setItem(GAME_RULES_KEY, gameRules);
    localStorage.setItem("srff_privacy_policy", form.privacyPolicy || "");
    localStorage.setItem(
      "srff_terms_conditions",
      form.termsAndConditions || "",
    );
    localStorage.setItem("srff_refund_policy", form.refundPolicy || "");
    if (form.supportContact) {
      localStorage.setItem(
        SUPPORT_NUMBER_KEY,
        form.supportContact.replace(/\D/g, ""),
      );
    }
    // Build extended announcementText JSON (stores policies + tick + banners)
    const currentExt = parseAnnouncement(settings?.announcementText || "");
    currentExt.tick = form.announcementText; // plain text ticker
    currentExt.fp = fairPlayPolicy;
    currentExt.gr = gameRules;
    currentExt.re = referEarn;
    currentExt.cu = contactUs;
    const backendPayload: AppSettings = {
      appName: form.appName,
      minDeposit: BigInt(Number(minDeposit) || 10),
      minWithdraw: form.minWithdraw,
      referralBonus: form.referralBonus,
      supportContact: form.supportContact,
      upiDetails: form.upiDetails,
      privacyPolicy: form.privacyPolicy,
      termsAndConditions: form.termsAndConditions,
      refundPolicy: form.refundPolicy,
      announcementText: JSON.stringify(currentExt),
    };
    try {
      await updateMutation.mutateAsync(backendPayload);
    } catch (err: any) {
      toast.warning(
        `Settings locally saved. Backend sync failed: ${err?.message || "retry later"}`,
      );
    }
    toast.success("Settings saved!");
    // Dispatch event so user panel picks up changes immediately
    window.dispatchEvent(new Event("srff_settings_updated"));
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Min Deposit (₹)</Label>
              <Input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value) || 0)}
                className="mt-1"
                placeholder="20"
                data-ocid="admin-settings.mindeposit.input"
              />
            </div>
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
            Support &amp; Payment
          </h2>
          <div>
            <Label>WhatsApp Support Number</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Yeh number Login/Register page par WhatsApp support button mein
              dikhega. Sirf digits daalo (e.g. 9104414372).
            </p>
            <Input
              value={form.supportContact}
              onChange={(e) => f("supportContact", e.target.value)}
              placeholder="9104414372"
              className="mt-1"
              data-ocid="admin-settings.support.input"
            />
          </div>
          <div>
            <Label>UPI ID</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Users deposit page par UPI ID copy karenge is se payment karenge.
            </p>
            <Input
              value={localStorage.getItem(UPI_ID_KEY) ?? "sk190rihan@mvhdfc"}
              onChange={(e) => {
                localStorage.setItem(UPI_ID_KEY, e.target.value);
                f("upiDetails", e.target.value);
              }}
              placeholder="yourname@upi"
              className="mt-1"
              data-ocid="admin-settings.upi.input"
            />
          </div>
          <div>
            <Label>Bank Account Number</Label>
            <Input
              defaultValue={
                localStorage.getItem(BANK_ACCOUNT_KEY) ?? "7477661867"
              }
              onChange={(e) =>
                localStorage.setItem(BANK_ACCOUNT_KEY, e.target.value)
              }
              placeholder="Bank account number"
              className="mt-1"
              data-ocid="admin-settings.bank_account.input"
            />
          </div>
          <div>
            <Label>Account Holder Name</Label>
            <Input
              defaultValue={localStorage.getItem(BANK_HOLDER_KEY) ?? "SK SAHIL"}
              onChange={(e) =>
                localStorage.setItem(BANK_HOLDER_KEY, e.target.value)
              }
              placeholder="Account holder ka naam"
              className="mt-1"
              data-ocid="admin-settings.bank_holder.input"
            />
          </div>
          <div>
            <Label>Bank Name</Label>
            <Input
              defaultValue={
                localStorage.getItem(BANK_NAME_KEY) ?? "Airtel Payment Bank"
              }
              onChange={(e) =>
                localStorage.setItem(BANK_NAME_KEY, e.target.value)
              }
              placeholder="e.g. Airtel Payment Bank, SBI"
              className="mt-1"
              data-ocid="admin-settings.bank_name.input"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Policies (Backend Stored)
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
            <Label>Terms &amp; Conditions</Label>
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

        {/* Local-only fields — stored in localStorage, NOT sent to backend */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Extra Policies (Local Stored)
          </h2>
          <p className="text-xs text-muted-foreground">
            Yeh fields locally save hote hain aur profile page par dikhte hain.
          </p>
          <div>
            <Label>🎁 Refer &amp; Earn Text</Label>
            <Textarea
              value={referEarn}
              onChange={(e) => setReferEarn(e.target.value)}
              rows={3}
              placeholder="Refer karne ka process, reward amount, aur instructions..."
              className="mt-1"
              data-ocid="admin-settings.referEarn.textarea"
            />
          </div>
          <div>
            <Label>📞 Contact Us</Label>
            <Textarea
              value={contactUs}
              onChange={(e) => setContactUs(e.target.value)}
              rows={3}
              placeholder="Contact details, WhatsApp number, email..."
              className="mt-1"
              data-ocid="admin-settings.contactus.textarea"
            />
          </div>
          <div>
            <Label>Fair Play Policy</Label>
            <Textarea
              value={fairPlayPolicy}
              onChange={(e) => setFairPlayPolicy(e.target.value)}
              rows={4}
              placeholder="Fair play rules aur guidelines..."
              className="mt-1"
              data-ocid="admin-settings.fairplay.textarea"
            />
          </div>
          <div>
            <Label>Match History Note</Label>
            <Textarea
              value={matchHistoryNote}
              onChange={(e) => setMatchHistoryNote(e.target.value)}
              rows={2}
              placeholder="Match history ke baare mein note..."
              className="mt-1"
              data-ocid="admin-settings.matchhistory.textarea"
            />
          </div>
          <div>
            <Label>📜 Game Rules (Tournament Rules)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Tournament ke rules likho — users profile page par dekh payenge.
            </p>
            <Textarea
              value={gameRules}
              onChange={(e) => setGameRules(e.target.value)}
              rows={5}
              placeholder="Tournament ke liye rules likhein...&#10;e.g. 1. Cheating strictly banned hai.&#10;2. Winner screenshot submit karna hoga."
              className="mt-1"
              data-ocid="admin-settings.gamerules.textarea"
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

      <AdminPasswordSection />
      <FooterTextSection />
      <UICustomizationSection />
    </div>
  );
}

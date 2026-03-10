import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit2,
  FileText,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  ScrollText,
  Shield,
  ShieldCheck,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import type { PaymentRequest } from "../hooks/useQueries";
import {
  useCallerProfile,
  useMyPaymentRequests,
  useSaveProfile,
  useSettings,
  useSubmitPaymentRequest,
} from "../hooks/useQueries";

const WHATSAPP_NUMBER = "919104414372";
const WHATSAPP_DISPLAY = "9104414372";
const MIN_DEPOSIT_KEY = "srff_min_deposit";
const CONTACT_US_KEY = "srff_contact_us";
const FAIR_PLAY_KEY = "srff_fair_play_policy";
const MATCH_HISTORY_KEY = "srff_match_history_note";
const GAME_RULES_KEY = "srff_game_rules";

function getMinDeposit(): number {
  try {
    return Number(localStorage.getItem(MIN_DEPOSIT_KEY)) || 50;
  } catch {
    return 50;
  }
}

function getLocalString(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function getWhatsAppUrl(amount?: string) {
  const text = amount
    ? `Deposit%20Request%20-%20Amount%3A%20%E2%82%B9${amount}`
    : "Support%20ke%20liye%20contact%20kar%20raha%20hoon";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function StatusBadge({ status }: { status: PaymentRequest["status"] }) {
  if ("pending" in status) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 text-xs">
        <Clock className="w-3 h-3" /> Pending
      </Badge>
    );
  }
  if ("accepted" in status) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1 text-xs">
        <CheckCircle className="w-3 h-3" /> Accepted
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1 text-xs">
      <XCircle className="w-3 h-3" /> Rejected
    </Badge>
  );
}

const AVATARS = [
  {
    id: 1,
    emoji: "\uD83D\uDD25",
    bg: "from-orange-500 to-red-600",
    label: "Fire",
  },
  {
    id: 2,
    emoji: "\u26A1",
    bg: "from-yellow-400 to-orange-500",
    label: "Thunder",
  },
  {
    id: 3,
    emoji: "\uD83C\uDFC6",
    bg: "from-yellow-500 to-amber-600",
    label: "Champion",
  },
  {
    id: 4,
    emoji: "\uD83C\uDFAF",
    bg: "from-green-500 to-emerald-600",
    label: "Sniper",
  },
  {
    id: 5,
    emoji: "\u2694\uFE0F",
    bg: "from-blue-500 to-indigo-600",
    label: "Warrior",
  },
  {
    id: 6,
    emoji: "\uD83D\uDEE1\uFE0F",
    bg: "from-slate-500 to-slate-700",
    label: "Shield",
  },
  {
    id: 7,
    emoji: "\uD83D\uDC80",
    bg: "from-purple-600 to-violet-700",
    label: "Skull",
  },
  {
    id: 8,
    emoji: "\uD83E\uDD81",
    bg: "from-amber-500 to-yellow-600",
    label: "Lion",
  },
  {
    id: 9,
    emoji: "\uD83D\uDC09",
    bg: "from-red-600 to-rose-700",
    label: "Dragon",
  },
  {
    id: 10,
    emoji: "\uD83C\uDF1F",
    bg: "from-cyan-400 to-blue-500",
    label: "Star",
  },
  {
    id: 11,
    emoji: "\uD83C\uDFAE",
    bg: "from-pink-500 to-rose-600",
    label: "Gamer",
  },
  {
    id: 12,
    emoji: "\uD83D\uDC51",
    bg: "from-yellow-400 to-yellow-600",
    label: "King",
  },
];

const AVATAR_KEY = "srff_avatar";

function getSavedAvatar(): number {
  try {
    return Number(localStorage.getItem(AVATAR_KEY)) || 0;
  } catch {
    return 0;
  }
}

function PolicySection({
  icon,
  title,
  content,
  ocid,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  ocid: string;
}) {
  const [open, setOpen] = useState(false);
  if (!content) return null;
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
        data-ocid={ocid}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-display font-semibold text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { currentUser, logout } = useUserAuth();
  const navigate = useNavigate();
  const { data: profile } = useCallerProfile();
  const { data: settings } = useSettings();
  const { data: myRequests } = useMyPaymentRequests();
  const saveMutation = useSaveProfile();
  const submitPayment = useSubmitPaymentRequest();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [savedAvatarId, setSavedAvatarId] = useState<number>(getSavedAvatar);
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<number>(getSavedAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositDone, setDepositDone] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);

  const userKey = currentUser?.phone ?? "guest";
  const WINNING_CASH_KEY = `srff_winning_cash_${userKey}`;

  const getWinningCash = (): number => {
    try {
      return Number(localStorage.getItem(WINNING_CASH_KEY)) || 0;
    } catch {
      return 0;
    }
  };
  const [winningCash, setWinningCash] = useState<number>(getWinningCash);

  // Local-only policy fields from localStorage (set by admin)
  const contactUs = getLocalString(CONTACT_US_KEY);
  const fairPlayPolicy = getLocalString(FAIR_PLAY_KEY);
  const matchHistoryNote = getLocalString(MATCH_HISTORY_KEY);
  const gameRules = getLocalString(GAME_RULES_KEY);

  const currentAvatar = AVATARS.find((a) => a.id === savedAvatarId) ?? null;
  const minDeposit = getMinDeposit();

  const startEdit = () => {
    setUsername(profile?.username ?? "");
    setFfUid(profile?.ffUid ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveMutation.mutateAsync({ ...profile, username, ffUid });
      toast.success("Profile saved!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleSetAvatar = () => {
    localStorage.setItem(AVATAR_KEY, String(selectedAvatarId));
    setSavedAvatarId(selectedAvatarId);
    setShowAvatarPicker(false);
    toast.success("Avatar updated!");
  };

  const copyReferral = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      toast.success("Referral code copied!");
    }
  };

  const handleDepositSubmit = () => {
    const amt = Number(depositAmount);
    if (!amt || amt < minDeposit) {
      toast.error(`Minimum deposit \u20b9${minDeposit} hai`);
      return;
    }
    if (!depositNote.trim()) {
      toast.error("UTR / Transaction ID daalo");
      return;
    }
    submitPayment.mutate(
      {
        amount: BigInt(amt),
        requestType: { deposit: null },
        note: depositNote.trim(),
        upiId: "",
      },
      {
        onSuccess: () => {
          setDepositDone(true);
          toast.success("Deposit request submit ho gaya!");
        },
        onError: () =>
          toast.error("Request submit nahi ho saka, dobara try karo"),
      },
    );
  };

  const handleWithdrawSubmit = () => {
    const amt = Number(withdrawAmount);
    const min = settings ? Number(settings.minWithdraw) : 100;
    if (!amt || amt < min) {
      toast.error(`Minimum withdrawal \u20b9${min} hai`);
      return;
    }
    if (amt > winningCash) {
      toast.error("Sirf Winning Cash se withdrawal ho sakta hai");
      return;
    }
    if (!withdrawUpi.trim()) {
      toast.error("Apna UPI ID daalo");
      return;
    }
    submitPayment.mutate(
      {
        amount: BigInt(amt),
        requestType: { withdraw: null },
        note: "",
        upiId: withdrawUpi.trim(),
      },
      {
        onSuccess: () => {
          const deducted = winningCash - Number(withdrawAmount);
          localStorage.setItem(WINNING_CASH_KEY, String(Math.max(0, deducted)));
          setWinningCash(Math.max(0, deducted));
          toast.success("Withdrawal request submit ho gaya!");
          setWithdrawOpen(false);
          setWithdrawAmount("");
          setWithdrawUpi("");
        },
        onError: () =>
          toast.error("Request submit nahi ho saka, dobara try karo"),
      },
    );
  };

  const resetDeposit = () => {
    setDepositAmount("");
    setDepositNote("");
    setDepositDone(false);
  };

  const handleConvertSubmit = () => {
    const amt = Number(convertAmount);
    const walletBal = profile ? Number(profile.walletBalance) : 0;
    const regularBalance = walletBal - winningCash;
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalo");
      return;
    }
    if (amt > regularBalance) {
      toast.error(`Sirf \u20b9${regularBalance} regular balance available hai`);
      return;
    }
    const newWinningCash = winningCash + amt;
    localStorage.setItem(WINNING_CASH_KEY, String(newWinningCash));
    setWinningCash(newWinningCash);
    setConvertAmount("");
    setConvertOpen(false);
    toast.success(`\u20b9${amt} Winning Cash mein convert ho gaya!`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-sm">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="font-display font-bold text-lg">Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="text-destructive hover:text-destructive"
            data-ocid="profile.logout.button"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Avatar Display */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary">
              {currentAvatar ? (
                <AvatarImage
                  src=""
                  alt={currentAvatar.label}
                  className="hidden"
                />
              ) : null}
              <AvatarFallback
                className={`text-3xl ${
                  currentAvatar
                    ? `bg-gradient-to-br ${currentAvatar.bg}`
                    : "bg-primary/20 text-primary"
                }`}
              >
                {currentAvatar
                  ? currentAvatar.emoji
                  : (currentUser.username?.charAt(0)?.toUpperCase() ?? "?")}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId(savedAvatarId);
                setShowAvatarPicker(true);
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
              data-ocid="profile.avatar-change.button"
            >
              <Edit2 className="w-3 h-3 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-lg">
              {currentUser.username || "Player"}
            </p>
            <p className="text-xs text-muted-foreground">
              📱 {currentUser.phone}
            </p>
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div
            className="bg-card border border-border rounded-2xl p-4 space-y-4"
            data-ocid="profile.avatar-picker.panel"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">
                Choose Avatar
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
                data-ocid="profile.avatar-picker.close_button"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    selectedAvatarId === av.id
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                  data-ocid={`profile.avatar.item.${av.id}`}
                >
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}
                  >
                    {av.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    #{av.id}
                  </span>
                  {selectedAvatarId === av.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={handleSetAvatar}
              disabled={selectedAvatarId === 0}
              data-ocid="profile.avatar-set.button"
            >
              Set Avatar
            </Button>
          </div>
        )}

        {/* Wallet + Deposit/Withdraw */}
        <div className="space-y-3">
          {/* Regular Balance Card */}
          <div className="bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 rounded-2xl p-4 glow-orange">
            <p className="text-sm text-primary/80 font-medium">
              Regular Balance
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="font-display font-bold text-3xl text-foreground">
                ₹
                {Math.max(
                  0,
                  (profile ? Number(profile.walletBalance) : 0) - winningCash,
                )}
              </span>
              <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 text-xs"
                    data-ocid="profile.convert.button"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Convert to Winning Cash
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="profile.convert.dialog">
                  <DialogHeader>
                    <DialogTitle>Convert to Winning Cash</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                      <p className="text-xs text-yellow-400 font-semibold">
                        ℹ️ Sirf Winning Cash se withdrawal ho sakta hai
                      </p>
                    </div>
                    <div>
                      <Label>
                        Amount (₹) — Available: ₹
                        {Math.max(
                          0,
                          (profile ? Number(profile.walletBalance) : 0) -
                            winningCash,
                        )}
                      </Label>
                      <Input
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        placeholder="Kitna convert karna hai?"
                        type="number"
                        className="mt-1"
                        data-ocid="profile.convert.input"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleConvertSubmit}
                      data-ocid="profile.convert.submit_button"
                    >
                      Convert Karo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Winning Cash Card */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-green-500/10 border border-yellow-500/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <p className="text-sm text-yellow-400 font-medium">
                Winning Cash
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-3xl text-yellow-300">
                ₹{winningCash}
              </span>
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                    data-ocid="profile.withdraw.button"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="profile.withdraw.dialog">
                  <DialogHeader>
                    <DialogTitle>Withdraw Winning Cash</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {winningCash === 0 ? (
                      <div
                        className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-3 text-center"
                        data-ocid="profile.withdraw.error_state"
                      >
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-yellow-400 font-semibold">
                          Pehle balance ko Winning Cash mein convert karo
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                          <p className="text-xs text-green-400 font-semibold">
                            Available Winning Cash: ₹{winningCash}
                          </p>
                        </div>
                        <div>
                          <Label>
                            Amount (₹) — Min: ₹
                            {settings ? Number(settings.minWithdraw) : 100}
                          </Label>
                          <Input
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Kitna withdraw karna hai?"
                            type="number"
                            className="mt-1"
                            data-ocid="profile.withdraw.input"
                          />
                        </div>
                        <div>
                          <Label>Aapka UPI ID</Label>
                          <Input
                            value={withdrawUpi}
                            onChange={(e) => setWithdrawUpi(e.target.value)}
                            placeholder="yourname@upi"
                            className="mt-1"
                            data-ocid="profile.withdraw.upi.input"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Admin is UPI ID pe payment karega
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="w-full"
                          onClick={handleWithdrawSubmit}
                          disabled={submitPayment.isPending}
                          data-ocid="profile.withdraw.submit_button"
                        >
                          {submitPayment.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Withdrawal Request Bhejo
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Deposit Button */}
          <div className="flex gap-3">
            <Dialog
              open={depositOpen}
              onOpenChange={(open) => {
                setDepositOpen(open);
                if (!open) resetDeposit();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="w-full gap-2"
                  data-ocid="profile.deposit.button"
                >
                  <ArrowDownToLine className="w-4 h-4" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="profile.deposit.dialog">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                </DialogHeader>
                {depositDone ? (
                  <div
                    className="flex flex-col items-center gap-4 py-6 text-center"
                    data-ocid="profile.deposit.success_state"
                  >
                    <CheckCircle className="w-12 h-12 text-green-400" />
                    <div>
                      <p className="font-bold text-foreground">
                        Request Submit Ho Gaya!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Admin review karega aur aapka balance update karega.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDepositOpen(false)}
                      data-ocid="profile.deposit.close_button"
                    >
                      Theek Hai
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
                      <p className="text-xs text-primary font-semibold">
                        Minimum Deposit: ₹{minDeposit}
                      </p>
                    </div>
                    <div>
                      <Label>Amount (₹) — Min: ₹{minDeposit}</Label>
                      <Input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={`Minimum ₹${minDeposit}`}
                        type="number"
                        className="mt-1"
                        data-ocid="profile.deposit.input"
                      />
                    </div>
                    {depositAmount && Number(depositAmount) >= minDeposit && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-green-400" />
                          <p className="font-semibold text-green-400 text-sm">
                            Step 1: WhatsApp per Payment Karo
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pehle{" "}
                          <span className="text-foreground font-bold">
                            ₹{depositAmount}
                          </span>{" "}
                          neeche diye WhatsApp number pe bhejo:
                        </p>
                        <div className="bg-background/60 rounded-lg px-3 py-2">
                          <p className="text-xs text-muted-foreground">
                            WhatsApp Number
                          </p>
                          <p className="font-mono font-bold text-green-400 text-lg">
                            {WHATSAPP_DISPLAY}
                          </p>
                        </div>
                        <a
                          href={getWhatsAppUrl(depositAmount)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            type="button"
                            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                            data-ocid="profile.deposit.whatsapp.button"
                          >
                            <MessageCircle className="w-4 h-4" /> WhatsApp per
                            Message Karo
                          </Button>
                        </a>
                      </div>
                    )}
                    <div>
                      <Label>Step 2: UTR / Transaction ID</Label>
                      <Input
                        value={depositNote}
                        onChange={(e) => setDepositNote(e.target.value)}
                        placeholder="Payment ka UTR ya Transaction ID"
                        className="mt-1"
                        data-ocid="profile.deposit.utr.input"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment bhejne ke baad transaction ID yahan daalo
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleDepositSubmit}
                      disabled={submitPayment.isPending}
                      data-ocid="profile.deposit.submit_button"
                    >
                      {submitPayment.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Deposit Request Submit Karo
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* My Payment Requests */}
        {myRequests && myRequests.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">
              Meri Requests
            </h3>
            <div className="space-y-2">
              {myRequests.slice(0, 5).map((req, i) => (
                <div
                  key={req.id.toString()}
                  className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
                  data-ocid={`profile.requests.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2">
                    {"deposit" in req.requestType ? (
                      <ArrowDownToLine className="w-3 h-3 text-green-400" />
                    ) : (
                      <ArrowUpFromLine className="w-3 h-3 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {"deposit" in req.requestType ? "Deposit" : "Withdraw"}{" "}
                        \u20b9{Number(req.amount)}
                      </p>
                      {req.note && (
                        <p className="text-xs text-muted-foreground">
                          UTR: {req.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm">Player Info</h3>
            {!editing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startEdit}
                data-ocid="profile.edit.button"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                data-ocid="profile.save.button"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                Save
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              {editing ? (
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Your username"
                  data-ocid="profile.username.input"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">
                  {currentUser.username || "Not set"}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Free Fire Name
              </Label>
              <p className="mt-1 text-sm font-medium">
                {currentUser.ffName || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Mobile Number
              </Label>
              <p className="mt-1 text-sm font-medium font-mono">
                {currentUser.phone}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Free Fire UID
              </Label>
              {editing ? (
                <Input
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  className="mt-1"
                  placeholder="Your FF UID"
                  data-ocid="profile.ffuid.input"
                />
              ) : (
                <p className="mt-1 text-sm font-medium font-mono">
                  {profile?.ffUid || "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {profile?.referralCode && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">
              Referral Code
            </h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono tracking-widest">
                {profile.referralCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyReferral}
                data-ocid="profile.referral-copy.button"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Rules, Privacy, T&C, Refund, Contact Us, Fair Play — Admin controlled */}
        <div className="space-y-2">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide px-1">
            📋 App Rules &amp; Policies
          </h3>

          {matchHistoryNote ? (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-primary" />
                <h4 className="font-display font-semibold text-sm">
                  Match History
                </h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {matchHistoryNote}
              </p>
            </div>
          ) : null}

          <PolicySection
            icon={<Shield className="w-4 h-4 text-blue-400" />}
            title="Privacy Policy"
            content={settings?.privacyPolicy ?? ""}
            ocid="profile.privacy.toggle"
          />
          <PolicySection
            icon={<FileText className="w-4 h-4 text-green-400" />}
            title="Terms &amp; Conditions"
            content={settings?.termsAndConditions ?? ""}
            ocid="profile.terms.toggle"
          />
          <PolicySection
            icon={<RefreshCw className="w-4 h-4 text-orange-400" />}
            title="Refund Policy"
            content={settings?.refundPolicy ?? ""}
            ocid="profile.refund.toggle"
          />
          <PolicySection
            icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
            title="Fair Play Policy"
            content={fairPlayPolicy}
            ocid="profile.fairplay.toggle"
          />
          <PolicySection
            icon={<Phone className="w-4 h-4 text-cyan-400" />}
            title="Contact Us"
            content={contactUs}
            ocid="profile.contactus.toggle"
          />

          {/* 📜 Rules Button */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setRulesOpen((v) => !v)}
              data-ocid="profile.rules.toggle"
            >
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <span className="font-display font-semibold text-sm">
                  📜 Rules
                </span>
              </div>
              {rulesOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {rulesOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {gameRules || "Admin ne abhi rules set nahi kiye hain."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Rules section (if admin has set rules separately) */}
        {settings?.upiDetails && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">
                Payment / UPI Details
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {settings.upiDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

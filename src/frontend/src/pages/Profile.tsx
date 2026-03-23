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
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit2,
  FileText,
  Gift,
  History,
  Loader2,
  Lock,
  LogOut,
  PhoneCall,
  RefreshCw,
  Save,
  ScrollText,
  Shield,
  ShieldCheck,
  Trophy,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import type { PaymentRequest } from "../hooks/useQueries";
import {
  useAllNotifications,
  useAllPhoneUsers,
  useCallerProfile,
  useMyPaymentRequests,
  useSaveProfile,
  useSettings,
  useSubmitPaymentRequest,
} from "../hooks/useQueries";

const MIN_DEPOSIT_KEY = "srff_min_deposit";
const CONTACT_US_KEY = "srff_contact_us";
const FAIR_PLAY_KEY = "srff_fair_play_policy";
const GAME_RULES_KEY = "srff_game_rules";
const UPI_ID_KEY = "srff_upi_id";
const BANK_ACCOUNT_KEY = "srff_bank_account";
const BANK_HOLDER_KEY = "srff_bank_holder";
const BANK_NAME_KEY = "srff_bank_name";

function getMinDeposit(): number {
  try {
    const raw = localStorage.getItem(MIN_DEPOSIT_KEY);
    if (raw === null) return 10;
    const val = Number(raw);
    return Number.isNaN(val) ? 10 : val;
  } catch {
    return 10;
  }
}

function getLocalWalletBalance(): number {
  try {
    const cu = JSON.parse(localStorage.getItem("srff_current_user") || "null");
    if (!cu?.phone) return 0;
    const users = JSON.parse(localStorage.getItem("srff_users") || "[]");
    const u = users.find((u: any) => u.phone === cu.phone);
    return u?.walletBalance || 0;
  } catch {
    return 0;
  }
}

function getLocalString(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
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
    image:
      "https://fragile-rose-ox0f0xpjsr.edgeone.app/Screenshot_2026_0311_192623.png",
    label: "Avatar 1",
  },
  {
    id: 2,
    image:
      "https://moderate-fuchsia-zngf7ch8ht.edgeone.app/Screenshot_2026_0311_192709.png",
    label: "Avatar 2",
  },
  {
    id: 3,
    image:
      "https://spicy-lime-kys4z9abso.edgeone.app/Screenshot_2026_0311_192742.png",
    label: "Avatar 3",
  },
  {
    id: 4,
    image: "https://i.ibb.co/pBHp9p4Y/Screenshot-2026-0311-192858.png",
    label: "Avatar 4",
  },
  {
    id: 5,
    image: "https://i.ibb.co/BKY6vhFK/Screenshot-2026-0311-193040.png",
    label: "Avatar 5",
  },
  {
    id: 6,
    image: "https://i.ibb.co/jPGYvTPD/Screenshot-2026-0311-193101.png",
    label: "Avatar 6",
  },
  {
    id: 7,
    image: "https://i.ibb.co/yFqYjdGw/Screenshot-2026-0311-193122.png",
    label: "Avatar 7",
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

export default function Profile() {
  const { currentUser, logout } = useUserAuth();
  const navigate = useNavigate();
  const { data: profile } = useCallerProfile();
  const { data: settings } = useSettings();
  const { data: myRequests } = useMyPaymentRequests();
  const { data: notifications = [] } = useAllNotifications();
  const { data: allPhoneUsers = [] } = useAllPhoneUsers();
  const saveMutation = useSaveProfile();
  const submitPayment = useSubmitPaymentRequest();
  const backendUser = (allPhoneUsers as any[]).find(
    (u) => u.phone === currentUser?.phone,
  );
  const walletBalance = backendUser
    ? Number(backendUser.walletBalance)
    : getLocalWalletBalance();
  const backendWinningCash = backendUser ? Number(backendUser.winningCash) : 0;

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [savedAvatarId, setSavedAvatarId] = useState<number>(getSavedAvatar);
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<number>(getSavedAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPlayerInfo, setShowPlayerInfo] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositDone, setDepositDone] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [fairPlayOpen, setFairPlayOpen] = useState(false);

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

  // Match history
  const JOINED_KEY = `srff_joined_matches_${userKey}`;
  const joinedMatches: Array<{
    id: string;
    title: string;
    gameMode: string;
    entryFee: number;
    prizePool: number;
    joinedAt: string;
    winningAmount: number;
  }> = (() => {
    try {
      return JSON.parse(localStorage.getItem(JOINED_KEY) || "[]");
    } catch {
      return [];
    }
  })();
  const enrichedMatches = joinedMatches.map((m) => {
    const winReq = myRequests?.find(
      (r) =>
        "deposit" in r.requestType &&
        "accepted" in r.status &&
        r.note?.includes(m.id),
    );
    return {
      ...m,
      winningAmount: winReq ? Number(winReq.amount) : m.winningAmount,
    };
  });

  // Notification read tracking
  const NOTIF_READ_KEY = `srff_notif_read_${userKey}`;
  const readIds: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || "[]");
    } catch {
      return [];
    }
  })();
  const unreadCount = notifications.filter(
    (n) => !readIds.includes(n.id?.toString() ?? ""),
  ).length;
  const markAllRead = () => {
    const ids = notifications.map((n) => n.id?.toString() ?? "");
    localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(ids));
  };

  // Reactive localStorage state for admin-editable policy texts
  const [privacyText, setPrivacyText] = useState(
    () => localStorage.getItem("srff_privacy_policy") || "",
  );
  const [termsText, setTermsText] = useState(
    () => localStorage.getItem("srff_terms_conditions") || "",
  );
  const [refundText, setRefundText] = useState(
    () => localStorage.getItem("srff_refund_policy") || "",
  );
  const [contactText, setContactText] = useState(
    () => localStorage.getItem(CONTACT_US_KEY) || "",
  );
  const [fairPlayText, setFairPlayText] = useState(
    () => localStorage.getItem(FAIR_PLAY_KEY) || "",
  );
  const [gameRulesText, setGameRulesText] = useState(
    () => localStorage.getItem(GAME_RULES_KEY) || "",
  );
  const [referEarnText, setReferEarnText] = useState(
    () => localStorage.getItem("srff_refer_earn") || "",
  );

  // Listen for admin localStorage changes and sync instantly
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "srff_privacy_policy") setPrivacyText(e.newValue || "");
      if (e.key === "srff_terms_conditions") setTermsText(e.newValue || "");
      if (e.key === "srff_refund_policy") setRefundText(e.newValue || "");
      if (e.key === CONTACT_US_KEY) setContactText(e.newValue || "");
      if (e.key === FAIR_PLAY_KEY) setFairPlayText(e.newValue || "");
      if (e.key === GAME_RULES_KEY) setGameRulesText(e.newValue || "");
      if (e.key === "srff_refer_earn") setReferEarnText(e.newValue || "");
    };
    // Also poll every 2s to catch same-tab admin changes
    const interval = setInterval(() => {
      setPrivacyText(localStorage.getItem("srff_privacy_policy") || "");
      setTermsText(localStorage.getItem("srff_terms_conditions") || "");
      setRefundText(localStorage.getItem("srff_refund_policy") || "");
      setContactText(localStorage.getItem(CONTACT_US_KEY) || "");
      setFairPlayText(localStorage.getItem(FAIR_PLAY_KEY) || "");
      setGameRulesText(localStorage.getItem(GAME_RULES_KEY) || "");
      setReferEarnText(localStorage.getItem("srff_refer_earn") || "");
    }, 2000);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Local-only policy fields from localStorage (set by admin)
  const gameRules = gameRulesText;

  const currentAvatar = AVATARS.find((a) => a.id === savedAvatarId) ?? null;
  const minDeposit =
    settings?.minDeposit !== undefined
      ? Number(settings.minDeposit)
      : getMinDeposit();
  const upiId = getLocalString(UPI_ID_KEY) || "sk190rihan@mvhdfc";
  const bankAccount = getLocalString(BANK_ACCOUNT_KEY) || "7477661867";
  const bankHolder = getLocalString(BANK_HOLDER_KEY) || "SK SAHIL";
  const bankName = getLocalString(BANK_NAME_KEY) || "Airtel Payment Bank";

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveMutation.mutateAsync({ ...profile, username, ffUid });
      toast.success("Profile saved!");
      setEditing(false);
      setShowPlayerInfo(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleClearInfo = async () => {
    if (!profile) return;
    try {
      await saveMutation.mutateAsync({
        ...profile,
        username: profile.username ?? "",
        ffUid: "",
      });
      setFfUid("");
      toast.success("Player info cleared!");
      setEditing(false);
      setShowPlayerInfo(false);
    } catch {
      toast.error("Failed to clear info");
    }
  };

  const handleSetAvatar = () => {
    localStorage.setItem(AVATAR_KEY, String(selectedAvatarId));
    setSavedAvatarId(selectedAvatarId);
    setShowAvatarPicker(false);
    setShowPlayerInfo(false);
    setEditing(false);
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
    if (amt <= 0 || (minDeposit > 0 && amt < minDeposit)) {
      const msg =
        minDeposit > 0
          ? `Minimum deposit ₹${minDeposit} hai`
          : "Valid amount daalo";
      toast.error(msg);
      return;
    }
    if (!depositNote.trim()) {
      toast.error("UTR / Transaction ID daalo");
      return;
    }
    if (
      depositNote.trim().length !== 12 ||
      !/^\d{12}$/.test(depositNote.trim())
    ) {
      toast.error("UTR exactly 12 digit ka hona chahiye");
      return;
    }
    submitPayment.mutate(
      {
        amount: amt,
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
    const min = settings?.minWithdraw ? Number(settings.minWithdraw) : 100;
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
        amount: amt,
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
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Avatar Display */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary">
              {currentAvatar ? (
                <AvatarImage
                  src={currentAvatar.image}
                  alt={currentAvatar.label}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                {currentUser.username?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => {
                const next = !showAvatarPicker;
                setSelectedAvatarId(savedAvatarId);
                setShowAvatarPicker(next);
                setShowPlayerInfo(next);
                if (next) {
                  setUsername(profile?.username ?? "");
                  setFfUid(profile?.ffUid ?? "");
                  setEditing(true);
                } else {
                  setEditing(false);
                }
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
                  <div className="w-11 h-11 rounded-full overflow-hidden">
                    <img
                      src={av.image}
                      alt={av.label}
                      className="w-full h-full object-cover"
                    />
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

        {/* Player Info Panel (shown when pencil is clicked) */}
        {showPlayerInfo && (
          <div
            className="bg-card border border-border rounded-2xl p-4 space-y-4"
            data-ocid="profile.playerinfo.panel"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">
                Player Info
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearInfo}
                  disabled={saveMutation.isPending}
                  className="text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                  data-ocid="profile.clear-info.button"
                >
                  Clear Info
                </Button>
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
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Username
                </Label>
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
        )}

        {/* Wallet + Deposit/Withdraw */}
        <div className="space-y-3">
          {/* Regular Balance Card */}
          <div className="bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 rounded-2xl p-4 glow-orange">
            <p className="text-sm text-primary/80 font-medium">
              Regular Balance
            </p>
            <div className="mt-1">
              <span className="font-display font-bold text-3xl text-foreground">
                ₹{Math.max(0, walletBalance - winningCash)}
              </span>
              <p className="text-xs text-primary/60 mt-1">
                Tournament join karne ke liye use hota hai
              </p>
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
                ₹{Math.max(winningCash, backendWinningCash)}
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
                          Aapke paas abhi koi Winning Cash nahi hai. Tournament
                          jeeto to automatically credit hoga!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                          <p className="text-xs text-green-400 font-semibold">
                            Available Winning Cash: ₹
                            {Math.max(winningCash, backendWinningCash)}
                          </p>
                        </div>
                        <div>
                          <Label>Amount (₹) — Min: ₹50</Label>
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
                    {/* Payment Details — always visible */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Step 1: Neeche diye account par payment karo
                      </p>
                      {/* UPI ID */}
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            UPI ID
                          </p>
                          <p className="font-mono font-bold text-orange-400 text-sm break-all">
                            {upiId}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="shrink-0 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                          onClick={() => {
                            navigator.clipboard.writeText(upiId);
                            toast.success("UPI ID copy ho gaya!");
                          }}
                          data-ocid="profile.deposit.copy_upi.button"
                        >
                          Copy
                        </Button>
                      </div>
                      {/* Bank Account */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Bank Account Number
                            </p>
                            <p className="font-mono font-bold text-blue-400 text-sm">
                              {bankAccount}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="shrink-0 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => {
                              navigator.clipboard.writeText(bankAccount);
                              toast.success("Account number copy ho gaya!");
                            }}
                            data-ocid="profile.deposit.copy_bank.button"
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Name:{" "}
                            <span className="text-foreground font-semibold">
                              {bankHolder}
                            </span>
                          </span>
                          <span>
                            Bank:{" "}
                            <span className="text-foreground font-semibold">
                              {bankName}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Step 2: UTR / Transaction ID (12 digit)</Label>
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

        {/* Profile Menu Buttons — all same accordion style as Rules */}
        <div className="space-y-2">
          {/* 1. Notifications */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => {
                setNotifOpen((v) => !v);
                if (!notifOpen) markAllRead();
              }}
              data-ocid="profile.notifications.toggle"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-400" />
                <span className="font-display font-semibold text-sm">
                  🔔 Notifications
                </span>
                {unreadCount > 0 && !notifOpen && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {notifOpen && (
              <div className="px-4 pb-4 space-y-2">
                {notifications.length === 0 ? (
                  <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground text-center">
                    🔕 Koi Notification Nahi Hai
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id?.toString() ?? n.title + n.timestamp}
                      className="bg-background/60 rounded-xl p-3"
                    >
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 2. Life Time Match History */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setMatchHistoryOpen((v) => !v)}
              data-ocid="profile.match-history.toggle"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="font-display font-semibold text-sm">
                  🏆 Life Time Match History
                </span>
              </div>
              {matchHistoryOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {matchHistoryOpen && (
              <div className="px-4 pb-4">
                {enrichedMatches.length === 0 ? (
                  <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground text-center">
                    Abhi tak koi match nahi khela. Tournament join karo!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrichedMatches.map((m, i) => (
                      <div
                        key={m.id}
                        className="bg-background/60 rounded-xl p-3 flex items-center justify-between gap-2"
                        data-ocid={`profile.match-history.item.${i + 1}`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{m.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.gameMode} • Entry: ₹{m.entryFee}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(m.joinedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          {m.winningAmount > 0 ? (
                            <span className="flex items-center gap-1 text-green-400 font-bold text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              +₹{m.winningAmount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No win
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Refer & Earn */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setReferOpen((v) => !v)}
              data-ocid="profile.refer.toggle"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="font-display font-semibold text-sm">
                  🎁 Refer & Earn
                </span>
              </div>
              {referOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {referOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 space-y-3">
                  {referEarnText ? (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {referEarnText}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-amber-400 font-semibold">
                        🎁 Refer & Earn kaise kaam karta hai:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Apna referral code apne dosto ko bhejo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Jab friend register kare, apna referral code daale
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Aapko bonus wallet mein milega!
                      </p>
                    </>
                  )}
                  {profile?.referralCode ? (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Aapka Referral Code:
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-primary text-sm flex-1 bg-black/30 px-2 py-1 rounded">
                          {profile.referralCode}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={copyReferral}
                          data-ocid="profile.refer.copy_button"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share link: {window.location.origin}/register?ref=
                        {profile.referralCode}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* 4. Contact Us */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setContactOpen((v) => !v)}
              data-ocid="profile.contact.toggle"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span className="font-display font-semibold text-sm">
                  📞 Contact Us
                </span>
              </div>
              {contactOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {contactOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {contactText ||
                    `📞 WhatsApp: 9104414372
📧 Gmail: Sk190rihan@gmail.com

Hame kisi bhi tournament ya payment issue ke liye contact karein.
WhatsApp par message karein ya Gmail par email karein.
Hum aapki help karne ke liye ready hain! 🙏`}
                </div>
              </div>
            )}
          </div>

          {/* 5. Privacy Policy */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setPrivacyOpen((v) => !v)}
              data-ocid="profile.privacy.toggle"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="font-display font-semibold text-sm">
                  🔒 Privacy Policy
                </span>
              </div>
              {privacyOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {privacyOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {privacyText ||
                    settings?.privacyPolicy ||
                    `🔒 PRIVACY POLICY - SR-FF-TOURNAMENT

1. DATA COLLECTION: Hum aapka mobile number, username, aur Free Fire name collect karte hain taaki aap app use kar sakein.

2. DATA SECURITY: Aapka data secure servers par store hota hai. Hum kabhi bhi aapka data third parties ko nahi dete.

3. WALLET DATA: Aapka wallet balance aur transactions securely store hote hain. Admin ke alawa koi bhi aapka balance access nahi kar sakta.

4. TOURNAMENT DATA: Tournament participation data aur match history aapki profile mein store hoti hai.

5. NO SHARING: Hum aapki personal information kisi bhi third party ko nahi dete - na ads ke liye, na kisi aur ke liye.

6. ACCOUNT SECURITY: Aapka password encrypted hai. Apna password kisi ke saath share na karein.

7. COOKIES: App better experience ke liye local storage use karta hai.

8. CONTACT: Privacy related kisi bhi sawaal ke liye: Sk190rihan@gmail.com`}
                </div>
              </div>
            )}
          </div>

          {/* 6. Terms and Conditions */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setTermsOpen((v) => !v)}
              data-ocid="profile.terms.toggle"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                <span className="font-display font-semibold text-sm">
                  📄 Terms and Conditions
                </span>
              </div>
              {termsOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {termsOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {termsText ||
                    settings?.termsAndConditions ||
                    `📄 TERMS AND CONDITIONS - SR-FF-TOURNAMENT

1. ELIGIBILITY: Yeh app sirf 18+ users ke liye hai. Account banana means aap in terms se agree karte hain.

2. ONE ACCOUNT: Ek mobile number se sirf ek account ban sakta hai. Duplicate accounts ban ho jaayenge.

3. TOURNAMENT RULES: Tournament join karne ke baad entry fee refund nahi hogi (refund policy dekhein).

4. FAIR PLAY: Cheating, hacking, ya unfair means use karne par account permanently ban ho jaayega.

5. WALLET: Wallet balance real money hai. Withdrawal sirf verified accounts ke liye available hai.

6. WINNING: Admin tournament results verify karega. Winning amount admin set karega aur automatically wallet mein credit hoga.

7. DISPUTES: Kisi bhi dispute ke liye admin se contact karein. Admin ka decision final hoga.

8. CHANGES: SR TECHNOLOGY PVT LTD in terms ko kabhi bhi change kar sakta hai. Continued use means acceptance.

9. CONTACT: Sk190rihan@gmail.com | WhatsApp: 9104414372`}
                </div>
              </div>
            )}
          </div>

          {/* 7. Refund and Cancellation */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setRefundOpen((v) => !v)}
              data-ocid="profile.refund.toggle"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-400" />
                <span className="font-display font-semibold text-sm">
                  ↩️ Refund and Cancellation
                </span>
              </div>
              {refundOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {refundOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {refundText ||
                    settings?.refundPolicy ||
                    `↩️ REFUND AND CANCELLATION POLICY

📌 Entry Fee Refund:
• Agar aap tournament join karne ke baad match cancel ho jaata hai (admin ki taraf se), to aapki poori entry fee wallet mein wapas aa jaayegi.
• Agar aapne tournament join kiya lekin khela nahi, to entry fee refund nahi hogi.

📌 Deposit Refund:
• Galat transaction hone par 24 ghante ke andar admin se contact karo.
• Verified UTR se deposit confirm hoga. Galat UTR submit karne par refund nahi hoga.
• Duplicate deposit (ek hi UTR do baar) ka paisa refund kiya jaayega.

📌 Withdrawal:
• Sirf Winning Cash withdraw ho sakta hai — regular balance nahi.
• Withdrawal ₹100 minimum se hoga.
• Processing time: 24-48 ghante (working days).
• Wrong bank details dene par responsibility aapki hogi.

📌 Cancellation:
• Tournament join karne ke baad cancel karna allowed nahi hai.
• Agar technical issue ho to admin se WhatsApp par contact karo.

📞 Support: WhatsApp ya Contact Us section mein jaao.`}
                </div>
              </div>
            )}
          </div>

          {/* 8. Fair Play Policy */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setFairPlayOpen((v) => !v)}
              data-ocid="profile.fairplay.toggle"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-display font-semibold text-sm">
                  ⚖️ Fair Play Policy
                </span>
              </div>
              {fairPlayOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {fairPlayOpen && (
              <div className="px-4 pb-4">
                <div className="bg-background/60 rounded-xl p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {fairPlayText ||
                    `⚖️ FAIR PLAY POLICY

SR-FF-TOURNAMENT ek fair aur honest gaming platform hai. Yahan sab players ke liye equal opportunity hai.

✅ Allowed:
• Legal Free Fire account se tournament mein participate karna.
• Apne genuine skill se game khel kar winning earn karna.
• Ek mobile number se ek account banana.

❌ Strictly Prohibited:
• Hacking, cheating ya any third-party tool/mod use karna.
• Account sharing — ek account multiple logo ke saath use karna.
• Fake screenshot ya manipulated proof submit karna.
• Multiple accounts banana ek hi player ke liye.
• Result manipulation ya fix karna.
• Abusive/offensive language use karna.

⚠️ Violation ka Result:
• 1st violation: Warning + match disqualify.
• 2nd violation: Account permanent ban + winning forfeit.
• Serious cheating: Legal action bhi ho sakta hai.

🏆 Fair play se hi asli winning milti hai. Khelo honestly, jito proudly!

📞 Koi shikayat ho to admin se contact karo.`}
                </div>
              </div>
            )}
          </div>

          {/* 9. Rules */}
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
                  {gameRules ||
                    `📜 SR-FF-TOURNAMENT — GAME RULES

🎮 TOURNAMENT RULES:

1️⃣ Registration:
• Sirf registered members tournament join kar sakte hain.
• Entry fee wallet se auto-deduct hogi join karne par.
• Join karne ke baad cancel nahi hoga.

2️⃣ Room Details:
• Room ID aur Password tournament start se 15 min pehle diya jaayega.
• Apna Free Fire naam aur UID verify karein — same hona chahiye.
• Late join allow nahi hoga Room ID share hone ke baad.

3️⃣ Game Play:
• Solo, Duo ya Squad — jo mode selected ho usi mein play karo.
• Cheating/hacking = immediate disqualification + ban.
• Intentional team killing = disqualification.
• AFK (Away From Keyboard) play nahi chalega.

4️⃣ Results:
• Results admin verify karega kills aur placement ke basis par.
• Winner screenshot submit karna hoga (agar required ho).
• Result announcement ke baad koi change nahi hoga.

5️⃣ Winning:
• Winning amount Winning Cash wallet mein credit hoga.
• Winning Cash se withdrawal kar sakte hain.
• Dispute hone par admin ka decision final hoga.

6️⃣ Conduct:
• Respectful behavior mandatory hai — sab players ke saath.
• Koi abusive language nahi.
• Admin ke instructions follow karna zaroori hai.

7️⃣ Technical Issues:
• Server issue hone par match reschedule ya cancel ho sakta hai.
• Apne device/internet ki problem par refund nahi hoga.

🏆 Khelo fair, jito bada — Good Luck! 🔥`}
                </div>
              </div>
            )}
          </div>

          {/* 10. Logout — standalone red button at very bottom */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-display font-semibold text-sm hover:bg-red-500/20 transition-colors"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            data-ocid="profile.logout.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

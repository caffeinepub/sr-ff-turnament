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
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  Clock,
  Coins,
  Gift,
  Loader2,
  LogIn,
  MessageCircle,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { PaymentRequest } from "../hooks/useQueries";
import {
  useCallerProfile,
  useMyPaymentRequests,
  useSettings,
  useSubmitPaymentRequest,
} from "../hooks/useQueries";

const WHATSAPP_NUMBER = "919104414372";
const WHATSAPP_DISPLAY = "9104414372";

const EARNING_TIPS = [
  "Win tournaments to earn prize money",
  "Refer friends to earn bonus credits",
  "Participate in daily free matches",
  "Top the leaderboard for weekly rewards",
];

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

export default function Earn() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: settings } = useSettings();
  const { data: myRequests } = useMyPaymentRequests();
  const submitPayment = useSubmitPaymentRequest();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositDone, setDepositDone] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleDepositSubmit = () => {
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalo");
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
      toast.error(`Minimum withdrawal ₹${min} hai`);
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

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <Coins className="w-16 h-16 text-primary/30" />
        <div className="text-center">
          <h2 className="font-display font-bold text-xl">Earn &amp; Wallet</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Login to manage your wallet
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="glow-orange"
          data-ocid="earn.login.button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display font-bold text-lg">Earn &amp; Wallet</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 rounded-2xl p-5 glow-orange">
          <p className="text-sm text-primary/80 font-medium">Total Balance</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-display font-bold text-4xl text-foreground">
              ₹{profile ? Number(profile.walletBalance) : 0}
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            {/* Deposit Dialog */}
            <Dialog
              open={depositOpen}
              onOpenChange={(open) => {
                setDepositOpen(open);
                if (!open) resetDeposit();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex-1 gap-2"
                  data-ocid="earn.deposit.button"
                >
                  <ArrowDownToLine className="w-4 h-4" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="earn.deposit.dialog">
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                </DialogHeader>
                {depositDone ? (
                  <div
                    className="flex flex-col items-center gap-4 py-6 text-center"
                    data-ocid="earn.deposit.success_state"
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
                      variant="outline"
                      onClick={() => setDepositOpen(false)}
                      data-ocid="earn.deposit.close_button"
                    >
                      Theek Hai
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Kitna deposit karna hai?"
                        type="number"
                        className="mt-1"
                        data-ocid="earn.deposit.input"
                      />
                    </div>

                    {/* WhatsApp Section */}
                    {depositAmount && Number(depositAmount) > 0 && (
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
                            data-ocid="earn.deposit.whatsapp.button"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp per Message Karo
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
                        data-ocid="earn.deposit.utr.input"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment bhejne ke baad transaction ID yahan daalo
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleDepositSubmit}
                      disabled={submitPayment.isPending}
                      data-ocid="earn.deposit.submit_button"
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

            {/* Withdraw Dialog */}
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-border"
                  data-ocid="earn.withdraw.button"
                >
                  <ArrowUpFromLine className="w-4 h-4" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="earn.withdraw.dialog">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
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
                      data-ocid="earn.withdraw.input"
                    />
                  </div>
                  <div>
                    <Label>Aapka UPI ID</Label>
                    <Input
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value)}
                      placeholder="yourname@upi"
                      className="mt-1"
                      data-ocid="earn.withdraw.upi.input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin is UPI ID pe payment karega
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleWithdrawSubmit}
                    disabled={submitPayment.isPending}
                    data-ocid="earn.withdraw.submit_button"
                  >
                    {submitPayment.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Withdrawal Request Bhejo
                  </Button>
                </div>
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
                  data-ocid={`earn.requests.item.${i + 1}`}
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
                        ₹{Number(req.amount)}
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

        {/* Referral Bonus */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">
              Referral Bonus
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Earn{" "}
            <span className="text-warning font-bold">
              ₹{settings ? Number(settings.referralBonus) : 50}
            </span>{" "}
            for each friend you refer!
          </p>
          {profile?.referralCode && (
            <div className="mt-3 bg-background border border-border rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Your referral code
              </p>
              <p className="font-mono font-bold tracking-widest text-primary">
                {profile.referralCode}
              </p>
            </div>
          )}
        </div>

        {/* Earning Tips */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-display font-semibold text-sm">Earning Tips</h3>
          </div>
          <ul className="space-y-2">
            {EARNING_TIPS.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-primary mt-0.5">●</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support WhatsApp */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <h3 className="font-display font-semibold text-sm text-green-400">
              Customer Support
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Koi problem hai? Hamare WhatsApp pe message karo:
          </p>
          <div className="bg-background/60 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-muted-foreground">WhatsApp Number</p>
            <p className="font-mono font-bold text-green-400 text-lg">
              {WHATSAPP_DISPLAY}
            </p>
          </div>
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              data-ocid="earn.support.whatsapp.button"
            >
              <MessageCircle className="w-4 h-4" />
              Support ke liye WhatsApp Karo
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

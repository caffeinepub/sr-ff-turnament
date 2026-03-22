import { Button } from "@/components/ui/button";
import { Gift, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import { useCallerProfile, useSettings } from "../hooks/useQueries";

const EARNING_TIPS = [
  "Win tournaments to earn prize money",
  "Refer friends to earn bonus credits",
  "Participate in daily free matches",
  "Top the leaderboard for weekly rewards",
];

interface ReferralRecord {
  referredUsername: string;
  referredPhone: string;
  rewardAmount: number;
  date: string;
}

export default function Earn() {
  const { currentUser } = useUserAuth();
  const { data: profile } = useCallerProfile();
  const { data: settings } = useSettings();

  const referralHistory: ReferralRecord[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("srff_referral_history") ?? "[]");
    } catch {
      return [];
    }
  })();

  const copyReferral = () => {
    if (profile?.referralCode) {
      const shareLink = `${window.location.origin}/register?ref=${profile.referralCode}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Referral link copy ho gaya! Share karo dosto ke saath");
    }
  };

  const shareLink = profile?.referralCode
    ? `${window.location.origin}/register?ref=${profile.referralCode}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display font-bold text-lg">Refer &amp; Earn</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Referral Bonus Card */}
        <div className="bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 rounded-2xl p-5 glow-orange">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg">Referral Bonus</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Apne dost ko refer karo aur{" "}
            <span className="text-warning font-bold">
              ₹{settings ? Number(settings.referralBonus) : 50}
            </span>{" "}
            bonus kamao har refer pe!
          </p>
          {currentUser && profile?.referralCode && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Tera referral link:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background/60 border border-border rounded-lg px-3 py-2 text-xs font-mono text-primary font-bold truncate">
                  {shareLink.length > 40
                    ? `${shareLink.slice(0, 40)}…`
                    : shareLink}
                </code>
                <Button
                  onClick={copyReferral}
                  className="gap-2 shrink-0"
                  data-ocid="earn.referral-copy.button"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Referral History */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">
              📋 Referral History
            </h3>
          </div>
          {referralHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Ab tak koi successful referral nahi hua. Apna referral code share
              karo!
            </p>
          ) : (
            <ul className="space-y-3">
              {referralHistory.map((rec) => (
                <li
                  key={`${rec.referredPhone}-${rec.date}`}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {rec.referredUsername?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {rec.referredUsername}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rec.referredPhone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">
                      +₹{rec.rewardAmount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rec.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
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
      </div>
    </div>
  );
}

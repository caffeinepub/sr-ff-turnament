import { Button } from "@/components/ui/button";
import { Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import { useCallerProfile, useSettings } from "../hooks/useQueries";

const EARNING_TIPS = [
  "Win tournaments to earn prize money",
  "Refer friends to earn bonus credits",
  "Participate in daily free matches",
  "Top the leaderboard for weekly rewards",
];

export default function Earn() {
  const { currentUser } = useUserAuth();
  const { data: profile } = useCallerProfile();
  const { data: settings } = useSettings();

  const copyReferral = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      toast.success("Referral code copied!");
    }
  };

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
                Tera referral code:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background/60 border border-border rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-primary font-bold">
                  {profile.referralCode}
                </code>
                <Button
                  onClick={copyReferral}
                  className="gap-2"
                  data-ocid="earn.referral-copy.button"
                >
                  Copy
                </Button>
              </div>
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
      </div>
    </div>
  );
}

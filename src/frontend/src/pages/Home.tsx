import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Coins,
  Flame,
  Megaphone,
  Shield,
  Star,
  Swords,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllTournaments, useCallerProfile } from "../hooks/useQueries";
import type { PromoBanner } from "./admin/AdminBanners";

const GAME_MODES = [
  { name: "BR Per Kill", cls: "game-card-1", emoji: "🎯" },
  { name: "BR Solo", cls: "game-card-2", emoji: "🛡️" },
  { name: "BR Squad", cls: "game-card-3", emoji: "🔥" },
  { name: "Clash Squad 1v1", cls: "game-card-4", emoji: "⚔️" },
  { name: "Clash Squad 4v4", cls: "game-card-5", emoji: "⚡" },
  { name: "Lone Wolf 1v1", cls: "game-card-6", emoji: "⭐" },
  { name: "Lone Wolf 2v2", cls: "game-card-7", emoji: "🏆" },
  { name: "Free Match", cls: "game-card-8", emoji: "🎮" },
  { name: "Sunday Special", cls: "game-card-9", emoji: "🌟" },
];

const _icons = { Shield, Star, Swords, Target, Zap };
void _icons;

function loadPromoBanners(): PromoBanner[] {
  try {
    const data = JSON.parse(localStorage.getItem("srff_promo_banners") || "[]");
    return (data as PromoBanner[]).filter((b) => b.active);
  } catch {
    return [];
  }
}

export default function Home() {
  const [contestTab, setContestTab] = useState("ongoing");
  const { data: tournaments = [] } = useAllTournaments();
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const [bannerIdx, setBannerIdx] = useState(0);

  const promoBanners = loadPromoBanners();
  const activeBanner = promoBanners[bannerIdx] ?? null;

  const filtered = tournaments.filter((t) => {
    if (contestTab === "ongoing") return t.status === "ongoing";
    if (contestTab === "upcoming") return t.status === "upcoming";
    return t.status === "complete";
  });

  const announcement =
    "🔥 Welcome to SR-FF-TOURNAMENT! Join now and win big prizes! New Free Fire tournaments added daily! 🏆 Top players get exclusive rewards! 🎯 BR Per Kill tournament starting soon!";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">
              SR-FF
            </span>
            <Badge
              variant="outline"
              className="text-xs border-primary/40 text-primary hidden sm:flex"
            >
              TOURNAMENT
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1">
              <Coins className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold text-warning">
                {profile ? Number(profile.walletBalance) : 0}
              </span>
            </div>
            <button
              type="button"
              className="relative p-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors"
              data-ocid="home.notifications.button"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            {!identity && (
              <button
                type="button"
                onClick={login}
                className="text-xs bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-full transition-colors"
                data-ocid="home.login.button"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-5 py-4">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 overflow-hidden">
          <Megaphone className="w-4 h-4 text-primary shrink-0" />
          <div className="overflow-hidden flex-1">
            <p className="animate-ticker text-sm text-primary font-medium">
              {announcement}
            </p>
          </div>
        </div>

        {/* Promotion Banner from Admin */}
        {activeBanner ? (
          <div
            className="relative rounded-2xl overflow-hidden glow-fire"
            data-ocid="home.promo-banner.panel"
          >
            {activeBanner.imageUrl ? (
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-r from-primary/40 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent flex items-center">
              <div className="p-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Promotion
                </p>
                <h2 className="font-display font-bold text-xl text-foreground leading-tight">
                  {activeBanner.title}
                </h2>
                {activeBanner.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeBanner.subtitle}
                  </p>
                )}
                {activeBanner.buttonText && activeBanner.buttonLink && (
                  <a
                    href={activeBanner.buttonLink}
                    target={
                      activeBanner.buttonLink.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    data-ocid="home.promo-banner.button"
                  >
                    {activeBanner.buttonText}{" "}
                    <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            {promoBanners.length > 1 && (
              <div className="absolute bottom-2 right-3 flex gap-1">
                {promoBanners.map((pb) => (
                  <button
                    key={pb.id}
                    type="button"
                    onClick={() => setBannerIdx(promoBanners.indexOf(pb))}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      pb.id === activeBanner.id ? "bg-primary" : "bg-white/40"
                    }`}
                    data-ocid={`home.promo-banner-dot.${promoBanners.indexOf(pb) + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden glow-fire">
            <img
              src="/assets/generated/ff-tournament-banner.dim_800x300.jpg"
              alt="Free Fire Tournament"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent flex items-center">
              <div className="p-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Live Now
                </p>
                <h2 className="font-display font-bold text-xl text-foreground leading-tight">
                  SR-FF Grand
                  <br />
                  Tournament
                </h2>
                <Link
                  to="/tournaments"
                  className="mt-2 inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                  data-ocid="home.play-now.button"
                >
                  Play Now <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">My Contest</h3>
            <Link
              to="/tournaments"
              className="text-xs text-primary"
              data-ocid="home.all-contests.link"
            >
              View All
            </Link>
          </div>
          <Tabs value={contestTab} onValueChange={setContestTab}>
            <TabsList className="w-full bg-card border border-border">
              <TabsTrigger
                value="ongoing"
                className="flex-1 text-xs"
                data-ocid="home.ongoing.tab"
              >
                Ongoing
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="flex-1 text-xs"
                data-ocid="home.upcoming.tab"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                className="flex-1 text-xs"
                data-ocid="home.complete.tab"
              >
                Complete
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-3 space-y-3">
            {filtered.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="contest.empty_state"
              >
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No {contestTab} tournaments</p>
              </div>
            ) : (
              filtered.slice(0, 3).map((t, i) => (
                <Link
                  key={t.id.toString()}
                  to="/tournament/$id"
                  params={{ id: t.id.toString() }}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/50 transition-colors"
                  data-ocid={`contest.item.${i + 1}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.gameMode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-warning font-semibold">
                      ₹{Number(t.prizePool)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(t.playerCount)}/{Number(t.maxPlayers)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="pb-2">
          <h3 className="font-display font-bold text-base mb-3">
            🔥 Free Fire Modes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {GAME_MODES.map((mode, i) => (
              <Link
                key={mode.name}
                to="/tournaments"
                className={`${mode.cls} rounded-xl aspect-square flex flex-col items-center justify-center gap-1 border border-white/10 hover:border-primary/50 hover:scale-105 transition-all`}
                data-ocid={`game-mode.item.${i + 1}`}
              >
                <span className="text-2xl">{mode.emoji}</span>
                <span className="text-[10px] font-semibold text-white/90 text-center px-1 leading-tight">
                  {mode.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="text-center py-4 px-4 border-t border-border mt-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

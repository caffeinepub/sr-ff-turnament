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
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAllTournaments, useCallerProfile } from "../hooks/useQueries";
import type { PromoBanner } from "./admin/AdminBanners";
import type { PromoLink } from "./admin/AdminHomeContent";

const GAME_MODES = [
  { name: "BR Per Kill", cls: "game-card-1" },
  { name: "BR Solo", cls: "game-card-2" },
  { name: "BR Squad", cls: "game-card-3" },
  { name: "Clash Squad 1v1", cls: "game-card-4" },
  { name: "Clash Squad 4v4", cls: "game-card-5" },
  { name: "Lone Wolf 1v1", cls: "game-card-6" },
  { name: "Lone Wolf 2v2", cls: "game-card-7" },
  { name: "Free Match", cls: "game-card-8" },
  { name: "Sunday Special", cls: "game-card-9" },
];

const _icons = { Shield, Star, Swords, Target, Zap };
void _icons;

const DEFAULT_ANNOUNCEMENT =
  "Welcome to SR-FF-TOURNAMENT! Join now and win big prizes! New Free Fire tournaments added daily! Top players get exclusive rewards! BR Per Kill tournament starting soon!";

function loadAnnouncement(): string {
  return localStorage.getItem("srff_announcement") ?? DEFAULT_ANNOUNCEMENT;
}

function loadPromoLinks(): PromoLink[] {
  try {
    const data = JSON.parse(
      localStorage.getItem("srff_promo_links") ?? "[]",
    ) as PromoLink[];
    return data.filter((p) => p.active);
  } catch {
    return [];
  }
}

function loadPromoBanners(): PromoBanner[] {
  try {
    const data = JSON.parse(localStorage.getItem("srff_promo_banners") || "[]");
    return (data as PromoBanner[]).filter((b) => b.active);
  } catch {
    return [];
  }
}

// Gradients for welcome lines (cycles if more lines added)
const NEW_WELCOME_GRADIENTS = [
  "linear-gradient(90deg, #f97316, #fbbf24)",
  "linear-gradient(90deg, #f43f5e, #fb923c)",
  "linear-gradient(90deg, #22d3ee, #6366f1)",
  "linear-gradient(90deg, #a3e635, #16a34a)",
  "linear-gradient(90deg, #facc15, #f97316)",
  "linear-gradient(90deg, #c084fc, #818cf8)",
  "linear-gradient(90deg, #f43f5e, #a855f7, #3b82f6)",
];

const BACK_WELCOME_GRADIENTS = [
  "linear-gradient(90deg, #f97316, #fbbf24, #f59e0b)",
  "linear-gradient(90deg, #22d3ee, #6366f1, #a855f7)",
  "linear-gradient(90deg, #a3e635, #16a34a, #10b981)",
  "linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24)",
  "linear-gradient(90deg, #fbbf24, #f97316, #ef4444)",
];

const DEFAULT_NEW_WELCOME_TEXTS = [
  "🎮 Welcome to SR-FF-TOURNAMENT! 🎮",
  "🇮🇳 India ka #1 Free Fire Tournament Platform 🔥",
  "💰 Ab compete karo aur jeeto REAL CASH prizes! 💰",
  "🏆 Roz naye tournaments join karo... 🏆",
  "⚡ Top players ko milte hain EXCLUSIVE rewards! ⚡",
  "🤝 Apni team banao. Apna naam banao. 👑",
  "💥 The Battle Begins NOW! 🚀",
];

const DEFAULT_BACK_WELCOME_TEXTS = [
  "🌟 WELCOME BACK TO OUR PLATFORM! 🌟",
  "☀️ WISH YOU A VERY GOOD DAY! ☀️",
  "🍀 BEST OF LUCK, CHAMPION! 🍀",
  "🔥 Go Dominate The Battlefield! 🔥",
  "🏆 Today Is YOUR Victory Day! 🏆",
];

function loadWelcomeLines(
  key: string,
  defaults: string[],
  gradients: string[],
): { text: string; gradient: string }[] {
  try {
    const raw = localStorage.getItem(key);
    const texts: string[] = raw ? (JSON.parse(raw) as string[]) : defaults;
    return texts.map((text, i) => ({
      text,
      gradient: gradients[i % gradients.length],
    }));
  } catch {
    return defaults.map((text, i) => ({
      text,
      gradient: gradients[i % gradients.length],
    }));
  }
}

// Dynamic lines read from localStorage (admin-editable)
const WELCOME_LINES = loadWelcomeLines(
  "srff_new_welcome_lines",
  DEFAULT_NEW_WELCOME_TEXTS,
  NEW_WELCOME_GRADIENTS,
);

// Welcome BACK lines shown on every login/app open
const WELCOME_BACK_LINES = loadWelcomeLines(
  "srff_login_welcome_lines",
  DEFAULT_BACK_WELCOME_TEXTS,
  BACK_WELCOME_GRADIENTS,
);

function getModalSizeClass(): string {
  const size = localStorage.getItem("srff_modal_size") || "medium";
  const map: Record<string, string> = {
    small: "max-w-xs",
    medium: "max-w-sm",
    large: "max-w-md",
  };
  return map[size] || "max-w-sm";
}

function WelcomeModal({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const currentLine = WELCOME_LINES[lineIdx].text;
    if (charIdx < currentLine.length) {
      timerRef.current = setTimeout(() => {
        setDisplayed((prev) => prev + currentLine[charIdx]);
        setCharIdx((c) => c + 1);
      }, 38);
    } else {
      timerRef.current = setTimeout(() => {
        if (lineIdx < WELCOME_LINES.length - 1) {
          setLineIdx((l) => l + 1);
          setDisplayed("");
          setCharIdx(0);
        } else {
          setDone(true);
        }
      }, 900);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [charIdx, lineIdx, done]);

  const currentGradient = WELCOME_LINES[lineIdx].gradient;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      data-ocid="welcome.modal"
    >
      <div
        className={`relative w-full ${getModalSizeClass()} rounded-3xl p-6 text-center overflow-hidden`}
        style={{
          background:
            "linear-gradient(135deg, #0f0a1a 0%, #14091f 50%, #0a1020 100%)",
          border: "1.5px solid rgba(249,115,22,0.5)",
          boxShadow:
            "0 0 60px rgba(249,115,22,0.25), 0 0 120px rgba(139,92,246,0.15), inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ background: "rgba(249,115,22,0.12)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ background: "rgba(139,92,246,0.12)", animationDelay: "1s" }}
        />

        <div className="flex items-center justify-center mb-3 relative">
          <div
            className="absolute w-28 h-28 rounded-full animate-spin"
            style={{
              background:
                "conic-gradient(from 0deg, #f97316, #fbbf24, #a855f7, #3b82f6, #f97316)",
              padding: "2px",
              animationDuration: "4s",
            }}
          />
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: "3px solid #0f0a1a",
              boxShadow: "0 0 30px rgba(249,115,22,0.7)",
            }}
          >
            <img
              src="/assets/uploads/sr_ff_tournament_icon_512-1.png"
              alt="SR-FF Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex items-center justify-center mb-1">
          <span
            className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-0.5 rounded-full"
            style={{
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.4)",
              color: "#fbbf24",
            }}
          >
            🎉 New Player Registered
          </span>
        </div>

        <h2
          className="font-display font-black text-2xl mb-4 mt-1"
          style={{
            background:
              "linear-gradient(90deg, #f97316, #fbbf24, #a855f7, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            letterSpacing: "-0.02em",
          }}
        >
          {username ? `Welcome, ${username}! 👋` : "Welcome, Player! 👋"}
        </h2>

        <div
          className="rounded-2xl px-4 py-4 mb-5 min-h-[80px] flex items-center justify-center relative overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 transition-all duration-500"
            style={{ background: currentGradient }}
          />
          <p
            className="text-base font-bold leading-relaxed relative z-10"
            style={{
              background: currentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))",
            }}
          >
            {displayed}
            <span
              className="inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse rounded-full"
              style={{
                background: "#f97316",
                display: done ? "none" : "inline-block",
              }}
            />
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-5">
          {WELCOME_LINES.map((line, i) => (
            <div
              key={line.text}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === lineIdx ? "20px" : "7px",
                height: "7px",
                background:
                  i < lineIdx
                    ? "#22c55e"
                    : i === lineIdx
                      ? "#f97316"
                      : "rgba(255,255,255,0.15)",
                boxShadow:
                  i === lineIdx
                    ? "0 0 8px rgba(249,115,22,0.8)"
                    : i < lineIdx
                      ? "0 0 6px rgba(34,197,94,0.5)"
                      : "none",
              }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(90deg, #f97316, #fbbf24, #f97316)",
              backgroundSize: "200% 100%",
              color: "#0a0a0a",
              boxShadow: "0 0 25px rgba(249,115,22,0.5)",
              letterSpacing: "0.05em",
            }}
            data-ocid="welcome.start.button"
          >
            🚀 Chalte Hain!
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            data-ocid="welcome.close.button"
          >
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>

        <p
          className="text-[10px] mt-3 font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          SR-FF-TOURNAMENT • Play. Win. Dominate.
        </p>
      </div>
    </div>
  );
}

// Welcome BACK modal shown on every login
function WelcomeBackModal({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const currentLine = WELCOME_BACK_LINES[lineIdx].text;
    if (charIdx < currentLine.length) {
      timerRef.current = setTimeout(() => {
        setDisplayed((prev) => prev + currentLine[charIdx]);
        setCharIdx((c) => c + 1);
      }, 40);
    } else {
      timerRef.current = setTimeout(() => {
        if (lineIdx < WELCOME_BACK_LINES.length - 1) {
          setLineIdx((l) => l + 1);
          setDisplayed("");
          setCharIdx(0);
        } else {
          setDone(true);
        }
      }, 900);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [charIdx, lineIdx, done]);

  const currentGradient = WELCOME_BACK_LINES[lineIdx].gradient;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(10px)" }}
      data-ocid="welcome-back.modal"
    >
      <div
        className={`relative w-full ${getModalSizeClass()} rounded-3xl p-6 text-center overflow-hidden`}
        style={{
          background:
            "linear-gradient(135deg, #060b1a 0%, #0a1020 50%, #0d0a18 100%)",
          border: "1.5px solid rgba(99,102,241,0.55)",
          boxShadow:
            "0 0 70px rgba(99,102,241,0.22), 0 0 130px rgba(34,211,238,0.10), inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Ambient glow top-left */}
        <div
          className="absolute top-0 left-0 w-52 h-52 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ background: "rgba(99,102,241,0.13)" }}
        />
        {/* Ambient glow bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{
            background: "rgba(34,211,238,0.10)",
            animationDelay: "1.2s",
          }}
        />
        {/* Center ambient */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(168,85,247,0.05)" }}
        />

        {/* Logo with spinning ring */}
        <div className="flex items-center justify-center mb-4 relative">
          <div
            className="absolute w-32 h-32 rounded-full animate-spin"
            style={{
              background:
                "conic-gradient(from 0deg, #6366f1, #22d3ee, #a855f7, #fbbf24, #6366f1)",
              padding: "2.5px",
              animationDuration: "5s",
            }}
          />
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden"
            style={{
              border: "3px solid #060b1a",
              boxShadow: "0 0 35px rgba(99,102,241,0.75)",
            }}
          >
            <img
              src="/assets/uploads/sr_ff_tournament_icon_512-1.png"
              alt="SR-FF Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Small crown badge on top */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 text-lg"
            style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }}
          >
            👑
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center mb-2">
          <span
            className="text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1 rounded-full"
            style={{
              background: "rgba(99,102,241,0.18)",
              border: "1px solid rgba(99,102,241,0.45)",
              color: "#a5b4fc",
            }}
          >
            ✨ Player Login Successful
          </span>
        </div>

        {/* Username greeting */}
        <h2
          className="font-display font-black mb-1"
          style={{
            fontSize: "1.35rem",
            background: "linear-gradient(90deg, #22d3ee, #a855f7, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.01em",
          }}
        >
          {username ? `Hey ${username}! 🎮` : "Hey Player! 🎮"}
        </h2>

        {/* Typing message box */}
        <div
          className="rounded-2xl px-4 py-4 mb-5 mt-3 min-h-[90px] flex items-center justify-center relative overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 transition-all duration-500"
            style={{ background: currentGradient }}
          />
          <p
            className="text-base font-extrabold leading-relaxed relative z-10 text-center tracking-wide"
            style={{
              background: currentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.15))",
            }}
          >
            {displayed}
            <span
              className="inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse rounded-full"
              style={{
                background: "#6366f1",
                display: done ? "none" : "inline-block",
              }}
            />
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {WELCOME_BACK_LINES.map((line, i) => (
            <div
              key={line.text}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === lineIdx ? "22px" : "7px",
                height: "7px",
                background:
                  i < lineIdx
                    ? "#22d3ee"
                    : i === lineIdx
                      ? "#6366f1"
                      : "rgba(255,255,255,0.12)",
                boxShadow:
                  i === lineIdx
                    ? "0 0 10px rgba(99,102,241,0.9)"
                    : i < lineIdx
                      ? "0 0 6px rgba(34,211,238,0.6)"
                      : "none",
              }}
            />
          ))}
        </div>

        {/* Action button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 relative overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)",
              color: "#ffffff",
              boxShadow:
                "0 0 28px rgba(99,102,241,0.55), 0 4px 15px rgba(0,0,0,0.3)",
              letterSpacing: "0.05em",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
            data-ocid="welcome-back.start.button"
          >
            🎯 Let's Play!
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            data-ocid="welcome-back.close.button"
          >
            <X
              className="w-4 h-4"
              style={{ color: "rgba(255,255,255,0.35)" }}
            />
          </button>
        </div>

        {/* Bottom tagline */}
        <p
          className="text-[10px] mt-3 font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          SR-FF-TOURNAMENT • Play. Win. Dominate.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [contestTab, setContestTab] = useState("ongoing");
  const { data: tournaments = [] } = useAllTournaments();

  const { data: profile } = useCallerProfile();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState("");
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [welcomeBackUsername, setWelcomeBackUsername] = useState("");

  useEffect(() => {
    // New user registration welcome
    const flag = localStorage.getItem("srff_new_user_welcome");
    if (flag) {
      const data = JSON.parse(flag);
      setWelcomeUsername(data.username || "");
      setShowWelcome(true);
      localStorage.removeItem("srff_new_user_welcome");
      return; // Don't show both at same time
    }
    // Returning user login welcome
    const loginFlag = localStorage.getItem("srff_login_welcome");
    if (loginFlag) {
      const data = JSON.parse(loginFlag);
      setWelcomeBackUsername(data.username || "");
      setShowWelcomeBack(true);
      localStorage.removeItem("srff_login_welcome");
    }
  }, []);

  const handleCloseWelcome = () => setShowWelcome(false);
  const handleCloseWelcomeBack = () => setShowWelcomeBack(false);

  const announcement = loadAnnouncement();
  const promoLinks = loadPromoLinks();
  const promoBanners = loadPromoBanners();
  const activeBanner = promoBanners[bannerIdx] ?? null;

  const filtered = tournaments.filter((t) => {
    if (contestTab === "ongoing") return t.status === "ongoing";
    if (contestTab === "upcoming") return t.status === "upcoming";
    return t.status === "complete";
  });

  return (
    <div className="min-h-screen bg-background">
      {showWelcome && (
        <WelcomeModal username={welcomeUsername} onClose={handleCloseWelcome} />
      )}
      {showWelcomeBack && !showWelcome && (
        <WelcomeBackModal
          username={welcomeBackUsername}
          onClose={handleCloseWelcomeBack}
        />
      )}

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span
              className="font-display font-bold text-base tracking-tight"
              style={{ letterSpacing: "0.03em" }}
            >
              SR-FF-TURNAMENT
            </span>
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
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-5 py-4">
        {/* Announcement ticker */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, #f97316, #f59e0b, #fbbf24, #eab308)",
            boxShadow: "0 2px 12px rgba(249,115,22,0.35)",
          }}
        >
          <Megaphone className="w-4 h-4 text-black shrink-0" />
          <div className="overflow-hidden flex-1">
            <p className="animate-ticker text-sm text-black font-semibold">
              {announcement}
            </p>
          </div>
        </div>

        {/* Promo Photo Links row */}
        {promoLinks.length > 0 && (
          <section data-ocid="home.promo-links.panel">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {promoLinks.map((item, i) => (
                <a
                  key={item.id}
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl overflow-hidden border border-border hover:border-primary/60 transition-all hover:scale-105 block"
                  style={{ width: 140 }}
                  data-ocid={`home.promo-link.item.${i + 1}`}
                >
                  <img
                    src={item.photoUrl}
                    alt={item.label}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                  <div className="bg-card px-2 py-1">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {item.label}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

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
                {promoBanners.map((pb, di) => (
                  <button
                    key={pb.id}
                    type="button"
                    onClick={() => setBannerIdx(di)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      pb.id === activeBanner.id ? "bg-primary" : "bg-white/40"
                    }`}
                    data-ocid={`home.promo-banner-dot.${di + 1}`}
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
                      Rs.{Number(t.prizePool)}
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
            Free Fire Modes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {GAME_MODES.map((mode, i) => (
              <Link
                key={mode.name}
                to="/tournaments"
                className={`${mode.cls} rounded-xl aspect-square flex flex-col items-center justify-center gap-1 border border-white/10 hover:border-primary/50 hover:scale-105 transition-all`}
                data-ocid={`game-mode.item.${i + 1}`}
              >
                <span className="text-[11px] font-semibold text-white/90 text-center px-1 leading-tight">
                  {mode.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="text-center py-4 px-4 border-t border-border mt-4">
        <p className="text-xs text-muted-foreground">
          {localStorage.getItem("srff_footer_text") ||
            "SR-FF-TURNAMENT — Free Fire Tournament Platform"}
        </p>
      </footer>
    </div>
  );
}

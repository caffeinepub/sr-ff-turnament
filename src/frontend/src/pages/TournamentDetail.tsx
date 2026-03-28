import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Coins,
  Loader2,
  Medal,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import {
  useAllTournamentBanners,
  useAllTournaments,
  useJoinTournamentWithFee,
  useLeaderboard,
} from "../hooks/useQueries";

const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];

const RANK_BG = [
  "bg-yellow-400/20 border-yellow-400/40",
  "bg-slate-300/20 border-slate-300/40",
  "bg-amber-600/20 border-amber-600/40",
];

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

interface TournamentPlayer {
  phone: string;
  username: string;
  avatarId: number;
  joinedAt: string;
  winningAmount?: number;
  gameName?: string;
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return `${phone.slice(0, 2)}XXXX${phone.slice(-2)}`;
}

function getTournamentPlayers(tournamentId: string): TournamentPlayer[] {
  try {
    return JSON.parse(
      localStorage.getItem(`srff_tp_${tournamentId}`) ?? "[]",
    ) as TournamentPlayer[];
  } catch {
    return [];
  }
}

function getAvatarById(avatarId: number) {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}

export default function TournamentDetail() {
  const params = useParams({ strict: false });
  const id = (params as Record<string, string>).id ?? "";
  const navigate = useNavigate();
  const { data: tournaments = [], isLoading } = useAllTournaments();
  const { currentUser } = useUserAuth();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinGameName, setJoinGameName] = useState("");
  const joinWithFeeMutation = useJoinTournamentWithFee();

  const localTournaments: typeof tournaments = (() => {
    try {
      const arr = JSON.parse(
        localStorage.getItem("srff_created_tournaments") ?? "[]",
      ) as Array<{
        id: string;
        title: string;
        gameMode: string;
        entryFee: number;
        prizePool: number;
        maxPlayers: number;
        minPlayers: number;
        status: string;
        description: string;
        startTime: number;
        playerCount: number;
      }>;
      return arr.map((lt) => ({
        id: lt.id as unknown as bigint,
        title: lt.title,
        gameMode: lt.gameMode,
        entryFee: BigInt(lt.entryFee),
        prizePool: BigInt(lt.prizePool),
        maxPlayers: BigInt(lt.maxPlayers),
        minPlayers: BigInt(lt.minPlayers),
        status: lt.status as any,
        description: lt.description,
        startTime: BigInt(Math.floor(lt.startTime * 1_000_000)),
        playerCount: BigInt(lt.playerCount),
      }));
    } catch {
      return [];
    }
  })();
  const allTournaments = [...tournaments, ...localTournaments];

  const tournament = allTournaments.find((t) => t.id.toString() === id);
  const { data: leaderboard = [] } = useLeaderboard(
    tournament?.id ?? BigInt(0),
  );
  const { data: allBanners = {} } = useAllTournamentBanners();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Tournament load ho raha hai...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">Tournament not found</p>
        <Button
          onClick={() => navigate({ to: "/tournaments" })}
          variant="outline"
        >
          Back
        </Button>
      </div>
    );
  }

  const bannerUrl = tournament
    ? (allBanners[tournament.id.toString()] ?? "")
    : "";

  const start = new Date(Number(tournament.startTime) / 1_000_000);
  const canJoin = tournament.status !== "complete";
  const playerCount = Number(tournament.playerCount);
  const maxPlayers = Number(tournament.maxPlayers);
  const minPlayers = Number(tournament.minPlayers);
  const joinPercent =
    maxPlayers > 0 ? Math.min((playerCount / maxPlayers) * 100, 100) : 0;

  const joinedPlayers = getTournamentPlayers(tournament.id.toString());

  const handleJoin = async (gameName?: string) => {
    if (!currentUser) {
      toast.error("Pehle login karo");
      return;
    }
    const entryFee = Number(tournament.entryFee);
    const finalGameName = gameName?.trim() || currentUser.username;

    setShowJoinDialog(false);

    // Check local duplicate first (fast check)
    const tpKey = `srff_tp_${tournament.id.toString()}`;
    try {
      const existingCheck = JSON.parse(localStorage.getItem(tpKey) ?? "[]") as {
        phone: string;
      }[];
      if (existingCheck.some((p) => p.phone === currentUser.phone)) {
        toast.error("Aap already is tournament mein join kar chuke hain!");
        return;
      }
    } catch {}

    try {
      const result = await joinWithFeeMutation.mutateAsync({
        tournamentId: tournament.id.toString(),
        phone: currentUser.phone,
        username: currentUser.username,
        entryFee,
        gameName: finalGameName,
        avatarId: Number(localStorage.getItem("srff_avatar") || "1"),
      });

      // Also save locally for instant UI update
      try {
        const existingPlayers = JSON.parse(
          localStorage.getItem(tpKey) ?? "[]",
        ) as Array<{
          phone: string;
          username?: string;
          avatarId?: number;
          joinedAt?: string;
          winningAmount?: number;
          gameName?: string;
        }>;
        existingPlayers.push({
          phone: currentUser.phone,
          username: currentUser.username,
          avatarId: Number(localStorage.getItem("srff_avatar") || "1"),
          joinedAt: new Date().toISOString(),
          winningAmount: 0,
          gameName: finalGameName,
        });
        localStorage.setItem(tpKey, JSON.stringify(existingPlayers));
      } catch {}

      // Update local user balance for UI
      try {
        const users = JSON.parse(
          localStorage.getItem("srff_users") ?? "[]",
        ) as Array<{ phone: string; walletBalance?: number }>;
        const updated = users.map((u) =>
          u.phone === currentUser.phone
            ? { ...u, walletBalance: result.newBalance }
            : u,
        );
        localStorage.setItem("srff_users", JSON.stringify(updated));
      } catch {}

      // Save to match history
      const JOINED_KEY = `srff_joined_matches_${currentUser.phone}`;
      try {
        const historyExisting = JSON.parse(
          localStorage.getItem(JOINED_KEY) || "[]",
        );
        const alreadyJoined = historyExisting.find(
          (m: { id: string }) => m.id === tournament.id.toString(),
        );
        if (!alreadyJoined) {
          historyExisting.push({
            id: tournament.id.toString(),
            title: tournament.title,
            gameMode: tournament.gameMode,
            entryFee,
            prizePool: Number(tournament.prizePool),
            joinedAt: new Date().toISOString(),
            winningAmount: 0,
          });
          localStorage.setItem(JOINED_KEY, JSON.stringify(historyExisting));
        }
      } catch {}

      toast.success(
        `\uD83C\uDFAE Tournament join ho gaya! Entry fee \u20B9${entryFee} deducted.`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Tournament join nahi hua. Dobara try karo.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => navigate({ to: "/tournaments" })}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            data-ocid="tournament-detail.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-base truncate">
            {tournament.title}
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {bannerUrl && (
          <div className="w-full rounded-xl overflow-hidden">
            <img
              src={bannerUrl}
              alt="Tournament Banner"
              className="w-full h-40 object-cover"
            />
          </div>
        )}
        {/* Tournament Card */}
        <div className="game-card-1 border border-primary/30 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge
                className={
                  tournament.status === "ongoing"
                    ? "bg-success/20 text-success border-0"
                    : tournament.status === "upcoming"
                      ? "bg-warning/20 text-warning border-0"
                      : "bg-muted text-muted-foreground border-0"
                }
              >
                {tournament.status === "ongoing"
                  ? "\u25cf LIVE"
                  : tournament.status === "upcoming"
                    ? "\u23f0 UPCOMING"
                    : "\u2713 COMPLETE"}
              </Badge>
              <h2 className="font-display font-bold text-xl mt-2">
                {tournament.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tournament.gameMode}
              </p>
            </div>
            <Trophy className="w-10 h-10 text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground">
            {tournament.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Coins,
              label: "Entry Fee",
              value: `\u20b9${Number(tournament.entryFee)}`,
              color: "text-foreground",
            },
            {
              icon: Trophy,
              label: "Prize Pool",
              value: `\u20b9${Number(tournament.prizePool)}`,
              color: "text-warning",
            },
            {
              icon: Clock,
              label: "Start Time",
              value: start.toLocaleString([], {
                dateStyle: "short",
                timeStyle: "short",
              }),
              color: "text-foreground",
            },
            {
              icon: Users,
              label: "Mode",
              value: tournament.gameMode,
              color: "text-foreground",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`font-bold text-sm ${color} truncate`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Player Join Leaderboard / Status */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-sm">Players Joined</h3>
            </div>
            {joinedPlayers.length > 0 && (
              <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
                {joinedPlayers.length} Players
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-background rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-warning transition-all"
              style={{ width: `${joinPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-background rounded-xl p-2">
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="font-bold text-lg text-primary">{playerCount}</p>
            </div>
            <div className="bg-background rounded-xl p-2">
              <p className="text-xs text-muted-foreground">Min Required</p>
              <p className="font-bold text-lg text-warning">
                {minPlayers > 0 ? minPlayers : "--"}
              </p>
            </div>
            <div className="bg-background rounded-xl p-2">
              <p className="text-xs text-muted-foreground">Max Players</p>
              <p className="font-bold text-lg">{maxPlayers}</p>
            </div>
          </div>

          {minPlayers > 0 &&
            playerCount < minPlayers &&
            tournament.status !== "complete" && (
              <p className="text-xs text-warning mb-3 text-center">
                Tournament start hone ke liye {minPlayers - playerCount} aur
                players chahiye
              </p>
            )}

          {/* Joined Players List */}
          {joinedPlayers.length > 0 ? (
            <div
              className="space-y-2 max-h-60 overflow-y-auto pr-1"
              data-ocid="tournament-detail.joined-players.list"
            >
              {joinedPlayers.map((player, i) => {
                const av = getAvatarById(player.avatarId);
                return (
                  <div
                    key={`${player.phone}-${i}`}
                    className="flex items-center gap-3 bg-background rounded-xl px-3 py-2"
                    data-ocid={`tournament-detail.joined-players.item.${i + 1}`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <img
                        src={av.image}
                        alt={av.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {player.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {maskPhone(player.phone)}
                      </p>
                    </div>
                    {/* Winning badge if tournament complete */}
                    {tournament.status === "complete" &&
                      player.winningAmount != null &&
                      player.winningAmount > 0 && (
                        <span className="text-xs font-bold bg-success/20 text-success border border-success/30 rounded-full px-2 py-0.5 shrink-0">
                          \u2705 \u20b9{player.winningAmount}
                        </span>
                      )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-4"
              data-ocid="tournament-detail.joined-players.empty_state"
            >
              <p className="text-xs text-muted-foreground">
                Abhi koi player join nahi kiya
              </p>
            </div>
          )}
        </div>

        {/* Regular Balance */}
        {currentUser &&
          (() => {
            const users: Array<{ phone: string; walletBalance?: number }> =
              (() => {
                try {
                  return JSON.parse(localStorage.getItem("srff_users") ?? "[]");
                } catch {
                  return [];
                }
              })();
            const userRecord = users.find((u) => u.phone === currentUser.phone);
            const wb = userRecord?.walletBalance ?? 0;
            const wc =
              Number(
                localStorage.getItem(`srff_winning_cash_${currentUser.phone}`),
              ) || 0;
            const regularBalance = Math.max(0, wb - wc);
            return (
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3">
                <Shield className="w-4 h-4 text-success shrink-0" />
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    Regular Balance:{" "}
                  </span>
                  <span className="font-bold text-warning">
                    ₹{regularBalance}
                  </span>
                </div>
              </div>
            );
          })()}

        {/* Join Button */}
        {canJoin && (
          <>
            <Button
              className="w-full h-12 text-base font-bold glow-orange"
              onClick={() => {
                if (!currentUser) {
                  toast.error("Pehle login karo");
                  return;
                }
                setJoinGameName("");
                setShowJoinDialog(true);
              }}
              data-ocid="tournament-detail.join.button"
            >
              {currentUser
                ? `Join for ₹${Number(tournament.entryFee)}`
                : "Login to Join"}
            </Button>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogContent data-ocid="tournament-detail.join-gamename.dialog">
                <DialogHeader>
                  <DialogTitle>🎮 Apna Free Fire Game Name Bharo</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-2">
                  Tournament join karne ke liye apna Free Fire in-game name
                  enter karo. Yeh naam admin ko winner decide karne ke liye
                  dikhai dega.
                </p>
                <Input
                  placeholder="Free Fire Game Name (e.g. PLAYER123)"
                  value={joinGameName}
                  onChange={(e) => setJoinGameName(e.target.value)}
                  data-ocid="tournament-detail.join-gamename.input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && joinGameName.trim()) {
                      setShowJoinDialog(false);
                      handleJoin(joinGameName.trim());
                    }
                  }}
                />
                <DialogFooter className="gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinDialog(false)}
                    data-ocid="tournament-detail.join-gamename.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!joinGameName.trim()}
                    onClick={() => {
                      const gn = joinGameName.trim();
                      setShowJoinDialog(false);
                      handleJoin(gn);
                    }}
                    data-ocid="tournament-detail.join-gamename.confirm_button"
                  >
                    ✅ Confirm Join
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        {/* Winner Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-warning" />
              <h3 className="font-display font-bold text-sm">
                Winner Leaderboard
              </h3>
            </div>
            <div className="space-y-2">
              {leaderboard
                .slice()
                .sort((a, b) => Number(a.position) - Number(b.position))
                .map((entry, i) => {
                  const pos = Number(entry.position);
                  const colorClass =
                    i < 3 ? RANK_COLORS[i] : "text-muted-foreground";
                  const bgClass =
                    i < 3 ? RANK_BG[i] : "bg-muted/20 border-border";
                  return (
                    <div
                      key={`${entry.playerName}-${pos}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 border ${bgClass}`}
                      data-ocid={`leaderboard.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${bgClass} ${colorClass}`}
                        >
                          {pos <= 3 ? <Medal className="w-4 h-4" /> : pos}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {entry.playerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{pos} Place
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-base ${colorClass}`}>
                          \u20b9{Number(entry.prize)}
                        </p>
                        <p className="text-xs text-muted-foreground">Prize</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {leaderboard.length === 0 && tournament.status === "complete" && (
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Results abhi announce nahi hue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

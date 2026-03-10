import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllTournaments,
  useCallerProfile,
  useJoinTournament,
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
    emoji: "\uD83D\uDD25",
    label: "Fire",
    bg: "from-orange-500 to-red-600",
  },
  {
    id: 2,
    emoji: "\u26A1",
    label: "Thunder",
    bg: "from-yellow-400 to-orange-500",
  },
  {
    id: 3,
    emoji: "\uD83C\uDFC6",
    label: "Champion",
    bg: "from-yellow-500 to-amber-600",
  },
  {
    id: 4,
    emoji: "\uD83C\uDFAF",
    label: "Sniper",
    bg: "from-green-500 to-emerald-600",
  },
  {
    id: 5,
    emoji: "\u2694\uFE0F",
    label: "Warrior",
    bg: "from-blue-500 to-indigo-600",
  },
  {
    id: 6,
    emoji: "\uD83D\uDEE1\uFE0F",
    label: "Shield",
    bg: "from-slate-500 to-slate-600",
  },
  {
    id: 7,
    emoji: "\uD83D\uDC80",
    label: "Skull",
    bg: "from-purple-500 to-violet-600",
  },
  {
    id: 8,
    emoji: "\uD83E\uDD81",
    label: "Lion",
    bg: "from-amber-500 to-yellow-600",
  },
  {
    id: 9,
    emoji: "\uD83D\uDC09",
    label: "Dragon",
    bg: "from-red-500 to-rose-600",
  },
  {
    id: 10,
    emoji: "\uD83C\uDF1F",
    label: "Star",
    bg: "from-cyan-500 to-blue-600",
  },
  {
    id: 11,
    emoji: "\uD83C\uDFAE",
    label: "Gamer",
    bg: "from-pink-500 to-rose-600",
  },
  {
    id: 12,
    emoji: "\uD83D\uDC51",
    label: "King",
    bg: "from-yellow-400 to-yellow-600",
  },
];

interface TournamentPlayer {
  phone: string;
  username: string;
  avatarId: number;
  joinedAt: string;
  winningAmount?: number;
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
  return (
    AVATARS.find((a) => a.id === avatarId) ?? {
      emoji: "\uD83C\uDFAE",
      bg: "from-pink-500 to-rose-600",
    }
  );
}

export default function TournamentDetail() {
  const params = useParams({ strict: false });
  const id = (params as Record<string, string>).id ?? "";
  const navigate = useNavigate();
  const { data: tournaments = [] } = useAllTournaments();
  const { data: profile } = useCallerProfile();
  const { identity, login } = useInternetIdentity();
  const { currentUser } = useUserAuth();
  const joinMutation = useJoinTournament();
  const tournament = tournaments.find((t) => t.id.toString() === id);
  const { data: leaderboard = [] } = useLeaderboard(
    tournament?.id ?? BigInt(0),
  );

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

  const start = new Date(Number(tournament.startTime) / 1_000_000);
  const canJoin = tournament.status !== "complete";
  const playerCount = Number(tournament.playerCount);
  const maxPlayers = Number(tournament.maxPlayers);
  const minPlayers = Number(tournament.minPlayers);
  const joinPercent =
    maxPlayers > 0 ? Math.min((playerCount / maxPlayers) * 100, 100) : 0;

  const joinedPlayers = getTournamentPlayers(tournament.id.toString());

  const handleJoin = async () => {
    if (!identity) {
      login();
      return;
    }
    try {
      await joinMutation.mutateAsync(tournament.id);
      toast.success("Joined tournament!");

      // Save to match history in localStorage
      const userKey = profile?.principal?.toString() ?? "guest";
      const JOINED_KEY = `srff_joined_matches_${userKey}`;
      try {
        const existing = JSON.parse(localStorage.getItem(JOINED_KEY) || "[]");
        const already = existing.find(
          (m: { id: string }) => m.id === tournament.id.toString(),
        );
        if (!already) {
          existing.push({
            id: tournament.id.toString(),
            title: tournament.title,
            gameMode: tournament.gameMode,
            entryFee: Number(tournament.entryFee),
            prizePool: Number(tournament.prizePool),
            joinedAt: new Date().toISOString(),
            winningAmount: 0,
          });
          localStorage.setItem(JOINED_KEY, JSON.stringify(existing));
        }
      } catch {}

      // Save player to tournament players list
      if (currentUser) {
        const tpKey = `srff_tp_${tournament.id.toString()}`;
        try {
          const players: TournamentPlayer[] = JSON.parse(
            localStorage.getItem(tpKey) ?? "[]",
          );
          const alreadyJoined = players.find(
            (p) => p.phone === currentUser.phone,
          );
          if (!alreadyJoined) {
            const savedAvatarId = Number.parseInt(
              localStorage.getItem("srff_avatar") || "0",
            );
            players.push({
              phone: currentUser.phone,
              username: currentUser.username,
              avatarId: savedAvatarId,
              joinedAt: new Date().toISOString(),
              winningAmount: 0,
            });
            localStorage.setItem(tpKey, JSON.stringify(players));
          }
        } catch {}
      }
    } catch {
      toast.error("Failed to join. Check wallet balance.");
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
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-base shrink-0`}
                    >
                      {av.emoji}
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

        {/* Wallet Balance */}
        {profile && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3">
            <Shield className="w-4 h-4 text-success shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Wallet Balance: </span>
              <span className="font-bold text-warning">
                \u20b9{Number(profile.walletBalance)}
              </span>
            </div>
          </div>
        )}

        {/* Join Button */}
        {canJoin && (
          <Button
            className="w-full h-12 text-base font-bold glow-orange"
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            data-ocid="tournament-detail.join.button"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Joining...
              </>
            ) : identity ? (
              `Join for \u20b9${Number(tournament.entryFee)}`
            ) : (
              "Login to Join"
            )}
          </Button>
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

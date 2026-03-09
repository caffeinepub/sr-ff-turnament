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

export default function TournamentDetail() {
  const params = useParams({ strict: false });
  const id = (params as Record<string, string>).id ?? "";
  const navigate = useNavigate();
  const { data: tournaments = [] } = useAllTournaments();
  const { data: profile } = useCallerProfile();
  const { identity, login } = useInternetIdentity();
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

  const handleJoin = async () => {
    if (!identity) {
      login();
      return;
    }
    try {
      await joinMutation.mutateAsync(tournament.id);
      toast.success("Joined tournament!");
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
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm">Players Joined</h3>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-background rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-warning transition-all"
              style={{ width: `${joinPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
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
              <p className="text-xs text-warning mt-2 text-center">
                Tournament start hone ke liye {minPlayers - playerCount} aur
                players chahiye
              </p>
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

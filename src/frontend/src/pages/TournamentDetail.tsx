import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Coins,
  Loader2,
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
  useTournamentResults,
} from "../hooks/useQueries";

export default function TournamentDetail() {
  const params = useParams({ strict: false });
  const id = (params as Record<string, string>).id ?? "";
  const navigate = useNavigate();
  const { data: tournaments = [] } = useAllTournaments();
  const { data: profile } = useCallerProfile();
  const { identity, login } = useInternetIdentity();
  const joinMutation = useJoinTournament();
  const tournament = tournaments.find((t) => t.id.toString() === id);
  const { data: results = [] } = useTournamentResults(
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
                  ? "● LIVE"
                  : tournament.status === "upcoming"
                    ? "⏰ UPCOMING"
                    : "✓ COMPLETE"}
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

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Coins,
              label: "Entry Fee",
              value: `₹${Number(tournament.entryFee)}`,
              color: "text-foreground",
            },
            {
              icon: Trophy,
              label: "Prize Pool",
              value: `₹${Number(tournament.prizePool)}`,
              color: "text-warning",
            },
            {
              icon: Users,
              label: "Players",
              value: `${Number(tournament.playerCount)}/${Number(tournament.maxPlayers)}`,
              color: "text-foreground",
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
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`font-bold text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {profile && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3">
            <Shield className="w-4 h-4 text-success shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Wallet Balance: </span>
              <span className="font-bold text-warning">
                ₹{Number(profile.walletBalance)}
              </span>
            </div>
          </div>
        )}

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
              `Join for ₹${Number(tournament.entryFee)}`
            ) : (
              "Login to Join"
            )}
          </Button>
        )}

        {tournament.status === "complete" && results.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" /> Results
            </h3>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={r.playerId.toString()}
                  className="flex items-center justify-between text-sm"
                  data-ocid={`result.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                      {Number(r.position)}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {r.playerId.toString().slice(0, 12)}...
                    </span>
                  </div>
                  <span className="text-warning font-bold">
                    ₹{Number(r.prize)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

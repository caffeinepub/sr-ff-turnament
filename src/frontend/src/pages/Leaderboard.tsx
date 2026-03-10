import { Crown, Medal, Trophy, Users } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useUserAuth } from "../context/UserAuthContext";
import { useAllTournaments, useLeaderboard } from "../hooks/useQueries";

interface MatchEntry {
  id: string;
  title: string;
  gameMode: string;
  entryFee: number;
  prizePool: number;
  joinedAt: string;
  winningAmount?: number;
}

interface PlayerStats {
  phone: string;
  username: string;
  ffName: string;
  totalMatches: number;
  totalWinnings: number;
  totalEntryFee: number;
  lastMatchAt: string;
}

function getUsers(): Array<{
  phone: string;
  username: string;
  ffName: string;
}> {
  try {
    return JSON.parse(localStorage.getItem("srff_users") || "[]");
  } catch {
    return [];
  }
}

function getJoinedMatches(phone: string): MatchEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(`srff_joined_matches_${phone}`) || "[]",
    );
  } catch {
    return [];
  }
}

function buildLeaderboard(): PlayerStats[] {
  const users = getUsers();
  const stats: PlayerStats[] = [];

  for (const user of users) {
    const matches = getJoinedMatches(user.phone);
    if (matches.length === 0) continue;

    const totalWinnings = matches.reduce(
      (sum, m) => sum + (m.winningAmount || 0),
      0,
    );
    const totalEntryFee = matches.reduce(
      (sum, m) => sum + (m.entryFee || 0),
      0,
    );
    const lastMatchAt = matches.reduce(
      (latest, m) => (m.joinedAt > latest ? m.joinedAt : latest),
      "",
    );

    stats.push({
      phone: user.phone,
      username: user.username,
      ffName: user.ffName,
      totalMatches: matches.length,
      totalWinnings,
      totalEntryFee,
      lastMatchAt,
    });
  }

  return stats.sort((a, b) => b.totalWinnings - a.totalWinnings);
}

const RANK_STYLES: Record<
  number,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  1: {
    bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/40",
    text: "text-yellow-400",
    icon: <Crown className="w-5 h-5 text-yellow-400" />,
    label: "Gold",
  },
  2: {
    bg: "bg-gradient-to-r from-slate-400/20 to-slate-500/10 border border-slate-400/40",
    text: "text-slate-300",
    icon: <Medal className="w-5 h-5 text-slate-300" />,
    label: "Silver",
  },
  3: {
    bg: "bg-gradient-to-r from-orange-700/20 to-amber-800/10 border border-orange-700/40",
    text: "text-orange-400",
    icon: <Medal className="w-5 h-5 text-orange-400" />,
    label: "Bronze",
  },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const style = RANK_STYLES[rank];
    return (
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${style.text} bg-opacity-30`}
      >
        {style.icon}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
      {rank}
    </span>
  );
}

function TournamentLeaderboard({ tournamentId }: { tournamentId: bigint }) {
  const { data: entries = [], isLoading } = useLeaderboard(tournamentId);

  if (isLoading) {
    return (
      <div
        data-ocid="leaderboard.loading_state"
        className="flex items-center justify-center py-12"
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        data-ocid="leaderboard.empty_state"
        className="text-center py-12 text-muted-foreground"
      >
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Is tournament ka leaderboard abhi available nahi hai</p>
      </div>
    );
  }

  return (
    <div data-ocid="leaderboard.tournament.list" className="space-y-2">
      {entries.map((entry) => {
        const rank = Number(entry.position);
        const rankStyle = rank <= 3 ? RANK_STYLES[rank] : null;
        return (
          <div
            key={entry.position.toString()}
            data-ocid={`leaderboard.tournament.item.${Number(entry.position)}`}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              rankStyle ? rankStyle.bg : "bg-card border border-border"
            }`}
          >
            <RankBadge rank={rank} />
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold truncate ${rankStyle ? rankStyle.text : "text-foreground"}`}
              >
                {entry.playerName}
              </p>
              <p className="text-xs text-muted-foreground">
                Position: {entry.position.toString()}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${rankStyle ? rankStyle.text : "text-green-400"}`}
              >
                ₹{entry.prize.toString()}
              </p>
              <p className="text-xs text-muted-foreground">Prize</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Leaderboard() {
  const { currentUser } = useUserAuth();
  const { data: tournaments = [] } = useAllTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  const leaderboard = buildLeaderboard();
  const completedTournaments = tournaments.filter(
    (t) => t.status === "complete",
  );

  const lastUpdated =
    leaderboard.length > 0
      ? leaderboard.reduce(
          (latest, p) => (p.lastMatchAt > latest ? p.lastMatchAt : latest),
          "",
        )
      : null;

  const selectedId = selectedTournamentId
    ? BigInt(selectedTournamentId)
    : completedTournaments.length > 0
      ? completedTournaments[0].id
      : null;

  return (
    <div
      data-ocid="leaderboard.page"
      className="min-h-screen bg-background pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold text-foreground">Leaderboard</h1>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated:{" "}
            {new Date(lastUpdated).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="px-4 pt-4">
        <Tabs defaultValue="overall">
          <TabsList className="w-full mb-4">
            <TabsTrigger
              value="overall"
              className="flex-1"
              data-ocid="leaderboard.overall.tab"
            >
              <Users className="w-4 h-4 mr-1" /> Overall
            </TabsTrigger>
            <TabsTrigger
              value="tournament"
              className="flex-1"
              data-ocid="leaderboard.tournament.tab"
            >
              <Trophy className="w-4 h-4 mr-1" /> Tournament
            </TabsTrigger>
          </TabsList>

          {/* Overall Tab */}
          <TabsContent value="overall">
            {leaderboard.length === 0 ? (
              <div
                data-ocid="leaderboard.empty_state"
                className="text-center py-16"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground font-medium">
                  Abhi koi tournament nahi khela
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pehle tournament join karo!
                </p>
              </div>
            ) : (
              <div data-ocid="leaderboard.overall.list" className="space-y-2">
                {leaderboard.map((player, idx) => {
                  const rank = idx + 1;
                  const rankStyle = rank <= 3 ? RANK_STYLES[rank] : null;
                  const isCurrentUser = currentUser?.phone === player.phone;

                  return (
                    <div
                      key={player.phone}
                      data-ocid={`leaderboard.overall.item.${rank}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isCurrentUser
                          ? "border-2 border-primary bg-primary/10"
                          : rankStyle
                            ? rankStyle.bg
                            : "bg-card border border-border"
                      }`}
                    >
                      <RankBadge rank={rank} />

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                        {player.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p
                            className={`font-semibold truncate ${
                              rankStyle
                                ? rankStyle.text
                                : isCurrentUser
                                  ? "text-primary"
                                  : "text-foreground"
                            }`}
                          >
                            {player.username}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {player.ffName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.totalMatches} matches played
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-400">
                          ₹{player.totalWinnings.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Winnings
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tournament Tab */}
          <TabsContent value="tournament">
            {completedTournaments.length === 0 ? (
              <div
                data-ocid="leaderboard.empty_state"
                className="text-center py-16"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground font-medium">
                  Abhi koi tournament complete nahi hua
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  data-ocid="leaderboard.tournament.select"
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {completedTournaments.map((t) => (
                    <option key={t.id.toString()} value={t.id.toString()}>
                      {t.title} — {t.gameMode}
                    </option>
                  ))}
                </select>

                {selectedId && (
                  <TournamentLeaderboard tournamentId={selectedId} />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  Coins,
  Filter,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Tournament } from "../backend.d";
import { useAllTournaments } from "../hooks/useQueries";

function parseLocalTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem("srff_created_tournaments");
    if (!raw) return [];
    const arr = JSON.parse(raw) as Array<{
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
      status: lt.status as Tournament["status"],
      description: lt.description,
      startTime: BigInt(Math.floor(lt.startTime * 1_000_000)),
      playerCount: BigInt(lt.playerCount),
    }));
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ongoing")
    return (
      <Badge className="bg-success/20 text-success border-0 text-xs">
        ● LIVE
      </Badge>
    );
  if (status === "upcoming")
    return (
      <Badge className="bg-warning/20 text-warning border-0 text-xs">
        ⏰ SOON
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-0 text-xs">
      ✓ DONE
    </Badge>
  );
}

function TournamentCard({ t, index }: { t: Tournament; index: number }) {
  const start = new Date(Number(t.startTime) / 1_000_000);
  return (
    <Link
      to="/tournament/$id"
      params={{ id: t.id.toString() }}
      className="block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:glow-orange"
      data-ocid={`tournament.item.${index}`}
    >
      <div className="game-card-1 h-2 w-full" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display font-bold text-sm leading-tight">
              {t.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t.gameMode}</p>
          </div>
          <StatusBadge status={t.status as string} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Coins className="w-3 h-3" />
              Entry
            </p>
            <p className="text-sm font-bold text-foreground">
              ₹{Number(t.entryFee)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              Prize
            </p>
            <p className="text-sm font-bold text-warning">
              ₹{Number(t.prizePool)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Players
            </p>
            <p className="text-sm font-bold text-foreground">
              {Number(t.playerCount)}/{Number(t.maxPlayers)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {start.toLocaleDateString()}{" "}
            {start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <span className="text-xs text-primary font-semibold flex items-center gap-0.5">
            Join <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Tournaments() {
  const [tab, setTab] = useState("all");
  const { data: tournaments = [], isLoading } = useAllTournaments();

  const [localCreated, setLocalCreated] = useState<Tournament[]>(
    parseLocalTournaments,
  );
  useEffect(() => {
    const refresh = () => setLocalCreated(parseLocalTournaments());
    window.addEventListener("srff_tournament_updated", refresh);
    window.addEventListener("storage", refresh);
    // Also poll every 2 seconds to catch admin changes in same tab
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("srff_tournament_updated", refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, []);

  const allTournaments = useMemo(() => {
    const backendIds = new Set(tournaments.map((t) => t.id.toString()));
    const locals = localCreated.filter(
      (lt) => !backendIds.has(lt.id.toString()),
    );
    return [...tournaments, ...locals];
  }, [tournaments, localCreated]);

  const filtered =
    tab === "all"
      ? allTournaments
      : allTournaments.filter((t) => t.status === tab);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="font-display font-bold text-lg">Tournaments</h1>
          <Filter className="w-4 h-4 text-muted-foreground" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-card border border-border">
            <TabsTrigger
              value="all"
              className="flex-1 text-xs"
              data-ocid="tournaments.all.tab"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="flex-1 text-xs"
              data-ocid="tournaments.ongoing.tab"
            >
              Live
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex-1 text-xs"
              data-ocid="tournaments.upcoming.tab"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="complete"
              className="flex-1 text-xs"
              data-ocid="tournaments.complete.tab"
            >
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3" data-ocid="tournaments.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="tournaments.empty_state"
          >
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No tournaments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t, i) => (
              <TournamentCard key={t.id.toString()} t={t} index={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

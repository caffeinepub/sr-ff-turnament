import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Loader2,
  Medal,
  Plus,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TournamentStatus } from "../../backend";
import type { Tournament } from "../../backend.d";
import {
  useAllTournaments,
  useCreateTournament,
  useLeaderboard,
  useSetLeaderboard,
} from "../../hooks/useQueries";

const GAME_MODES = [
  "Solo",
  "Duo",
  "Squad",
  "4v4 Clash Squad",
  "BR Ranked",
  "CS Ranked",
  "Custom Room",
  "BR Per Kill",
  "Lone Wolf 1v1",
  "Lone Wolf 2v2",
  "Sunday Special",
  "1 vs 1 Custom",
  "4 vs 4 Custom",
  "BR Full Map",
];

interface TournamentForm {
  title: string;
  gameMode: string;
  startTime: string;
  entryFee: string;
  prizePool: string;
  maxPlayers: string;
  minPlayers: string;
  status: string;
  description: string;
}

const EMPTY_FORM: TournamentForm = {
  title: "",
  gameMode: "Squad",
  startTime: "",
  entryFee: "",
  prizePool: "",
  maxPlayers: "100",
  minPlayers: "10",
  status: "upcoming",
  description: "",
};

function TournamentFormModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TournamentForm>(EMPTY_FORM);
  const createMutation = useCreateTournament();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        title: form.title,
        gameMode: form.gameMode,
        startTime: BigInt(new Date(form.startTime).getTime() * 1_000_000),
        entryFee: BigInt(Number(form.entryFee)),
        prizePool: BigInt(Number(form.prizePool)),
        maxPlayers: BigInt(Number(form.maxPlayers)),
        minPlayers: BigInt(Number(form.minPlayers)),
        status: form.status as TournamentStatus,
        description: form.description,
      });
      toast.success("Tournament created!");
      setForm(EMPTY_FORM);
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Failed to create tournament");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2"
          data-ocid="admin-tournaments.create.open_modal_button"
        >
          <Plus className="w-4 h-4" /> Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="admin-tournaments.create.dialog"
      >
        <DialogHeader>
          <DialogTitle>Create Free Fire Tournament</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tournament title"
              required
              className="mt-1"
              data-ocid="admin-tournaments.title.input"
            />
          </div>
          <div>
            <Label>Game Mode</Label>
            <Select
              value={form.gameMode}
              onValueChange={(v) => setForm({ ...form, gameMode: v })}
            >
              <SelectTrigger
                className="mt-1"
                data-ocid="admin-tournaments.gamemode.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAME_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
              className="mt-1"
              data-ocid="admin-tournaments.starttime.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Entry Fee (\u20b9)</Label>
              <Input
                type="number"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                placeholder="50"
                required
                className="mt-1"
                data-ocid="admin-tournaments.entryfee.input"
              />
            </div>
            <div>
              <Label>Prize Pool (\u20b9)</Label>
              <Input
                type="number"
                value={form.prizePool}
                onChange={(e) =>
                  setForm({ ...form, prizePool: e.target.value })
                }
                placeholder="5000"
                required
                className="mt-1"
                data-ocid="admin-tournaments.prizepool.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max Players</Label>
              <Input
                type="number"
                value={form.maxPlayers}
                onChange={(e) =>
                  setForm({ ...form, maxPlayers: e.target.value })
                }
                className="mt-1"
                data-ocid="admin-tournaments.maxplayers.input"
              />
            </div>
            <div>
              <Label>Min Players</Label>
              <Input
                type="number"
                value={form.minPlayers}
                onChange={(e) =>
                  setForm({ ...form, minPlayers: e.target.value })
                }
                placeholder="10"
                className="mt-1"
                data-ocid="admin-tournaments.minplayers.input"
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger
                className="mt-1"
                data-ocid="admin-tournaments.status.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Tournament details..."
              className="mt-1"
              data-ocid="admin-tournaments.description.textarea"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
            data-ocid="admin-tournaments.create.submit_button"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Create Tournament
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface LeaderboardRow {
  id: number;
  position: string;
  playerName: string;
  prize: string;
}

function ResultsModal({ tournament }: { tournament: Tournament }) {
  const [open, setOpen] = useState(false);
  const { data: leaderboard = [], refetch } = useLeaderboard(tournament.id);
  const setLeaderboardMutation = useSetLeaderboard();

  const [rows, setRows] = useState<LeaderboardRow[]>([
    { id: 1, position: "1", playerName: "", prize: "" },
    { id: 2, position: "2", playerName: "", prize: "" },
    { id: 3, position: "3", playerName: "", prize: "" },
  ]);

  const handleOpen = () => {
    if (leaderboard.length > 0) {
      setRows(
        leaderboard.map((e, idx) => ({
          id: idx + 1,
          position: String(Number(e.position)),
          playerName: e.playerName,
          prize: String(Number(e.prize)),
        })),
      );
    }
    setOpen(true);
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        id: Date.now(),
        position: String(r.length + 1),
        playerName: "",
        prize: "",
      },
    ]);
  const removeRow = (i: number) =>
    setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof LeaderboardRow, val: string) =>
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
    );

  const handleSave = async () => {
    const entries = rows
      .filter((r) => r.playerName.trim() && r.prize)
      .map(
        (r) =>
          [
            BigInt(Number(r.position)),
            r.playerName.trim(),
            BigInt(Number(r.prize)),
          ] as [bigint, string, bigint],
      );
    try {
      await setLeaderboardMutation.mutateAsync({
        tournamentId: tournament.id,
        entries,
      });
      toast.success("Leaderboard save ho gaya!");
      refetch();
      setOpen(false);
    } catch {
      toast.error("Save nahi ho saka");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-xs"
          onClick={handleOpen}
          data-ocid="admin-tournaments.results.open_modal_button"
        >
          <Trophy className="w-3 h-3" /> Results
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="admin-tournaments.results.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-warning" /> Winner Leaderboard
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-2">{tournament.title}</p>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={row.id}
              className="flex items-center gap-2"
              data-ocid={`admin-tournaments.results.item.${i + 1}`}
            >
              <Input
                type="number"
                value={row.position}
                onChange={(e) => updateRow(i, "position", e.target.value)}
                className="w-16 text-center"
                placeholder="#"
                data-ocid={`admin-tournaments.results.position.input.${i + 1}`}
              />
              <Input
                value={row.playerName}
                onChange={(e) => updateRow(i, "playerName", e.target.value)}
                placeholder="Player name"
                className="flex-1"
                data-ocid={`admin-tournaments.results.playername.input.${i + 1}`}
              />
              <Input
                type="number"
                value={row.prize}
                onChange={(e) => updateRow(i, "prize", e.target.value)}
                placeholder="\u20b9 Prize"
                className="w-24"
                data-ocid={`admin-tournaments.results.prize.input.${i + 1}`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="px-1.5 text-destructive hover:text-destructive"
                onClick={() => removeRow(i)}
                data-ocid={`admin-tournaments.results.delete_button.${i + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1"
            onClick={addRow}
            data-ocid="admin-tournaments.results.add.button"
          >
            <Plus className="w-3 h-3" /> Add Player
          </Button>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={setLeaderboardMutation.isPending}
            data-ocid="admin-tournaments.results.save.button"
          >
            {setLeaderboardMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Leaderboard Save Karo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTournaments() {
  const { data: tournaments = [], refetch } = useAllTournaments();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">
          Free Fire Tournaments
        </h1>
        <TournamentFormModal onCreated={refetch} />
      </div>

      {tournaments.length === 0 ? (
        <div
          className="text-center py-20"
          data-ocid="admin-tournaments.empty_state"
        >
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            No tournaments yet. Create one!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t: Tournament, i: number) => (
            <div
              key={t.id.toString()}
              className="bg-card border border-border rounded-2xl p-4"
              data-ocid={`admin-tournaments.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-display font-bold text-sm">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.gameMode}</p>
                </div>
                <Badge
                  className={`text-xs shrink-0 ${
                    t.status === "ongoing"
                      ? "bg-success/20 text-success border-0"
                      : t.status === "upcoming"
                        ? "bg-warning/20 text-warning border-0"
                        : "bg-muted text-muted-foreground border-0"
                  }`}
                >
                  {t.status as string}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Entry</p>
                  <p className="text-sm font-bold">
                    \u20b9{Number(t.entryFee)}
                  </p>
                </div>
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Prize</p>
                  <p className="text-sm font-bold text-warning">
                    \u20b9{Number(t.prizePool)}
                  </p>
                </div>
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Players</p>
                  <p className="text-sm font-bold">
                    {Number(t.playerCount)}/{Number(t.maxPlayers)}
                  </p>
                </div>
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Min</p>
                  <p className="text-sm font-bold text-warning">
                    {Number(t.minPlayers) > 0 ? Number(t.minPlayers) : "--"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  data-ocid={`admin-tournaments.verify.button.${i + 1}`}
                >
                  <Users className="w-3 h-3" /> Players
                </Button>
                <ResultsModal tournament={t} />
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  data-ocid={`admin-tournaments.edit.button.${i + 1}`}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="px-2"
                  data-ocid={`admin-tournaments.delete.button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

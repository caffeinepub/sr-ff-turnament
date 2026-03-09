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
import { Edit2, Loader2, Plus, Trash2, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TournamentStatus } from "../../backend";
import type { Tournament } from "../../backend.d";
import { useAllTournaments, useCreateTournament } from "../../hooks/useQueries";

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
              <Label>Entry Fee (₹)</Label>
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
              <Label>Prize Pool (₹)</Label>
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
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Entry</p>
                  <p className="text-sm font-bold">₹{Number(t.entryFee)}</p>
                </div>
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Prize</p>
                  <p className="text-sm font-bold text-warning">
                    ₹{Number(t.prizePool)}
                  </p>
                </div>
                <div className="text-center bg-background rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Players</p>
                  <p className="text-sm font-bold">
                    {Number(t.playerCount)}/{Number(t.maxPlayers)}
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
                  <Users className="w-3 h-3" /> Verify Players
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  data-ocid={`admin-tournaments.results.button.${i + 1}`}
                >
                  <Trophy className="w-3 h-3" /> Results
                </Button>
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

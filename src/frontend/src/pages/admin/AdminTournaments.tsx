import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  CheckCircle2,
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

const DELETED_KEY = "srff_deleted_tournaments";
const OVERRIDES_KEY = "srff_tournament_overrides";
const CREATED_KEY = "srff_created_tournaments";

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

function saveTournamentPlayerWinnings(
  tournamentId: string,
  players: TournamentPlayer[],
) {
  localStorage.setItem(`srff_tp_${tournamentId}`, JSON.stringify(players));
}

function getAvatarById(avatarId: number) {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}

/**
 * Automatically credit winning amount to a player's Winning Cash wallet.
 * Uses srff_winning_cash_{phone} key — same key that Profile.tsx reads.
 * Tracks credited tournaments per phone to avoid double-crediting.
 */
function creditWinningCash(
  phone: string,
  amount: number,
  tournamentId: string,
  tournamentTitle: string,
) {
  if (amount <= 0) return;

  // Prevent double-crediting: check if this tournament already credited for this phone
  const creditedKey = `srff_credited_${phone}`;
  let credited: string[] = [];
  try {
    credited = JSON.parse(
      localStorage.getItem(creditedKey) ?? "[]",
    ) as string[];
  } catch {
    credited = [];
  }
  if (credited.includes(tournamentId)) return; // Already credited

  // Add to winning cash
  const cashKey = `srff_winning_cash_${phone}`;
  const current = Number(localStorage.getItem(cashKey) ?? "0");
  localStorage.setItem(cashKey, String(current + amount));

  // Mark this tournament as credited for this phone
  credited.push(tournamentId);
  localStorage.setItem(creditedKey, JSON.stringify(credited));

  // Send in-app notification to the user
  const notifKey = `srff_user_notifs_${phone}`;
  let notifs: {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }[] = [];
  try {
    notifs = JSON.parse(
      localStorage.getItem(notifKey) ?? "[]",
    ) as typeof notifs;
  } catch {
    notifs = [];
  }
  notifs.unshift({
    id: `win_${tournamentId}_${Date.now()}`,
    title: "🏆 Tournament Winning!",
    message: `Congratulations! ₹${amount} winning amount has been credited to your Winning Cash wallet from "${tournamentTitle}". You can now withdraw it!`,
    time: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(notifKey, JSON.stringify(notifs));
}

interface LocalTournament {
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
  bannerUrl?: string;
}

function getLocalTournaments(): LocalTournament[] {
  try {
    return JSON.parse(
      localStorage.getItem(CREATED_KEY) ?? "[]",
    ) as LocalTournament[];
  } catch {
    return [];
  }
}

function saveLocalTournament(t: LocalTournament) {
  const arr = getLocalTournaments();
  arr.unshift(t);
  localStorage.setItem(CREATED_KEY, JSON.stringify(arr));
}

function deleteLocalTournament(id: string) {
  const arr = getLocalTournaments().filter((t) => t.id !== id);
  localStorage.setItem(CREATED_KEY, JSON.stringify(arr));
}

function getDeleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function addDeleted(id: string) {
  const arr = getDeleted();
  if (!arr.includes(id)) arr.push(id);
  localStorage.setItem(DELETED_KEY, JSON.stringify(arr));
}

interface TournamentOverride {
  title?: string;
  gameMode?: string;
  entryFee?: string;
  prizePool?: string;
  maxPlayers?: string;
  minPlayers?: string;
  status?: string;
  description?: string;
}

function getOverride(id: string): TournamentOverride | null {
  try {
    const all = JSON.parse(
      localStorage.getItem(OVERRIDES_KEY) ?? "{}",
    ) as Record<string, TournamentOverride>;
    return all[id] ?? null;
  } catch {
    return null;
  }
}

function saveOverride(id: string, data: TournamentOverride) {
  try {
    const all = JSON.parse(
      localStorage.getItem(OVERRIDES_KEY) ?? "{}",
    ) as Record<string, TournamentOverride>;
    all[id] = { ...all[id], ...data };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

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
  bannerUrl: string;
}

const TOURNAMENT_BANNERS_KEY = "srff_tournament_banners";

function getTournamentBanners(): Record<string, string> {
  try {
    return JSON.parse(
      localStorage.getItem(TOURNAMENT_BANNERS_KEY) ?? "{}",
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveTournamentBanner(id: string, url: string) {
  const banners = getTournamentBanners();
  banners[id] = url;
  localStorage.setItem(TOURNAMENT_BANNERS_KEY, JSON.stringify(banners));
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
  bannerUrl: "",
};

function TournamentFormModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TournamentForm>(EMPTY_FORM);
  const createMutation = useCreateTournament();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save to backend first — this makes tournament visible to ALL users on ALL devices
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
      // Backend succeeded — also save locally for instant local display
      const localT: LocalTournament = {
        id: `local_${Date.now()}`,
        title: form.title,
        gameMode: form.gameMode,
        entryFee: Number(form.entryFee),
        prizePool: Number(form.prizePool),
        maxPlayers: Number(form.maxPlayers),
        minPlayers: Number(form.minPlayers),
        status: form.status,
        description: form.description,
        startTime: new Date(form.startTime).getTime(),
        playerCount: 0,
      };
      saveLocalTournament(localT);
      window.dispatchEvent(new Event("srff_tournament_updated"));
      toast.success(
        "Tournament create ho gaya! Sabke user panel mein 3 second mein dikh jaayega.",
      );
      setForm(EMPTY_FORM);
      setOpen(false);
      onCreated();
    } catch (err) {
      console.error("Tournament create failed:", err);
      toast.error("Tournament create nahi hua — dobara try karo.");
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
          <div>
            <Label>Tournament Banner Image URL</Label>
            <Input
              value={form.bannerUrl}
              onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              placeholder="https://...image.jpg"
              className="mt-1"
              data-ocid="admin-tournaments.banner.input"
            />
            {form.bannerUrl && (
              <img
                src={form.bannerUrl}
                alt="banner preview"
                className="mt-2 w-8 h-8 rounded object-cover border border-border"
              />
            )}
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

// Edit Tournament Modal
function EditTournamentModal({
  tournament,
  onSaved,
}: {
  tournament: Tournament;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);

  const override = getOverride(tournament.id.toString());

  const [form, setForm] = useState<TournamentForm>({
    title: override?.title ?? tournament.title,
    gameMode: override?.gameMode ?? tournament.gameMode,
    startTime: "",
    entryFee: override?.entryFee ?? String(Number(tournament.entryFee)),
    prizePool: override?.prizePool ?? String(Number(tournament.prizePool)),
    maxPlayers: override?.maxPlayers ?? String(Number(tournament.maxPlayers)),
    minPlayers: override?.minPlayers ?? String(Number(tournament.minPlayers)),
    status: override?.status ?? (tournament.status as string),
    description: override?.description ?? tournament.description,
    bannerUrl: getTournamentBanners()[tournament.id.toString()] ?? "",
  });

  const handleOpen = () => {
    const ov = getOverride(tournament.id.toString());
    setForm({
      title: ov?.title ?? tournament.title,
      gameMode: ov?.gameMode ?? tournament.gameMode,
      startTime: "",
      entryFee: ov?.entryFee ?? String(Number(tournament.entryFee)),
      prizePool: ov?.prizePool ?? String(Number(tournament.prizePool)),
      maxPlayers: ov?.maxPlayers ?? String(Number(tournament.maxPlayers)),
      minPlayers: ov?.minPlayers ?? String(Number(tournament.minPlayers)),
      status: ov?.status ?? (tournament.status as string),
      description: ov?.description ?? tournament.description,
      bannerUrl: getTournamentBanners()[tournament.id.toString()] ?? "",
    });
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveOverride(tournament.id.toString(), {
      title: form.title,
      gameMode: form.gameMode,
      entryFee: form.entryFee,
      prizePool: form.prizePool,
      maxPlayers: form.maxPlayers,
      minPlayers: form.minPlayers,
      status: form.status,
      description: form.description,
    });
    saveTournamentBanner(tournament.id.toString(), form.bannerUrl);
    toast.success("Tournament updated!");
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-2"
          onClick={handleOpen}
          data-ocid="admin-tournaments.edit.open_modal_button"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="admin-tournaments.edit.dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3 py-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tournament title"
              required
              className="mt-1"
              data-ocid="admin-tournaments.edit.title.input"
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
                data-ocid="admin-tournaments.edit.gamemode.select"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Entry Fee (\u20b9)</Label>
              <Input
                type="number"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                className="mt-1"
                data-ocid="admin-tournaments.edit.entryfee.input"
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
                className="mt-1"
                data-ocid="admin-tournaments.edit.prizepool.input"
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
                data-ocid="admin-tournaments.edit.maxplayers.input"
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
                className="mt-1"
                data-ocid="admin-tournaments.edit.minplayers.input"
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
                data-ocid="admin-tournaments.edit.status.select"
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
              data-ocid="admin-tournaments.edit.description.textarea"
            />
          </div>
          <div>
            <Label>Tournament Banner Image URL</Label>
            <Input
              value={form.bannerUrl}
              onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              placeholder="https://...image.jpg"
              className="mt-1"
              data-ocid="admin-tournaments.edit.banner.input"
            />
            {form.bannerUrl && (
              <img
                src={form.bannerUrl}
                alt="banner preview"
                className="mt-2 w-8 h-8 rounded object-cover border border-border"
              />
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            data-ocid="admin-tournaments.edit.save_button"
          >
            Save Changes
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
  const [creditedCount, setCreditedCount] = useState(0);

  // Player-based prizes (when players have joined)
  const [playerPrizes, setPlayerPrizes] = useState<Record<string, string>>({});
  // Fallback manual rows (when no players joined yet)
  const [rows, setRows] = useState<LeaderboardRow[]>([
    { id: 1, position: "1", playerName: "", prize: "" },
    { id: 2, position: "2", playerName: "", prize: "" },
    { id: 3, position: "3", playerName: "", prize: "" },
  ]);

  const [joinedPlayers, setJoinedPlayers] = useState<TournamentPlayer[]>([]);

  const handleOpen = () => {
    const players = getTournamentPlayers(tournament.id.toString());
    setJoinedPlayers(players);
    setCreditedCount(0);

    // Pre-fill prizes from stored winning amounts
    const prizes: Record<string, string> = {};
    for (const p of players) {
      prizes[p.phone] = p.winningAmount ? String(p.winningAmount) : "";
    }
    setPlayerPrizes(prizes);

    // Also populate fallback rows from leaderboard (when no joined players)
    if (players.length === 0 && leaderboard.length > 0) {
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
    const tournamentId = tournament.id.toString();
    const tournamentTitle = tournament.title;
    let entries: [bigint, string, bigint][];
    let newlyCredited = 0;

    if (joinedPlayers.length > 0) {
      // Build leaderboard from joined players + their prizes
      entries = joinedPlayers
        .map((p, idx) => {
          const prize = Number(playerPrizes[p.phone] ?? "0");
          return [BigInt(idx + 1), p.username, BigInt(prize)] as [
            bigint,
            string,
            bigint,
          ];
        })
        .filter(([, , prize]) => prize > BigInt(0));

      // Save winning amounts back to tournament players localStorage
      const updatedPlayers = joinedPlayers.map((p) => ({
        ...p,
        winningAmount: Number(playerPrizes[p.phone] ?? 0),
      }));
      saveTournamentPlayerWinnings(tournamentId, updatedPlayers);

      // AUTO-CREDIT: add winning amount to each player's Winning Cash wallet
      for (const p of joinedPlayers) {
        const amount = Number(playerPrizes[p.phone] ?? 0);
        if (amount > 0) {
          const creditedKey = `srff_credited_${p.phone}`;
          let credited: string[] = [];
          try {
            credited = JSON.parse(
              localStorage.getItem(creditedKey) ?? "[]",
            ) as string[];
          } catch {
            credited = [];
          }
          if (!credited.includes(tournamentId)) {
            creditWinningCash(p.phone, amount, tournamentId, tournamentTitle);
            newlyCredited++;
          }
        }
      }
    } else {
      // Fallback: use manual rows
      entries = rows
        .filter((r) => r.playerName.trim() && r.prize)
        .map(
          (r) =>
            [
              BigInt(Number(r.position)),
              r.playerName.trim(),
              BigInt(Number(r.prize)),
            ] as [bigint, string, bigint],
        );
    }

    try {
      await setLeaderboardMutation.mutateAsync({
        tournamentId: tournament.id,
        entries,
      });
      if (newlyCredited > 0) {
        toast.success(
          `\u2705 Leaderboard save ho gaya! ${newlyCredited} players ke Winning Cash wallet mein amount automatically credit ho gaya.`,
        );
      } else {
        toast.success("Leaderboard save ho gaya!");
      }
      setCreditedCount(newlyCredited);
      refetch();
      setOpen(false);
    } catch {
      // Even if backend fails, localStorage credits are already done
      if (newlyCredited > 0) {
        toast.success(
          `\u2705 ${newlyCredited} players ke wallets mein amount credit ho gaya!`,
        );
      } else {
        toast.error("Save nahi ho saka");
      }
      setOpen(false);
    }
  };

  // Check if already credited for any player
  const alreadyCreditedPhones = joinedPlayers.filter((p) => {
    try {
      const credited = JSON.parse(
        localStorage.getItem(`srff_credited_${p.phone}`) ?? "[]",
      ) as string[];
      return credited.includes(tournament.id.toString());
    } catch {
      return false;
    }
  });

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
        <p className="text-xs text-muted-foreground mb-1">{tournament.title}</p>

        {/* Auto-credit info banner */}
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-600 dark:text-green-400">
            <span className="font-bold">Auto Credit ON:</span> Jab aap prize
            save karoge, system automatically us player ke Winning Cash wallet
            mein amount transfer kar dega. Admin ko alag se kuch karne ki
            zarurat nahi.
          </p>
        </div>

        {alreadyCreditedPhones.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {alreadyCreditedPhones.length} player(s) ko already credit ho
              chuka hai is tournament se.
            </p>
          </div>
        )}

        {creditedCount > 0 && (
          <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/40 rounded-xl px-3 py-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              \u2705 {creditedCount} players ke Winning Cash wallets mein amount
              credit ho gaya!
            </p>
          </div>
        )}

        {joinedPlayers.length > 0 ? (
          /* Players joined — show each with prize input */
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              {joinedPlayers.length} players ne join kiya — inhe prize set karo:
            </p>
            {joinedPlayers.map((player, i) => {
              const av = getAvatarById(player.avatarId);
              const alreadyCredited = alreadyCreditedPhones.some(
                (p) => p.phone === player.phone,
              );
              return (
                <div
                  key={player.phone}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    alreadyCredited
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-muted/30"
                  }`}
                  data-ocid={`admin-tournaments.results.item.${i + 1}`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <img
                      src={av.image}
                      alt={av.label ?? "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {player.username}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {maskPhone(player.phone)}
                      {alreadyCredited && (
                        <span className="text-green-500 font-medium">
                          \u2022 Credited \u2713
                        </span>
                      )}
                    </p>
                  </div>
                  {/* Prize input */}
                  <Input
                    type="number"
                    value={playerPrizes[player.phone] ?? ""}
                    onChange={(e) =>
                      setPlayerPrizes((prev) => ({
                        ...prev,
                        [player.phone]: e.target.value,
                      }))
                    }
                    placeholder="\u20b9 Prize"
                    className="w-24 text-sm"
                    disabled={alreadyCredited}
                    data-ocid={`admin-tournaments.results.player-prize.input.${i + 1}`}
                  />
                </div>
              );
            })}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={setLeaderboardMutation.isPending}
              data-ocid="admin-tournaments.results.save.button"
            >
              {setLeaderboardMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              \uD83D\uDCB8 Prizes Save Karo & Wallets Credit Karo
            </Button>
          </div>
        ) : (
          /* No players joined — fallback manual entry */
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Abhi koi player join nahi kiya. Manually enter karo:
            </p>
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
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTournaments() {
  const { data: allTournaments = [], refetch } = useAllTournaments();
  const [localDeleted, setLocalDeleted] = useState<string[]>(getDeleted);
  const [, forceUpdate] = useState(0);
  const [localCreated, setLocalCreated] =
    useState<LocalTournament[]>(getLocalTournaments);

  const tournaments = allTournaments.filter(
    (t) => !localDeleted.includes(t.id.toString()),
  );

  const handleDelete = (id: string) => {
    if (id.startsWith("local_")) {
      deleteLocalTournament(id);
      setLocalCreated(getLocalTournaments());
    } else {
      addDeleted(id);
      setLocalDeleted(getDeleted());
    }
    toast.success("Tournament delete ho gaya!");
  };

  // Refresh local state on refetch
  const handleRefetch = () => {
    refetch();
    setLocalCreated(getLocalTournaments());
    forceUpdate((n) => n + 1);
  };

  // Apply local overrides to backend tournaments
  const displayBackend = tournaments.map((t) => {
    const ov = getOverride(t.id.toString());
    if (!ov) return t;
    return {
      ...t,
      title: ov.title ?? t.title,
      gameMode: ov.gameMode ?? t.gameMode,
      entryFee: ov.entryFee ? BigInt(Number(ov.entryFee)) : t.entryFee,
      prizePool: ov.prizePool ? BigInt(Number(ov.prizePool)) : t.prizePool,
      maxPlayers: ov.maxPlayers ? BigInt(Number(ov.maxPlayers)) : t.maxPlayers,
      minPlayers: ov.minPlayers ? BigInt(Number(ov.minPlayers)) : t.minPlayers,
      status: (ov.status ?? t.status) as Tournament["status"],
      description: ov.description ?? t.description,
    };
  });

  // Merge local tournaments (shown first) with backend tournaments
  const localAsDisplay = localCreated.map((lt) => ({
    id: lt.id as unknown as bigint,
    title: lt.title,
    gameMode: lt.gameMode,
    entryFee: BigInt(lt.entryFee),
    prizePool: BigInt(lt.prizePool),
    maxPlayers: BigInt(lt.maxPlayers),
    minPlayers: BigInt(lt.minPlayers),
    status: lt.status as Tournament["status"],
    description: lt.description,
    startTime: BigInt(lt.startTime * 1_000_000),
    playerCount: BigInt(lt.playerCount),
  }));

  const displayTournaments = [...localAsDisplay, ...displayBackend];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">
          Free Fire Tournaments
        </h1>
        <TournamentFormModal onCreated={handleRefetch} />
      </div>

      {displayTournaments.length === 0 ? (
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
          {displayTournaments.map((t: Tournament, i: number) => (
            <div
              key={t.id.toString()}
              className="bg-card border border-border rounded-2xl p-4"
              data-ocid={`admin-tournaments.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const b = getTournamentBanners()[t.id.toString()];
                    return b ? (
                      <img
                        src={b}
                        alt="banner"
                        className="w-8 h-8 rounded object-cover border border-border shrink-0"
                      />
                    ) : null;
                  })()}
                  <div>
                    <h3 className="font-display font-bold text-sm">
                      {t.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t.gameMode}
                    </p>
                  </div>
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
                <EditTournamentModal
                  tournament={t}
                  onSaved={() => forceUpdate((n) => n + 1)}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="px-2"
                      data-ocid={`admin-tournaments.delete.button.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin-tournaments.delete.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Tournament Delete Karo?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{t.title}&rdquo; ko delete karne par woh list se
                        hat jaega. Kya aap sure hain?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="admin-tournaments.delete.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(t.id.toString())}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="admin-tournaments.delete.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

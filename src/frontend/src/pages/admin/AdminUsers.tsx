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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  MinusCircle,
  PlusCircle,
  Search,
  Shield,
  ShieldOff,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend.d";
import {
  useAdminAdjustWallet,
  useAllUsers,
  useBlockUser,
  useUnblockUser,
} from "../../hooks/useQueries";

interface RegisteredPlayer {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}

function getRegisteredPlayers(): RegisteredPlayer[] {
  try {
    return JSON.parse(localStorage.getItem("srff_users") || "[]");
  } catch {
    return [];
  }
}

function decodePassword(passwordHash: string): string {
  try {
    return atob(passwordHash);
  } catch {
    return passwordHash;
  }
}

function WalletAdjustDialog({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const adjustMutation = useAdminAdjustWallet();

  const handleAdjust = async (isAdd: boolean) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalo");
      return;
    }
    try {
      await adjustMutation.mutateAsync({
        userId: user.principal,
        amount: BigInt(amt),
        isAdd,
      });
      toast.success(
        `\u20b9${amt} ${isAdd ? "add" : "cut"} ho gaya - ${user.username}`,
      );
      setAmount("");
      setOpen(false);
    } catch (e: any) {
      toast.error(
        e?.message?.includes("Insufficient")
          ? "Insufficient balance"
          : "Failed to adjust wallet",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs border-primary/40 text-primary hover:bg-primary/10"
          data-ocid="admin-users.wallet.open_modal_button"
        >
          <Wallet className="w-3 h-3" /> Wallet
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="admin-users.wallet.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> Wallet Adjust
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Player</p>
            <p className="font-bold">{user.username}</p>
            <p className="text-sm text-warning font-bold mt-1">
              Current Balance: \u20b9{Number(user.walletBalance)}
            </p>
          </div>
          <div>
            <Label>Amount (\u20b9)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Kitna add ya cut karna hai?"
              className="mt-1"
              data-ocid="admin-users.wallet.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleAdjust(true)}
              disabled={adjustMutation.isPending}
              data-ocid="admin-users.wallet.add.button"
            >
              {adjustMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Add Balance
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => handleAdjust(false)}
              disabled={adjustMutation.isPending}
              data-ocid="admin-users.wallet.cut.button"
            >
              {adjustMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MinusCircle className="w-4 h-4" />
              )}
              Cut Balance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { data: users = [] } = useAllUsers();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const [search, setSearch] = useState("");

  const [playersExpanded, setPlayersExpanded] = useState(true);
  const [playerSearch, setPlayerSearch] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    new Set(),
  );

  const registeredPlayers = getRegisteredPlayers();
  const filteredPlayers = registeredPlayers.filter(
    (p) =>
      p.name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.phone?.includes(playerSearch),
  );

  const togglePasswordReveal = (index: number) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const filtered = users.filter(
    (u: UserProfile) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.ffUid.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBlock = async (user: UserProfile) => {
    try {
      await blockMutation.mutateAsync(user.principal);
      toast.success(`${user.username} blocked`);
    } catch {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async (user: UserProfile) => {
    try {
      await unblockMutation.mutateAsync(user.principal);
      toast.success(`${user.username} unblocked`);
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Users</h1>

      {/* Registered Players Section */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/30 via-card to-yellow-950/20 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-orange-300">
                Registered Players
              </h2>
              <p className="text-xs text-muted-foreground">
                Mobile se register hue players
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
              {registeredPlayers.length} Players
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-xs"
              onClick={() => setPlayersExpanded((v) => !v)}
              data-ocid="admin-players.toggle.button"
            >
              {playersExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Players Data Dekhein
                </>
              )}
            </Button>
          </div>
        </div>

        {playersExpanded && (
          <div className="p-5 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Naam ya mobile number se dhundho..."
                className="pl-9 bg-background/50 border-orange-500/20 text-sm"
                data-ocid="admin-players.search.search_input"
              />
            </div>

            {filteredPlayers.length === 0 ? (
              <div
                className="text-center py-14 rounded-xl bg-background/30 border border-orange-500/10"
                data-ocid="admin-players.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 text-orange-400/20" />
                <p className="text-muted-foreground text-sm">
                  {registeredPlayers.length === 0
                    ? "Abhi koi player registered nahi hai"
                    : "Koi player nahi mila"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-orange-500/20">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-950/40 hover:bg-orange-950/40 border-orange-500/20">
                      <TableHead className="text-orange-300 font-bold text-xs w-10">
                        #
                      </TableHead>
                      <TableHead className="text-orange-300 font-bold text-xs">
                        Naam
                      </TableHead>
                      <TableHead className="text-orange-300 font-bold text-xs">
                        Mobile
                      </TableHead>
                      <TableHead className="text-orange-300 font-bold text-xs">
                        FF Name
                      </TableHead>
                      <TableHead className="text-orange-300 font-bold text-xs">
                        Password
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player, i) => (
                      <TableRow
                        key={player.phone || player.name || String(i)}
                        className="border-orange-500/10 hover:bg-orange-500/5"
                        data-ocid={`admin-players.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-white">
                                {player.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                            <span className="font-semibold text-sm">
                              {player.name || "\u2014"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-cyan-400">
                            {player.phone || "\u2014"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {player.email || "\u2014"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-yellow-300">
                              {revealedPasswords.has(i)
                                ? decodePassword(player.passwordHash)
                                : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordReveal(i)}
                              className="text-muted-foreground hover:text-orange-300 transition-colors"
                            >
                              {revealedPasswords.has(i) ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ICP Backend Users + Wallet Management */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-1">
          ICP Users - Wallet Management
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Kisi bhi user ka balance add ya cut karo
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Username ya FF UID se dhundho..."
            className="pl-9"
            data-ocid="admin-users.search.search_input"
          />
        </div>

        {filtered.length === 0 ? (
          <div
            className="text-center py-20"
            data-ocid="admin-users.empty_state"
          >
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {users.length === 0
                ? "No users registered yet"
                : "No users found"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user: UserProfile, i: number) => (
              <div
                key={user.principal.toString()}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                data-ocid={`admin-users.item.${i + 1}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary">
                    {user.username?.charAt(0)?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {user.username || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {user.ffUid || "No UID"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-warning font-bold">
                      \u20b9{Number(user.walletBalance)}
                    </span>
                    <Badge
                      className={`text-xs ${user.isBlocked ? "bg-destructive/20 text-destructive border-0" : "bg-success/20 text-success border-0"}`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <WalletAdjustDialog user={user} />
                  {user.isBlocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs text-success border-success/40 hover:bg-success/10"
                      onClick={() => handleUnblock(user)}
                      disabled={unblockMutation.isPending}
                      data-ocid={`admin-users.unblock.button.${i + 1}`}
                    >
                      {unblockMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => handleBlock(user)}
                      disabled={blockMutation.isPending}
                      data-ocid={`admin-users.block.button.${i + 1}`}
                    >
                      {blockMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ShieldOff className="w-3 h-3" />
                      )}
                      Block
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

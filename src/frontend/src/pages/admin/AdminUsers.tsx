import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Phone,
  PlusCircle,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend.d";
import { useAdminAdjustWallet, useAllUsers } from "../../hooks/useQueries";

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

function MobilePaySection({ users }: { users: UserProfile[] }) {
  const [mobile, setMobile] = useState("");
  const [foundPlayer, setFoundPlayer] = useState<RegisteredPlayer | null>(null);
  const [matchedIcpUser, setMatchedIcpUser] = useState<UserProfile | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [searched, setSearched] = useState(false);
  const adjustMutation = useAdminAdjustWallet();

  const handleSearch = () => {
    const trimmed = mobile.trim();
    if (!trimmed) {
      toast.error("Mobile number daalo");
      return;
    }
    const players = getRegisteredPlayers();
    const found = players.find((p) => p.phone === trimmed);
    setSearched(true);
    if (!found) {
      setFoundPlayer(null);
      setMatchedIcpUser(null);
      toast.error("Is mobile number ka koi user nahi mila");
      return;
    }
    setFoundPlayer(found);
    // Match by name (username) in ICP users
    const icpMatch = users.find(
      (u) => u.username.toLowerCase() === (found.name || "").toLowerCase(),
    );
    setMatchedIcpUser(icpMatch ?? null);
  };

  const handleAdjust = async (isAdd: boolean) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Valid amount daalo");
      return;
    }
    if (!matchedIcpUser) {
      toast.error("ICP user nahi mila — wallet adjust nahi ho sakta");
      return;
    }
    try {
      await adjustMutation.mutateAsync({
        userId: matchedIcpUser.principal,
        amount: BigInt(amt),
        isAdd,
      });
      toast.success(
        `\u20b9${amt} ${isAdd ? "add" : "cut"} ho gaya — ${matchedIcpUser.username} ke wallet mein!`,
      );
      setAmount("");
    } catch (e: any) {
      toast.error(
        e?.message?.includes("Insufficient")
          ? "Insufficient balance"
          : "Wallet adjust nahi ho saka",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-card to-blue-950/20 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-cyan-500/20">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Phone className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-cyan-300">
            📱 Mobile Se Wallet Mein Amount Daalo
          </h2>
          <p className="text-xs text-muted-foreground">
            Mobile number se user dhundho aur balance add/cut karo
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Mobile Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs text-cyan-300 mb-1 block">
              Mobile Number
            </Label>
            <Input
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                setSearched(false);
                setFoundPlayer(null);
                setMatchedIcpUser(null);
              }}
              placeholder="User ka mobile number daalo..."
              type="tel"
              className="bg-background/50 border-cyan-500/30 focus:border-cyan-400"
              data-ocid="admin-mobile-pay.mobile.input"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              onClick={handleSearch}
              data-ocid="admin-mobile-pay.search.button"
            >
              <Search className="w-4 h-4" /> Search
            </Button>
          </div>
        </div>

        {/* Found User Card */}
        {searched && foundPlayer && (
          <div
            className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 space-y-3"
            data-ocid="admin-mobile-pay.found.card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                <span className="font-bold text-white text-sm">
                  {foundPlayer.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">
                  {foundPlayer.name || "—"}
                </p>
                <p className="text-xs text-cyan-400 font-mono">
                  📱 {foundPlayer.phone}
                </p>
                {matchedIcpUser ? (
                  <p className="text-xs text-green-400 font-bold mt-0.5">
                    💰 Balance: ₹{Number(matchedIcpUser.walletBalance)}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-400 mt-0.5">
                    ⚠️ ICP wallet nahi mila (user ne abhi login nahi kiya)
                  </p>
                )}
              </div>
            </div>

            {matchedIcpUser && (
              <div className="space-y-3 pt-1 border-t border-cyan-500/20">
                <div>
                  <Label className="text-xs text-cyan-300 mb-1 block">
                    Amount (₹)
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Kitna add ya cut karna hai?"
                    className="bg-background/50 border-cyan-500/30"
                    data-ocid="admin-mobile-pay.amount.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAdjust(true)}
                    disabled={adjustMutation.isPending || !amount}
                    data-ocid="admin-mobile-pay.add.button"
                  >
                    {adjustMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    ➕ Add to Wallet
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleAdjust(false)}
                    disabled={adjustMutation.isPending || !amount}
                    data-ocid="admin-mobile-pay.cut.button"
                  >
                    {adjustMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MinusCircle className="w-4 h-4" />
                    )}
                    ✂️ Cut from Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {searched && !foundPlayer && (
          <div
            className="text-center py-6 rounded-xl bg-red-950/20 border border-red-500/20"
            data-ocid="admin-mobile-pay.not-found.error_state"
          >
            <p className="text-sm text-red-400 font-semibold">
              ❌ Is mobile number ka koi user nahi mila
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Phone number check karke dobara try karo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { data: users = [] } = useAllUsers();

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

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Users</h1>

      {/* Mobile Pay Section — TOP */}
      <MobilePaySection users={users} />

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
              type="button"
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
    </div>
  );
}

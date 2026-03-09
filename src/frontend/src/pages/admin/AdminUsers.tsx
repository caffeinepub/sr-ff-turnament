import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, ShieldOff, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend.d";
import {
  useAllUsers,
  useBlockUser,
  useUnblockUser,
} from "../../hooks/useQueries";

export default function AdminUsers() {
  const { data: users = [] } = useAllUsers();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const [search, setSearch] = useState("");

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
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl">Users</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or FF UID..."
          className="pl-9"
          data-ocid="admin-users.search.search_input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20" data-ocid="admin-users.empty_state">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {users.length === 0 ? "No users registered yet" : "No users found"}
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
                  <span className="text-xs text-warning">
                    ₹{Number(user.walletBalance)}
                  </span>
                  <Badge
                    className={`text-xs ${user.isBlocked ? "bg-destructive/20 text-destructive border-0" : "bg-success/20 text-success border-0"}`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </div>
              </div>
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
          ))}
        </div>
      )}
    </div>
  );
}

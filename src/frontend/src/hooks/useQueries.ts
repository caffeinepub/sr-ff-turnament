import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionType } from "../backend";
import type {
  AppSettings,
  LeaderboardEntry,
  TournamentView as Tournament,
  TournamentStatus,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

const NOTIFICATIONS_KEY = "srff_global_notifications";

export interface PaymentRequest {
  id: number;
  userPhone: string;
  username: string;
  amount: number;
  requestType: { deposit: null } | { withdraw: null };
  status: { pending: null } | { accepted: null } | { rejected: null };
  timestamp: number;
  note: string;
  upiId: string;
}

export interface GlobalNotification {
  id: number;
  title: string;
  message: string;
  imageUrl: string;
  timestamp: number;
}

// ---- localStorage notification helpers ----
function getLocalNotifications(): GlobalNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalNotification(n: GlobalNotification) {
  const existing = getLocalNotifications();
  if (existing.some((e) => e.id === n.id)) return;
  existing.unshift(n);
  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(existing.slice(0, 50)),
  );
}

function getNextLocalId(): number {
  const existing = getLocalNotifications();
  return existing.length > 0 ? Math.max(...existing.map((e) => e.id)) + 1 : 1;
}

export function useAllTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTournaments();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 3000,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllNotifications() {
  const { actor } = useActor();
  return useQuery<GlobalNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const local = getLocalNotifications();
      // Try to also get from ICP backend and merge
      if (actor) {
        try {
          const backendNotifs = await actor.getAllNotifications();
          const mapped: GlobalNotification[] = backendNotifs.map((n: any) => ({
            id: Number(n.id) + 100000, // offset to avoid id collision with localStorage
            title: n.title,
            message: n.message,
            imageUrl: n.imageUrl,
            timestamp: Number(n.timestamp) / 1_000_000, // nanoseconds to ms
          }));
          // Merge: combine local + backend, deduplicate by title+timestamp
          const combined = [...local];
          for (const bn of mapped) {
            const already = combined.some(
              (l) =>
                l.title === bn.title &&
                Math.abs(l.timestamp - bn.timestamp) < 10000,
            );
            if (!already) combined.push(bn);
          }
          // Sort by timestamp descending
          combined.sort((a, b) => b.timestamp - a.timestamp);
          return combined;
        } catch {
          // backend failed — return local only
        }
      }
      return local;
    },
    staleTime: 0,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
}

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<AppSettings | null>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournamentParticipants(tournamentId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["participants", tournamentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTournamentParticipants(tournamentId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournamentResults(tournamentId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["results", tournamentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTournamentResults(tournamentId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboard(tournamentId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", tournamentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(tournamentId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetLeaderboard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      tournamentId: bigint;
      entries: Array<[bigint, string, bigint]>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setLeaderboard(args.tournamentId, args.entries);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["leaderboard", vars.tournamentId.toString()],
      });
    },
  });
}

export function useJoinTournament() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.joinTournament(tournamentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      gameMode: string;
      startTime: bigint;
      entryFee: bigint;
      prizePool: bigint;
      maxPlayers: bigint;
      minPlayers: bigint;
      status: TournamentStatus;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTournament(
        args.title,
        args.gameMode,
        args.startTime,
        args.entryFee,
        args.prizePool,
        args.maxPlayers,
        args.minPlayers,
        args.status,
        args.description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      message: string;
      imageUrl: string;
    }) => {
      // Always save to localStorage first (guaranteed to work)
      const localId = getNextLocalId();
      const localNotif: GlobalNotification = {
        id: localId,
        title: args.title,
        message: args.message,
        imageUrl: args.imageUrl,
        timestamp: Date.now(),
      };
      saveLocalNotification(localNotif);

      // Set update flag if it's an update notification
      if (/update|\u{1F504}/u.test(args.title)) {
        localStorage.setItem(
          "srff_update_timestamp",
          String(localNotif.timestamp),
        );
      }

      // Also try ICP backend (works if actor has admin token)
      if (actor) {
        try {
          await actor.createNotification(
            args.title,
            args.message,
            args.imageUrl,
          );
        } catch {
          // Backend failed (likely no admin token in URL) — localStorage is the fallback
        }
      }

      return localId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (actor as any).getAllUsers()) as UserProfile[];
      } catch {
        return [] as UserProfile[];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.blockUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unblockUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      userId: Principal;
      amount: bigint;
      type: TransactionType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createWalletTransaction(args.userId, args.amount, args.type);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

// ---- Payment request adapter ----
function adaptOpenPayment(op: any): PaymentRequest {
  return {
    id: Number(op.id),
    userPhone: op.phone,
    username: op.username,
    amount: Number(op.amount),
    requestType:
      op.requestType === "deposit" ? { deposit: null } : { withdraw: null },
    status:
      op.status === "pending"
        ? { pending: null }
        : op.status === "accepted"
          ? { accepted: null }
          : { rejected: null },
    timestamp: Number(op.timestamp) / 1_000_000,
    note: op.note,
    upiId: op.upiId,
  };
}

// ---- Payment request hooks — backend ONLY (no localStorage fallback for writes) ----

export function useSubmitPaymentRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      amount: number;
      requestType: { deposit: null } | { withdraw: null };
      note: string;
      upiId: string;
    }) => {
      const currentUser = JSON.parse(
        localStorage.getItem("srff_current_user") || "null",
      );
      if (!currentUser?.phone) throw new Error("Not logged in");

      // Backend is required — no localStorage fallback for payment requests
      if (!actor) {
        throw new Error("Server se connect nahi ho saka. Dobara try karo.");
      }

      const reqType = "deposit" in args.requestType ? "deposit" : "withdraw";
      const id = await actor.submitOpenPaymentRequest(
        currentUser.phone,
        currentUser.username || currentUser.phone,
        BigInt(args.amount),
        reqType,
        args.note,
        args.upiId,
      );
      return Number(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPaymentRequests"] });
      qc.invalidateQueries({ queryKey: ["allPaymentRequests"] });
    },
  });
}

export function useMyPaymentRequests() {
  const { actor } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["myPaymentRequests"],
    queryFn: async () => {
      const currentUser = JSON.parse(
        localStorage.getItem("srff_current_user") || "null",
      );
      if (!currentUser?.phone) return [];

      if (!actor) return [];
      try {
        const requests = await actor.getMyOpenPaymentRequests(
          currentUser.phone,
        );
        return requests.map(adaptOpenPayment);
      } catch {
        return [];
      }
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
}

export function useAllPaymentRequests() {
  const { actor } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["allPaymentRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const requests = await actor.getAllOpenPaymentRequests();
        return requests.map(adaptOpenPayment);
      } catch (e) {
        console.error("getAllOpenPaymentRequests error:", e);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 0,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdatePaymentRequestStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      requestId: number;
      status: { accepted: null } | { rejected: null };
    }) => {
      const newStatus = "accepted" in args.status ? "accepted" : "rejected";

      if (!actor)
        throw new Error("Server se connect nahi ho saka. Dobara try karo.");

      await actor.updateOpenPaymentStatus(
        BigInt(args.requestId),
        newStatus,
        BigInt(0),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPaymentRequests"] });
      qc.invalidateQueries({ queryKey: ["myPaymentRequests"] });
    },
  });
}

export function useAllPhoneUsers() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allPhoneUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllPhoneUsers();
        return result;
      } catch (e) {
        console.error("getAllPhoneUsers error:", e);
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 0,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminAdjustWallet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      phone: string;
      amount: number;
      isAdd: boolean;
      currentBalance: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      const newBalance = args.isAdd
        ? args.currentBalance + args.amount
        : Math.max(0, args.currentBalance - args.amount);
      return actor.updatePhoneUserBalance(args.phone, BigInt(newBalance));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPhoneUsers"] });
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAdminDeletePhoneUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error("Not connected");
      // Backend has no deletePhoneUser, so zero out the balance
      // and clear from localStorage so they can re-register
      try {
        await actor.updatePhoneUserBalance(phone, BigInt(0));
      } catch {
        // ignore — user may not exist on backend
      }
      // Clear from localStorage
      try {
        const users = JSON.parse(localStorage.getItem("srff_users") || "[]");
        const filtered = users.filter((u: any) => u.phone !== phone);
        localStorage.setItem("srff_users", JSON.stringify(filtered));
      } catch {}
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPhoneUsers"] });
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUpdatePhoneUserWinningCash() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { phone: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePhoneUserWinningCash(args.phone, args.amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPhoneUsers"] });
    },
  });
}

// ---- Promo Banner hooks (backend-based, all devices) ----

export interface BackendPromoBanner {
  id: number;
  title: string;
  subtitle: string;
  imageData: string; // base64
  buttonText: string;
  buttonLink: string;
  active: boolean;
  createdAt: number;
}

export function useAllPromoBanners() {
  const { actor } = useActor();
  return useQuery<BackendPromoBanner[]>({
    queryKey: ["promoBanners"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).getAllPromoBanners();
        return result.map((b: any) => ({
          id: Number(b.id),
          title: b.title,
          subtitle: b.subtitle,
          imageData: b.imageData,
          buttonText: b.buttonText,
          buttonLink: b.buttonLink,
          active: b.active,
          createdAt: Number(b.createdAt),
        }));
      } catch {
        return [];
      }
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
}

export function useSavePromoBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      subtitle: string;
      imageData: string;
      buttonText: string;
      buttonLink: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).savePromoBanner(
        args.title,
        args.subtitle,
        args.imageData,
        args.buttonText,
        args.buttonLink,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoBanners"] }),
  });
}

export function useUpdatePromoBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: number;
      title: string;
      subtitle: string;
      imageData: string;
      buttonText: string;
      buttonLink: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updatePromoBanner(
        BigInt(args.id),
        args.title,
        args.subtitle,
        args.imageData,
        args.buttonText,
        args.buttonLink,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoBanners"] }),
  });
}

export function useTogglePromoBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).togglePromoBanner(BigInt(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoBanners"] }),
  });
}

export function useDeletePromoBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deletePromoBanner(BigInt(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promoBanners"] }),
  });
}

export function useSaveTournamentBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { tournamentId: string; imageData: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).saveTournamentBanner(
        args.tournamentId,
        args.imageData,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournamentBanners"] }),
  });
}

export function useAllTournamentBanners() {
  const { actor } = useActor();
  return useQuery<Record<string, string>>({
    queryKey: ["tournamentBanners"],
    queryFn: async () => {
      if (!actor) return {};
      try {
        const result = (await (
          actor as any
        ).getAllTournamentBanners()) as Array<[string, string]>;
        const map: Record<string, string> = {};
        for (const [k, v] of result) map[k] = v;
        return map;
      } catch {
        return {};
      }
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
}

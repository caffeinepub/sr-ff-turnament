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

const PAYMENTS_KEY = "srff_payment_requests";
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

// ---- Payment request hooks — backend-first with localStorage fallback ----

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
      const reqType = "deposit" in args.requestType ? "deposit" : "withdraw";

      // Try backend first
      if (actor) {
        try {
          const id = await actor.submitOpenPaymentRequest(
            currentUser.phone,
            currentUser.username || currentUser.phone,
            BigInt(args.amount),
            reqType,
            args.note,
            args.upiId,
          );
          return Number(id);
        } catch (err) {
          console.error(
            "Backend submitPaymentRequest failed, falling back to localStorage:",
            err,
          );
        }
      }

      // Fallback to localStorage
      const requests: PaymentRequest[] = JSON.parse(
        localStorage.getItem(PAYMENTS_KEY) || "[]",
      );
      const newId =
        requests.length > 0 ? Math.max(...requests.map((r) => r.id)) + 1 : 1;
      const newReq: PaymentRequest = {
        id: newId,
        userPhone: currentUser.phone,
        username: currentUser.username || currentUser.phone,
        amount: args.amount,
        requestType: args.requestType,
        status: { pending: null },
        timestamp: Date.now(),
        note: args.note,
        upiId: args.upiId,
      };
      requests.push(newReq);
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(requests));
      return newId;
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

      // Try backend first
      if (actor) {
        try {
          const requests = await actor.getMyOpenPaymentRequests(
            currentUser.phone,
          );
          return requests.map(adaptOpenPayment);
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback to localStorage
      const requests: PaymentRequest[] = JSON.parse(
        localStorage.getItem(PAYMENTS_KEY) || "[]",
      );
      return requests.filter((r) => r.userPhone === currentUser.phone);
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
      // Try backend first
      if (actor) {
        try {
          const requests = await actor.getAllOpenPaymentRequests();
          return requests.map(adaptOpenPayment);
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback to localStorage
      return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || "[]");
    },
    staleTime: 0,
    refetchInterval: 3000,
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

      // Try backend first
      if (actor) {
        try {
          await actor.updateOpenPaymentStatus(
            BigInt(args.requestId),
            newStatus,
            BigInt(0),
          );
          return;
        } catch (err) {
          console.error(
            "Backend updatePaymentStatus failed, falling back to localStorage:",
            err,
          );
        }
      }

      // Fallback to localStorage
      const requests: PaymentRequest[] = JSON.parse(
        localStorage.getItem(PAYMENTS_KEY) || "[]",
      );
      const idx = requests.findIndex((r) => r.id === args.requestId);
      if (idx === -1) throw new Error("Request not found");
      const req = requests[idx];
      requests[idx] = { ...req, status: args.status };
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(requests));

      if ("accepted" in args.status && "deposit" in req.requestType) {
        const users = JSON.parse(localStorage.getItem("srff_users") || "[]");
        const userIdx = users.findIndex((u: any) => u.phone === req.userPhone);
        if (userIdx !== -1) {
          users[userIdx].walletBalance =
            (users[userIdx].walletBalance || 0) + req.amount;
          localStorage.setItem("srff_users", JSON.stringify(users));
          const cu = JSON.parse(
            localStorage.getItem("srff_current_user") || "null",
          );
          if (cu?.phone === req.userPhone) {
            cu.walletBalance = users[userIdx].walletBalance;
            localStorage.setItem("srff_current_user", JSON.stringify(cu));
          }
        }
      }

      if ("accepted" in args.status && "withdraw" in req.requestType) {
        const cashKey = `srff_winning_cash_${req.userPhone}`;
        const cur = Number(localStorage.getItem(cashKey) || "0");
        localStorage.setItem(cashKey, String(Math.max(0, cur - req.amount)));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPaymentRequests"] });
      qc.invalidateQueries({ queryKey: ["myPaymentRequests"] });
    },
  });
}

export function useAllPhoneUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allPhoneUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPhoneUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 5000,
  });
}

export function useAdminAdjustWallet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      userId: Principal;
      amount: bigint;
      isAdd: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).adminAdjustWallet(
        args.userId,
        args.amount,
        args.isAdd,
      ) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

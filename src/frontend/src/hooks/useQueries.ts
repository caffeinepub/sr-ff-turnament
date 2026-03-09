import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionType } from "../backend";
import type {
  AppSettings,
  Tournament,
  TournamentStatus,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export interface PaymentRequest {
  id: bigint;
  userId: Principal;
  username: string;
  amount: bigint;
  requestType: { deposit: null } | { withdraw: null };
  status: { pending: null } | { accepted: null } | { rejected: null };
  timestamp: bigint;
  note: string;
  upiId: string;
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
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotifications();
    },
    enabled: !!actor && !isFetching,
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
      if (!actor) throw new Error("Not connected");
      return actor.createNotification(args.title, args.message, args.imageUrl);
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

// Payment request hooks
export function useSubmitPaymentRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      amount: bigint;
      requestType: { deposit: null } | { withdraw: null };
      note: string;
      upiId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).submitPaymentRequest(
        args.amount,
        args.requestType,
        args.note,
        args.upiId,
      ) as Promise<bigint>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPaymentRequests"] });
    },
  });
}

export function useMyPaymentRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["myPaymentRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (
          actor as any
        ).getMyPaymentRequests()) as PaymentRequest[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPaymentRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["allPaymentRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (
          actor as any
        ).getAllPaymentRequests()) as PaymentRequest[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePaymentRequestStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      requestId: bigint;
      status: { accepted: null } | { rejected: null };
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updatePaymentRequestStatus(
        args.requestId,
        args.status,
      ) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPaymentRequests"] });
    },
  });
}

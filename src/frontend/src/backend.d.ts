import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AppSettings {
    upiDetails: string;
    announcementText: string;
    refundPolicy: string;
    privacyPolicy: string;
    appName: string;
    minWithdraw: bigint;
    termsAndConditions: string;
    supportContact: string;
    referralBonus: bigint;
}
export interface Notification {
    id: bigint;
    title: string;
    imageUrl: string;
    message: string;
    timestamp: bigint;
}
export interface TournamentResult {
    playerId: Principal;
    prize: bigint;
    position: bigint;
}
export interface Tournament {
    id: bigint;
    startTime: bigint;
    status: TournamentStatus;
    title: string;
    playerCount: bigint;
    description: string;
    gameMode: string;
    entryFee: bigint;
    maxPlayers: bigint;
    prizePool: bigint;
}
export interface UserProfile {
    principal: Principal;
    referralCode: string;
    username: string;
    isBlocked: boolean;
    walletBalance: bigint;
    ffUid: string;
}
export enum TournamentStatus {
    upcoming = "upcoming",
    complete = "complete",
    ongoing = "ongoing"
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(userId: Principal): Promise<void>;
    createNotification(title: string, message: string, imageUrl: string): Promise<void>;
    createTournament(title: string, gameMode: string, startTime: bigint, entryFee: bigint, prizePool: bigint, maxPlayers: bigint, status: TournamentStatus, description: string): Promise<bigint>;
    createWalletTransaction(userId: Principal, amount: bigint, transactionType: TransactionType): Promise<bigint>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllTournaments(): Promise<Array<Tournament>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSettings(): Promise<AppSettings | null>;
    getTournamentParticipants(tournamentId: bigint): Promise<Array<Principal>>;
    getTournamentResults(tournamentId: bigint): Promise<Array<TournamentResult>>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinTournament(tournamentId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTournamentResults(tournamentId: bigint, positions: Array<[bigint, bigint, Principal]>): Promise<void>;
    unblockUser(userId: Principal): Promise<void>;
    updateSettings(newSettings: AppSettings): Promise<void>;
}

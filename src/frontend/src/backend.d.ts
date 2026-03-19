import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    playerName: string;
    prize: bigint;
    position: bigint;
}
export interface TournamentView {
    id: bigint;
    startTime: bigint;
    status: TournamentStatus;
    title: string;
    minPlayers: bigint;
    playerCount: bigint;
    description: string;
    gameMode: string;
    entryFee: bigint;
    maxPlayers: bigint;
    prizePool: bigint;
}
export interface TournamentResult {
    playerId: Principal;
    prize: bigint;
    position: bigint;
}
export interface PhoneUser {
    referralCode: string;
    username: string;
    winningCash: bigint;
    passwordHash: string;
    ffName: string;
    phone: string;
    registeredAt: bigint;
    walletBalance: bigint;
}
export interface AppSettings {
    upiDetails: string;
    announcementText: string;
    refundPolicy: string;
    privacyPolicy: string;
    minDeposit: bigint;
    appName: string;
    minWithdraw: bigint;
    termsAndConditions: string;
    supportContact: string;
    referralBonus: bigint;
}
export interface PhoneUserView {
    referralCode: string;
    username: string;
    winningCash: bigint;
    ffName: string;
    phone: string;
    registeredAt: bigint;
    walletBalance: bigint;
}
export interface Notification {
    id: bigint;
    title: string;
    imageUrl: string;
    message: string;
    timestamp: bigint;
}
export interface PaymentRequest {
    id: bigint;
    status: PaymentRequestStatus;
    username: string;
    userId: Principal;
    note: string;
    timestamp: bigint;
    upiId: string;
    amount: bigint;
    requestType: PaymentRequestType;
}
export interface OpenPaymentRequest {
    id: bigint;
    status: string;
    username: string;
    note: string;
    timestamp: bigint;
    upiId: string;
    phone: string;
    amount: bigint;
    approvedAmount: bigint;
    requestType: string;
}
export interface UserProfile {
    principal: Principal;
    referralCode: string;
    username: string;
    isBlocked: boolean;
    walletBalance: bigint;
    ffUid: string;
}
export enum PaymentRequestStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum PaymentRequestType {
    withdraw = "withdraw",
    deposit = "deposit"
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
    createTournament(title: string, gameMode: string, startTime: bigint, entryFee: bigint, prizePool: bigint, maxPlayers: bigint, minPlayers: bigint, status: TournamentStatus, description: string): Promise<bigint>;
    createWalletTransaction(userId: Principal, amount: bigint, transactionType: TransactionType): Promise<bigint>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllOpenPaymentRequests(): Promise<Array<OpenPaymentRequest>>;
    getAllPaymentRequests(): Promise<Array<PaymentRequest>>;
    getAllPhoneUsers(): Promise<Array<PhoneUserView>>;
    getAllTournaments(): Promise<Array<TournamentView>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(tournamentId: bigint): Promise<Array<LeaderboardEntry>>;
    getMyOpenPaymentRequests(phone: string): Promise<Array<OpenPaymentRequest>>;
    getMyPaymentRequests(): Promise<Array<PaymentRequest>>;
    getPhoneUser(phone: string): Promise<PhoneUser | null>;
    getSettings(): Promise<AppSettings | null>;
    getTournamentParticipants(tournamentId: bigint): Promise<Array<Principal>>;
    getTournamentResults(tournamentId: bigint): Promise<Array<TournamentResult>>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinTournament(tournamentId: bigint): Promise<void>;
    phoneUserExists(phone: string): Promise<boolean>;
    registerPhoneUser(phone: string, username: string, ffName: string, passwordHash: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setLeaderboard(tournamentId: bigint, entries: Array<[bigint, string, bigint]>): Promise<void>;
    setTournamentResults(tournamentId: bigint, positions: Array<[bigint, bigint, Principal]>): Promise<void>;
    submitOpenPaymentRequest(phone: string, username: string, amount: bigint, requestType: string, note: string, upiId: string): Promise<bigint>;
    submitPaymentRequest(amount: bigint, requestType: PaymentRequestType, note: string, upiId: string): Promise<bigint>;
    unblockUser(userId: Principal): Promise<void>;
    updateOpenPaymentStatus(requestId: bigint, newStatus: string, approvedAmount: bigint): Promise<bigint>;
    updatePaymentRequestStatus(requestId: bigint, newStatus: PaymentRequestStatus): Promise<void>;
    updatePhoneUserBalance(phone: string, balance: bigint): Promise<void>;
    updatePhoneUserWinningCash(phone: string, amount: bigint): Promise<void>;
    updateSettings(newSettings: AppSettings): Promise<void>;
}

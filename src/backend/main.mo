import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // ------------------- Types and Comparison Functions --------------------

  public type TournamentStatus = {
    #upcoming;
    #ongoing;
    #complete;
  };

  public type Tournament = {
    id : Nat;
    title : Text;
    gameMode : Text;
    startTime : Int;
    entryFee : Nat;
    prizePool : Nat;
    maxPlayers : Nat;
    status : TournamentStatus;
    description : Text;
    playerCount : Nat;
  };

  // TournamentView includes minPlayers (stored separately for backwards compat)
  public type TournamentView = {
    id : Nat;
    title : Text;
    gameMode : Text;
    startTime : Int;
    entryFee : Nat;
    prizePool : Nat;
    maxPlayers : Nat;
    minPlayers : Nat;
    status : TournamentStatus;
    description : Text;
    playerCount : Nat;
  };

  module Tournament {
    public func compare(t1 : Tournament, t2 : Tournament) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };

    public func compareByStartTime(t1 : Tournament, t2 : Tournament) : Order.Order {
      Int.compare(t1.startTime, t2.startTime);
    };
  };

  public type TournamentResult = {
    position : Nat;
    prize : Nat;
    playerId : Principal;
  };

  public type LeaderboardEntry = {
    position : Nat;
    playerName : Text;
    prize : Nat;
  };

  public type TransactionType = { #deposit; #withdrawal };

  public type Transaction = {
    id : Nat;
    userId : Principal;
    amount : Nat;
    transactionType : TransactionType;
    timestamp : Int;
  };

  public type Notification = {
    id : Nat;
    title : Text;
    message : Text;
    imageUrl : Text;
    timestamp : Int;
  };

  public type AppSettings = {
    appName : Text;
    minWithdraw : Nat;
    referralBonus : Nat;
    minDeposit : Nat;
    supportContact : Text;
    upiDetails : Text;
    privacyPolicy : Text;
    termsAndConditions : Text;
    refundPolicy : Text;
    announcementText : Text;
  };

  public type PaymentRequestType = { #deposit; #withdraw };
  public type PaymentRequestStatus = { #pending; #accepted; #rejected };

  public type PaymentRequest = {
    id : Nat;
    userId : Principal;
    username : Text;
    amount : Nat;
    requestType : PaymentRequestType;
    status : PaymentRequestStatus;
    timestamp : Int;
    note : Text;
    upiId : Text;
  };

  public type UserProfile = {
    username : Text;
    ffUid : Text;
    walletBalance : Nat;
    referralCode : Text;
    isBlocked : Bool;
    principal : Principal;
  };

  // New PhoneUser type for mobile/phone-based users
  public type PhoneUser = {
    phone : Text;
    username : Text;
    ffName : Text;
    passwordHash : Text;
    walletBalance : Nat;
    winningCash : Nat;
    referralCode : Text;
    registeredAt : Int;
  };

  // Public view of PhoneUser (without passwordHash)
  public type PhoneUserView = {
    phone : Text;
    username : Text;
    ffName : Text;
    walletBalance : Nat;
    winningCash : Nat;
    referralCode : Text;
    registeredAt : Int;
  };

  // New OpenPaymentRequest type for open payment requests (phone-based)
  public type OpenPaymentRequest = {
    id : Nat;
    phone : Text;
    username : Text;
    amount : Nat;
    requestType : Text; // "deposit" or "withdraw"
    status : Text; // "pending", "accepted", "rejected"
    note : Text; // UTR number for deposit
    upiId : Text;
    timestamp : Int;
    approvedAmount : Nat;
  };

  // ------------------------ Persistent Storage ---------------------------

  // Users
  let users = Map.empty<Principal, UserProfile>();

  // Tournaments
  let tournaments = Map.empty<Nat, Tournament>();
  var nextTournamentId = 0;

  // Tournament Players
  let tournamentPlayers = Map.empty<Nat, List.List<Principal>>();
  type TournamentResults = List.List<TournamentResult>;
  let tournamentResults = Map.empty<Nat, TournamentResults>();

  // Tournament min players (separate map for backwards compat)
  let tournamentMinPlayers = Map.empty<Nat, Nat>();

  // Tournament Leaderboard (admin-managed winner entries)
  type LeaderboardEntries = List.List<LeaderboardEntry>;
  let tournamentLeaderboards = Map.empty<Nat, LeaderboardEntries>();

  // Notifications
  let notifications = Map.empty<Nat, Notification>();
  var nextNotificationId = 0;

  // Transactions
  let transactions = Map.empty<Nat, Transaction>();
  var nextTransactionId = 0;

  // Payment Requests
  let paymentRequests = Map.empty<Nat, PaymentRequest>();
  var nextPaymentRequestId = 0;

  var settings : ?AppSettings = null;

  // Phone Users
  let phoneUsers = Map.empty<Text, PhoneUser>();

  // Open Payment Requests (for phone users)
  let openPaymentRequests = Map.empty<Nat, OpenPaymentRequest>();
  var nextOpenPaymentRequestId = 0;

  // ---------------------- Authorization (RBAC) ---------------------------

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ---------------------- User Management APIs ---------------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    if (caller != userPrincipal and not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(userPrincipal);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, { profile with principal = caller });
  };

  public shared ({ caller }) func blockUser(userId : Principal) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can block users");
    };
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        users.add(userId, { profile with isBlocked = true });
      };
    };
  };

  public shared ({ caller }) func unblockUser(userId : Principal) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can unblock users");
    };
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        users.add(userId, { profile with isBlocked = false });
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  // -------------------- Phone User Registration APIs ---------------------

  // Public registration - anyone can register a new phone user
  public shared ({ caller }) func registerPhoneUser(phone : Text, username : Text, ffName : Text, passwordHash : Text) : async () {
    switch (phoneUsers.get(phone)) {
      case (null) {
        let newUser : PhoneUser = {
          phone;
          username;
          ffName;
          passwordHash;
          walletBalance = 0;
          winningCash = 0;
          referralCode = "";
          registeredAt = Time.now();
        };
        phoneUsers.add(phone, newUser);
      };
      case (?_) {
        Runtime.trap("User already exists with this phone number");
      };
    };
  };

  // Admin-only: Get all phone users
  public query ({ caller }) func getAllPhoneUsers() : async [PhoneUserView] {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all phone users");
    };
    phoneUsers.values().toArray().map(func(user : PhoneUser) : PhoneUserView {
      {
        phone = user.phone;
        username = user.username;
        ffName = user.ffName;
        walletBalance = user.walletBalance;
        winningCash = user.winningCash;
        referralCode = user.referralCode;
        registeredAt = user.registeredAt;
      }
    });
  };

  // Public: Get phone user for login validation (returns full user including passwordHash)
  // Note: Frontend should validate password client-side or use secure authentication flow
  public query ({ caller }) func getPhoneUser(phone : Text) : async ?PhoneUser {
    phoneUsers.get(phone);
  };

  // Public: Check if phone exists
  public query ({ caller }) func phoneUserExists(phone : Text) : async Bool {
    phoneUsers.containsKey(phone);
  };

  // Admin-only: Update phone user balance
  public shared ({ caller }) func updatePhoneUserBalance(phone : Text, balance : Nat) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can update user balances");
    };
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone user not found") };
      case (?user) {
        phoneUsers.add(phone, { user with walletBalance = balance });
      };
    };
  };

  // Admin-only: Update phone user winning cash
  public shared ({ caller }) func updatePhoneUserWinningCash(phone : Text, amount : Nat) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can update winning cash");
    };
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone user not found") };
      case (?user) {
        phoneUsers.add(phone, { user with winningCash = amount });
      };
    };
  };

  // Internal helper: Increment phone user balance (used by payment approval)
  func incrementPhoneUserBalanceInternal(phone : Text, amount : Nat) : () {
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone user not found") };
      case (?user) {
        let newBalance = user.walletBalance + amount;
        phoneUsers.add(phone, { user with walletBalance = newBalance });
      };
    };
  };

  // Internal helper: Decrement phone user balance
  func decrementPhoneUserBalanceInternal(phone : Text, amount : Nat) : () {
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone user not found") };
      case (?user) {
        if (user.walletBalance < amount) {
          Runtime.trap("Insufficient funds to decrement wallet");
        };
        let newBalance = user.walletBalance - amount;
        phoneUsers.add(phone, { user with walletBalance = newBalance });
      };
    };
  };

  // ------------------ Open Payment Request APIs ----------------------

  // Public: Submit payment request (anyone can submit for their phone number)
  public shared ({ caller }) func submitOpenPaymentRequest(phone : Text, username : Text, amount : Nat, requestType : Text, note : Text, upiId : Text) : async Nat {
    // Verify phone user exists
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone user not found") };
      case (?_) { /* OK */ };
    };

    let newId = nextOpenPaymentRequestId;
    let req : OpenPaymentRequest = {
      id = newId;
      phone;
      username;
      amount;
      requestType;
      status = "pending";
      note;
      upiId;
      timestamp = Time.now();
      approvedAmount = 0;
    };

    openPaymentRequests.add(newId, req);
    nextOpenPaymentRequestId += 1;
    newId;
  };

  // Admin-only: Get all open payment requests
  public query ({ caller }) func getAllOpenPaymentRequests() : async [OpenPaymentRequest] {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payment requests");
    };
    openPaymentRequests.values().toArray();
  };

  // Admin-only: Update payment request status and approve/reject
  public shared ({ caller }) func updateOpenPaymentStatus(requestId : Nat, newStatus : Text, approvedAmount : Nat) : async Nat {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };

    let currentReq = switch (openPaymentRequests.get(requestId)) {
      case (null) { Runtime.trap("Open Payment Request not found") };
      case (?req) { req };
    };

    openPaymentRequests.add(requestId, {
      currentReq with
      status = newStatus;
      approvedAmount;
    });

    // Auto-credit wallet for accepted deposits
    if (currentReq.requestType == "deposit" and newStatus == "accepted") {
      incrementPhoneUserBalanceInternal(currentReq.phone, approvedAmount);
    };

    // Return updated balance
    switch (phoneUsers.get(currentReq.phone)) {
      case (null) { 0 };
      case (?user) { user.walletBalance };
    };
  };

  // Public: Get payment requests for a specific phone number
  public query ({ caller }) func getMyOpenPaymentRequests(phone : Text) : async [OpenPaymentRequest] {
    let allValues = openPaymentRequests.values().toArray();
    allValues.filter(func(req : OpenPaymentRequest) : Bool { req.phone == phone });
  };

  // ---------------------- Tournament APIs ---------------------------

  public shared ({ caller }) func createTournament(title : Text, gameMode : Text, startTime : Int, entryFee : Nat, prizePool : Nat, maxPlayers : Nat, minPlayers : Nat, status : TournamentStatus, description : Text) : async Nat {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };
    let tournament : Tournament = {
      id = nextTournamentId;
      title;
      gameMode;
      startTime;
      entryFee;
      prizePool;
      maxPlayers;
      status;
      description;
      playerCount = 0;
    };
    tournaments.add(tournament.id, tournament);
    tournamentMinPlayers.add(tournament.id, minPlayers);
    tournamentPlayers.add(tournament.id, List.empty<Principal>());
    nextTournamentId += 1;
    tournament.id;
  };

  public shared ({ caller }) func joinTournament(tournamentId : Nat) : async () {
    if (not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized: Only users can join tournaments");
    };

    let profile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (profile.isBlocked) { Runtime.trap("User is blocked") };

    let tournament = switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };

    if (tournament.playerCount >= tournament.maxPlayers) {
      Runtime.trap("Tournament is full");
    };

    if (profile.walletBalance < tournament.entryFee) {
      Runtime.trap("Insufficient funds");
    };

    let joinedPlayers = switch (tournamentPlayers.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?players) { players };
    };

    if (joinedPlayers.contains(caller)) {
      Runtime.trap("User already joined tournament");
    };

    switch (tournaments.get(tournamentId)) {
      case (?tournament) {
        let newTournament : Tournament = {
          tournament with
          playerCount = tournament.playerCount + 1;
        };
        tournaments.add(tournament.id, newTournament);
      };
      case (null) { Runtime.trap("Tournament not found") };
    };

    let updatedPlayers = List.fromIter(joinedPlayers.values());
    updatedPlayers.add(caller);
    tournamentPlayers.add(tournamentId, updatedPlayers);

    let updatedProfile = {
      profile with walletBalance = (if (profile.walletBalance >= tournament.entryFee) { profile.walletBalance - tournament.entryFee } else { Runtime.trap("Insufficient funds") });
    };
    users.add(caller, updatedProfile);
  };

  public shared ({ caller }) func setTournamentResults(tournamentId : Nat, positions : [(Nat, Nat, Principal)]) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can set tournament results");
    };

    let resultsList = List.empty<TournamentResult>();
    positions.forEach(
      func((position, prize, playerId)) {
        resultsList.add({
          position;
          prize;
          playerId;
        });
      }
    );
    tournamentResults.add(tournamentId, resultsList);

    positions.forEach(
      func((_, prize, playerId)) {
        switch (users.get(playerId)) {
          case (null) { () };
          case (?profile) {
            users.add(playerId, { profile with walletBalance = profile.walletBalance + prize });
          };
        };
      }
    );
  };

  // Admin sets leaderboard with player names and prizes
  public shared ({ caller }) func setLeaderboard(tournamentId : Nat, entries : [(Nat, Text, Nat)]) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can set leaderboard");
    };
    let entriesList = List.empty<LeaderboardEntry>();
    entries.forEach(
      func((position, playerName, prize)) {
        entriesList.add({ position; playerName; prize });
      }
    );
    tournamentLeaderboards.add(tournamentId, entriesList);
  };

  public query ({ caller }) func getLeaderboard(tournamentId : Nat) : async [LeaderboardEntry] {
    switch (tournamentLeaderboards.get(tournamentId)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  // ------------------- Wallet and Transaction APIs -----------------------

  public shared ({ caller }) func createWalletTransaction(userId : Principal, amount : Nat, transactionType : TransactionType) : async Nat {
    if (caller != userId and not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Can only create transactions for yourself");
    };

    if (caller == userId and not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };

    let profile = switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };

    if (profile.isBlocked) {
      Runtime.trap("User is blocked");
    };

    if (transactionType == #withdrawal) {
      let currentSettings = switch (settings) {
        case (null) { Runtime.trap("App settings not configured") };
        case (?s) { s };
      };

      if (amount < currentSettings.minWithdraw) {
        Runtime.trap("Amount below minimum withdrawal limit");
      };

      if (profile.walletBalance < amount) {
        Runtime.trap("Insufficient balance for withdrawal");
      };

      let updatedProfile = {
        profile with walletBalance = (if (profile.walletBalance >= amount) { profile.walletBalance - amount } else { Runtime.trap("Insufficient balance") });
      };
      users.add(userId, updatedProfile);
    };

    if (transactionType == #deposit) {
      let updatedProfile = {
        profile with walletBalance = profile.walletBalance + amount;
      };
      users.add(userId, updatedProfile);
    };

    let transaction : Transaction = {
      id = nextTransactionId;
      userId;
      amount;
      transactionType;
      timestamp = Time.now();
    };

    transactions.add(transaction.id, transaction);
    nextTransactionId += 1;

    transaction.id;
  };

  // ------------------- Payment Request APIs -----------------------

  public shared ({ caller }) func submitPaymentRequest(amount : Nat, requestType : PaymentRequestType, note : Text, upiId : Text) : async Nat {
    if (not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit payment requests");
    };

    let profile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };

    if (profile.isBlocked) {
      Runtime.trap("User is blocked");
    };

    if (requestType == #withdraw) {
      if (profile.walletBalance < amount) {
        Runtime.trap("Insufficient balance for withdrawal");
      };
    };

    let req : PaymentRequest = {
      id = nextPaymentRequestId;
      userId = caller;
      username = profile.username;
      amount;
      requestType;
      status = #pending;
      timestamp = Time.now();
      note;
      upiId;
    };

    paymentRequests.add(req.id, req);
    nextPaymentRequestId += 1;
    req.id;
  };

  public query ({ caller }) func getMyPaymentRequests() : async [PaymentRequest] {
    if (not hasPermissionInternal(caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let all = paymentRequests.values().toArray();
    all.filter(func(r : PaymentRequest) : Bool { r.userId == caller });
  };

  public query ({ caller }) func getAllPaymentRequests() : async [PaymentRequest] {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payment requests");
    };
    paymentRequests.values().toArray();
  };

  public shared ({ caller }) func updatePaymentRequestStatus(requestId : Nat, newStatus : PaymentRequestStatus) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can update payment request status");
    };

    let req = switch (paymentRequests.get(requestId)) {
      case (null) { Runtime.trap("Payment request not found") };
      case (?r) { r };
    };

    if (newStatus == #accepted) {
      if (req.requestType == #deposit) {
        switch (users.get(req.userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?profile) {
            users.add(req.userId, { profile with walletBalance = profile.walletBalance + req.amount });
          };
        };
      };
    };

    paymentRequests.add(requestId, { req with status = newStatus });
  };

  // ----------------------- Notification APIs -----------------------------

  public shared ({ caller }) func createNotification(title : Text, message : Text, imageUrl : Text) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };
    let id = nextNotificationId;
    let notification : Notification = {
      id;
      title;
      message;
      imageUrl;
      timestamp = Time.now();
    };
    notifications.add(id, notification);
    nextNotificationId += 1;
  };

  public query ({ caller }) func getAllNotifications() : async [Notification] {
    notifications.values().toArray();
  };

  // ----------------------- App Settings API ------------------------------

  public shared ({ caller }) func updateSettings(newSettings : AppSettings) : async () {
    if (not isAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := ?newSettings;
  };

  public query ({ caller }) func getSettings() : async ?AppSettings {
    settings;
  };

  // ---------------------- Helper & State APIs ---------------------------

  func isAdminInternal(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func hasPermissionInternal(caller : Principal, role : AccessControl.UserRole) : Bool {
    AccessControl.hasPermission(accessControlState, caller, role);
  };

  public query ({ caller }) func getAllTournaments() : async [TournamentView] {
    let ts = tournaments.values().toArray().sort();
    ts.map(func(t : Tournament) : TournamentView {
      {
        id = t.id;
        title = t.title;
        gameMode = t.gameMode;
        startTime = t.startTime;
        entryFee = t.entryFee;
        prizePool = t.prizePool;
        maxPlayers = t.maxPlayers;
        minPlayers = switch (tournamentMinPlayers.get(t.id)) { case (null) { 0 }; case (?v) { v } };
        status = t.status;
        description = t.description;
        playerCount = t.playerCount;
      }
    });
  };

  public query ({ caller }) func getTournamentParticipants(tournamentId : Nat) : async [Principal] {
    switch (tournamentPlayers.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?players) { players.toArray() };
    };
  };

  public query ({ caller }) func getTournamentResults(tournamentId : Nat) : async [TournamentResult] {
    switch (tournamentResults.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?results) { results.toArray() };
    };
  };
};

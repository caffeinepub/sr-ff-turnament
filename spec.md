# SR-FF-TOURNAMENT

## Current State
A full Free Fire tournament management app with admin and user panels. Major issues found: localStorage-only data for critical features, non-existent backend functions called, hardcoded values ignoring settings, missing onClick handlers, duplicate join bugs, and balance display not synced with backend.

## Requested Changes (Diff)

### Add
- Players button onClick in AdminTournaments to show joined players list
- Try/catch for JSON.parse on welcome flags in Home.tsx
- Backend-synced balance display using useAllPhoneUsers hook
- Backend-synced winning cash using phone user data
- Tournament banners in Tournaments.tsx from backend (useAllTournamentBanners)

### Modify
- `useAdminAdjustWallet` in useQueries.ts: use `updatePhoneUserBalance(phone, newBalance)` instead of non-existent `adminAdjustWallet`
- `useAdminDeletePhoneUser` in useQueries.ts: use proper error since no backend delete function
- AdminUsers.tsx `handleAdjust`: work by phone directly without requiring ICP user match
- AdminSettings.tsx: fix `BigInt(20)` hardcode to `BigInt(minDeposit)` 
- Profile.tsx `handleWithdrawSubmit`: use `settings?.minWithdraw ?? 100` not hardcoded 50
- Profile.tsx balance display: use backend phone user data from `useAllPhoneUsers`
- Profile.tsx winning cash: read from backend PhoneUserView.winningCash
- Profile.tsx notification keys: use `n.id` not `n.title` as React key
- Home.tsx `getLocalWalletBalance`: use backend phone user data
- Home.tsx JSON.parse welcome flag: wrap in try/catch
- TournamentDetail.tsx `handleJoin`: check duplicate join BEFORE fee deduction
- AdminTournaments.tsx tournament create: don't save local copy after backend success (avoid duplicates)
- AdminTournaments.tsx ResultsModal: call `actor.updatePhoneUserWinningCash` for each winner after setting prizes
- Leaderboard.tsx: use backend `useAllPhoneUsers` for overall leaderboard, fix BigInt crash for local IDs
- Tournaments.tsx: use `useAllTournamentBanners` from backend instead of localStorage

### Remove
- Hardcoded localStorage fallback for winning cash credit in AdminTournaments (replace with backend call)
- `matchedIcpUser` requirement for wallet adjust (phone-based is sufficient)

## Implementation Plan
1. Fix useQueries.ts: useAdminAdjustWallet, useAdminDeletePhoneUser, add useUpdatePhoneUserWinningCash
2. Fix AdminUsers.tsx: handleAdjust works by phone
3. Fix AdminSettings.tsx: BigInt(minDeposit) not BigInt(20)
4. Fix AdminTournaments.tsx: no local copy after backend create, Players button onClick, ResultsModal calls backend for winning cash
5. Fix Profile.tsx: withdrawal min, balance from backend, winning cash from backend, notification keys
6. Fix Home.tsx: balance from backend, JSON.parse try/catch
7. Fix TournamentDetail.tsx: duplicate join check before fee deduction
8. Fix Tournaments.tsx: banners from backend
9. Fix Leaderboard.tsx: overall from backend, BigInt crash fix

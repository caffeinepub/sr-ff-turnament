# SR-FF-TOURNAMENT

## Current State
All user registrations and deposit/withdraw requests are stored in device-local localStorage, making them invisible on other devices. Admin cannot see registrations or deposit requests submitted from user devices because each device has its own separate localStorage. The new backend now has phone-based user registration methods (`registerPhoneUser`, `getPhoneUser`, `phoneUserExists`) and open payment request methods (`submitOpenPaymentRequest`, `getAllOpenPaymentRequests`, `updateOpenPaymentStatus`) that work without ICP Identity.

Minimum deposit is hardcoded/read from localStorage so different devices show different values.

## Requested Changes (Diff)

### Add
- `useAllPhoneUsers()` hook in useQueries.ts using `actor.getAllPhoneUsers()`
- `useSubmitOpenPaymentRequest()` hook calling `actor.submitOpenPaymentRequest()`
- `useAllOpenPaymentRequests()` hook calling `actor.getAllOpenPaymentRequests()` every 3s
- `useUpdateOpenPaymentStatus()` hook calling `actor.updateOpenPaymentStatus()`
- `useMyOpenPaymentRequests(phone)` hook calling `actor.getMyOpenPaymentRequests(phone)`

### Modify
- `UserAuthContext.tsx`: Make `register()` and `login()` async. `register()` calls `actor.registerPhoneUser()` first to save to backend, then also saves to localStorage. `login()` tries `actor.getPhoneUser(phone)` first and verifies password hash, falls back to localStorage if backend fails (for backward compatibility with old users).
- `Register.tsx`: `handleSubmit` becomes async, awaits `register()`
- `Login.tsx`: `handleSubmit` becomes async, awaits `login()`
- `AdminUsers.tsx`: Replace `getRegisteredPlayers()` (localStorage) with `useAllPhoneUsers()` backend hook. Show `walletBalance` and `winningCash` from backend. Also update MobilePaySection to search by phone in backend users.
- `AdminPayments.tsx`: Use `useAllOpenPaymentRequests()` and `useUpdateOpenPaymentStatus()` instead of old localStorage-based hooks. Adapt OpenPaymentRequest (id: bigint, status: string, requestType: string) to fit existing PaymentCard UI.
- Profile.tsx deposit page: Use `useSubmitOpenPaymentRequest()` instead of localStorage hook. Read `minDeposit` from `useSettings()` (backend). Min deposit = 10 rs (from settings).
- `useSettings()` already reads from backend — ensure minDeposit is used everywhere deposit min is shown.

### Remove
- Old localStorage-only payment hooks: `useSubmitPaymentRequest`, `useAllPaymentRequests`, `useUpdatePaymentRequestStatus`, `useMyPaymentRequests` — replace with backend-based versions

## Implementation Plan
1. Update `useQueries.ts`: add backend-based payment and phone-user hooks
2. Update `UserAuthContext.tsx`: async register/login with backend
3. Update `Register.tsx` and `Login.tsx`: async form submit handlers
4. Update `AdminUsers.tsx`: use `useAllPhoneUsers()` from backend
5. Update `AdminPayments.tsx`: use `useAllOpenPaymentRequests()` and `useUpdateOpenPaymentStatus()`
6. Update Profile.tsx: deposit uses `useSubmitOpenPaymentRequest()` and shows minDeposit from backend settings
7. Validate and fix any TypeScript errors

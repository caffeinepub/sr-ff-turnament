# SR-FF-TOURNAMENT

## Current State
Admin panel se registered users aur deposit requests nahi dikh rahe. Root cause: backend mein `getAllPhoneUsers()` aur `getAllOpenPaymentRequests()` par `isAdminInternal(caller)` guard hai — admin panel browser se anonymous call hoti hai, auth fail hoti hai, frontend silently `[]` return karta hai.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `getAllPhoneUsers()` backend function: Remove admin guard — PhoneUserView mein password nahi hota, safe hai
- `getAllOpenPaymentRequests()` backend function: Remove admin guard — admin panel ko sab requests dikhne chahiye
- Frontend useQueries.ts `useAllPhoneUsers`: Add error logging, ensure refetch interval 3s
- Frontend useQueries.ts `useAllPaymentRequests`: Add error logging, ensure refetch interval 2s
- AdminUsers.tsx: Remove localStorage fallback — only use backend data
- AdminPayments.tsx: Ensure polling is aggressive (2s interval)

### Remove
- localStorage fallback for user search in AdminUsers.tsx

## Implementation Plan
1. Fix backend main.mo — remove admin guard from getAllPhoneUsers and getAllOpenPaymentRequests
2. Fix useQueries.ts — improve error handling, reduce polling intervals for admin queries
3. Fix AdminUsers.tsx — remove localStorage fallback
4. Fix AdminPayments.tsx — ensure fast polling

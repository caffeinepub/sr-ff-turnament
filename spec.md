# SR-FF-TOURNAMENT

## Current State
Banners (promo banners + tournament banners) are stored in localStorage — so they only show on admin's device, not on all users' devices. Tournament create form has a bannerUrl (URL input) and logo URL field. AdminBanners uses localStorage with URL input for image.

## Requested Changes (Diff)

### Add
- Backend: PromoBanner type + stable storage + CRUD APIs (savePromoBanner, getPromoBanners, deletePromoBanner, togglePromoBanner)
- Backend: tournamentBanners map (tournamentId Text → imageData Text) + saveBackendTournamentBanner + getBackendTournamentBanner APIs
- File upload input (instead of URL) for both promo banners and tournament banners — converts to base64 and stores in backend

### Modify
- AdminBanners.tsx: Replace URL input with file upload, save/load from backend
- AdminTournaments.tsx: Remove logo URL input entirely; replace bannerUrl text input with file upload; save banner to backend
- Home.tsx: Load promo banners from backend instead of localStorage
- TournamentDetail.tsx: Load tournament banner from backend instead of localStorage

### Remove
- Tournament logo URL input field
- localStorage usage for banners

## Implementation Plan
1. Add PromoBanner type and storage to main.mo with full CRUD
2. Add tournamentBanners Text map to main.mo with save/get APIs
3. Update AdminBanners.tsx: file upload → base64, backend save/load
4. Update AdminTournaments.tsx: remove logo URL, file upload for banner, backend save
5. Update Home.tsx: fetch promo banners from backend
6. Update TournamentDetail.tsx: fetch tournament banner from backend

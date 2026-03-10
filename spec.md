# SR-FF-TURNAMENT

## Current State
Admin panel has: Tournaments (create only, edit/delete buttons non-functional), Users/Wallet, Payments, Banners, Theme, HomeContent, Notifications, Settings.

## Requested Changes (Diff)

### Add
- Tournament Edit modal (pre-filled form, save updates tournament)
- Tournament Delete with confirmation dialog
- Admin Password Change section in Settings (old password verify + new password set, stored in localStorage key `srff_admin_password`)
- Welcome Message Editor in HomeContent: editable lines for both New User welcome (7 lines) and Returning User welcome (5 lines), stored in localStorage `srff_welcome_new` and `srff_welcome_returning`
- Footer text editor in Settings (stored in localStorage `srff_footer_text`)
- WhatsApp support number editor already in Settings (supportContact) - highlight it clearly

### Modify
- AdminTournaments: wire the existing Edit button to open a pre-filled edit modal; wire Delete button to useDeleteTournament or local optimistic delete with confirm dialog
- AdminSettings: add Password Change section and Footer Text field
- AdminHomeContent: add Welcome Message editor section

### Remove
- Nothing

## Implementation Plan
1. In AdminTournaments.tsx: Add EditTournamentModal component (same fields as create, pre-filled), connect to edit button. Add delete confirm dialog connected to delete button. Use useUpdateTournament hook if available, else localStorage fallback.
2. In AdminSettings.tsx: Add "Change Admin Password" card with current password verify + new password input. Add "Footer Text" input. Both saved to localStorage.
3. In AdminHomeContent.tsx: Add "Welcome Messages" section with two sub-sections (New User / Returning User), each with editable text areas per line (or single textarea), saved to localStorage keys `srff_welcome_new` and `srff_welcome_returning`.
4. In Home.tsx / Login.tsx (or wherever welcome modals are rendered): Read welcome text from localStorage instead of hardcoded strings.
5. In AdminLayout.tsx or Layout.tsx footer: Read footer text from localStorage.

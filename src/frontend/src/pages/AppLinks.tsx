import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";

const FULL_PROMPT = `=== SR-FF-TOURNAMENT — FULL APP BUILD PROMPT ===

TECH STACK:
- Frontend: React + TypeScript + Tailwind CSS
- Font: Sora (Google Fonts)
- Routing: @tanstack/react-router
- Icons: lucide-react
- Notifications: sonner (toast)
- Backend: Any persistent DB (Firebase / Supabase / Node.js)
- All user settings stored in localStorage + backend DB

===============================================
ROUTES / PAGES:
===============================================
/login          → User Login Page
/register       → User Register Page
/forgot-password → Forgot Password Page
/               → Home Page (protected)
/tournaments    → Tournaments List (protected)
/tournament/$id → Tournament Detail (protected)
/profile        → Profile Page (protected)
/earn           → Earn / Referral Page (protected)
/links          → App Links Page (public)
/admin          → Admin Login Page
/admin/dashboard       → Admin Dashboard (protected admin)
/admin/tournaments     → Manage Tournaments
/admin/users           → Manage Users
/admin/payments        → Manage Payments
/admin/banners         → Manage Promo Banners
/admin/notifications   → Send Notifications
/admin/home-content    → Manage Home Content
/admin/theme           → Theme Customization
/admin/settings        → App Settings

===============================================
BRANDING:
===============================================
- App Name: SR-FF-TURNAMENT (always fully visible)
- Logo: Circular image at /assets/uploads/sr_ff_tournament_icon_512.png
- Header: Dark background oklch(0.1 0.025 15 / 0.95) with blur
- App name gradient: linear-gradient(90deg, #f97316, #eab308, #22d3ee)
- Font: Sora, weight 800, uppercase, letter-spacing 0.05em
- Signature stamp: "This app created by SR TECHNOLOGY PVT LTD ™"
- Footer: "SR-FF-TURNAMENT — Free Fire Tournament Platform"
- Copyright: "Copyright © 2026, SR TECHNOLOGY PVT LTD ™"

===============================================
THEME SYSTEM (6 THEMES):
===============================================
1. Fire          — primary: #f97316 (orange)
2. Ocean Blue    — primary: #0ea5e9 (blue)
3. Purple Night  — primary: #a855f7 (purple)
4. Jungle Green  — primary: #22c55e (green)
5. Blood Red     — primary: #ef4444 (red)
6. Golden Crown  — primary: #eab308 (gold)

Admin can change theme from /admin/theme
Admin can set header gradient colors (color1, color2, color3)
stored in localStorage key: srff_header_colors
format: { color1: "#f97316", color2: "#eab308", color3: "#22d3ee" }

===============================================
AUTHENTICATION:
===============================================
- No auto-login — always require mobile + password on open
- Register fields: Mobile Number, Username, Free Fire Name, Password
- Password has eye icon to show/hide
- Only 1 account per mobile number — show error on duplicate
- Login: mobile + password only
- Session stored in localStorage key: srff_current_user
- On logout: clear srff_current_user from localStorage completely
- User must re-enter mobile + password every time

Admin:
- Admin login at /admin with password field
- Default password: 7477661867Ss
- Session stored in sessionStorage key: adminAuth = "true"
- Password changeable from admin settings
- Stored in localStorage key: srff_admin_password

===============================================
HEADER (User Panel):
===============================================
- Sticky, dark background with blur
- Left: circular logo + gradient app name "SR-FF-TURNAMENT"
- Right:
  1. Bell icon button — notification bell
     - Shows red badge with count when unread notifications exist
     - On click: opens slide panel from right
     - Panel shows list of admin global messages
     - If no notifications: shows "Koi Notification Nahi Hai"
  2. Balance button: coin icon + total balance
     - Background: gradient using header colors
     - On click: navigates to /profile (wallet section)

===============================================
LOGIN PAGE:
===============================================
- Full screen centered layout with ambient glow background
- Circular logo (w-24 h-24) with orange glow box-shadow
- App name gradient text below logo
- Form card: background dark, border orange/30
- Form size controlled by localStorage key: srff_form_size
  values: "small" | "medium" | "large" (default: "large")
  large: max-w-lg, p-7, py-3 inputs
- Fields: Mobile Number (tel input), Password (with eye toggle)
- Submit button: orange gradient, dark text, orange glow shadow
- Below form: WhatsApp Customer Support green button
  href: https://wa.me/91{supportNumber}
  Support number from localStorage key: srff_support_number (default: 9104414372)

===============================================
REGISTER PAGE:
===============================================
- Same layout as login
- Fields: Mobile Number, Username, Free Fire Name, Password (eye toggle)
- On successful register:
  - Save to localStorage key: srff_users (array)
  - Set localStorage key: srff_new_user_welcome = { username }
  - Redirect to /
- WhatsApp Customer Support button (same as login)

===============================================
WELCOME MODALS:
===============================================
NEW USER WELCOME MODAL (after register):
- Full screen overlay with spinning color ring around logo
- 7 default animated typing lines (editable from admin)
- Button: "Chalte Hain!"
- Modal size from localStorage key: srff_modal_size

RETURNING USER WELCOME BACK MODAL (after login):
- Full screen overlay with spinning ring
- 5 default animated typing lines (editable from admin)
- Button: "Let's Play!"

===============================================
HOME PAGE:
===============================================
- Announcement Ticker: fire orange-gold gradient, black text
- Promo Banners (switchable with dots, only active shown)
- Quick stats, active tournaments list
- Balance button in header: coin icon + amount, click goes to wallet
- Notification bell with unread badge

===============================================
TOURNAMENTS PAGE:
===============================================
- List all tournaments by mode
- Each card: mode name, entry fee, prize pool, players joined, small banner icon
- Join button deducts entry fee from wallet automatically
- Tournament detail: rules, prize breakdown, registered players, leaderboard

===============================================
WALLET SYSTEM:
===============================================
- Two balance cards: Regular Balance + Winning Cash
- Deposit → admin approves → added to Regular Balance
- Tournament winnings → go to Regular Balance
- User converts Regular Balance to Winning Cash manually
- Withdrawal only from Winning Cash

===============================================
EARN PAGE (Referral):
===============================================
- Shows user's unique referral link
- Share button for WhatsApp, Instagram, Facebook etc.
- Referral bonus system

===============================================
PROFILE PAGE (Modern Modal):
===============================================
Line-by-line buttons (exact order):
1. Notifications >
2. Life Time Match History >
3. Refer & Earn >
4. Contact Us >
5. Privacy Policy >
6. Terms and Conditions >
7. Refund and Cancellation >
8. Fair Play Policy >
9. Rules >
10. Logout (at the very bottom)

- Avatar picker (12 avatars)
- Show: username, mobile, FF name, wallet balance

===============================================
ADMIN PANEL — Route: /admin — Password: 7477661867Ss
===============================================
Sections:
1. Dashboard — stats overview
2. Registered Players — view all users, toggle password, search by mobile
3. User Wallet Management — search by mobile → add or cut balance
4. Tournaments — create/edit/delete; each has banner image URL field
5. Payments — approve/reject deposit and withdrawal requests
6. Promo Banners — add/edit/delete with ON/OFF toggle
7. Notifications — send global message to all users
8. Home Content — edit announcement ticker, add promo photo links
9. Theme — change app theme, header gradient colors
10. Settings — includes:
    - Minimum deposit amount
    - WhatsApp support number
    - Privacy Policy (textarea)
    - Terms and Conditions (textarea)
    - Refund and Cancellation (textarea)
    - Fair Play Policy (textarea)
    - Contact Us (textarea)
    - Game Rules (textarea)
    - UI Customization:
      * Login/Register form size (Small/Medium/Large)
      * Welcome modal size (Small/Medium/Large)
      * New user welcome message lines (editable)
      * Login welcome back message lines (editable)
    - Admin password change

===============================================
LINKS PAGE (/links):
===============================================
- User Panel link with copy button
- Admin Panel link with copy button
- Full App Prompt with one-click copy button

===============================================
IMPORTANT RULES:
===============================================
1. No extra login buttons after user is logged in
2. Auto-login DISABLED — always show login screen on open
3. Logout: clear localStorage srff_current_user → redirect /login
4. Admin panel has NO ICP Wallet Management section
   Only mobile number based wallet add/cut
5. All policy content editable by admin, shown in profile
6. Tournament winnings go to Regular Balance
   User converts to Winning Cash manually
   Withdrawal only from Winning Cash
7. One mobile number = one account only (strict validation)
8. Admin password default: 7477661867Ss

=== END OF PROMPT ===`;

function CopyButton({
  text,
  label = "Copy Link",
}: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="applinks.copy_button"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all duration-200 active:scale-95"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function AppLinks() {
  const baseUrl = window.location.origin;
  const userUrl = baseUrl;
  const adminUrl = `${baseUrl}/admin`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-orange-400 mb-1">
            SR-FF-TOURNAMENT
          </h1>
          <p className="text-gray-400 text-sm">App Links</p>
        </div>

        {/* User App */}
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Users size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">User App</h2>
              <p className="text-gray-400 text-xs">Players ka panel</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-sm truncate flex-1">
              {userUrl}
            </span>
            <a
              href={userUrl}
              target="_blank"
              rel="noreferrer"
              data-ocid="applinks.user_link"
            >
              <ExternalLink
                size={14}
                className="text-gray-400 hover:text-white"
              />
            </a>
          </div>
          <CopyButton text={userUrl} />
        </div>

        {/* Admin App */}
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs">Admin access only</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-sm truncate flex-1">
              {adminUrl}
            </span>
            <a
              href={adminUrl}
              target="_blank"
              rel="noreferrer"
              data-ocid="applinks.admin_link"
            >
              <ExternalLink
                size={14}
                className="text-gray-400 hover:text-white"
              />
            </a>
          </div>
          <CopyButton text={adminUrl} />
        </div>

        {/* Full App Prompt */}
        <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Full App Prompt</h2>
              <p className="text-gray-400 text-xs">
                Ek click mein poora prompt copy karo
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-xs leading-relaxed">
              SR-FF-TOURNAMENT ka poora build prompt — kisi bhi AI app builder
              mein paste karo aur app ready ho jaayega.
            </p>
          </div>
          <CopyButton text={FULL_PROMPT} label="Copy Full Prompt" />
        </div>

        <p className="text-center text-gray-600 text-xs">
          © SR-FF-TOURNAMENT. All rights reserved.
        </p>
      </div>
    </div>
  );
}

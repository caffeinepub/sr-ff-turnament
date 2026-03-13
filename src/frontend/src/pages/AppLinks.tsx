import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
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

===============================================
AUTHENTICATION:
===============================================
- No auto-login — always require mobile + password on open
- Register fields: Mobile Number, Username, Free Fire Name, Password
- Only 1 account per mobile number
- Admin login at /admin with password: 7477661867Ss

===============================================
ADMIN PANEL — Route: /admin — Password: 7477661867Ss
===============================================
Sections:
1. Dashboard, 2. Players, 3. Wallet Management
4. Tournaments, 5. Payments, 6. Banners
7. Notifications, 8. Home Content, 9. Theme, 10. Settings

=== END OF PROMPT ===`;

function CopyButton({
  text,
  label = "Copy Link",
  color = "orange",
}: { text: string; label?: string; color?: "orange" | "cyan" | "red" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const colorMap = {
    orange: "bg-orange-500 hover:bg-orange-600",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="applinks.copy_button"
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${colorMap[color]} text-white font-semibold text-sm transition-all duration-200 active:scale-95`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function FetchCopyDownloadButton({
  url,
  filename,
  label,
  color,
}: {
  url: string;
  filename: string;
  label: string;
  color: string;
}) {
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [dlStatus, setDlStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  const fetchText = async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    return res.text();
  };

  const handleCopy = async () => {
    setCopyStatus("loading");
    try {
      const text = await fetchText();
      await navigator.clipboard.writeText(text);
      setCopyStatus("done");
      setTimeout(() => setCopyStatus("idle"), 2500);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  };

  const handleDownload = async () => {
    setDlStatus("loading");
    try {
      const text = await fetchText();
      const blob = new Blob([text], { type: "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDlStatus("done");
      setTimeout(() => setDlStatus("idle"), 2500);
    } catch {
      setDlStatus("error");
      setTimeout(() => setDlStatus("idle"), 2500);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleCopy}
        disabled={copyStatus === "loading"}
        data-ocid="applinks.copy_button"
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60 text-white"
        style={{ background: color }}
      >
        {copyStatus === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Loading...
          </>
        ) : copyStatus === "done" ? (
          <>
            <Check size={16} /> Copied!
          </>
        ) : copyStatus === "error" ? (
          <>
            <span>⚠</span> Error
          </>
        ) : (
          <>
            <Copy size={16} /> {label}
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={dlStatus === "loading"}
        data-ocid="applinks.download_code_button"
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60 text-white"
        style={{
          background:
            dlStatus === "done"
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "linear-gradient(135deg,#374151,#1f2937)",
          border: "1px solid #4b5563",
        }}
      >
        {dlStatus === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Downloading...
          </>
        ) : dlStatus === "done" ? (
          <>
            <Check size={16} /> Downloaded!
          </>
        ) : (
          <>
            <Download size={16} /> Download .txt
          </>
        )}
      </button>
    </div>
  );
}

function DownloadCodeButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const handleDownload = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/assets/full-app-code.txt");
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SR-FF-TOURNAMENT-FullCode.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === "loading"}
      data-ocid="applinks.download_code_button"
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60"
      style={{
        background:
          status === "done"
            ? "linear-gradient(135deg,#22c55e,#16a34a)"
            : status === "error"
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#6366f1,#a855f7)",
        color: "#fff",
      }}
    >
      {status === "loading" ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Downloading...
        </>
      ) : status === "done" ? (
        <>
          <Check size={16} /> Downloaded!
        </>
      ) : status === "error" ? (
        <>
          <span>⚠</span> Error — Try Again
        </>
      ) : (
        <>
          <Download size={16} /> Download Full App Code
        </>
      )}
    </button>
  );
}

export default function AppLinks() {
  const baseUrl = "https://sr-ff-turnament-zc1.caffeine.xyz";
  const userUrl = `${baseUrl}/login`;
  const adminUrl = `${baseUrl}/admin`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-orange-400 mb-1">
            SR-FF-TOURNAMENT
          </h1>
          <p className="text-gray-400 text-sm">App Links &amp; Code</p>
        </div>

        {/* User Panel Link */}
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Users size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">User Panel</h2>
              <p className="text-gray-400 text-xs">Players ka permanent link</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-xs truncate flex-1 font-mono">
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
          <CopyButton
            text={userUrl}
            label="Copy User Panel Link"
            color="orange"
          />
        </div>

        {/* Admin Panel Link */}
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs">
                Admin access only — permanent link
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-cyan-400 text-xs truncate flex-1 font-mono">
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
          <CopyButton
            text={adminUrl}
            label="Copy Admin Panel Link"
            color="red"
          />
        </div>

        {/* User Panel Full Code */}
        <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <Users size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">User Panel — Full Code</h2>
              <p className="text-gray-400 text-xs">
                Login, Register, Home, Profile, Tournaments, Leaderboard — saara
                code
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-xs leading-relaxed">
              User panel ke saare pages ka TypeScript/React source code — copy
              ya download karo backup ke liye.
            </p>
          </div>
          <FetchCopyDownloadButton
            url="/assets/user-panel-code.txt"
            filename="SR-FF-UserPanel-Code.txt"
            label="Copy User Panel Code"
            color="linear-gradient(135deg,#0e7490,#0891b2)"
          />
        </div>

        {/* Admin Panel Full Code */}
        <div className="bg-gray-900 border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/20 p-2 rounded-lg">
              <Shield size={20} className="text-rose-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel — Full Code</h2>
              <p className="text-gray-400 text-xs">
                Dashboard, Tournaments, Users, Payments, Settings — saara code
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-xs leading-relaxed">
              Admin panel ke saare pages ka TypeScript/React source code — copy
              ya download karo backup ke liye.
            </p>
          </div>
          <FetchCopyDownloadButton
            url="/assets/admin-panel-code.txt"
            filename="SR-FF-AdminPanel-Code.txt"
            label="Copy Admin Panel Code"
            color="linear-gradient(135deg,#9f1239,#be123c)"
          />
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
          <CopyButton
            text={FULL_PROMPT}
            label="Copy Full Prompt"
            color="orange"
          />
        </div>

        {/* Full App Code Download */}
        <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <Code2 size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Full App Code</h2>
              <p className="text-gray-400 text-xs">
                Poora source code — backup ke liye download karo
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-xs leading-relaxed">
              App ke saare pages, components, context aur admin panel ka source
              code ek single{" "}
              <span className="text-indigo-300 font-mono">.txt</span> file mein.
              Download karke safe jagah save karo — yeh aapka backup hai.
            </p>
          </div>
          <DownloadCodeButton />
        </div>

        <p className="text-center text-gray-600 text-xs">
          © SR-FF-TOURNAMENT. All rights reserved.
        </p>
      </div>
    </div>
  );
}

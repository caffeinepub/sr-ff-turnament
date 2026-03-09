import { Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import BottomNav from "./BottomNav";

const HEADER_COLORS_KEY = "srff_header_colors";

function getHeaderColors() {
  try {
    const data = JSON.parse(localStorage.getItem(HEADER_COLORS_KEY) || "null");
    if (data?.color1 && data.color2)
      return data as { color1: string; color2: string; color3: string };
  } catch {}
  return { color1: "#f97316", color2: "#eab308", color3: "#22d3ee" };
}

export default function Layout() {
  const { currentUser, logout } = useUserAuth();
  const navigate = useNavigate();
  const [headerColors, setHeaderColors] = useState(getHeaderColors);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === HEADER_COLORS_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.color1) setHeaderColors(data);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {currentUser && (
        <header
          className="sticky top-0 z-40 border-b px-4 py-2 flex items-center justify-between"
          style={{
            background: "oklch(0.1 0.025 15 / 0.95)",
            borderColor: `${headerColors.color1}33`,
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/assets/uploads/sr_ff_tournament_icon_512-1.png"
              alt="logo"
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              style={{ boxShadow: `0 0 8px ${headerColors.color1}80` }}
            />
            <span
              className="text-xs font-bold uppercase whitespace-nowrap"
              style={{
                background: `linear-gradient(90deg, ${headerColors.color1}, ${headerColors.color2}, ${headerColors.color3})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.05em",
              }}
            >
              SR-FF-TURNAMENT
            </span>
          </div>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </header>
      )}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

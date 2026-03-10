import { Outlet, useNavigate } from "@tanstack/react-router";
import { Bell, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllNotifications, useCallerProfile } from "../hooks/useQueries";
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

function useWinningCash(principalSlice: string): number {
  const key = `srff_winning_cash_${principalSlice}`;
  const [val, setVal] = useState(() => {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) setVal(Number(e.newValue) || 0);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);
  return val;
}

export default function Layout() {
  const { currentUser } = useUserAuth();
  const navigate = useNavigate();
  const [headerColors, setHeaderColors] = useState(getHeaderColors);
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const principalSlice =
    identity?.getPrincipal().toString().slice(0, 8) ?? "guest";
  const _winningCash = useWinningCash(principalSlice);
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications = [] } = useAllNotifications();

  const READ_KEY = `srff_notif_read_${principalSlice}`;
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  const unreadCount = (notifications as any[]).filter(
    (n) => !readIds.has(String(n.id)),
  ).length;

  const markAllRead = () => {
    const ids = (notifications as any[]).map((n) => String(n.id));
    setReadIds(new Set(ids));
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {}
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    markAllRead();
  };

  const totalBalance = profile ? Number(profile.walletBalance) : 0;

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

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={handleOpenNotifications}
              className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${headerColors.color1}22, ${headerColors.color2}11)`,
                border: `1px solid ${headerColors.color1}44`,
              }}
              data-ocid="header.notifications.button"
            >
              <Bell
                className="w-4 h-4"
                style={{ color: headerColors.color2 }}
              />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                  style={{ background: "#ef4444" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Balance Button */}
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${headerColors.color1}33, ${headerColors.color2}22)`,
                border: `1px solid ${headerColors.color1}55`,
                color: headerColors.color2,
                boxShadow: `0 0 10px ${headerColors.color1}30`,
              }}
              data-ocid="header.balance.button"
            >
              <span style={{ filter: "none" }}>🪙</span>
              <span style={{ color: "white", fontWeight: 700 }}>
                ₹{totalBalance}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Notification Slide Panel */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowNotifications(false)}
          onKeyDown={() => setShowNotifications(false)}
          data-ocid="notifications.modal"
        >
          <div
            className="ml-auto w-full max-w-sm h-full flex flex-col"
            style={{
              background: "oklch(0.1 0.025 15)",
              borderLeft: `1px solid ${headerColors.color1}33`,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: `${headerColors.color1}33` }}
            >
              <div className="flex items-center gap-2">
                <Bell
                  className="w-4 h-4"
                  style={{ color: headerColors.color1 }}
                />
                <span
                  className="font-bold text-sm"
                  style={{
                    background: `linear-gradient(90deg, ${headerColors.color1}, ${headerColors.color2})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Notifications
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                onKeyDown={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                data-ocid="notifications.close_button"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(notifications as any[]).length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-4 py-16"
                  data-ocid="notifications.empty_state"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${headerColors.color1}22, ${headerColors.color2}11)`,
                      border: `1px solid ${headerColors.color1}33`,
                    }}
                  >
                    <Bell
                      className="w-7 h-7"
                      style={{ color: `${headerColors.color1}88` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold mb-1">
                      Koi Notification Nahi Hai 🔕
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Jab admin koi global message bhejega,
                      <br />
                      woh yahan dikhai dega 🔔
                    </p>
                  </div>
                </div>
              ) : (
                [...(notifications as any[])]
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((n, i) => (
                    <div
                      key={String(n.id)}
                      className="rounded-xl p-3 border"
                      style={{
                        background: `linear-gradient(135deg, ${headerColors.color1}0f, transparent)`,
                        borderColor: `${headerColors.color1}33`,
                      }}
                      data-ocid={`notifications.item.${i + 1}`}
                    >
                      {n.imageUrl && (
                        <img
                          src={n.imageUrl}
                          alt=""
                          className="w-full rounded-lg mb-2 max-h-36 object-cover"
                        />
                      )}
                      <p
                        className="font-bold text-sm mb-1"
                        style={{
                          background: `linear-gradient(90deg, ${headerColors.color1}, ${headerColors.color2})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(
                            Number(n.timestamp) / 1_000_000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

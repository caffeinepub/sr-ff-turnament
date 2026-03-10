import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Trophy, User } from "lucide-react";

export default function BottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;

  const links = [
    { to: "/leaderboard", label: "Board", icon: Trophy },
    { to: "/", label: "Play", icon: Gamepad2 },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-stretch max-w-lg mx-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`nav.${label.toLowerCase()}.link`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_oklch(0.72_0.19_44)]" : ""}`}
              />
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

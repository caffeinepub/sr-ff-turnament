import { Button } from "@/components/ui/button";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  Flame,
  Home,
  ImagePlay,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Settings,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/admin/home-content", label: "Home Content", icon: Home },
  { to: "/admin/banners", label: "Promo Banners", icon: ImagePlay },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/theme", label: "App Theme", icon: Palette },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { location } = useRouterState();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate({ to: "/admin" });
  };

  const closeOverlay = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeOverlay}
          onKeyDown={(e) => e.key === "Escape" && closeOverlay()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary glow-fire" />
            <span className="font-display font-bold text-lg text-foreground">
              FF-ADMIN PANEL
            </span>
          </div>
        </div>
        <nav
          className="flex-1 p-4 space-y-1 overflow-y-auto"
          data-ocid="admin.nav.panel"
        >
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
                data-ocid={`admin.${label.toLowerCase().replace(/ /g, "-")}.link`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            data-ocid="admin.sidebar.toggle"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-foreground">
            FF-ADMIN PANEL
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import AdminLayout from "./components/AdminLayout";
import Layout from "./components/Layout";
import { UserAuthProvider } from "./context/UserAuthContext";
import AppLinks from "./pages/AppLinks";
import Earn from "./pages/Earn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TournamentDetail from "./pages/TournamentDetail";
import Tournaments from "./pages/Tournaments";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHomeContent from "./pages/admin/AdminHomeContent";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminUsers from "./pages/admin/AdminUsers";

function isAdminAuthenticated() {
  return sessionStorage.getItem("adminAuth") === "true";
}

function isUserAuthenticated() {
  return !!localStorage.getItem("srff_current_user");
}

const rootRoute = createRootRoute({
  component: () => (
    <UserAuthProvider>
      <Outlet />
      <Toaster />
    </UserAuthProvider>
  ),
});

// Auth pages (no layout)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPassword,
});

// User layout (protected)
const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user",
  component: Layout,
  beforeLoad: () => {
    if (!isUserAuthenticated()) throw redirect({ to: "/login" });
  },
});
const homeRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/",
  component: Home,
});
const tournamentsRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/tournaments",
  component: Tournaments,
});
const tournamentDetailRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/tournament/$id",
  component: TournamentDetail,
});
const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
  component: Profile,
});
const earnRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/earn",
  component: Earn,
});

const appLinksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: AppLinks,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLogin,
});
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "adminLayout",
  component: AdminLayout,
  beforeLoad: () => {
    if (!isAdminAuthenticated()) throw redirect({ to: "/admin" });
  },
});
const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/dashboard",
  component: AdminDashboard,
});
const adminTournamentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/tournaments",
  component: AdminTournaments,
});
const adminBannersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/banners",
  component: AdminBanners,
});
const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/settings",
  component: AdminSettings,
});
const adminThemeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/theme",
  component: AdminTheme,
});
const adminHomeContentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/home-content",
  component: AdminHomeContent,
});
const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/notifications",
  component: AdminNotifications,
});
const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsers,
});
const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/payments",
  component: AdminPayments,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  userLayoutRoute.addChildren([
    homeRoute,
    tournamentsRoute,
    tournamentDetailRoute,
    profileRoute,
    earnRoute,
  ]),
  appLinksRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminTournamentsRoute,
    adminBannersRoute,
    adminSettingsRoute,
    adminThemeRoute,
    adminHomeContentRoute,
    adminNotificationsRoute,
    adminUsersRoute,
    adminPaymentsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

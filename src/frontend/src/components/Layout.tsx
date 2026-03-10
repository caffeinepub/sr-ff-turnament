import { Outlet } from "@tanstack/react-router";
import BottomNav from "./BottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

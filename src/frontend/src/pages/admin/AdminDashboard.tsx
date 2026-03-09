import { Activity, Trophy, Users, Zap } from "lucide-react";
import { useAllTournaments } from "../../hooks/useQueries";

export default function AdminDashboard() {
  const { data: tournaments = [] } = useAllTournaments();

  const stats = [
    {
      label: "Total Tournaments",
      value: tournaments.length,
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Tournaments",
      value: tournaments.filter((t) => t.status === "ongoing").length,
      icon: Activity,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Upcoming",
      value: tournaments.filter((t) => t.status === "upcoming").length,
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Completed",
      value: tournaments.filter((t) => t.status === "complete").length,
      icon: Users,
      color: "text-muted-foreground",
      bg: "bg-muted/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, Admin
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-4"
            data-ocid={`dashboard.stat.${i + 1}`}
          >
            <div
              className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="font-display font-semibold text-base mb-4">
          Recent Tournaments
        </h2>
        {tournaments.length === 0 ? (
          <p
            className="text-sm text-muted-foreground text-center py-6"
            data-ocid="dashboard.tournaments.empty_state"
          >
            No tournaments yet
          </p>
        ) : (
          <div className="space-y-3">
            {tournaments.slice(0, 5).map((t, i) => (
              <div
                key={t.id.toString()}
                className="flex items-center justify-between"
                data-ocid={`dashboard.tournament.item.${i + 1}`}
              >
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.gameMode}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    t.status === "ongoing"
                      ? "bg-success/20 text-success"
                      : t.status === "upcoming"
                        ? "bg-warning/20 text-warning"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.status as string}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

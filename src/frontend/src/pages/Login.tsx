import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";

export default function Login() {
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = login(phone.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate({ to: "/" });
    } else {
      toast.error(result.error || "Mobile number ya password galat hai");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "oklch(0.7 0.22 35 / 0.08)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "oklch(0.72 0.18 200 / 0.06)" }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-2"
              style={{
                borderColor: "oklch(0.82 0.18 80 / 0.6)",
                boxShadow: "0 0 28px oklch(0.7 0.22 35 / 0.6)",
              }}
            >
              <img
                src="/assets/uploads/sr_ff_tournament_icon_512-1.png"
                alt="SR-FF-TURNAMENT Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1
                className="font-display uppercase tracking-widest"
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.38em",
                  background:
                    "linear-gradient(90deg, oklch(0.7 0.22 35), oklch(0.82 0.18 80), oklch(0.72 0.18 200))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                }}
              >
                SR-FF-TURNAMENT
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs tracking-wider">
                Apne account mein login karo
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{
            background: "oklch(0.12 0.028 15)",
            borderColor: "oklch(0.7 0.22 35 / 0.3)",
          }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Flame
              className="w-5 h-5"
              style={{ color: "oklch(0.7 0.22 35)" }}
            />
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-phone"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Mobile Number
              </label>
              <input
                id="login-phone"
                data-ocid="login.phone.input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 XXXXXXXXXX"
                className="w-full rounded-lg px-3 py-2.5 text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  data-ocid="login.password.input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                />
                <button
                  data-ocid="login.password.toggle"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                data-ocid="login.forgot.link"
                to="/forgot-password"
                className="text-xs hover:underline transition-colors"
                style={{ color: "oklch(0.72 0.18 200)" }}
              >
                Password bhool gaye?
              </Link>
            </div>

            <button
              data-ocid="login.submit_button"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.7 0.22 35), oklch(0.75 0.18 75))",
                color: "oklch(0.1 0.01 15)",
                boxShadow: "0 0 16px oklch(0.7 0.22 35 / 0.4)",
              }}
            >
              {loading ? "Login ho raha hai..." : "Login Karo"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Account nahi hai?{" "}
            <Link
              data-ocid="login.register.link"
              to="/register"
              className="font-medium hover:underline"
              style={{ color: "oklch(0.7 0.22 35)" }}
            >
              Naya account banao
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

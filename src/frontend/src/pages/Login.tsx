import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Flame, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";

function getSupportNumber(): string {
  return localStorage.getItem("srff_support_number") || "9104414372";
}

export default function Login() {
  const { login } = useUserAuth();
  const formSize = localStorage.getItem("srff_form_size") || "large";
  const sizeClasses = {
    small: {
      wrapper: "max-w-sm",
      card: "p-4",
      input: "py-2 text-sm",
      btn: "py-2",
    },
    medium: {
      wrapper: "max-w-md",
      card: "p-5",
      input: "py-2.5 text-sm",
      btn: "py-2.5",
    },
    large: {
      wrapper: "max-w-lg",
      card: "p-7",
      input: "py-3 text-base",
      btn: "py-3",
    },
  };
  const sz =
    sizeClasses[formSize as keyof typeof sizeClasses] || sizeClasses.large;
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await login(phone.trim(), password);
    setLoading(false);
    if (result.success) {
      localStorage.setItem(
        "srff_login_welcome",
        JSON.stringify({ username: result.username || phone.trim() }),
      );
      navigate({ to: "/" });
    } else {
      toast.error(result.error || "Mobile number ya password galat hai");
    }
  }

  const supportNumber = getSupportNumber();

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

      <div className={`w-full ${sz.wrapper} relative`}>
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
              <p className="text-muted-foreground mt-1 text-xs tracking-wide">
                Professional Free Fire Tournament Platform
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className={`rounded-2xl border border-border/50 ${sz.card}`}
          style={{
            background: "oklch(0.14 0.02 260 / 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
          }}
        >
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground/80"
              >
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
                placeholder="10 digit mobile number"
                className={`w-full rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 px-4 ${sz.input}`}
                data-ocid="login.input"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground/80"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Apna password dalo"
                  className={`w-full rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 px-4 pr-12 ${sz.input}`}
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-ocid="login.password.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl font-bold text-white transition-all ${sz.btn} flex items-center justify-center gap-2 disabled:opacity-60`}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.7 0.22 35), oklch(0.65 0.2 25))",
                boxShadow: loading
                  ? "none"
                  : "0 4px 16px oklch(0.7 0.22 35 / 0.4)",
              }}
              data-ocid="login.submit_button"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login Karo"
              )}
            </button>
          </form>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Naya account chahiye?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
                data-ocid="login.register.link"
              >
                Register Karo
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Password bhool gaye?{" "}
              <Link
                to="/forgot-password"
                className="text-primary hover:underline font-medium"
                data-ocid="login.forgot.link"
              >
                Reset karo
              </Link>
            </p>
          </div>
        </div>

        {/* WhatsApp Support */}
        <div className="mt-4 text-center">
          <a
            href={`https://wa.me/91${supportNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            data-ocid="login.whatsapp.link"
          >
            <MessageCircle className="w-4 h-4" />
            Deposit support ke liye WhatsApp karo
          </a>
        </div>

        <p
          className="text-center mt-4"
          style={{
            fontSize: "0.6rem",
            color: "oklch(0.5 0.05 260)",
            letterSpacing: "0.05em",
          }}
        >
          This app created by SR TECHNOLOGY PVT LTD ™
        </p>
      </div>
    </div>
  );
}

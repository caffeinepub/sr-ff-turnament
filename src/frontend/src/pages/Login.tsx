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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = login(phone.trim(), password);
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
              <p className="text-muted-foreground mt-0.5 text-xs tracking-wider">
                Apne account mein login karo
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border ${sz.card}`}
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
                className={`w-full rounded-lg px-3 ${sz.input} bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
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
                  className={`w-full rounded-lg px-3 ${sz.input} pr-10 bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
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
              className={`w-full ${sz.btn} rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-60`}
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

        {/* Customer Support */}
        <div className="mt-4">
          <a
            href={`https://wa.me/91${supportNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="login.support.button"
            className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl border font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #075e54, #25d366)",
              borderColor: "#25d366",
              color: "#fff",
              boxShadow: "0 0 18px #25d36644",
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Customer Support — WhatsApp Karo</span>
          </a>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Login mein problem? Seedha support se baat karo 👆
          </p>
        </div>
      </div>
    </div>
  );
}

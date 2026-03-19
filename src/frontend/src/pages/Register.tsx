import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";

function getSupportNumber(): string {
  return localStorage.getItem("srff_support_number") || "9104414372";
}

export default function Register() {
  const { register } = useUserAuth();
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
  const [username, setUsername] = useState("");
  const [ffName, setFfName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username required");
      return;
    }
    if (!ffName.trim()) {
      toast.error("Free Fire name required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password kam se kam 6 characters ka hona chahiye");
      return;
    }
    setLoading(true);
    const result = await register(phone.trim(), password, username, ffName);
    setLoading(false);
    if (result.success) {
      localStorage.setItem(
        "srff_new_user_welcome",
        JSON.stringify({ username: username.trim() }),
      );
      toast.success("Account ban gaya! Welcome to SR-FF-TURNAMENT");
      navigate({ to: "/" });
    } else {
      toast.error(result.error || "Registration fail ho gaya");
    }
  }

  const supportNumber = getSupportNumber();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "oklch(0.7 0.22 35 / 0.07)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "oklch(0.72 0.18 200 / 0.06)" }}
        />
      </div>

      <div className={`w-full ${sz.wrapper} relative`}>
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-2"
              style={{
                borderColor: "oklch(0.82 0.18 80 / 0.6)",
                boxShadow: "0 0 24px oklch(0.7 0.22 35 / 0.5)",
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
                  letterSpacing: "0.3em",
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
                Naya account banao aur tournament mein participate karo
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
            <UserPlus className="w-5 h-5 text-primary" />
            Register
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
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
                data-ocid="register.input"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground/80"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Apna username dalo"
                className={`w-full rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 px-4 ${sz.input}`}
                data-ocid="register.username.input"
              />
            </div>

            {/* FF Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="ffname"
                className="text-sm font-medium text-foreground/80"
              >
                Free Fire Name
              </label>
              <input
                id="ffname"
                type="text"
                value={ffName}
                onChange={(e) => setFfName(e.target.value)}
                required
                placeholder="Free Fire mein apna naam"
                className={`w-full rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 px-4 ${sz.input}`}
                data-ocid="register.ffname.input"
              />
            </div>

            {/* Password */}
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
                  minLength={6}
                  placeholder="Kam se kam 6 characters"
                  className={`w-full rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 px-4 pr-12 ${sz.input}`}
                  data-ocid="register.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-ocid="register.password.toggle"
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
              data-ocid="register.submit_button"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Karo
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Pehle se account hai?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
              data-ocid="register.login.link"
            >
              Login Karo
            </Link>
          </p>
        </div>

        {/* WhatsApp Support */}
        <div className="mt-4 text-center">
          <a
            href={`https://wa.me/91${supportNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            data-ocid="register.whatsapp.link"
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

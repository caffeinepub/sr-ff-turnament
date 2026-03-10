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

  function handleSubmit(e: React.FormEvent) {
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
    const result = register(phone.trim(), password, username, ffName);
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
                Naya account banao aur tournament mein join karo
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border ${sz.card}`}
          style={{
            background: "oklch(0.12 0.028 15)",
            borderColor: "oklch(0.68 0.22 145 / 0.3)",
          }}
        >
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <UserPlus
              className="w-5 h-5"
              style={{ color: "oklch(0.68 0.22 145)" }}
            />
            Register
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Mobile Number
              </label>
              <input
                id="reg-phone"
                data-ocid="register.phone.input"
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
                htmlFor="reg-username"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Username
              </label>
              <input
                id="reg-username"
                data-ocid="register.username.input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Apna username likho"
                className={`w-full rounded-lg px-3 ${sz.input} bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
              />
            </div>

            <div>
              <label
                htmlFor="reg-ffname"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Free Fire Name
              </label>
              <input
                id="reg-ffname"
                data-ocid="register.ffname.input"
                type="text"
                value={ffName}
                onChange={(e) => setFfName(e.target.value)}
                required
                placeholder="Apna Free Fire in-game name"
                className={`w-full rounded-lg px-3 ${sz.input} bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  data-ocid="register.password.input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-lg px-3 ${sz.input} pr-10 bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`}
                />
                <button
                  data-ocid="register.password.toggle"
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

            <button
              data-ocid="register.submit_button"
              type="submit"
              disabled={loading}
              className={`w-full ${sz.btn} rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-60 mt-2`}
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.68 0.22 145), oklch(0.72 0.18 200))",
                color: "oklch(0.1 0.01 15)",
                boxShadow: "0 0 16px oklch(0.68 0.22 145 / 0.4)",
              }}
            >
              {loading ? "Account ban raha hai..." : "Register Karo"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Pehle se account hai?{" "}
            <Link
              data-ocid="register.login.link"
              to="/login"
              className="font-medium hover:underline"
              style={{ color: "oklch(0.7 0.22 35)" }}
            >
              Login karo
            </Link>
          </p>
        </div>

        {/* Customer Support */}
        <div className="mt-4">
          <a
            href={`https://wa.me/91${supportNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="register.support.button"
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
            Register mein koi problem? Seedha support se baat karo 👆
          </p>
        </div>
      </div>
    </div>
  );
}

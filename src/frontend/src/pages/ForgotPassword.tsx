import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useUserAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("srff_users") || "[]");
    const exists = users.find(
      (u: { phone: string }) => u.phone === phone.trim(),
    );
    if (!exists) {
      toast.error("Yeh mobile number registered nahi hai");
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords match nahi kar rahe");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password kam se kam 6 characters ka hona chahiye");
      return;
    }
    setLoading(true);
    const result = resetPassword(phone.trim(), newPassword);
    setLoading(false);
    if (result.success) {
      toast.success("Password reset ho gaya! Ab login karo.");
      navigate({ to: "/login" });
    } else {
      toast.error(result.error || "Password reset fail ho gaya");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "oklch(0.75 0.18 75 / 0.07)" }}
        />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/assets/generated/freefire-logo-transparent.dim_200x200.png"
              alt="Free Fire Logo"
              className="w-16 h-16 object-contain"
              style={{
                filter: "drop-shadow(0 0 12px oklch(0.7 0.22 35 / 0.7))",
              }}
            />
            <h1
              className="font-display uppercase tracking-widest"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.35em",
                background:
                  "linear-gradient(90deg, oklch(0.7 0.22 35), oklch(0.82 0.18 80), oklch(0.72 0.18 200))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
              }}
            >
              SR-FF-TURNAMENT
            </h1>
            <p className="text-muted-foreground text-xs tracking-wide">
              Password reset karo
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{
            background: "oklch(0.12 0.028 15)",
            borderColor: "oklch(0.75 0.18 75 / 0.3)",
          }}
        >
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <KeyRound
              className="w-5 h-5"
              style={{ color: "oklch(0.75 0.18 75)" }}
            />
            Password Bhool Gaye?
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {step === 1
              ? "Step 1: Apna registered mobile number daalo"
              : "Step 2: Naya password set karo"}
          </p>

          <div className="flex items-center gap-2 mb-6">
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{ background: "oklch(0.75 0.18 75)" }}
            />
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{
                background:
                  step === 2 ? "oklch(0.75 0.18 75)" : "oklch(0.22 0.04 20)",
              }}
            />
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-phone"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Registered Mobile Number
                </label>
                <input
                  id="forgot-phone"
                  data-ocid="forgot.phone.input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full rounded-lg px-3 py-2.5 text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                />
              </div>
              <button
                data-ocid="forgot.next.button"
                type="submit"
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.75 0.18 75), oklch(0.82 0.18 80))",
                  color: "oklch(0.1 0.01 15)",
                  boxShadow: "0 0 16px oklch(0.75 0.18 75 / 0.4)",
                }}
              >
                Aage Jao
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-new-password"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Naya Password
                </label>
                <div className="relative">
                  <input
                    id="forgot-new-password"
                    data-ocid="forgot.new_password.input"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  />
                  <button
                    data-ocid="forgot.new_password.toggle"
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="forgot-confirm"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="forgot-confirm"
                    data-ocid="forgot.confirm_password.input"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  />
                  <button
                    data-ocid="forgot.confirm_password.toggle"
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                data-ocid="forgot.reset.submit_button"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.75 0.18 75), oklch(0.82 0.18 80))",
                  color: "oklch(0.1 0.01 15)",
                  boxShadow: "0 0 16px oklch(0.75 0.18 75 / 0.4)",
                }}
              >
                {loading ? "Reset ho raha hai..." : "Password Reset Karo"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-5">
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: "oklch(0.7 0.22 35)" }}
            >
              Wapas Login par jao
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

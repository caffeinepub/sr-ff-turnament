import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Flame, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const storedPw =
      localStorage.getItem("srff_admin_password") || "7477661867Ss";
    if (password === storedPw) {
      // Use localStorage (not sessionStorage) so auth persists when Android app is backgrounded
      localStorage.setItem("adminAuth", "true");
      navigate({ to: "/admin/dashboard" });
    } else {
      toast.error("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-2xl">SR-FF</span>
          </div>
          <h1 className="font-display font-bold text-xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your password to continue
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
          data-ocid="admin-login.form"
        >
          <div>
            <Label htmlFor="password" className="text-sm">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pl-10 pr-10"
                required
                data-ocid="admin-login.password.input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPwd((v) => !v)}
                data-ocid="admin-login.show-password.toggle"
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full glow-orange"
            disabled={loading}
            data-ocid="admin-login.submit.button"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

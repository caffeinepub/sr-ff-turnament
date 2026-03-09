import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Copy,
  Edit2,
  Loader2,
  LogIn,
  LogOut,
  Save,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useSaveProfile } from "../hooks/useQueries";

const AVATARS = [
  { id: 1, emoji: "🔥", bg: "from-orange-500 to-red-600", label: "Fire" },
  { id: 2, emoji: "⚡", bg: "from-yellow-400 to-orange-500", label: "Thunder" },
  { id: 3, emoji: "🏆", bg: "from-yellow-500 to-amber-600", label: "Champion" },
  { id: 4, emoji: "🎯", bg: "from-green-500 to-emerald-600", label: "Sniper" },
  { id: 5, emoji: "⚔️", bg: "from-blue-500 to-indigo-600", label: "Warrior" },
  { id: 6, emoji: "🛡️", bg: "from-slate-500 to-slate-700", label: "Shield" },
  { id: 7, emoji: "💀", bg: "from-purple-600 to-violet-700", label: "Skull" },
  { id: 8, emoji: "🦁", bg: "from-amber-500 to-yellow-600", label: "Lion" },
  { id: 9, emoji: "🐉", bg: "from-red-600 to-rose-700", label: "Dragon" },
  { id: 10, emoji: "🌟", bg: "from-cyan-400 to-blue-500", label: "Star" },
  { id: 11, emoji: "🎮", bg: "from-pink-500 to-rose-600", label: "Gamer" },
  { id: 12, emoji: "👑", bg: "from-yellow-400 to-yellow-600", label: "King" },
];

const AVATAR_KEY = "srff_avatar";

function getSavedAvatar(): number {
  try {
    return Number(localStorage.getItem(AVATAR_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function Profile() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const saveMutation = useSaveProfile();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [savedAvatarId, setSavedAvatarId] = useState<number>(getSavedAvatar);
  const [selectedAvatarId, setSelectedAvatarId] =
    useState<number>(getSavedAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const currentAvatar = AVATARS.find((a) => a.id === savedAvatarId) ?? null;

  const startEdit = () => {
    setUsername(profile?.username ?? "");
    setFfUid(profile?.ffUid ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveMutation.mutateAsync({ ...profile, username, ffUid });
      toast.success("Profile saved!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleSetAvatar = () => {
    localStorage.setItem(AVATAR_KEY, String(selectedAvatarId));
    setSavedAvatarId(selectedAvatarId);
    setShowAvatarPicker(false);
    toast.success("Avatar updated!");
  };

  const copyReferral = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      toast.success("Referral code copied!");
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <User className="w-16 h-16 text-muted-foreground/30" />
        <div className="text-center">
          <h2 className="font-display font-bold text-xl">Your Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Login to view and edit your profile
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="glow-orange"
          data-ocid="profile.login.button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          {isLoggingIn ? "Connecting..." : "Login"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="font-display font-bold text-lg">Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-destructive hover:text-destructive"
            data-ocid="profile.logout.button"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Avatar Display */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-primary">
              {currentAvatar ? (
                <AvatarImage
                  src=""
                  alt={currentAvatar.label}
                  className="hidden"
                />
              ) : null}
              <AvatarFallback
                className={`text-3xl ${
                  currentAvatar
                    ? `bg-gradient-to-br ${currentAvatar.bg}`
                    : "bg-primary/20 text-primary"
                }`}
              >
                {currentAvatar
                  ? currentAvatar.emoji
                  : (profile?.username?.charAt(0)?.toUpperCase() ?? "?")}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId(savedAvatarId);
                setShowAvatarPicker(true);
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
              data-ocid="profile.avatar-change.button"
            >
              <Edit2 className="w-3 h-3 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-lg">
              {profile?.username || "Player"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {identity.getPrincipal().toString().slice(0, 16)}...
            </p>
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div
            className="bg-card border border-border rounded-2xl p-4 space-y-4"
            data-ocid="profile.avatar-picker.panel"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">
                Choose Avatar
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
                data-ocid="profile.avatar-picker.close_button"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    selectedAvatarId === av.id
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                  data-ocid={`profile.avatar.item.${av.id}`}
                >
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}
                  >
                    {av.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    #{av.id}
                  </span>
                  {selectedAvatarId === av.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleSetAvatar}
              disabled={selectedAvatarId === 0}
              data-ocid="profile.avatar-set.button"
            >
              Set Avatar
            </Button>
          </div>
        )}

        {/* Player Info */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm">Player Info</h3>
            {!editing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                data-ocid="profile.edit.button"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                data-ocid="profile.save.button"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                Save
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              {editing ? (
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Your username"
                  data-ocid="profile.username.input"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">
                  {profile?.username || "Not set"}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Free Fire UID
              </Label>
              {editing ? (
                <Input
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  className="mt-1"
                  placeholder="Your FF UID"
                  data-ocid="profile.ffuid.input"
                />
              ) : (
                <p className="mt-1 text-sm font-medium font-mono">
                  {profile?.ffUid || "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {profile?.referralCode && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">
              Referral Code
            </h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono tracking-widest">
                {profile.referralCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyReferral}
                data-ocid="profile.referral-copy.button"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Clock, Loader2, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllNotifications,
  useCreateNotification,
} from "../../hooks/useQueries";

export default function AdminNotifications() {
  const { data: notifications = [] } = useAllNotifications();
  const createMutation = useCreateNotification();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);

  const handleSendUpdateNotification = async () => {
    setIsSendingUpdate(true);
    try {
      await createMutation.mutateAsync({
        title: "🔄 Naya Update Aaya Hai!",
        message:
          "SR-FF-TOURNAMENT app mein naya update aaya hai! 🎉\n\nLatest version lene ke liye:\n\n✅ Step 1: Notification band karo\n✅ Step 2: Niche 'Update App' button dhundho\n✅ Step 3: Update App button par click karo\n✅ Step 4: App automatic reload ho jaayega\n\nUpdate karne ke baad aapko saare naye features milenge! 🚀",
        imageUrl: "",
      });
      toast.success("Update notification sabko bhej di gayi!");
    } catch {
      toast.error("Update notification bhejne mein error aaya");
    } finally {
      setIsSendingUpdate(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ title, message, imageUrl });
      toast.success("Notification sent to all users!");
      setTitle("");
      setMessage("");
      setImageUrl("");
    } catch {
      toast.error("Failed to send notification");
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl">Notifications</h1>

      {/* App Update Notification Button */}
      <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-sm text-orange-400 mb-1">
              App Update Notification
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Jab bhi app mein koi naya update aaye, yeh button dabao — sab
              users ko automatically update notification jaayegi aur unhe ek
              &ldquo;Update App&rdquo; button dikhega.
            </p>
            <Button
              onClick={handleSendUpdateNotification}
              disabled={isSendingUpdate}
              className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold"
              data-ocid="admin-notifications.update_app.button"
            >
              {isSendingUpdate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              🔄 App Update Notification Bhejo
            </Button>
            <div
              className="mt-3 rounded-xl p-3"
              style={{
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              <p className="text-xs font-semibold text-orange-400 mb-1">
                📱 Play Store jaisa Update Modal
              </p>
              <p className="text-xs text-muted-foreground">
                Yeh button dabane par{" "}
                <strong className="text-orange-300">sab users</strong> ke app
                mein ek
                <strong className="text-orange-300">
                  {" "}
                  Play Store jaisa "Naya Update Aaya Hai!" modal
                </strong>{" "}
                dikhega. Users "Update Karo" click karenge to app latest version
                load karega — bina kuch download kiye.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Send form */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="font-display font-semibold text-sm mb-4">
          Send Global Notification
        </h2>
        <form
          onSubmit={handleSend}
          className="space-y-3"
          data-ocid="admin-notifications.form"
        >
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
              className="mt-1"
              data-ocid="admin-notifications.title.input"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              required
              rows={3}
              className="mt-1"
              data-ocid="admin-notifications.message.textarea"
            />
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
              data-ocid="admin-notifications.imageurl.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={createMutation.isPending}
            data-ocid="admin-notifications.send.submit_button"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send to All Users
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="font-display font-semibold text-sm mb-4">
          Notification History
        </h2>
        {notifications.length === 0 ? (
          <div
            className="text-center py-8"
            data-ocid="admin-notifications.empty_state"
          >
            <Bell className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No notifications sent yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={n.id.toString()}
                className="border border-border rounded-xl p-3"
                data-ocid={`admin-notifications.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(n.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

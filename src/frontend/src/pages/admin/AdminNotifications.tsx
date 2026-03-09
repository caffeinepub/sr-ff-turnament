import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Clock, Loader2, Send } from "lucide-react";
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
                    {new Date(
                      Number(n.timestamp) / 1_000_000,
                    ).toLocaleDateString()}
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

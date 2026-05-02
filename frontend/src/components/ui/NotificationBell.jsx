import { useEffect, useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";
import { Badge } from "./badge";
import { notificationsAPI } from "../../lib/notificationsApi";

const timeAgo = (iso) => {  
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.is_read).length,
    [items]
  );

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // you can pass params like { limit: 20 } if backend supports
      const res = await notificationsAPI.list({ limit: 15 });
      setItems(res.data || []);
    } catch (e) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const handleMarkRead = async (n) => {
    if (n.is_read) return;
    try {
      await notificationsAPI.markRead(n.notification_id || n.id);
      setItems((prev) =>
        prev.map((x) =>
          (x.notification_id || x.id) === (n.notification_id || n.id)
            ? { ...x, is_read: true }
            : x
        )
      );
    } catch (e) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-lg hover:bg-slate-100"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-away overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-[360px] z-50">
            <Card className="rounded-2xl border shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="font-heading font-bold text-slate-900">
                  Notifications
                </div>
                <Badge variant="secondary">
                  {unreadCount} unread
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 text-sm text-slate-500">Loading...</div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    No notifications
                  </div>
                ) : (
                  <ul className="max-h-[420px] overflow-auto divide-y">
                    {items.map((n) => {
                      const id = n.notification_id || n.id;
                      return (
                        <li
                          key={id}
                          className={`p-4 cursor-pointer hover:bg-slate-50 ${
                            !n.is_read ? "bg-slate-50" : ""
                          }`}
                          onClick={() => handleMarkRead(n)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900 text-sm">
                                  {n.title || "Notification"}
                                </p>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                )}
                              </div>
                              {n.message && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {n.message}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 mt-2">
                                {timeAgo(n.created_at)}
                              </p>
                            </div>

                            {!n.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(n);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

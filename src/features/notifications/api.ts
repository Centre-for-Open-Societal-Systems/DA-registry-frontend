import { authRequest } from "@/features/auth";
import type { AppNotification } from "@/components/layout/NotificationsPanel";

interface ListResponse {
  data: AppNotification[];
  meta: { unread_count: number; limit: number; start: number };
}

export interface NotificationPage {
  items: AppNotification[];
  /** Unread across all of the user's notifications, not just this page: the bell badge. */
  unreadCount: number;
}

/** GET /api/v1/da-services/notifications: the signed-in user's own notifications, newest first. */
export async function listNotifications({ unread = false, limit = 20, start = 0 } = {}): Promise<NotificationPage> {
  const query = new URLSearchParams({ limit: String(limit), start: String(start) });
  if (unread) query.set("unread", "1");
  const res = await authRequest<ListResponse>(`/da-services/notifications?${query}`);
  return { items: res.data, unreadCount: res.meta.unread_count };
}

/** POST /notifications/{id}/read. Already-read rows are left as they are. */
export async function markNotificationRead(id: string): Promise<void> {
  await authRequest(`/da-services/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
}

/** POST /notifications/read-all. */
export async function markAllNotificationsRead(): Promise<void> {
  await authRequest("/da-services/notifications/read-all", { method: "POST" });
}

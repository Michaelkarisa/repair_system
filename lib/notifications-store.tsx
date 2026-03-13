"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Notification, NotificationType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

// ─── MOCK NOTIFICATIONS ───────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n-001",
    shop_id: "shop-001",
    recipient_id: null, // broadcast
    type: "ticket_assigned",
    title: "Ticket TK-004 Assigned",
    message: "iPad Pro charging port repair assigned to James Lee.",
    link: "/tickets/ticket-004",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "n-002",
    shop_id: "shop-001",
    recipient_id: null,
    type: "ticket_status_changed",
    title: "TK-003 Ready for Pickup",
    message: "Samsung Galaxy S24 battery replacement is complete.",
    link: "/tickets/ticket-003",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "n-003",
    shop_id: "shop-001",
    recipient_id: "owner-001",
    type: "invoice_paid",
    title: "Invoice INV-2025-001 Paid",
    message: "John Davis paid $380 for iPhone 15 Pro screen replacement.",
    link: "/invoices/inv-001",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "n-004",
    shop_id: "shop-001",
    recipient_id: null,
    type: "parts_arrived",
    title: "Parts Arrived",
    message: "Apple Watch Series 9 display module is in stock. TK-011 can proceed.",
    link: "/tickets/ticket-011",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "n-005",
    shop_id: "shop-001",
    recipient_id: "owner-001",
    type: "escalation",
    title: "Escalation: TK-006",
    message: "Water-damaged Pixel 8 Pro — customer requesting urgent update.",
    link: "/tickets/ticket-006",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "n-006",
    shop_id: "shop-001",
    recipient_id: null,
    type: "invoice_overdue",
    title: "Invoice Overdue",
    message: "INV-2025-003 for Emily Rodriguez is 3 days past due.",
    link: "/invoices/inv-003",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "n-007",
    shop_id: "shop-001",
    recipient_id: null,
    type: "team_invite",
    title: "Team Invite Sent",
    message: "Invite email sent to jordan.l@infernorepair.com (Parts Specialist).",
    link: "/settings",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "created_at">) => void;
  dismiss: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [all, setAll] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Filter notifications visible to this user: broadcast OR addressed to them
  const notifications = all.filter(
    n => n.recipient_id === null || (user && n.recipient_id === user.id)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setAll(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setAll(prev => prev.map(n =>
      (n.recipient_id === null || (user && n.recipient_id === user.id))
        ? { ...n, read: true } : n
    ));
  }, [user]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "created_at">) => {
    const newN: Notification = {
      ...n,
      id: `n-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAll(prev => [newN, ...prev]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setAll(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification, dismiss }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

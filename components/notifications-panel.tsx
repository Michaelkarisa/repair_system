"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/lib/notifications-store";
import { Notification, NotificationType } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<NotificationType, string> = {
  ticket_assigned:      "🎫",
  ticket_status_changed:"🔄",
  ticket_note_added:    "📝",
  invoice_paid:         "💰",
  invoice_overdue:      "⚠️",
  parts_arrived:        "📦",
  team_invite:          "👥",
  escalation:           "🚨",
  system:               "⚙️",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  ticket_assigned:      "bg-blue-100 dark:bg-blue-900/30",
  ticket_status_changed:"bg-purple-100 dark:bg-purple-900/30",
  ticket_note_added:    "bg-gray-100 dark:bg-gray-800",
  invoice_paid:         "bg-green-100 dark:bg-green-900/30",
  invoice_overdue:      "bg-red-100 dark:bg-red-900/30",
  parts_arrived:        "bg-orange-100 dark:bg-orange-900/30",
  team_invite:          "bg-cyan-100 dark:bg-cyan-900/30",
  escalation:           "bg-red-100 dark:bg-red-900/30",
  system:               "bg-gray-100 dark:bg-gray-800",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifItem({ n, onRead }: { n: Notification; onRead: () => void }) {
  const icon = TYPE_ICONS[n.type] ?? "🔔";
  const color = TYPE_COLORS[n.type] ?? "bg-gray-100";

  const inner = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60 cursor-pointer border-b border-border last:border-0",
        !n.read && "bg-primary/5"
      )}
      onClick={onRead}
    >
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-semibold text-foreground leading-tight", !n.read && "font-bold")}>
            {n.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(n.created_at)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
      </div>
      {!n.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );

  if (n.link) {
    return <Link href={n.link}>{inner}</Link>;
  }
  return inner;
}

export function NotificationsPanel() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted" title="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 border-border shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <NotifItem
                key={n.id}
                n={n}
                onRead={() => { markRead(n.id); setOpen(false); }}
              />
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2 bg-background">
            <p className="text-xs text-muted-foreground text-center">
              Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

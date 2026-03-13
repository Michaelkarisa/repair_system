import { Badge } from "@/components/ui/badge";
import {
  TICKET_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  type TicketStatus,
  type InvoiceStatus,
} from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Covers both ticket and invoice statuses
const statusStyles: Record<string, { bg: string; text: string }> = {
  // ticket statuses
  open:              { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-700 dark:text-blue-300" },
  diagnosed:         { bg: "bg-yellow-50 dark:bg-yellow-950/40", text: "text-yellow-700 dark:text-yellow-300" },
  in_progress:       { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300" },
  waiting_parts:     { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300" },
  awaiting_approval: { bg: "bg-pink-50 dark:bg-pink-950/40",   text: "text-pink-700 dark:text-pink-300" },
  ready_for_pickup:  { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300" },
  completed:         { bg: "bg-slate-100 dark:bg-slate-800",   text: "text-slate-600 dark:text-slate-300" },
  cancelled:         { bg: "bg-red-50 dark:bg-red-950/40",     text: "text-red-600 dark:text-red-300" },
  // invoice statuses
  draft:             { bg: "bg-slate-100 dark:bg-slate-800",   text: "text-slate-600 dark:text-slate-300" },
  sent:              { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-700 dark:text-blue-300" },
  partially_paid:    { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
  paid:              { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300" },
  overdue:           { bg: "bg-red-50 dark:bg-red-950/40",     text: "text-red-700 dark:text-red-300" },
};

const ALL_LABELS: Record<string, string> = {
  ...TICKET_STATUS_LABELS,
  ...INVOICE_STATUS_LABELS,
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? { bg: "bg-muted", text: "text-muted-foreground" };
  const label = ALL_LABELS[status] ?? status;
  return (
    <Badge
      className={`${style.bg} ${style.text} border-0 font-medium text-xs whitespace-nowrap ${className ?? ""}`}
    >
      {label}
    </Badge>
  );
}

// Priority badge
const priorityStyles: Record<string, { bg: string; text: string }> = {
  low:    { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
  medium: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
  high:   { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300" },
  urgent: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300" },
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const style = priorityStyles[priority] ?? priorityStyles.medium;
  return (
    <Badge className={`${style.bg} ${style.text} border-0 font-medium text-xs capitalize ${className ?? ""}`}>
      {priority}
    </Badge>
  );
}

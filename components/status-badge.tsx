import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  received: { bg: "bg-blue-50", text: "text-blue-700", label: "Received" },
  diagnosing: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Diagnosing" },
  "waiting-parts": { bg: "bg-orange-50", text: "text-orange-700", label: "Waiting for Parts" },
  repairing: { bg: "bg-purple-50", text: "text-purple-700", label: "Repairing" },
  ready: { bg: "bg-green-50", text: "text-green-700", label: "Ready for Pickup" },
  completed: { bg: "bg-gray-50", text: "text-gray-700", label: "Completed" },
  paid: { bg: "bg-green-50", text: "text-green-700", label: "Paid" },
  unpaid: { bg: "bg-red-50", text: "text-red-700", label: "Unpaid" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.received;

  return (
    <Badge className={`${style.bg} ${style.text} border-0 font-medium ${className}`}>
      {style.label}
    </Badge>
  );
}

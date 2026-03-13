import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types";
import { TICKET_STATUS_LABELS } from "@/lib/types";

// Linear progress steps (cancelled is handled separately)
const STEPS: TicketStatus[] = [
  'open',
  'diagnosed',
  'in_progress',
  'waiting_parts',
  'awaiting_approval',
  'ready_for_pickup',
  'completed',
];

const STEP_ORDER: Record<string, number> = Object.fromEntries(
  STEPS.map((s, i) => [s, i])
);

interface TicketStatusTimelineProps {
  currentStatus: TicketStatus | string;
  completedAt?: string | null;
}

export function TicketStatusTimeline({ currentStatus, completedAt }: TicketStatusTimelineProps) {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STEP_ORDER[currentStatus] ?? 0;

  return (
    <div>
      {isCancelled ? (
        <div className="flex items-center gap-2 py-2">
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-400 flex items-center justify-center shrink-0">
            <X className="h-4 w-4 text-red-600" />
          </div>
          <span className="text-sm font-medium text-red-600">Ticket Cancelled</span>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const isDone    = index < currentIndex || currentStatus === 'completed';
              const isCurrent = index === currentIndex && currentStatus !== 'completed';
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors",
                      isDone    ? "bg-primary border-primary text-primary-foreground"
                               : isCurrent ? "bg-background border-primary text-primary"
                                           : "bg-background border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isDone
                      ? <Check className="h-3.5 w-3.5" />
                      : <div className={cn("h-2 w-2 rounded-full", isCurrent ? "bg-primary" : "bg-muted-foreground/30")} />
                    }
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-0.5 transition-colors", index < currentIndex ? "bg-primary" : "bg-muted-foreground/20")} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex mt-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex-1 min-w-0 text-center px-0.5">
                <p className={cn(
                  "text-[10px] font-medium leading-tight truncate",
                  index <= currentIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  {TICKET_STATUS_LABELS[step]}
                </p>
              </div>
            ))}
          </div>

          {completedAt && currentStatus === 'completed' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Completed {new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </>
      )}
    </div>
  );
}

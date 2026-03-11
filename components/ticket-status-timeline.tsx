import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: string;
  label: string;
  description?: string;
  date?: string;
}

const allSteps: TimelineStep[] = [
  { status: "received", label: "Received" },
  { status: "diagnosing", label: "Diagnosing" },
  { status: "waiting-parts", label: "Waiting for Parts" },
  { status: "repairing", label: "Repairing" },
  { status: "ready", label: "Ready for Pickup" },
  { status: "completed", label: "Completed" },
];

const statusOrder: Record<string, number> = {
  received: 0,
  diagnosing: 1,
  "waiting-parts": 2,
  repairing: 3,
  ready: 4,
  completed: 5,
};

interface TicketStatusTimelineProps {
  currentStatus: string;
  completedDate?: string;
}

export function TicketStatusTimeline({
  currentStatus,
  completedDate,
}: TicketStatusTimelineProps) {
  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        {allSteps.map((step, index) => {
          const isCompleted = index < currentIndex || (index === currentIndex && currentStatus === "completed");
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex items-center flex-1">
              {/* Circle */}
              <div
                className={cn(
                  "relative h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                  isCompleted || isCurrent
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              {/* Line (if not last) */}
              {index < allSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1",
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels below timeline */}
      <div className="flex gap-2 mt-4">
        {allSteps.map((step, index) => (
          <div
            key={step.status}
            className="flex-1 flex flex-col items-center"
          >
            <p
              className={cn(
                "text-xs font-medium text-center leading-tight",
                index <= currentIndex ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

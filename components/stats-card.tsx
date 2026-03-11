import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "accent";
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card
      className={`p-6 ${
        variant === "accent" ? "bg-primary/5 border-primary/20" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-primary opacity-60">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

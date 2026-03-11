import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: PricingCardProps) {
  return (
    <Card
      className={`p-8 flex flex-col ${
        highlighted
          ? "border-primary bg-primary/5 shadow-lg"
          : "border-border hover:border-primary/30"
      }`}
    >
      <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>

      <Button
        className={`w-full mb-8 ${
          highlighted
            ? "bg-primary hover:bg-primary/90"
            : "bg-secondary text-foreground hover:bg-secondary/80"
        }`}
      >
        Get Started
      </Button>

      <div className="space-y-4 flex-1">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

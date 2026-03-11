"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Zap, Users, BarChart3 } from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const steps = [
    {
      title: "Welcome!",
      description: "Let's get your repair shop set up in Inferno Repair",
      icon: Zap,
      content:
        "Over the next few steps, we'll configure your shop settings and introduce you to the key features of our platform.",
    },
    {
      title: "Track Your Repairs",
      description: "Manage tickets from creation to completion",
      icon: CheckCircle,
      content:
        "Create repair tickets for each customer, track them through every stage of the repair process, and keep customers informed every step of the way.",
    },
    {
      title: "Manage Your Team",
      description: "Collaborate with technicians and staff",
      icon: Users,
      content:
        "Add team members, assign tickets to technicians, and track productivity across your entire shop with role-based permissions.",
    },
    {
      title: "Monitor Performance",
      description: "Get insights with analytics",
      icon: BarChart3,
      content:
        "View real-time dashboards showing repair completion rates, average turnaround times, and revenue metrics to make data-driven decisions.",
    },
  ];

  const CurrentIcon = steps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("[v0] Onboarding completed");
    router.push("/dashboard");
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 md:p-12 border-border">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CurrentIcon className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {steps[currentStep].title}
          </h1>

          <p className="text-muted-foreground mb-6">
            {steps[currentStep].description}
          </p>

          <p className="text-foreground text-lg leading-relaxed">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentStep > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isLoading}
              className="border-border text-foreground"
            >
              Back
            </Button>
          )}

          <Button
            size="lg"
            onClick={handleNext}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading
              ? "Setting up..."
              : currentStep === steps.length - 1
                ? "Get Started"
                : "Next"}
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              disabled={isLoading}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-primary w-8"
                  : index < currentStep
                    ? "bg-primary/40 w-2"
                    : "bg-muted w-2"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

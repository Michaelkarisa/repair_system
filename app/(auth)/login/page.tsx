"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For demo purposes, always succeed
    console.log("[v0] Login with:", { email, password });
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-md p-8 border-border">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your repair shop dashboard
        </p>
      </div>

      {/* Demo Hint */}
      <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-xs text-primary font-medium">
          💡 Demo Hint: Use any email and password to proceed
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading || !email || !password}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition">
          Back to Home
        </Link>
      </div>
    </Card>
  );
}

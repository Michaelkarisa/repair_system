"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Building2, User, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [shopName,   setShopName]   = useState("");
  const [ownerName,  setOwnerName]  = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;

    setError(null);
    setIsLoading(true);

    try {
      // 1. Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw new Error(signUpError.message);

      const user = authData.user;
      if (!user) throw new Error("Sign-up succeeded but no user was returned.");

      // 2. Bootstrap shop + owner team_member via a SECURITY DEFINER RPC.
      //    This bypasses RLS, which is necessary because the session may not
      //    be fully active yet (Supabase requires email confirmation by default).
      const { error: rpcError } = await supabase.rpc("register_shop", {
        p_user_id:    user.id,
        p_shop_name:  shopName,
        p_owner_name: ownerName,
        p_email:      email,
        p_currency:   "KES",
        p_timezone:   "Africa/Nairobi",
      });
      if (rpcError) throw new Error(rpcError.message);

      // 3. Navigate to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = shopName && ownerName && email && password && agreeTerms;

  return (
    <Card className="w-full max-w-md p-8 border-border">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your repair shop in minutes
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shopName" className="text-foreground">Shop Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="shopName" placeholder="Inferno Repair & Service"
              value={shopName} onChange={(e) => setShopName(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-foreground">Owner Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="ownerName" placeholder="John Doe"
              value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isLoading} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            disabled={isLoading} className="border-border" />
          <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal cursor-pointer">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading || !isFormValid}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isLoading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
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
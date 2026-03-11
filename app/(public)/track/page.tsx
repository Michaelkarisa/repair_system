"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft } from "lucide-react";

export default function TrackingLookup() {
  const [ticketCode, setTicketCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push(`/track/${ticketCode}`);
  };

  const exampleTickets = ["TK-001", "TK-002", "TK-003", "TK-004", "TK-005"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Track Your Repair
            </h1>
            <p className="text-muted-foreground">
              Enter your ticket number to check the status of your repair
            </p>
          </div>

          <Card className="p-8 border-border">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="ticket" className="text-sm font-medium text-foreground block mb-2">
                  Ticket Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ticket"
                    placeholder="e.g., TK-001"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    className="pl-10 border-border focus-visible:ring-1 focus-visible:ring-accent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!ticketCode.trim() || isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3">Try example tickets:</p>
              <div className="flex flex-wrap gap-2">
                {exampleTickets.map((ticket) => (
                  <button
                    key={ticket}
                    onClick={() => {
                      setTicketCode(ticket);
                    }}
                    className="px-3 py-1.5 text-xs bg-muted hover:bg-primary/10 text-foreground rounded transition"
                  >
                    {ticket}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have a ticket? <Link href="/register" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import { TicketStatusTimeline } from "@/components/ticket-status-timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Smartphone, Clock, Phone, Mail, ShieldCheck } from "lucide-react";
import type { Ticket } from "@/lib/types";
import { TICKET_STATUS_LABELS } from "@/lib/types";

interface Props { params: Promise<{ code: string }> }

export default function TrackingPage({ params }: Props) {
  const { code } = use(params);
  const [ticket,  setTicket]  = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, customer:customers(name, phone, email)")
        .ilike("code", code)
        .single();

      if (error || !data) {
        setError("Ticket not found. Please check the code and try again.");
      } else {
        setTicket(data);
      }
      setLoading(false);
    })();
  }, [code]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  );

  if (error || !ticket) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 max-w-md text-center border-border">
        <h2 className="text-xl font-bold text-foreground mb-2">Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild className="bg-primary hover:bg-primary/90"><Link href="/track">Try Again</Link></Button>
      </Card>
    </div>
  );

  const balance = Math.max(0, (ticket.cost_final ?? ticket.cost_estimate) - ticket.deposit_amount);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/track" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-8 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-mono mb-1">{ticket.code}</h1>
          <p className="text-muted-foreground text-sm">{TICKET_STATUS_LABELS[ticket.status as any] ?? ticket.status}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <Card className="p-6 mb-6 border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Repair Status</h2>
        <TicketStatusTimeline currentStatus={ticket.status} completedAt={ticket.completed_at} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card className="p-5 border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-primary" /> Repair Details
          </h3>
          <div className="space-y-2 text-sm">
            <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Issue</p><p className="text-foreground">{ticket.issue_description}</p></div>
            {ticket.diagnosis && <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Diagnosis</p><p className="text-foreground">{ticket.diagnosis}</p></div>}
          </div>
        </Card>

        <Card className="p-5 border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" /> Timeline
          </h3>
          <div className="space-y-2 text-sm">
            <div><p className="text-xs text-muted-foreground">Received</p><p className="text-foreground">{fmt(ticket.created_at)}</p></div>
            {ticket.completed_at && <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-foreground">{fmt(ticket.completed_at)}</p></div>}
          </div>
        </Card>
      </div>

      <Card className="p-5 border-border mb-5">
        <h3 className="font-semibold text-foreground mb-3 text-sm">Cost Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Estimated</span><span>KES {ticket.cost_estimate}</span></div>
          {ticket.cost_final != null && <div className="flex justify-between"><span className="text-muted-foreground">Final</span><span>KES {ticket.cost_final}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Deposit Paid</span><span className="text-green-600">-KES {ticket.deposit_amount}</span></div>
          <div className="flex justify-between pt-2 border-t border-border font-bold"><span>Balance Due</span><span className="text-primary">KES {balance}</span></div>
        </div>
      </Card>

      {ticket.warranty_expires_at && (
        <Card className="p-4 mb-5 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Warranty valid until {fmt(ticket.warranty_expires_at)}</p>
          </div>
        </Card>
      )}

      <Card className="p-5 border-primary/20 bg-primary/5">
        <p className="text-sm font-semibold text-foreground text-center mb-3">Questions about your repair?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
          <a href="tel:+254700000000" className="flex items-center justify-center gap-2 text-primary hover:opacity-80"><Phone className="h-4 w-4" />+254 700 000 000</a>
          <a href="mailto:support@infernorepair.com" className="flex items-center justify-center gap-2 text-primary hover:opacity-80"><Mail className="h-4 w-4" />support@infernorepair.com</a>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, listTickets } from "@/lib/actions/tickets";
import { getInvoiceStats } from "@/lib/actions/invoices";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { StatsCard } from "@/components/stats-card";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Ticket as TicketIcon, Package, CheckCircle, AlertTriangle,
  Clock, Wrench, ArrowRight, DollarSign,
} from "lucide-react";
import type { Ticket } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [ticketStats, setTicketStats] = useState<Record<string, number>>({});
  const [invoiceStats, setInvoiceStats] = useState<Record<string, any>>({});
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [tStats, iStats, recent] = await Promise.all([
        getDashboardStats(user.shop_id, user.access_token),
        getInvoiceStats(user.shop_id, user.access_token),
        listTickets(user.shop_id, user.access_token, { limit: 8 }),
      ]);
      if (tStats.data) setTicketStats(tStats.data as any);
      if (iStats.data)  setInvoiceStats(iStats.data);
      if (recent.data)  setRecentTickets(recent.data as Ticket[]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const cards = [
    { label: "Open",            value: ticketStats.open ?? 0,             icon: <TicketIcon className="h-5 w-5" /> },
    { label: "In Progress",     value: ticketStats.in_progress ?? 0,      icon: <Wrench className="h-5 w-5" /> },
    { label: "Waiting Parts",   value: ticketStats.waiting_parts ?? 0,    icon: <Package className="h-5 w-5" /> },
    { label: "Ready for Pickup",value: ticketStats.ready_for_pickup ?? 0, icon: <CheckCircle className="h-5 w-5" />, variant: "accent" as const },
    { label: "Awaiting Approval",value: ticketStats.awaiting_approval ?? 0, icon: <Clock className="h-5 w-5" /> },
    { label: "Completed",       value: ticketStats.completed ?? 0,        icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Revenue (Paid)",  value: formatCurrency(invoiceStats.paid?.total ?? 0, user?.currency_code), icon: <DollarSign className="h-5 w-5" />, variant: "accent" as const },
    { label: "Overdue Invoices",value: invoiceStats.overdue?.count ?? 0,  icon: <AlertTriangle className="h-5 w-5" /> },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name} · {user?.role && <span className="capitalize">{user.role}</span>}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {isLoading
            ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-28" />)
            : cards.map(c => (
                <StatsCard key={c.label} label={c.label} value={c.value} icon={c.icon} variant={c.variant} />
              ))
          }
        </div>

        {/* Recent Tickets */}
        <Card className="border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Tickets</h2>
            <Button asChild variant="outline" size="sm" className="border-border gap-2">
              <Link href="/tickets">View All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : recentTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Code", "Issue", "Status", "Priority", "Date", "Est. Cost"].map(h => (
                      <TableHead key={h} className="text-foreground font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map(t => (
                    <TableRow
                      key={t.id}
                      className="border-border hover:bg-muted/50 cursor-pointer transition"
                      onClick={() => router.push(`/tickets/${t.id}`)}
                    >
                      <TableCell className="font-mono font-semibold text-primary text-sm">{t.code}</TableCell>
                      <TableCell className="text-foreground text-sm max-w-[200px] truncate">{t.issue_description}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmt(t.created_at)}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {t.cost_final != null
                          ? formatCurrency(t.cost_final, user?.currency_code)
                          : `~${formatCurrency(t.cost_estimate, user?.currency_code)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground mb-4">No tickets yet.</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/tickets">Create your first ticket</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

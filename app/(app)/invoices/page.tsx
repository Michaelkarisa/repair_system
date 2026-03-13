"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listInvoices, getInvoiceStats } from "@/lib/actions/invoices";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, TrendingUp, AlertCircle, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { INVOICE_STATUS_LABELS } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [stats,     setStats]     = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("all");
  const [total,     setTotal]     = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [iRes, sRes] = await Promise.all([
        listInvoices(user.shop_id, user.access_token, {
          status: status !== "all" ? status as InvoiceStatus : undefined,
          search: search || undefined,
          limit: 100,
        }),
        getInvoiceStats(user.shop_id, user.access_token),
      ]);
      setInvoices(iRes.data as Invoice[]);
      setTotal(iRes.count);
      if (sRes.data) setStats(sRes.data);
    } finally {
      setIsLoading(false);
    }
  }, [user, status, search]);

  useEffect(() => { load(); }, [load]);

  const fmt = (d?: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const paidTotal     = stats.paid?.total ?? 0;
  const partialTotal  = stats.partially_paid?.total ?? 0;
  const overdueTotal  = stats.overdue?.total ?? 0;
  const outstandingCount = (stats.sent?.count ?? 0) + (stats.partially_paid?.count ?? 0) + (stats.overdue?.count ?? 0);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Invoices</h1>
          <p className="text-sm text-muted-foreground">Track invoices and payments</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Collected</span>
            </div>
            <p className="text-xl font-extrabold text-green-700 dark:text-green-400">{formatCurrency(paidTotal, user?.currency_code)}</p>
          </Card>
          <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Partial</span>
            </div>
            <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{formatCurrency(partialTotal, user?.currency_code)}</p>
          </Card>
          <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Overdue</span>
            </div>
            <p className="text-xl font-extrabold text-red-700 dark:text-red-400">{formatCurrency(overdueTotal, user?.currency_code)}</p>
          </Card>
          <Card className="p-4 border-border">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">{outstandingCount} invoices</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5 border-border">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by invoice number…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 border-border" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-48 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="border-border">
          {isLoading ? (
            <div className="p-5 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Invoice #", "Ticket", "Amount", "Paid", "Balance", "Due", "Status", "Actions"].map(h => (
                      <TableHead key={h} className="text-foreground font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id} className="border-border hover:bg-muted/50 transition">
                      <TableCell className="font-mono font-bold text-primary text-sm">{inv.invoice_number}</TableCell>
                      <TableCell className="font-mono text-muted-foreground text-sm">
                        {(inv as any).ticket?.code ?? inv.ticket_id.slice(0, 8) + "…"}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">KES {inv.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600 font-semibold text-sm">KES {inv.amount_paid.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        KES {Math.max(0, inv.amount - inv.amount_paid).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmt(inv.due_date)}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="border-border">
                          <Link href={`/invoices/${inv.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No invoices found.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

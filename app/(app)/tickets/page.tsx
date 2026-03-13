"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listTickets } from "@/lib/actions/tickets";
import { listTeamMembers } from "@/lib/actions/team";
import { listCustomers } from "@/lib/actions/customers";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
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
import { Plus, Search, Ticket as TicketIcon } from "lucide-react";
import { NewTicketModal } from "@/components/modals/new-ticket-modal";
import { formatCurrency } from "@/lib/currency";
import type { Ticket, Customer, TeamMember, TicketStatus } from "@/lib/types";
import { TICKET_STATUS_LABELS } from "@/lib/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const PRIORITY_OPTIONS = [
  { value: "all",    label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
];

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [team, setTeam]             = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [priorityFilter, setPriority] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [tResult, cResult, mResult] = await Promise.all([
        listTickets(user.shop_id, user.access_token, {
          status:   statusFilter !== "all" ? statusFilter as TicketStatus : undefined,
          priority: priorityFilter !== "all" ? priorityFilter as any : undefined,
          search:   search || undefined,
          limit: 100,
        }),
        listCustomers(user.shop_id, user.access_token, { limit: 200 }),
        listTeamMembers(user.shop_id, user.access_token, { status: "active" }),
      ]);
      setTickets(tResult.data as Ticket[]);
      setTotalCount(tResult.count);
      setCustomers(cResult.data as Customer[]);
      setTeam(mResult.data as TeamMember[]);
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter, priorityFilter, search]);

  useEffect(() => { load(); }, [load]);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name ?? "—";
  const getTechName     = (id?: string | null) => id ? (team.find(m => m.id === id)?.name ?? id) : "—";
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Tickets</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? "Loading…" : `${totalCount} repair ticket${totalCount !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5 border-border">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ticket code or issue…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 border-border" />
            </div>
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-52 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriority}>
              <SelectTrigger className="w-full md:w-40 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="border-border">
          {isLoading ? (
            <div className="p-5 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
          ) : tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Code", "Customer", "Issue", "Status", "Priority", "Assigned", "Date", "Est.", "Actions"].map(h => (
                      <TableHead key={h} className="text-foreground font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map(t => (
                    <TableRow key={t.id} className="border-border hover:bg-muted/50 transition">
                      <TableCell className="font-mono font-bold text-primary text-sm">{t.code}</TableCell>
                      <TableCell className="text-foreground text-sm">{getCustomerName(t.customer_id)}</TableCell>
                      <TableCell className="text-foreground text-sm max-w-[180px] truncate">{t.issue_description}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{getTechName(t.assigned_to)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmt(t.created_at)}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {formatCurrency(t.cost_estimate, user?.currency_code)}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="border-border">
                          <Link href={`/tickets/${t.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tickets match your filters."
                  : "No tickets yet. Create your first ticket to get started."}
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" /> Create First Ticket
              </Button>
            </div>
          )}
        </Card>
      </div>

      <NewTicketModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        customers={customers}
        teamMembers={team}
        onSuccess={load}
      />
    </div>
  );
}

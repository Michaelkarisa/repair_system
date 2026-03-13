"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTicket, updateTicket, addTicketNote, getTicketNotes, getTicketStatusHistory } from "@/lib/actions/tickets";
import { getCustomer } from "@/lib/actions/customers";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { TicketStatusTimeline } from "@/components/ticket-status-timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Smartphone, FileText, DollarSign, User, RefreshCw,
  Clock, ShieldCheck, Lock, Clipboard, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, ROLE_LABELS } from "@/lib/types";
import type { Ticket, Customer, TicketNote, TicketStatusHistory, TicketStatus, TicketPriority } from "@/lib/types";

interface Props { params: { id: string } }

export default function TicketDetailPage({ params }: Props) {
  const { user } = useAuth();
  const [ticket,    setTicket]    = useState<Ticket | null>(null);
  const [customer,  setCustomer]  = useState<Customer | null>(null);
  const [notes,     setNotes]     = useState<TicketNote[]>([]);
  const [history,   setHistory]   = useState<TicketStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Note form
  const [noteText,     setNoteText]     = useState("");
  const [isInternal,   setIsInternal]   = useState(true);
  const [addingNote,   setAddingNote]   = useState(false);

  // Status update
  const [pendingStatus,   setPendingStatus]   = useState<TicketStatus | "">("");
  const [updatingStatus,  setUpdatingStatus]  = useState(false);

  // Diagnosis
  const [diagnosis,       setDiagnosis]       = useState("");
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  // Show/hide sections
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [tRes, nRes, hRes] = await Promise.all([
        getTicket(params.id, user.shop_id, user.access_token),
        getTicketNotes(params.id, user.access_token),
        getTicketStatusHistory(params.id, user.access_token),
      ]);
      if (tRes.error || !tRes.data) { setError("Ticket not found"); return; }
      setTicket(tRes.data as Ticket);
      setPendingStatus(tRes.data.status as TicketStatus);
      setDiagnosis(tRes.data.diagnosis ?? "");
      setNotes(nRes.data as TicketNote[]);
      setHistory(hRes.data as TicketStatusHistory[]);

      if (tRes.data.customer_id) {
        const cRes = await getCustomer(tRes.data.customer_id, user.shop_id, user.access_token);
        if (cRes.data) setCustomer(cRes.data as Customer);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async () => {
    if (!ticket || !user || pendingStatus === ticket.status || !pendingStatus) return;
    setUpdatingStatus(true);
    const res = await updateTicket(ticket.id, user.shop_id, user.access_token, { status: pendingStatus });
    setUpdatingStatus(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to update status", { description: msg });
    } else {
      setTicket(res.data as Ticket);
      toast.success(`Status updated to "${TICKET_STATUS_LABELS[pendingStatus]}"`);
      const hRes = await getTicketStatusHistory(ticket.id, user.access_token);
      setHistory(hRes.data as TicketStatusHistory[]);
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!ticket || !user) return;
    setSavingDiagnosis(true);
    const res = await updateTicket(ticket.id, user.shop_id, user.access_token, { diagnosis });
    setSavingDiagnosis(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to save diagnosis", { description: msg });
    } else {
      setTicket(res.data as Ticket);
      toast.success("Diagnosis saved");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !ticket || !user) return;
    setAddingNote(true);
    const res = await addTicketNote(ticket.id, user.team_member_id, noteText.trim(), isInternal, user.access_token);
    setAddingNote(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to add note", { description: msg });
    } else {
      setNotes(prev => [...prev, res.data as TicketNote]);
      setNoteText("");
      toast.success("Note added");
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isLoading) return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  );

  if (error || !ticket) return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <Card className="p-8 text-center border-border">
        <p className="text-muted-foreground mb-4">{error ?? "Ticket not found"}</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/tickets">Back to Tickets</Link>
        </Button>
      </Card>
    </div>
  );

  const balance = (ticket.cost_final ?? ticket.cost_estimate) - ticket.deposit_amount;

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/tickets" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground font-mono">{ticket.code}</h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="text-sm text-muted-foreground">Created {fmt(ticket.created_at)}</p>
          </div>
          {/* Status update */}
          <div className="flex items-center gap-2">
            <Select value={pendingStatus} onValueChange={v => setPendingStatus(v as TicketStatus)}>
              <SelectTrigger className="w-52 border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TICKET_STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || pendingStatus === ticket.status || !pendingStatus}
              className="bg-primary hover:bg-primary/90 gap-2" size="sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${updatingStatus ? "animate-spin" : ""}`} />
              {updatingStatus ? "Updating…" : "Update"}
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-5 mb-5 border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Repair Progress</p>
          <TicketStatusTimeline currentStatus={ticket.status} completedAt={ticket.completed_at} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Device / Issue */}
          <Card className="p-5 border-border lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-primary" /> Issue Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Issue Description</p>
                <p className="text-sm text-foreground leading-relaxed">{ticket.issue_description}</p>
              </div>
              {ticket.intake_condition && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Intake Condition</p>
                  <p className="text-sm text-foreground">{ticket.intake_condition}</p>
                </div>
              )}
              {ticket.lock_code && (
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Lock code: <span className="font-mono font-semibold text-foreground">{ticket.lock_code}</span></p>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            <div className="mt-5 pt-4 border-t border-border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Diagnosis
              </Label>
              <Textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Enter technical diagnosis…"
                className="border-border min-h-[80px] text-sm"
                disabled={savingDiagnosis}
              />
              <Button
                size="sm"
                className="mt-2 bg-primary hover:bg-primary/90"
                onClick={handleSaveDiagnosis}
                disabled={savingDiagnosis || diagnosis === (ticket.diagnosis ?? "")}
              >
                {savingDiagnosis ? "Saving…" : "Save Diagnosis"}
              </Button>
            </div>
          </Card>

          {/* Cost Summary */}
          <Card className="p-5 border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" /> Cost Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Est. Cost</span><span className="font-semibold text-foreground">{formatCurrency(ticket.cost_estimate, user?.currency_code)}</span></div>
              {ticket.cost_final != null && (
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Final Cost</span><span className="font-semibold text-foreground">{formatCurrency(ticket.cost_final, user?.currency_code)}</span></div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Deposit Paid</span>
                <span className="font-semibold text-green-600">-{formatCurrency(ticket.deposit_amount, user?.currency_code)}</span>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Balance Due</div>
                <div className="text-2xl font-extrabold text-primary">{formatCurrency(balance > 0 ? balance : 0, user?.currency_code)}</div>
              </div>
            </div>

            {/* Warranty */}
            {ticket.warranty_expires_at && (
              <div className="mt-4 bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">WARRANTY</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500">{ticket.warranty_days} days · until {fmt(ticket.warranty_expires_at)}</p>
              </div>
            )}

            {/* Timeline dates */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timeline</p>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm text-foreground">{fmt(ticket.created_at)}</p></div>
              {ticket.completed_at && <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-sm text-foreground">{fmt(ticket.completed_at)}</p></div>}
            </div>
          </Card>
        </div>

        {/* Customer */}
        {customer && (
          <Card className="p-5 border-border mb-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" /> Customer
            </h3>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-6 flex-wrap text-sm">
                <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Name</p><p className="font-semibold text-foreground">{customer.name}</p></div>
                {customer.phone && <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Phone</p><p className="text-foreground">{customer.phone}</p></div>}
                {customer.email && <div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Email</p><p className="text-foreground">{customer.email}</p></div>}
              </div>
              <Button asChild variant="outline" size="sm" className="border-border">
                <Link href={`/customers/${customer.id}`}>View Customer</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-5 border-border mb-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" /> Notes
          </h3>
          <form onSubmit={handleAddNote} className="mb-5 pb-5 border-b border-border space-y-2">
            <Textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note about this repair…"
              className="border-border min-h-[72px] text-sm"
              disabled={addingNote}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Switch checked={isInternal} onCheckedChange={setIsInternal} />
                {isInternal ? "Internal only" : "Customer-visible"}
              </label>
              <Button type="submit" disabled={!noteText.trim() || addingNote} className="bg-primary hover:bg-primary/90" size="sm">
                {addingNote ? "Adding…" : "Add Note"}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {notes.length === 0
              ? <p className="text-sm text-muted-foreground">No notes yet.</p>
              : notes.map(n => (
                <div key={n.id} className={`p-3 rounded-lg text-sm ${n.is_internal ? "bg-muted/50 border border-border" : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-xs">{n.author?.name ?? "System"}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{n.is_internal ? "Internal" : "Customer"}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{fmtShort(n.created_at)}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{n.note}</p>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Status History */}
        <Card className="p-5 border-border">
          <button
            className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
            onClick={() => setShowHistory(h => !h)}
          >
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Status History ({history.length})</span>
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showHistory && (
            <div className="mt-4 space-y-2">
              {history.length === 0
                ? <p className="text-sm text-muted-foreground">No status changes recorded.</p>
                : history.map(h => (
                  <div key={h.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm flex-1">
                      <span className="text-muted-foreground">{h.old_status ? TICKET_STATUS_LABELS[h.old_status as any] ?? h.old_status : "—"}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">{TICKET_STATUS_LABELS[h.new_status as any] ?? h.new_status}</span>
                      {h.changed_by && <span className="text-muted-foreground ml-2">by {h.changed_by.name}</span>}
                      <span className="text-xs text-muted-foreground ml-2">{fmtShort(h.changed_at)}</span>
                      {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getInvoice, updateInvoice, getInvoicePayments, recordPayment } from "@/lib/actions/invoices";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Printer, Plus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Invoice, Payment, PaymentMethod } from "@/lib/types";
import { PAYMENT_METHOD_LABELS, INVOICE_STATUS_LABELS } from "@/lib/types";

interface Props { params: { id: string } }

export default function InvoiceDetailPage({ params }: Props) {
  const { user } = useAuth();
  const [invoice,   setInvoice]   = useState<any | null>(null);
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [iRes, pRes] = await Promise.all([
        getInvoice(params.id, user.shop_id, user.access_token),
        getInvoicePayments(params.id, user.access_token),
      ]);
      if (iRes.error || !iRes.data) { setError("Invoice not found"); return; }
      setInvoice(iRes.data);
      setPayments(pRes.data as Payment[]);
    } finally {
      setIsLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => {
    if (!invoice) return;
    const w = window.open("", "_blank")!;
    const balance = invoice.amount - invoice.amount_paid;
    w.document.write(`
      <html><head><title>${invoice.invoice_number}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:48px;max-width:640px;margin:0 auto}
        .brand{font-size:22px;font-weight:800;color:#ff4d2e}.inv-num{font-size:22px;font-weight:700}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{border:1px solid #ddd;padding:10px;font-size:14px}
        th{background:#f5f5f5;font-size:12px;text-transform:uppercase}
        .total-row td{font-weight:700;font-size:16px;border:none}
        .footer{margin-top:40px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:16px}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;margin-bottom:32px">
        <div><div class="brand">Inferno Repair</div></div>
        <div style="text-align:right"><div class="inv-num">${invoice.invoice_number}</div>
          <div style="color:#888;font-size:13px">Status: ${INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}</div>
          ${invoice.due_date ? `<div style="color:#888;font-size:13px">Due: ${new Date(invoice.due_date).toLocaleDateString()}</div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Repair Service — Ticket ${invoice.ticket?.code ?? invoice.ticket_id}</td><td>KES ${invoice.amount.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div style="text-align:right;margin-top:8px">
        <div>Total: <strong>KES ${invoice.amount.toLocaleString()}</strong></div>
        <div style="color:green">Paid: <strong>KES ${invoice.amount_paid.toLocaleString()}</strong></div>
        <div style="font-size:18px;font-weight:700;color:#ff4d2e;margin-top:8px">Balance Due: KES ${Math.max(0,balance).toLocaleString()}</div>
      </div>
      ${invoice.notes ? `<p style="margin-top:20px;font-size:13px;color:#555">Notes: ${invoice.notes}</p>` : ""}
      <div class="footer">Thank you for your business — Inferno Repair</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isLoading) return (
    <div className="flex-1 p-6"><div className="max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div></div>
  );
  if (error || !invoice) return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <Card className="p-8 text-center border-border">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild className="bg-primary hover:bg-primary/90"><Link href="/invoices">Back</Link></Button>
      </Card>
    </div>
  );

  const balance = Math.max(0, invoice.amount - invoice.amount_paid);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Link>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground font-mono">{invoice.invoice_number}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">Created {fmt(invoice.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-border">
              <Printer className="h-4 w-4" /> Print
            </Button>
            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <Button size="sm" onClick={() => setShowPaymentModal(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" /> Record Payment
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card className="p-5 border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Invoice Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice #</span><span className="font-mono font-bold text-foreground">{invoice.invoice_number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Linked Ticket</span><Link href={`/tickets/${invoice.ticket_id}`} className="text-primary hover:underline font-mono text-xs">{invoice.ticket?.code ?? invoice.ticket_id.slice(0,8)}</Link></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="text-foreground">{fmt(invoice.due_date)}</span></div>
              {invoice.paid_at && <div className="flex justify-between"><span className="text-muted-foreground">Paid At</span><span className="text-foreground">{fmt(invoice.paid_at)}</span></div>}
            </div>
          </Card>

          <Card className="p-5 border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-semibold text-foreground">KES {invoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-semibold text-green-600">KES {invoice.amount_paid.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold text-foreground">Balance Due</span>
                <span className="font-extrabold text-primary text-lg">KES {balance.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {invoice.notes && (
          <Card className="p-5 border-border mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-foreground">{invoice.notes}</p>
          </Card>
        )}

        {/* Payments history */}
        <Card className="p-5 border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Payment History</p>
          {payments.length === 0
            ? <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            : <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-sm">
                  <div>
                    <span className="font-semibold text-foreground">KES {p.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">via {PAYMENT_METHOD_LABELS[p.payment_method]}</span>
                    {p.reference && <span className="text-xs text-muted-foreground ml-2 font-mono">ref: {p.reference}</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{fmtShort(p.paid_at)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>

      <RecordPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={invoice.id}
        shopId={user?.shop_id ?? ""}
        token={user?.access_token ?? ""}
        balance={balance}
        onSuccess={() => { setShowPaymentModal(false); load(); toast.success("Payment recorded successfully"); }}
      />
    </div>
  );
}

function RecordPaymentModal({ open, onClose, invoiceId, shopId, token, balance, onSuccess }: {
  open: boolean; onClose: () => void; invoiceId: string; shopId: string; token: string; balance: number; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    amount: String(balance),
    payment_method: "cash" as PaymentMethod,
    reference: "",
    external_reference: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error("Amount must be greater than 0"); return; }
    setSaving(true);
    const res = await recordPayment(shopId, token, {
      invoice_id: invoiceId,
      amount,
      payment_method: form.payment_method,
      reference: form.reference || undefined,
      external_reference: form.external_reference || undefined,
    });
    setSaving(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to record payment", { description: msg });
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md border-border">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Balance due: KES {balance.toLocaleString()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Amount (KES) *</Label>
            <Input type="number" min="0.01" step="0.01" value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="border-border" disabled={saving} />
          </div>
          <div className="space-y-1">
            <Label>Payment Method *</Label>
            <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v as PaymentMethod }))}>
              <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Reference (optional)</Label>
            <Input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
              placeholder="e.g. receipt number" className="border-border" disabled={saving} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Recording…" : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

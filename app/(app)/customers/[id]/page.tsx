"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCustomerWithHistory, updateCustomer } from "@/lib/actions/customers";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Mail, MapPin, Wrench, FileText, Calendar, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, Ticket, Invoice } from "@/lib/types";

interface Props { params: { id: string } }

export default function CustomerDetailPage({ params }: Props) {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tickets,  setTickets]  = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [editing,  setEditing]  = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await getCustomerWithHistory(params.id, user.shop_id, user.access_token);
    if (res.error || !res.data) { setError("Customer not found"); setLoading(false); return; }
    setCustomer(res.data.customer as Customer);
    setTickets(res.data.tickets);
    setInvoices(res.data.invoices as Invoice[]);
    setEditForm({
      name:  res.data.customer.name,
      phone: res.data.customer.phone ?? "",
      email: res.data.customer.email ?? "",
      notes: res.data.customer.notes ?? "",
    });
    setLoading(false);
  }, [user, params.id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customer) return;
    setSaving(true);
    const res = await updateCustomer(customer.id, user.shop_id, user.access_token, {
      name:  editForm.name.trim(),
      phone: editForm.phone.trim() || null,
      email: editForm.email.trim() || null,
      notes: editForm.notes.trim() || null,
    });
    setSaving(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      const isDupe = msg.toLowerCase().includes("duplicate") || msg.includes("unique");
      toast.error(
        isDupe ? "Email or phone already belongs to another customer" : "Failed to update customer",
        { description: msg }
      );
    } else {
      setCustomer(res.data as Customer);
      setEditing(false);
      toast.success("Customer updated");
    }
  };

  const fmt = (d?: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const totalSpent = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  if (loading) return (
    <div className="flex-1 p-6"><div className="max-w-4xl mx-auto space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div></div>
  );
  if (error || !customer) return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <Card className="p-8 text-center border-border">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild className="bg-primary hover:bg-primary/90"><Link href="/customers">Back</Link></Button>
      </Card>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/customers" className="inline-flex items-center gap-2 text-primary hover:opacity-80 mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-0.5">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">Customer since {fmt(customer.created_at)}</p>
          </div>
          <Button size="sm" variant="outline" className="border-border gap-2" onClick={() => setEditing(v => !v)}>
            <Pencil className="h-3.5 w-3.5" />{editing ? "Cancel Edit" : "Edit"}
          </Button>
        </div>

        {editing ? (
          <Card className="p-5 border-border mb-5">
            <h2 className="font-semibold text-foreground mb-4 text-sm">Edit Customer</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <Label>Full Name *</Label>
                <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="border-border" disabled={saving} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="border-border" disabled={saving} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="border-border" disabled={saving} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                  className="border-border min-h-[60px]" disabled={saving} />
              </div>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <Card className="p-5 border-border md:col-span-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact</h2>
              <div className="space-y-2 text-sm">
                {customer.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" />{customer.phone}</div>}
                {customer.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" />{customer.email}</div>}
                {customer.notes && <p className="text-muted-foreground mt-2 text-xs">{customer.notes}</p>}
              </div>
            </Card>
            <Card className="p-5 border-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Summary</h2>
              <div className="space-y-3">
                <div><p className="text-xs text-muted-foreground">Total Repairs</p><p className="text-2xl font-bold text-foreground">{customer.repair_count}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-2xl font-bold text-primary">KES {totalSpent.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Last Repair</p><p className="text-sm text-foreground">{fmt(customer.last_repair_date)}</p></div>
              </div>
            </Card>
          </div>
        )}

        {/* Ticket history */}
        <Card className="border-border mb-4">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Repair History ({tickets.length})</h2>
          </div>
          {tickets.length === 0
            ? <p className="p-6 text-sm text-muted-foreground">No repairs yet.</p>
            : <div className="divide-y divide-border">
              {tickets.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition">
                  <div>
                    <p className="font-mono font-bold text-primary text-sm">{t.code}</p>
                    <p className="text-sm text-foreground mt-0.5">{t.issue_description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmt(t.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={t.status} />
                    <Button asChild variant="outline" size="sm" className="border-border">
                      <Link href={`/tickets/${t.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          }
        </Card>

        {/* Invoice history */}
        <Card className="border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Invoice History ({invoices.length})</h2>
          </div>
          {invoices.length === 0
            ? <p className="p-6 text-sm text-muted-foreground">No invoices yet.</p>
            : <div className="divide-y divide-border">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition">
                  <div>
                    <p className="font-mono font-bold text-primary text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{fmt(inv.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-sm text-foreground">KES {inv.amount.toLocaleString()}</span>
                    <StatusBadge status={inv.status} />
                    <Button asChild variant="outline" size="sm" className="border-border">
                      <Link href={`/invoices/${inv.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>
    </div>
  );
}

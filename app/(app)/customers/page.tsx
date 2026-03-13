"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listCustomers, createCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Phone, Mail, Calendar, Plus, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState("");
  const [total, setTotal]         = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await listCustomers(user.shop_id, user.access_token, { search: search || undefined, limit: 200 });
      setCustomers(res.data as Customer[]);
      setTotal(res.count);
    } finally {
      setIsLoading(false);
    }
  }, [user, search]);

  useEffect(() => { load(); }, [load]);

  const fmt = (d?: string | null) => {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Customers</h1>
            <p className="text-sm text-muted-foreground">{isLoading ? "Loading…" : `${total} customer${total !== 1 ? "s" : ""}`}</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> New Customer
          </Button>
        </div>

        <Card className="p-4 mb-5 border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 border-border" />
          </div>
        </Card>

        <Card className="border-border">
          {isLoading ? (
            <div className="p-5 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Name", "Phone", "Email", "Repairs", "Last Repair", "Actions"].map(h => (
                      <TableHead key={h} className="text-foreground font-semibold text-xs uppercase tracking-wide">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id} className="border-border hover:bg-muted/50 transition">
                      <TableCell className="font-semibold text-foreground">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.phone ? <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" />{c.phone}</span> : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.email ? <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" />{c.email}</span> : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Wrench className="h-3 w-3 text-primary shrink-0" />{c.repair_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0" />{fmt(c.last_repair_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="border-border">
                          <Link href={`/customers/${c.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No customers found.</p>
            </div>
          )}
        </Card>
      </div>

      <CreateCustomerModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        shopId={user?.shop_id ?? ""}
        token={user?.access_token ?? ""}
        onSuccess={() => { setShowCreate(false); load(); }}
      />
    </div>
  );
}

function CreateCustomerModal({ open, onClose, shopId, token, onSuccess }: {
  open: boolean; onClose: () => void; shopId: string; token: string; onSuccess: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const res = await createCustomer(shopId, token, {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setSaving(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      const isEmailDupe = msg.toLowerCase().includes("email");
      const isPhoneDupe = msg.toLowerCase().includes("phone");
      toast.error(
        isEmailDupe ? "A customer with this email already exists in your shop" :
        isPhoneDupe ? "A customer with this phone number already exists in your shop" :
        "Failed to create customer",
        { description: msg }
      );
    } else {
      toast.success("Customer created successfully");
      setForm({ name: "", email: "", phone: "", notes: "" });
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md border-border">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <DialogDescription>Add a new customer to your shop.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="John Doe" className="border-border" disabled={saving} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+254 700 000 000" className="border-border" disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="john@email.com" className="border-border" disabled={saving} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any notes about this customer…" className="border-border" disabled={saving} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Creating…" : "Create Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

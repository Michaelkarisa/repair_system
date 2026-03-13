"use client";

import { useState } from "react";
import { createTicket } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { Customer, TeamMember, TicketPriority } from "@/lib/types";
import { TICKET_PRIORITY_LABELS } from "@/lib/types";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  teamMembers: TeamMember[];
  onSuccess?: () => void;
}

const INITIAL = {
  customer_id: "",
  issue_description: "",
  priority: "medium" as TicketPriority,
  cost_estimate: "0",
  deposit_amount: "0",
  assigned_to: "",
  lock_code: "",
  intake_condition: "",
};

export function NewTicketModal({ open, onOpenChange, customers, teamMembers, onSuccess }: NewTicketModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const technicians = teamMembers.filter(m => m.status === "active");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customer_id) e.customer_id = "Please select a customer";
    if (!form.issue_description.trim()) e.issue_description = "Issue description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSaving(true);
    const res = await createTicket(user.shop_id, user.access_token, {
      customer_id: form.customer_id,
      issue_description: form.issue_description.trim(),
      priority: form.priority,
      cost_estimate: parseFloat(form.cost_estimate) || 0,
      deposit_amount: parseFloat(form.deposit_amount) || 0,
      assigned_to: form.assigned_to || undefined,
      lock_code: form.lock_code.trim() || undefined,
      intake_condition: form.intake_condition.trim() || undefined,
    });
    setSaving(false);
    if (res.error) {
      const msg = typeof res.error === "string" ? res.error : res.error.message;
      toast.error("Failed to create ticket", { description: msg });
    } else {
      toast.success(`Ticket ${res.data.code} created successfully`);
      setForm(INITIAL);
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleClose = () => {
    if (!saving) { setForm(INITIAL); setErrors({}); onOpenChange(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>Enter repair details to open a new ticket</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer */}
          <div className="space-y-1">
            <Label>Customer *</Label>
            <Select value={form.customer_id} onValueChange={v => setForm(p => ({ ...p, customer_id: v }))} disabled={saving}>
              <SelectTrigger className="border-border">
                <SelectValue placeholder="Select a customer…" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0
                  ? <SelectItem value="none" disabled>No customers yet</SelectItem>
                  : customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id}</p>}
          </div>

          {/* Issue */}
          <div className="space-y-1">
            <Label>Issue Description *</Label>
            <Textarea value={form.issue_description} onChange={f("issue_description")}
              placeholder="Describe the problem with the device…"
              className="border-border min-h-[80px]" disabled={saving} />
            {errors.issue_description && <p className="text-xs text-destructive">{errors.issue_description}</p>}
          </div>

          {/* Intake condition */}
          <div className="space-y-1">
            <Label>Intake Condition (optional)</Label>
            <Textarea value={form.intake_condition} onChange={f("intake_condition")}
              placeholder="Physical condition, accessories received, pre-existing damage…"
              className="border-border min-h-[60px]" disabled={saving} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as TicketPriority }))} disabled={saving}>
                <SelectTrigger className="border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_PRIORITY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign to */}
            <div className="space-y-1">
              <Label>Assign To</Label>
              <Select value={form.assigned_to} onValueChange={v => setForm(p => ({ ...p, assigned_to: v }))} disabled={saving}>
                <SelectTrigger className="border-border"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {technicians.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Est. Cost (KES)</Label>
              <Input type="number" min="0" step="0.01" value={form.cost_estimate}
                onChange={f("cost_estimate")} className="border-border" disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label>Deposit (KES)</Label>
              <Input type="number" min="0" step="0.01" value={form.deposit_amount}
                onChange={f("deposit_amount")} className="border-border" disabled={saving} />
            </div>
            <div className="space-y-1">
              <Label>Lock Code</Label>
              <Input value={form.lock_code} onChange={f("lock_code")}
                placeholder="PIN / password" className="border-border font-mono" disabled={saving} />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? "Creating…" : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

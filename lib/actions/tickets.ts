'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import type { TicketStatus, TicketPriority } from '@/lib/types';

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createTicket(shopId: string, token: string, data: {
  customer_id: string;
  device_id?: string;
  assigned_to?: string;
  issue_description: string;
  priority?: TicketPriority;
  cost_estimate?: number;
  deposit_amount?: number;
  lock_code?: string;
  intake_condition?: string;
}) {
  const sb = createServerClient(token);
  try {
    // Generate unique code with up to 3 retries on collision
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    let ticket = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const rand = Math.random().toString(36).toUpperCase().slice(2, 7);
      const code = `TKT-${datePart}-${rand}`;

      const { data: t, error } = await sb
        .from('tickets')
        .insert({ shop_id: shopId, code, status: 'open', priority: 'medium', cost_estimate: 0, deposit_amount: 0, ...data })
        .select()
        .single();

      if (!error) { ticket = t; break; }
      // Retry only on unique constraint violation for the code
      if (error.code === '23505' && error.message.includes('code')) {
        lastError = error;
        continue;
      }
      throw error;
    }

    if (!ticket) throw lastError;
    revalidatePath('/tickets');
    return { data: ticket, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details, hint: err.hint } };
  }
}

// ─── GET ONE ──────────────────────────────────────────────────────────────────
export async function getTicket(ticketId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('shop_id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return { data: data ?? null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

// ─── LIST ─────────────────────────────────────────────────────────────────────
export async function listTickets(shopId: string, token: string, opts: {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const sb = createServerClient(token);
  try {
    let q = sb
      .from('tickets')
      .select('*', { count: 'exact' })
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (opts.status)      q = q.eq('status', opts.status);
    if (opts.priority)    q = q.eq('priority', opts.priority);
    if (opts.assigned_to) q = q.eq('assigned_to', opts.assigned_to);
    if (opts.search)      q = q.or(`code.ilike.%${opts.search}%,issue_description.ilike.%${opts.search}%`);
    if (opts.limit)       q = q.limit(opts.limit);
    if (opts.offset)      q = q.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0, error: null };
  } catch (err: any) {
    return { data: [], count: 0, error: { message: err.message, code: err.code } };
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateTicket(ticketId: string, shopId: string, token: string, updates: Partial<{
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  issue_description: string;
  diagnosis: string;
  cost_estimate: number;
  cost_final: number;
  deposit_amount: number;
  warranty_days: number;
  warranty_expires_at: string;
  lock_code: string;
  intake_condition: string;
  internal_notes: string;
  completed_at: string;
}>) {
  const sb = createServerClient(token);
  try {
    // Auto-set completed_at when status → completed
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    // Auto-calculate warranty_expires_at from warranty_days + completed_at
    if (updates.warranty_days != null && updates.warranty_days > 0) {
      const base = updates.completed_at ? new Date(updates.completed_at) : new Date();
      const expires = new Date(base);
      expires.setDate(expires.getDate() + updates.warranty_days);
      updates.warranty_expires_at = expires.toISOString();
    }

    const { data, error } = await sb
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .eq('shop_id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details } };
  }
}

// ─── NOTES ────────────────────────────────────────────────────────────────────
export async function addTicketNote(ticketId: string, authorId: string, note: string, isInternal = true, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('ticket_notes')
      .insert({ ticket_id: ticketId, author_team_member_id: authorId, note, is_internal: isInternal })
      .select('*, author:team_members(id, name, role)')
      .single();
    if (error) throw error;
    revalidatePath(`/tickets/${ticketId}`);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function getTicketNotes(ticketId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('ticket_notes')
      .select('*, author:team_members(id, name, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (err: any) {
    return { data: [], error: { message: err.message } };
  }
}

// ─── STATUS HISTORY ───────────────────────────────────────────────────────────
export async function getTicketStatusHistory(ticketId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('ticket_status_history')
      .select('*, changed_by:team_members(id, name, role)')
      .eq('ticket_id', ticketId)
      .order('changed_at', { ascending: true });
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (err: any) {
    return { data: [], error: { message: err.message } };
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export async function getDashboardStats(shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    // Single query — aggregate in JS instead of 8 round trips
    const { data, error } = await sb
      .from('tickets')
      .select('status')
      .eq('shop_id', shopId);

    if (error) throw error;

    const counts: Record<string, number> = {
      open: 0, diagnosed: 0, in_progress: 0, waiting_parts: 0,
      awaiting_approval: 0, ready_for_pickup: 0, completed: 0, cancelled: 0,
    };
    for (const row of data ?? []) {
      if (row.status in counts) counts[row.status]++;
    }

    return { data: counts, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message } };
  }
}


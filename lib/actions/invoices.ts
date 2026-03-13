'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import type { InvoiceStatus } from '@/lib/types';

export async function createInvoice(shopId: string, token: string, data: {
  ticket_id: string;
  invoice_number: string;
  amount: number;
  due_date?: string;
  notes?: string;
}) {
  const sb = createServerClient(token);
  try {
    const { data: inv, error } = await sb
      .from('invoices')
      .insert({ shop_id: shopId, amount_paid: 0, status: 'draft', ...data })
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/invoices');
    return { data: inv, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details, hint: err.hint } };
  }
}

export async function getInvoice(invoiceId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('invoices')
      .select('*, ticket:tickets(id, code, customer_id, status)')
      .eq('id', invoiceId)
      .eq('shop_id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return { data: data ?? null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function listInvoices(shopId: string, token: string, opts: {
  status?: InvoiceStatus;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const sb = createServerClient(token);
  try {
    // Join tickets so we can show human-readable ticket codes in the list
    let q = sb
      .from('invoices')
      .select('*, ticket:tickets(code)', { count: 'exact' })
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (opts.status) q = q.eq('status', opts.status);
    if (opts.search) q = q.ilike('invoice_number', `%${opts.search}%`);
    if (opts.limit)  q = q.limit(opts.limit);
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0, error: null };
  } catch (err: any) {
    return { data: [], count: 0, error: { message: err.message, code: err.code } };
  }
}

export async function updateInvoice(invoiceId: string, shopId: string, token: string, updates: {
  status?: InvoiceStatus;
  due_date?: string | null;
  notes?: string | null;
  amount?: number;
}) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .eq('shop_id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/invoices');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function getInvoicePayments(invoiceId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('paid_at', { ascending: false });
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (err: any) {
    return { data: [], error: { message: err.message } };
  }
}

export async function recordPayment(shopId: string, token: string, data: {
  invoice_id: string;
  amount: number;
  payment_method: 'paystack' | 'cash' | 'transfer' | 'mpesa' | 'card';
  reference?: string;
  external_reference?: string;
  status?: 'pending' | 'completed' | 'failed' | 'reversed';
}) {
  const sb = createServerClient(token);
  try {
    const { data: payment, error } = await sb
      .from('payments')
      .insert({ shop_id: shopId, status: 'completed', paid_at: new Date().toISOString(), ...data })
      .select()
      .single();
    if (error) throw error;
    // DB trigger sync_invoice_amount_paid auto-updates invoice status
    revalidatePath('/invoices');
    return { data: payment, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details } };
  }
}

export async function getInvoiceStats(shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    // Single query — aggregate in JS instead of 6 round trips
    const { data, error } = await sb
      .from('invoices')
      .select('status, amount')
      .eq('shop_id', shopId);

    if (error) throw error;

    const stats: Record<string, { count: number; total: number }> = {};
    for (const row of data ?? []) {
      stats[row.status] ??= { count: 0, total: 0 };
      stats[row.status].count++;
      stats[row.status].total += row.amount ?? 0;
    }

    return { data: stats, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message } };
  }
}


'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

export async function createCustomer(shopId: string, token: string, data: {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) {
  const sb = createServerClient(token);
  try {
    const { data: customer, error } = await sb
      .from('customers')
      .insert({ shop_id: shopId, repair_count: 0, ...data })
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/customers');
    return { data: customer, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details, hint: err.hint } };
  }
}

export async function getCustomer(customerId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('shop_id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return { data: data ?? null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function listCustomers(shopId: string, token: string, opts: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const sb = createServerClient(token);
  try {
    let q = sb
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('shop_id', shopId)
      .order('name', { ascending: true });

    if (opts.search) {
      q = q.or(`name.ilike.%${opts.search}%,email.ilike.%${opts.search}%,phone.ilike.%${opts.search}%`);
    }
    if (opts.limit)  q = q.limit(opts.limit);
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0, error: null };
  } catch (err: any) {
    return { data: [], count: 0, error: { message: err.message, code: err.code } };
  }
}

export async function updateCustomer(customerId: string, shopId: string, token: string, updates: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .eq('shop_id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/customers');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details } };
  }
}

export async function getCustomerWithHistory(customerId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const [custResult, ticketsResult] = await Promise.all([
      sb.from('customers').select('*').eq('id', customerId).eq('shop_id', shopId).single(),
      sb.from('tickets').select('*, device:devices(brand, model, device_type)').eq('customer_id', customerId).eq('shop_id', shopId).order('created_at', { ascending: false }),
    ]);

    if (custResult.error && custResult.error.code !== 'PGRST116') throw custResult.error;
    if (!custResult.data) return { data: null, error: { message: 'Customer not found' } };

    const ticketIds = (ticketsResult.data ?? []).map(t => t.id);
    let invoices: any[] = [];
    if (ticketIds.length > 0) {
      const { data: invData } = await sb
        .from('invoices')
        .select('*')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: false });
      invoices = invData ?? [];
    }

    return {
      data: { customer: custResult.data, tickets: ticketsResult.data ?? [], invoices },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function deleteCustomer(customerId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { error } = await sb
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('shop_id', shopId);
    if (error) throw error;
    revalidatePath('/customers');
    return { error: null };
  } catch (err: any) {
    return { error: { message: err.message, code: err.code } };
  }
}


'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

export async function getShop(shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return { data: data ?? null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function updateShop(shopId: string, token: string, updates: {
  name?: string;
  owner_name?: string;
  email?: string;
  support_email?: string | null;
  phone?: string | null;
  country?: string | null;
  currency_code?: string;
  timezone?: string;
}) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/settings');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details } };
  }
}

export async function exportShopData(shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const [customers, tickets, invoices, payments, team] = await Promise.all([
      sb.from('customers').select('*').eq('shop_id', shopId),
      sb.from('tickets').select('*').eq('shop_id', shopId),
      sb.from('invoices').select('*').eq('shop_id', shopId),
      sb.from('payments').select('*').eq('shop_id', shopId),
      sb.from('team_members').select('id, name, email, role, status').eq('shop_id', shopId),
    ]);
    return {
      data: {
        customers: customers.data ?? [],
        tickets: tickets.data ?? [],
        invoices: invoices.data ?? [],
        payments: payments.data ?? [],
        team: team.data ?? [],
        exported_at: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: { message: err.message } };
  }
}


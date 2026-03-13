'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import type { SubscriptionPlan, SubscriptionStatus } from '@/lib/types';

export async function getSubscription(shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return { data: data ?? null, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function upsertSubscription(shopId: string, token: string, updates: {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  billing_cycle?: 'monthly' | 'yearly';
  auto_renew?: boolean;
  current_period_start?: string;
  current_period_end?: string;
  paystack_reference?: string;
  paystack_customer_code?: string;
  cancelled_at?: string | null;
  downgrade_at?: string | null;
}) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('subscriptions')
      .upsert({ shop_id: shopId, ...updates }, { onConflict: 'shop_id' })
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/settings');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function cancelSubscription(shopId: string, token: string) {
  return upsertSubscription(shopId, token, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    auto_renew: false,
  });
}


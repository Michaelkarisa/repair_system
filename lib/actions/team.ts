'use server';

import { createServerClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import type { TeamMemberRole, TeamMemberStatus } from '@/lib/types';

export async function listTeamMembers(shopId: string, token: string, opts: {
  status?: TeamMemberStatus;
} = {}) {
  const sb = createServerClient(token);
  try {
    let q = sb
      .from('team_members')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: true });

    if (opts.status) q = q.eq('status', opts.status);

    const { data, error } = await q;
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (err: any) {
    return { data: [], error: { message: err.message, code: err.code } };
  }
}

export async function inviteTeamMember(shopId: string, token: string, data: {
  name: string;
  email: string;
  role: TeamMemberRole;
  phone?: string;
}) {
  const sb = createServerClient(token);
  try {
    const { data: member, error } = await sb
      .from('team_members')
      .insert({
        shop_id: shopId,
        ...data,
        status: 'pending',
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/settings');
    return { data: member, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code, details: err.details, hint: err.hint } };
  }
}

export async function updateTeamMember(memberId: string, shopId: string, token: string, updates: {
  name?: string;
  role?: TeamMemberRole;
  phone?: string | null;
  status?: TeamMemberStatus;
}) {
  const sb = createServerClient(token);
  try {
    const { data, error } = await sb
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .eq('shop_id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/settings');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

export async function removeTeamMember(memberId: string, shopId: string, token: string) {
  const sb = createServerClient(token);
  try {
    // Soft-delete: set status to inactive rather than hard delete
    const { data, error } = await sb
      .from('team_members')
      .update({ status: 'inactive' })
      .eq('id', memberId)
      .eq('shop_id', shopId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/settings');
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message, code: err.code } };
  }
}


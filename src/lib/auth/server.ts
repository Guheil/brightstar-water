import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';
import { ROLE_DESTINATIONS } from './session';
import {
  profileCanAccessApplication,
  profileRequiresOnboarding,
  type SupabaseProfile,
} from './types';

const isUserRole = (value: unknown): value is UserRole =>
  value === 'customer' || value === 'admin' || value === 'deliverer';

export async function getAuthenticatedProfile(): Promise<SupabaseProfile | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== 'string' || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,phone,role,status,account_origin,onboarding_stage,onboarding_password_changed_at,onboarding_completed_at,created_at,updated_at')
    .eq('id', userId)
    .single();

  if (error || !data || !isUserRole(data.role)) return null;
  return data as SupabaseProfile;
}

export async function requireRole(role: UserRole): Promise<SupabaseProfile> {
  const profile = await getAuthenticatedProfile();

  if (!profile || profile.status !== 'active') redirect('/login');
  if (profileRequiresOnboarding(profile)) redirect('/onboarding');
  if (!profileCanAccessApplication(profile)) redirect('/login');
  if (profile.role !== role) redirect(ROLE_DESTINATIONS[profile.role]);

  return profile;
}

// Pure utility functions for billing — no 'use server', safe to import in client components

export type PlanType = 'starter' | 'professional' | 'enterprise';

const PLAN_PRICES: Record<PlanType, number> = {
  starter: 29,
  professional: 79,
  enterprise: 299,
};

export function getPlanPrice(plan: PlanType): number {
  return PLAN_PRICES[plan];
}

export function getPlanFeatures(plan: PlanType): string[] {
  const features: Record<PlanType, string[]> = {
    starter: [
      'Up to 50 repairs/month',
      'Basic ticketing',
      '5 team members',
      'Email support',
      'Customer management',
    ],
    professional: [
      'Unlimited tickets',
      'Advanced ticketing',
      '20 team members',
      'Priority support',
      'Advanced analytics',
      'Inventory management',
      'Invoice generation',
    ],
    enterprise: [
      'Everything in Professional',
      'Unlimited team members',
      'Custom workflows',
      'Dedicated support',
      'API access',
      'Custom integrations',
      'SLA guarantee',
    ],
  };
  return features[plan];
}
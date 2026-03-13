// Pure utility functions — no 'use server', safe to import in client components
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
      '5 team members',
      'Basic ticketing',
      'Email support',
      'Customer management',
    ],
    professional: [
      'Unlimited tickets',
      '20 team members',
      'Advanced analytics',
      'Invoice generation',
      'Priority support',
      'Inventory management',
    ],
    enterprise: [
      'Everything in Professional',
      'Unlimited team members',
      'Custom workflows',
      'API access',
      'Dedicated support',
      'SLA guarantee',
    ],
  };
  return features[plan];
}

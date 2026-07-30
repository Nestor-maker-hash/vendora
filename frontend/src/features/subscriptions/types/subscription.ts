export interface SubscriptionPlan {
  id: string;

  name: string;

  monthly_price: number;
  yearly_price: number;

  storage_gb: number;

  max_staff: number;

  custom_domain: boolean;
  analytics: boolean;
  priority_support: boolean;
  api_access: boolean;

  created_at: string;
}

export interface BusinessSubscription {
  id: string;

  business_id: string;

  plan_id: string;

  status: string;

  started_at: string;

  expires_at: string | null;

  created_at: string;

  subscription_plans?: SubscriptionPlan;
}

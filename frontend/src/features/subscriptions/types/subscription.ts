export interface SubscriptionPlan {
  id: string;

  name: string;
  description: string | null;

  monthly_price: number;
  yearly_price: number | null;

  storage_gb: number;

  max_products: number | null;
  max_orders_per_month: number | null;
  max_customers: number | null;
  max_delivery_zones: number | null;
  max_staff: number;

  custom_domain: boolean;
  analytics: boolean;
  priority_support: boolean;
  api_access: boolean;

  is_active: boolean;
  is_public: boolean;
  sort_order: number;

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

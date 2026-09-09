export interface Business {
  id: string;

  owner_id: string;

  name: string;
  slug: string;

  category: string | null;

  phone: string | null;
  email: string | null;

  currency: string | null;

  description: string | null;

  address: string | null;
  state: string | null;
  city: string | null;

  logo_url: string | null;
  banner_url: string | null;

  website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;

  pay_on_delivery_enabled: boolean | null;
  online_payment_enabled: boolean | null;

  paystack_subaccount_code: string | null;
  paystack_bank_code: string | null;
  paystack_connected: boolean;
  paystack_connected_at: string | null;


  minimum_order_mode: string | null;
  minimum_order_quantity: number | null;

  store_ready_acknowledged: boolean;

  created_at: string;
}

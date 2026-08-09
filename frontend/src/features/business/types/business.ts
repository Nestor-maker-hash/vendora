export interface Business {
  id: string;

  owner_id: string;

  name: string;
  slug: string;
  

  phone: string | null;
  email: string | null;
  currency: string;

pay_on_delivery_enabled: boolean;

bank_transfer_enabled: boolean;

online_payment_enabled: boolean;

bank_name: string | null;

account_name: string | null;

account_number: string | null;


  description: string | null;

  address: string | null;

  logo_url: string | null;

  banner_url: string | null;

  created_at: string;
}

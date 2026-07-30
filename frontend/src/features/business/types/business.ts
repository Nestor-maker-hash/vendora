export interface Business {
  id: string;

  owner_id: string;

  name: string;
  slug: string;
  

  phone: string | null;
  email: string | null;
  currency: string;

  description: string | null;

  address: string | null;

  logo_url: string | null;

  banner_url: string | null;

  created_at: string;
}

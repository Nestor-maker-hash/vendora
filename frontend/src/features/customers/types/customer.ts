export interface Customer {
  name: string;
  phone: string;
  email: string | null;

  orders: number;
  totalSpent: number;

  lastOrder: string;
}

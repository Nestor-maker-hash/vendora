export interface Notification {
  id: string;

  business_id: string;

  title: string;
  message: string;

  type: string;

  link: string | null;

  is_read: boolean;

  created_at: string;
}

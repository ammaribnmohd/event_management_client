export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  max_capacity: number;
  attendee_count?: number;
  current_attendees?: number;
  is_full?: boolean;
  spots_remaining?: number;
}

export interface Attendee {
  id?: string;
  event_id?: string;
  name: string;
  email: string;
  phone?: string;
  registration_date: string;
  event_title?: string | null;
  event_date?: string | null;
  location?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  admin: {
    id: string;
    username: string;
  };
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendee, AuthResponse, EventItem, Pagination } from '../models';

interface EventsResponse {
  success: boolean;
  data: EventItem[];
  pagination: Pagination;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  login(payload: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  registerAdmin(payload: {
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/auth/register`, payload);
  }

  listPublicEvents(query: {
    page: number;
    perPage: number;
    sort: string;
    order: string;
    search: string;
  }): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/events`, {
      params: this.withParams(query),
    });
  }

  getEvent(id: string): Observable<{ success: boolean; data: EventItem }> {
    return this.http.get<{ success: boolean; data: EventItem }>(`${this.baseUrl}/events/${id}`);
  }

  registerForEvent(id: string, payload: { name: string; email: string; phone: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/events/${id}/register`, payload);
  }

  listAdminEvents(query: {
    page: number;
    perPage: number;
    sort: string;
    order: string;
    search: string;
  }): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/admin/events`, {
      params: this.withParams(query),
    });
  }

  createEvent(payload: {
    title: string;
    description: string;
    eventDate: string;
    eventTime: string;
    location: string;
    maxCapacity: number;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/admin/events`, payload);
  }

  updateEvent(
    id: string,
    payload: {
      title: string;
      description: string;
      eventDate: string;
      eventTime: string;
      location: string;
      maxCapacity: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.baseUrl}/admin/events/${id}`, payload);
  }

  deleteEvent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/admin/events/${id}`);
  }

  listEventAttendees(eventId: string): Observable<{ success: boolean; attendees: Attendee[] }> {
    return this.http.get<{ success: boolean; attendees: Attendee[] }>(`${this.baseUrl}/admin/events/${eventId}/attendees`);
  }

  listAllAttendees(): Observable<{ success: boolean; attendees: Attendee[] }> {
    return this.http.get<{ success: boolean; attendees: Attendee[] }>(`${this.baseUrl}/admin/attendees`);
  }

  downloadReport(eventId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/events/${eventId}/report.csv`, {
      responseType: 'blob',
    });
  }

  private withParams(input: Record<string, string | number>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(input)) {
      params = params.set(key, String(value));
    }
    return params;
  }
}

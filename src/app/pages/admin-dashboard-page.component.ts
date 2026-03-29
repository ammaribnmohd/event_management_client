import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Attendee, EventItem, Pagination } from '../core/models';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  events: EventItem[] = [];
  allAttendees: Attendee[] = [];
  selectedAttendees: Attendee[] = [];
  selectedEventTitle = '';

  showAttendeeList = false;
  showModal = false;
  loading = false;
  error = '';
  attendeesSearch = '';

  query = {
    search: '',
    sort: 'event_date',
    order: 'DESC',
    page: 1,
    perPage: 8,
  };

  pagination: Pagination = { page: 1, perPage: 8, total: 0, totalPages: 0 };

  ngOnInit(): void {
    this.loadEvents();
    this.loadAllAttendees();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  searchEvents(): void {
    this.query.page = 1;
    this.loadEvents();
  }

  onSearchInput(): void {
    if (this.query.search === '') {
      this.query.page = 1;
      this.loadEvents();
    }
  }

  sortBy(value: 'title' | 'event_date'): void {
    if (this.query.sort === value) {
      // Toggle order if same sort is clicked
      this.query.order = this.query.order === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // Reset to ascending when switching sort field
      this.query.sort = value;
      this.query.order = 'ASC';
    }
    this.query.page = 1;
    this.loadEvents();
  }

  toggleOrder(): void {
    this.query.order = this.query.order === 'ASC' ? 'DESC' : 'ASC';
    this.query.page = 1;
    this.loadEvents();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages) {
      return;
    }

    this.query.page = page;
    this.loadEvents();
  }

  openAttendeesModal(event: EventItem): void {
    this.selectedEventTitle = event.title;
    this.selectedAttendees = [];
    this.showModal = true;

    this.api.listEventAttendees(event.id).subscribe({
      next: (response) => {
        this.selectedAttendees = response.attendees;
      },
      error: () => {
        this.error = 'Failed to load attendees for event';
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  deleteEvent(event: EventItem): void {
    const confirmed = window.confirm('Are you sure?');
    if (!confirmed) {
      return;
    }

    this.api.deleteEvent(event.id).subscribe({
      next: () => {
        this.loadEvents();
        this.loadAllAttendees();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete event';
      },
    });
  }

  downloadReport(event: EventItem): void {
    this.api.downloadReport(event.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title}_attendees.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = 'Failed to download report';
      },
    });
  }

  filteredAttendees(): Attendee[] {
    const term = this.attendeesSearch.trim().toLowerCase();
    if (!term) {
      return this.allAttendees;
    }

    return this.allAttendees.filter((attendee) => attendee.name.toLowerCase().includes(term));
  }

  pages(): number[] {
    return Array.from({ length: this.pagination.totalPages }, (_unused, i) => i + 1);
  }

  private loadEvents(): void {
    this.loading = true;
    this.error = '';

    this.api.listAdminEvents(this.query).subscribe({
      next: (response) => {
        this.events = response.data;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load events';
        this.loading = false;
      },
    });
  }

  private loadAllAttendees(): void {
    this.api.listAllAttendees().subscribe({
      next: (response) => {
        this.allAttendees = response.attendees;
      },
      error: () => {
        this.error = 'Failed to load attendees';
      },
    });
  }
}

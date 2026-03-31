import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventItem, Pagination } from '../core/models';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatTooltipModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  events: EventItem[] = [];
  pagination: Pagination = { page: 1, perPage: 8, total: 0, totalPages: 0 };
  query = {
    search: '',
    sort: 'event_date',
    order: 'DESC',
    page: 1,
    perPage: 8,
  };
  loading = false;
  error = '';
  locationOverflow: Record<string, boolean> = {};

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.query.search = params.get('search') ?? '';
      this.query.sort = params.get('sort') ?? 'event_date';
      this.query.order = params.get('order') ?? 'DESC';
      this.query.page = Number(params.get('page') ?? 1);
      this.loadEvents();
    });
  }

  submitSearch(): void {
    this.navigate({ page: 1 });
  }

  onSearchInput(): void {
    if (this.query.search === '') {
      this.navigate({ page: 1 });
    }
  }

  sortBy(sort: 'title' | 'event_date'): void {
    if (this.query.sort === sort) {
      // Toggle order if same sort is clicked
      const newOrder = this.query.order === 'ASC' ? 'DESC' : 'ASC';
      this.navigate({ order: newOrder, page: 1 });
    } else {
      // Reset to ascending when switching sort field
      this.navigate({ sort, order: 'ASC', page: 1 });
    }
  }

  toggleOrder(): void {
    const order = this.query.order === 'ASC' ? 'DESC' : 'ASC';
    this.navigate({ order, page: 1 });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages) {
      return;
    }
    this.navigate({ page });
  }

  private navigate(partial: Partial<typeof this.query>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.query,
        ...partial,
      },
    });
  }

  private loadEvents(): void {
    this.loading = true;
    this.error = '';

    this.api.listPublicEvents(this.query).subscribe({
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

  pages(): number[] {
    return Array.from({ length: this.pagination.totalPages }, (_unused, i) => i + 1);
  }

  updateLocationOverflow(eventId: string | number, element: HTMLElement): void {
    this.locationOverflow[String(eventId)] = element.scrollWidth > element.clientWidth;
  }

  isLocationOverflow(eventId: string | number): boolean {
    return Boolean(this.locationOverflow[String(eventId)]);
  }
}

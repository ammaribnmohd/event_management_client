import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './event-form-page.component.html',
  styleUrl: './shared-form.scss',
})
export class EventFormPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly isEdit = Boolean(this.id);
  readonly todayDate = this.formatDate(new Date());
  readonly minSelectableDate = this.toLocalDate(this.todayDate);

  loading = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    eventDate: ['', [Validators.required, this.eventDateValidator.bind(this)]],
    eventTime: ['', Validators.required],
    location: ['', Validators.required],
    maxCapacity: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    if (!this.isEdit) {
      return;
    }

    if (!this.id) {
      this.error = 'Invalid event id';
      return;
    }

    this.loading = true;
    this.api.getEvent(this.id).subscribe({
      next: (response) => {
        const event = response.data;
        this.form.patchValue({
          title: event.title,
          description: event.description,
          eventDate: event.event_date,
          eventTime: event.event_time.slice(0, 5),
          location: event.location,
          maxCapacity: event.max_capacity,
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load event';
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.success = '';

    const formValue = this.form.getRawValue();
    const payload = {
      ...formValue,
      eventDate: this.normalizeDateForApi(formValue.eventDate),
    };

    const request = this.isEdit && this.id
      ? this.api.updateEvent(this.id, payload)
      : this.api.createEvent(payload);

    request.subscribe({
      next: (response) => {
        this.success = response.message;
        this.notify.success(response.message || (this.isEdit ? 'Event updated' : 'Event created'));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save event';
      },
    });
  }

  private eventDateValidator(control: AbstractControl): Record<string, boolean> | null {
    if (this.isEdit || !control.value) {
      return null;
    }

    const selectedDate = this.parseDateValue(control.value);
    if (!selectedDate) {
      return { invalidDate: true };
    }

    const today = this.toLocalDate(this.todayDate);
    return selectedDate < today ? { pastDate: true } : null;
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateValue(value: unknown): Date | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const day = Number(isoMatch[3]);
      return new Date(year, month, day);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  private normalizeDateForApi(value: unknown): string {
    const parsed = this.parseDateValue(value);
    return parsed ? this.formatDate(parsed) : this.todayDate;
  }

  private toLocalDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}

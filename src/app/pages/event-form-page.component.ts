import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  loading = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    eventDate: ['', Validators.required],
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

    const request = this.isEdit && this.id
      ? this.api.updateEvent(this.id, this.form.getRawValue())
      : this.api.createEvent(this.form.getRawValue());

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
}

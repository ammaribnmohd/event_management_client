import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventItem } from '../core/models';
import { ApiService } from '../core/services/api.service';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?=(?:.*\d){7,15}$)\+?[0-9\s\-()]+$/;

@Component({
  selector: 'app-event-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './event-register-page.component.html',
  styleUrl: './shared-form.scss',
})
export class EventRegisterPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  event: EventItem | null = null;
  loading = true;
  message = '';
  error = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(emailRegex)]],
    phone: ['', [Validators.required, Validators.pattern(phoneRegex)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.api.getEvent(id).subscribe({
      next: (response) => {
        this.event = response.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Event not found';
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.event) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.message = '';

    this.api.registerForEvent(this.event.id, this.form.getRawValue()).subscribe({
      next: (response) => {
        this.message = response.message;
        this.form.disable();
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
      },
    });
  }
}

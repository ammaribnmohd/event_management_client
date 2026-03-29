import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api.service';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?=(?:.*\d){7,15}$)\+?[0-9\s\-()]+$/;

@Component({
  selector: 'app-admin-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-register-page.component.html',
  styleUrl: './shared-form.scss',
})
export class AdminRegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(emailRegex)]],
    phone: ['', [Validators.required, Validators.pattern(phoneRegex)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.success = '';
    this.api.registerAdmin(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.success = response.message;
        this.form.reset();
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
      },
    });
  }
}

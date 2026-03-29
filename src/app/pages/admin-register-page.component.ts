import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api.service';

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
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
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

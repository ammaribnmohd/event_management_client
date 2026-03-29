import { Injectable, computed, signal } from '@angular/core';

interface StoredAdmin {
  id: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private readonly adminSignal = signal<StoredAdmin | null>(this.readAdmin());

  readonly isLoggedIn = computed(() => Boolean(this.tokenSignal()));
  readonly admin = computed(() => this.adminSignal());

  get token(): string | null {
    return this.tokenSignal();
  }

  saveSession(token: string, admin: StoredAdmin): void {
    this.tokenSignal.set(token);
    this.adminSignal.set(admin);
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.adminSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  }

  private readAdmin(): StoredAdmin | null {
    const raw = localStorage.getItem('admin');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredAdmin;
    } catch {
      return null;
    }
  }
}

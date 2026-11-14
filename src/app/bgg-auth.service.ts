import { Injectable, computed, signal } from '@angular/core';

export const BGG_API_TOKEN_STORAGE_KEY = 'bgg_api_token';

@Injectable({
  providedIn: 'root',
})
export class BggAuthService {
  private readonly tokenSignal = signal<string | null>(this.readInitialToken());

  readonly token = this.tokenSignal.asReadonly();
  readonly hasToken = computed(() => {
    const t = this.tokenSignal();
    return typeof t === 'string' && t.trim().length > 0;
  });

  private readInitialToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(BGG_API_TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return null;
  }

  setToken(rawToken: string): void {
    const cleanToken = rawToken.trim();
    if (!cleanToken) {
      this.clearToken();
      return;
    }

    this.tokenSignal.set(cleanToken);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(BGG_API_TOKEN_STORAGE_KEY, cleanToken);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(BGG_API_TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }
}


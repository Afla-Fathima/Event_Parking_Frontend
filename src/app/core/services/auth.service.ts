import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserRole } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly sessionKey = 'parkflow_session';
  private readonly session = signal<LoginResponse | null>(this.restore());

  readonly user = computed(() => this.session());
  readonly isAuthenticated = computed(() => this.isSessionValid(this.session()));
  readonly role = computed<UserRole | null>(() => this.session()?.role ?? null);
  readonly customerId = computed(() => this.session()?.customerId ?? null);

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    const normalizedRequest: LoginRequest = {
      email: request.email.trim().toLowerCase(),
      password: request.password.trim(),
    };

    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, normalizedRequest)
      .pipe(tap((response) => this.save(response)));
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.api}/customers/register`, request);
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(
      `${this.api}/auth/forgot-password`,
      { email },
    );
  }

  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Observable<{ message: string }> {
    const normalizedNewPassword = newPassword.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    return this.http.post<{ message: string }>(`${this.api}/auth/reset-password`, {
      token: token.trim(),
      newPassword: normalizedNewPassword,
      confirmPassword: normalizedConfirmPassword,
    });
  }

  token(): string | null {
    const current = this.session();
    return this.isSessionValid(current) ? (current?.token ?? null) : null;
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.session.set(null);
  }

  private save(response: LoginResponse): void {
    sessionStorage.setItem(this.sessionKey, JSON.stringify(response));
    this.session.set(response);
  }

  private restore(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(this.sessionKey);
      if (!raw) return null;
      const value = JSON.parse(raw) as LoginResponse;
      if (!this.isSessionValid(value)) {
        sessionStorage.removeItem(this.sessionKey);
        return null;
      }
      return value;
    } catch {
      sessionStorage.removeItem(this.sessionKey);
      return null;
    }
  }

  private isSessionValid(value: LoginResponse | null): boolean {
    if (!value?.token || !value.expiration) return false;
    const expiry = new Date(value.expiration).getTime();
    return Number.isFinite(expiry) && expiry > Date.now();
  }
}

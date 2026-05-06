import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  // ✅ Public readonly signals
  user = this._user.asReadonly();
  token = this._token.asReadonly();

  // ✅ Computed states
  isLoggedIn = computed(() => !!this._token());
  isCandidate = computed(() => this._user()?.role === 'candidate');
  isEmployer = computed(() => this._user()?.role === 'employer');
  isAdmin = computed(() => this._user()?.role === 'admin');
  userRole = computed(() => this._user()?.role);

  // ✅ SET AUTH (login/register)
  setAuth(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ✅ 🔥 MAIN FIX: update user everywhere instantly
  updateUser(user: User) {
    this._user.set({ ...user }); // 🔥 spread ensures change detection
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ✅ Optional helper (clean naming)
  setUser(user: User) {
    this.updateUser(user);
  }

  // ✅ LOGOUT
  clearAuth() {
    this._user.set(null);
    this._token.set(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ✅ Load from storage
  private loadUser(): User | null {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
}
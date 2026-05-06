import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../shared/store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  authStore = inject(AuthStore);
  private api = environment.apiUrl;

  register(data: any) {
    return this.http.post<any>(`${this.api}/auth/register`, data).pipe(
      tap((res: any) => this.authStore.setAuth(res.data.user, res.data.token))
    );
  }

  login(data: any) {
    return this.http.post<any>(`${this.api}/auth/login`, data).pipe(
      tap((res: any) => this.authStore.setAuth(res.data.user, res.data.token))
    );
  }

  logout() {
    return this.http.post<any>(`${this.api}/auth/logout`, {}).pipe(
      tap(() => {
        this.authStore.clearAuth();
        this.router.navigate(['/login']);
      })
    );
  }

  getMe() {
    return this.http.get<any>(`${this.api}/auth/me`).pipe(
      tap((res: any) => this.authStore.updateUser(res.data))
    );
  }
}
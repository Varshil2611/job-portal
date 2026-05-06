import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  updateProfile(data: any) {
    return this.http.put<any>(`${this.api}/users/profile`, data);
  }

  uploadResume(formData: FormData) {
    return this.http.post<any>(`${this.api}/users/upload-resume`, formData);
  }

  uploadLogo(formData: FormData) {
    return this.http.post<any>(`${this.api}/users/upload-logo`, formData);
  }

  toggleSaveJob(jobId: string) {
    return this.http.post<any>(`${this.api}/users/save-job/${jobId}`, {});
  }

  getSavedJobs() {
    return this.http.get<any>(`${this.api}/users/saved-jobs`);
  }

  getAllUsers(role?: string) {
    const params = role ? `?role=${role}` : '';
    return this.http.get<any>(`${this.api}/users/admin/all${params}`);
  }

  getAdminStats() {
    return this.http.get<any>(`${this.api}/users/admin/stats`);
  }

  toggleUserActive(userId: string) {
    return this.http.patch<any>(`${this.api}/users/admin/${userId}/toggle-active`, {});
  }
}
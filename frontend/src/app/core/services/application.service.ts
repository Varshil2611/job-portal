import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  applyToJob(jobId: string, formData: FormData) {
    return this.http.post<any>(`${this.api}/applications/apply/${jobId}`, formData);
  }

  getMyApplications() {
    return this.http.get<any>(`${this.api}/applications/my`);
  }

  getApplicantsForJob(jobId: string, status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.http.get<any>(`${this.api}/applications/job/${jobId}${params}`);
  }

  updateStatus(applicationId: string, status: string) {
    return this.http.patch<any>(`${this.api}/applications/${applicationId}/status`, { status });
  }

  withdrawApplication(applicationId: string) {
    return this.http.delete<any>(`${this.api}/applications/${applicationId}`);
  }
}
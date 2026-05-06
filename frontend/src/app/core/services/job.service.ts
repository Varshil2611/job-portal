import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAllJobs(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<any>(`${this.api}/jobs`, { params });
  }

  getJobById(id: string) {
    return this.http.get<any>(`${this.api}/jobs/${id}`);
  }

  createJob(data: any) {
    return this.http.post<any>(`${this.api}/jobs`, data);
  }

  updateJob(id: string, data: any) {
    return this.http.put<any>(`${this.api}/jobs/${id}`, data);
  }

  deleteJob(id: string) {
    return this.http.delete<any>(`${this.api}/jobs/${id}`);
  }

  getMyPostedJobs() {
    return this.http.get<any>(`${this.api}/jobs/employer/my-jobs`);
  }
}
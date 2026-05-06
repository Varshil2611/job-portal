import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../shared/store/auth.store';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-detail.component.html'
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  job: any = null;
  loading = false;
  applying = false;
  applied = false;
  error = '';
  success = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.http.get<any>(`/api/jobs/${id}`).subscribe({
      next: (res: any) => {
        this.job = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyWithProfileResume() {
    if (!this.authStore.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.applying = true;
    this.error = '';
    const formData = new FormData();
    formData.append('coverLetter', 'I am interested in this position.');

    this.http.post<any>(
      `/api/applications/apply/${this.job._id}`,
      formData,
      { headers: { Authorization: `Bearer ${this.authStore.token()}` } }
    ).subscribe({
      next: () => {
        this.applied = true;
        this.success = 'Applied!';
        this.applying = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to apply.';
        this.applying = false;
        this.cdr.detectChanges();
      }
    });
  }
}
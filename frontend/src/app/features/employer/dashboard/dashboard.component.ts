import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthStore } from '../../../shared/store/auth.store';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private jobService = inject(JobService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  jobs: any[] = [];
  loading = false;

  get totalJobs() { return this.jobs.length; }
  get totalApplicants() { return this.jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0); }
  get activeJobs() { return this.jobs.filter(j => j.isActive).length; }

  ngOnInit() {
    this.loading = true;
    this.jobService.getMyPostedJobs().subscribe({
      next: (res: any) => {
        this.jobs = res.data.jobs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-employer-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  jobs: any[] = [];
  loading = false;
  deleting: string | null = null;
  successMsg = '';

  ngOnInit() {
    this.load();

    // Reload every time user navigates back to this page
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.load();
    });
  }

  load() {
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

  deleteJob(id: string) {
    if (!confirm('Delete this job? All applications will be removed.')) return;
    this.deleting = id;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j._id !== id);
        this.deleting = null;
        this.successMsg = 'Job deleted successfully.';
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to delete.');
        this.deleting = null;
        this.cdr.detectChanges();
      }
    });
  }
}
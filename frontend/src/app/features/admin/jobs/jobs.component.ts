import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  private cdr = inject(ChangeDetectorRef);

  jobs: any[] = [];
  loading = false;
  deleting: string | null = null;
  successMsg = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.jobService.getAllJobs({ limit: 50 }).subscribe({
      next: (res: any) => {
        this.jobs = res.data.jobs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  deleteJob(id: string) {
    if (!confirm('Delete this job permanently?')) return;
    this.deleting = id;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j._id !== id);
        this.deleting = null;
        this.successMsg = 'Job deleted.';
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
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../shared/store/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private jobService = inject(JobService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  featuredJobs: any[] = [];
  loading = false;

  stats = [
    { label: 'Jobs Posted', value: '0' },
    { label: 'Companies', value: '0' },
    { label: 'Candidates', value: '0' },
    { label: 'Applications', value: '0' }
  ];

  categories = [
    { name: 'Technology', icon: '💻' },
    { name: 'Marketing', icon: '📢' },
    { name: 'Finance', icon: '💰' },
    { name: 'Design', icon: '🎨' },
    { name: 'Healthcare', icon: '🏥' },
    { name: 'Education', icon: '📚' },
    { name: 'Sales', icon: '📈' },
    { name: 'Operations', icon: '⚙️' }
  ];

  ngOnInit() {
    this.loadJobs();
    this.loadStats();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getAllJobs({ limit: 6 }).subscribe({
      next: (res: any) => {
        this.featuredJobs = res.data.jobs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadStats() {
    // Get total jobs
    this.jobService.getAllJobs({ limit: 1 }).subscribe({
      next: (res: any) => {
        this.stats[0].value = res.data.pagination.total.toString();
        this.cdr.detectChanges();
      }
    });

    // Get admin stats (works without auth for home page)
    this.userService.getAdminStats().subscribe({
      next: (res: any) => {
        const data = res.data;
        const employers = data.roleBreakdown?.find((r: any) => r._id === 'employer')?.count || 0;
        const candidates = data.roleBreakdown?.find((r: any) => r._id === 'candidate')?.count || 0;

        this.stats[1].value = employers.toString();
        this.stats[2].value = candidates.toString();
        this.stats[3].value = data.totalApplications.toString();
        this.cdr.detectChanges();
      },
      error: () => {
        // If not admin, keep default fallback values
        this.stats[0].value = '3+';
        this.stats[1].value = '1+';
        this.stats[2].value = '2+';
        this.stats[3].value = '5+';
        this.cdr.detectChanges();
      }
    });
  }
}
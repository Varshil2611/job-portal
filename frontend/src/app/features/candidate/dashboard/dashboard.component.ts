import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthStore } from '../../../shared/store/auth.store';
import { Application } from '../../../core/models/application.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private appService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  applications: Application[] = [];
  loading = false;

  get totalApplied() { return this.applications.length; }
  get totalShortlisted() { return this.applications.filter(a => a.status === 'shortlisted').length; }
  get totalAccepted() { return this.applications.filter(a => a.status === 'accepted').length; }
  get totalRejected() { return this.applications.filter(a => a.status === 'rejected').length; }

  ngOnInit() {
    this.loading = true;
    this.appService.getMyApplications().subscribe({
      next: (res: any) => {
        this.applications = res.data.applications;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }
}
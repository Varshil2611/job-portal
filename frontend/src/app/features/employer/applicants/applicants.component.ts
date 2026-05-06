import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './applicants.component.html'
})
export class ApplicantsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  applicants: any[] = [];
  filtered: any[] = [];
  loading = false;
  activeFilter = 'all';
  updating: string | null = null;
  jobId = '';

  statuses = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];
  filters = ['all', ...this.statuses];

  ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('jobId')!;
    this.load();
  }

  load() {
    this.loading = true;
    this.appService.getApplicantsForJob(this.jobId).subscribe({
      next: (res: any) => {
        this.applicants = res.data.applications;
        this.applyFilter(this.activeFilter);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter(filter: string) {
    this.activeFilter = filter;
    this.filtered = filter === 'all'
      ? this.applicants
      : this.applicants.filter(a => a.status === filter);
    this.cdr.detectChanges();
  }

  getCount(filter: string) {
    if (filter === 'all') return this.applicants.length;
    return this.applicants.filter(a => a.status === filter).length;
  }

  updateStatus(appId: string, status: string) {
    this.updating = appId;
    this.appService.updateStatus(appId, status).subscribe({
      next: () => {
        const app = this.applicants.find(a => a._id === appId);
        if (app) app.status = status;
        this.applyFilter(this.activeFilter);
        this.updating = null;
        this.cdr.detectChanges();
      },
      error: () => { this.updating = null; this.cdr.detectChanges(); }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }
}
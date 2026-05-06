import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './applications.component.html'
})
export class ApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  applications: any[] = [];
  filtered: any[] = [];
  loading = false;
  activeFilter = 'all';
  withdrawing: string | null = null;
  successMsg = '';

  filters = ['all', 'pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.appService.getMyApplications().subscribe({
      next: (res: any) => {
        this.applications = res.data.applications;
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
      ? this.applications
      : this.applications.filter(a => a.status === filter);
    this.cdr.detectChanges();
  }

  getCount(filter: string): number {
    if (filter === 'all') return this.applications.length;
    return this.applications.filter(a => a.status === filter).length;
  }

  withdraw(id: string) {
    if (!confirm('Withdraw this application?')) return;
    this.withdrawing = id;
    this.appService.withdrawApplication(id).subscribe({
      next: () => {
        this.successMsg = 'Application withdrawn.';
        this.withdrawing = null;
        this.load();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        alert(err.error?.message || 'Cannot withdraw.');
        this.withdrawing = null;
        this.cdr.detectChanges();
      }
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
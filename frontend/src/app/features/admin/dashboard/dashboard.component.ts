import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  stats: any = null;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.userService.getAdminStats().subscribe({
      next: (res: any) => {
        this.stats = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  getRoleCount(role: string): number {
    return this.stats?.roleBreakdown?.find((r: any) => r._id === role)?.count || 0;
  }
}
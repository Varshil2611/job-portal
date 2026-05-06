import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  filtered: any[] = [];
  loading = false;
  activeFilter = 'all';
  toggling: string | null = null;
  successMsg = '';

  filters = ['all', 'candidate', 'employer', 'admin'];

  ngOnInit() { this.load(); }

  load(role?: string) {
    this.loading = true;
    this.userService.getAllUsers(role).subscribe({
      next: (res: any) => {
        this.users = res.data.users;
        this.filtered = this.users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter(filter: string) {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filtered = this.users;
    } else {
      this.filtered = this.users.filter(u => u.role === filter);
    }
    this.cdr.detectChanges();
  }

  toggleActive(userId: string) {
    this.toggling = userId;
    this.userService.toggleUserActive(userId).subscribe({
      next: (res: any) => {
        const user = this.users.find(u => u._id === userId);
        if (user) user.isActive = res.data.isActive;
        this.applyFilter(this.activeFilter);
        this.toggling = null;
        this.successMsg = `User ${res.data.isActive ? 'activated' : 'deactivated'}.`;
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed.');
        this.toggling = null;
        this.cdr.detectChanges();
      }
    });
  }

  getCount(filter: string) {
    if (filter === 'all') return this.users.length;
    return this.users.filter(u => u.role === filter).length;
  }
}
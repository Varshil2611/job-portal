import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-jobs.component.html'
})
export class SavedJobsComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  savedJobs: any[] = [];
  loading = false;
  removing: string | null = null;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.userService.getSavedJobs().subscribe({
      next: (res: any) => {
        this.savedJobs = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  removeJob(jobId: string) {
    this.removing = jobId;
    this.userService.toggleSaveJob(jobId).subscribe({
      next: () => {
        this.savedJobs = this.savedJobs.filter(j => j._id !== jobId);
        this.removing = null;
        this.cdr.detectChanges();
      },
      error: () => { this.removing = null; this.cdr.detectChanges(); }
    });
  }
}
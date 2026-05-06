import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  jobs: any[] = [];
  loading = false;
  totalJobs = 0;
  currentPage = 1;
  totalPages = 1;

  jobTypes = ['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'internship'];
  categories = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Design', 'Sales', 'Operations', 'HR', 'Other'];
  experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead'];

  filterForm = this.fb.group({
    keyword: [''],
    location: [''],
    jobType: [''],
    category: [''],
    experienceLevel: [''],
    salaryMin: [''],
    salaryMax: ['']
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filterForm.patchValue({ category: params['category'] });
      }
      this.loadJobs(1);
    });

    this.filterForm.get('keyword')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.loadJobs(1));
  }

  loadJobs(page = 1) {
    this.loading = true;
    this.currentPage = page;
    const val = this.filterForm.value as any;
    const filters: any = { page, limit: 9 };
    Object.keys(val).forEach(k => { if (val[k]) filters[k] = val[k]; });

    this.jobService.getAllJobs(filters).subscribe({
      next: (res: any) => {
        this.jobs = res.data.jobs;
        this.totalJobs = res.data.pagination.total;
        this.totalPages = res.data.pagination.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilters() { this.loadJobs(1); }
  clearFilters() { this.filterForm.reset(); this.loadJobs(1); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}
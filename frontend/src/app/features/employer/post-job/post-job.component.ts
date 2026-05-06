import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-job.component.html'
})
export class PostJobComponent {
  private jobService = inject(JobService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  loading = false;
  error = '';
  success = '';

  jobTypes = ['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'internship'];
  categories = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Design', 'Sales', 'Operations', 'HR', 'Other'];
  experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead'];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(50)]],
    requirements: [''],
    location: ['', Validators.required],
    jobType: ['full-time', Validators.required],
    category: ['Technology', Validators.required],
    experienceLevel: ['junior', Validators.required],
    salaryMin: [''],
    salaryMax: [''],
    isNegotiable: [false],
    skillsRequired: ['', Validators.required],
    deadline: ['', Validators.required]
  });

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    const val = this.form.value;
    const data = {
      title: val.title,
      description: val.description,
      requirements: val.requirements,
      location: val.location,
      jobType: val.jobType,
      category: val.category,
      experienceLevel: val.experienceLevel,
      salary: {
        min: val.salaryMin ? Number(val.salaryMin) : 0,
        max: val.salaryMax ? Number(val.salaryMax) : 0,
        currency: 'INR',
        isNegotiable: val.isNegotiable
      },
      skillsRequired: (val.skillsRequired as string)
        .split(',').map(s => s.trim()).filter(Boolean),
      deadline: val.deadline
    };

    this.jobService.createJob(data).subscribe({
      next: () => {
        this.success = 'Job posted successfully!';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/employer/jobs']), 1500);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to post job.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
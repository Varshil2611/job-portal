import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) },
  { path: 'jobs', loadComponent: () => import('./features/public/job-list/job-list.component').then(m => m.JobListComponent) },
  { path: 'jobs/:id', loadComponent: () => import('./features/public/job-detail/job-detail.component').then(m => m.JobDetailComponent) },

  // Auth (guest only)
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // Candidate
  { path: 'candidate', canActivate: [authGuard, roleGuard], data: { roles: ['candidate'] }, children: [
    { path: 'dashboard', loadComponent: () => import('./features/candidate/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'applications', loadComponent: () => import('./features/candidate/applications/applications.component').then(m => m.ApplicationsComponent) },
    { path: 'saved-jobs', loadComponent: () => import('./features/candidate/saved-jobs/saved-jobs.component').then(m => m.SavedJobsComponent) },
    { path: 'profile', loadComponent: () => import('./features/candidate/profile/profile.component').then(m => m.ProfileComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  ]},

  // Employer
  { path: 'employer', canActivate: [authGuard, roleGuard], data: { roles: ['employer'] }, children: [
    { path: 'dashboard', loadComponent: () => import('./features/employer/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'jobs', loadComponent: () => import('./features/employer/job-list/job-list.component').then(m => m.JobListComponent) },
    { path: 'post-job', loadComponent: () => import('./features/employer/post-job/post-job.component').then(m => m.PostJobComponent) },
    { path: 'applicants/:jobId', loadComponent: () => import('./features/employer/applicants/applicants.component').then(m => m.ApplicantsComponent) },
    { path: 'company-profile', loadComponent: () => import('./features/employer/company-profile/company-profile.component').then(m => m.CompanyProfileComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  ]},

  // Admin
  { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }, children: [
    { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
    { path: 'jobs', loadComponent: () => import('./features/admin/jobs/jobs.component').then(m => m.JobsComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
  ]},

  { path: '**', redirectTo: '' }
];
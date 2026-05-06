import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../shared/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  authStore = inject(AuthStore);

  loading = false;
  saving = false;
  uploading = false;
  successMsg = '';
  errorMsg = '';

  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    bio: [''],
    location: [''],
    experience: [''],
    skills: ['']
  });

  ngOnInit() {
    const user = this.authStore.user();
    if (user) {
      this.form.patchValue({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        experience: user.experience || '',
        skills: user.skills?.join(', ') || ''
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const skillsStr = this.form.value.skills || '';
    const data = {
      ...this.form.value,
      skills: skillsStr ? skillsStr.split(',').map((s: string) => s.trim()).filter(Boolean) : []
    };

    this.userService.updateProfile(data).subscribe({
      next: (res: any) => {
        this.authStore.updateUser(res.data);
        this.successMsg = 'Profile updated successfully!';
        this.saving = false;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Failed to update profile.';
        this.saving = false;
      }
    });
  }

  onResumeUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    const formData = new FormData();
    formData.append('resume', file);
    this.userService.uploadResume(formData).subscribe({
      next: (res: any) => {
        this.authService.getMe().subscribe();
        this.successMsg = 'Resume uploaded!';
        this.uploading = false;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err: any) => {
        this.errorMsg = 'Resume upload failed.';
        this.uploading = false;
      }
    });
  }
}
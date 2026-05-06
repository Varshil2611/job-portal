import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../shared/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-profile.component.html'
})
export class CompanyProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  saving = false;
  uploading = false;
  successMsg = '';
  errorMsg = '';

  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    companyName: ['', Validators.required],
    companyWebsite: [''],
    companyDescription: [''],
    companyIndustry: [''],
    companySize: ['']
  });

  companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

  ngOnInit() {
    const user = this.authStore.user();
    if (user) {
      this.form.patchValue({
        name: user.name || '',
        companyName: user.company?.name || '',
        companyWebsite: user.company?.website || '',
        companyDescription: user.company?.description || '',
        companyIndustry: user.company?.industry || '',
        companySize: user.company?.size || ''
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    const val = this.form.value;
    const data = {
      name: val.name,
      company: {
        name: val.companyName,
        website: val.companyWebsite,
        description: val.companyDescription,
        industry: val.companyIndustry,
        size: val.companySize
      }
    };
    this.userService.updateProfile(data).subscribe({
      next: (res: any) => {
        this.authStore.updateUser(res.data);
        this.successMsg = 'Company profile updated!';
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Failed to update.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    const formData = new FormData();
    formData.append('logo', file);
    this.userService.uploadLogo(formData).subscribe({
      next: () => {
        this.authService.getMe().subscribe();
        this.successMsg = 'Logo uploaded!';
        this.uploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Logo upload failed.';
        this.uploading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {}

  /**
   * Register user
   */
  onSubmit(): void {
    // Reset errors
    this.errors = {};
    
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const credentials = this.registerForm.value;

    this.authService.register(credentials).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificationService.showNotification('Registration successful', 'success');
        this.router.navigate(['/search']);
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.error && error.error.errors) {
          // Map backend validation errors to form fields
          error.error.errors.forEach((err: any) => {
            this.errors[err.param] = err.msg;
          });
        } else {
          // Generic error
          this.notificationService.showNotification('Registration failed', 'danger');
        }
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(field: string): boolean {
    return (
      (this.registerForm.get(field)?.invalid && 
       this.registerForm.get(field)?.touched) ||
      !!this.errors[field]
    );
  }

  /**
   * Get error message for field
   */
  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    
    if (this.errors[field]) {
      return this.errors[field];
    }
    
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least 4 characters`;
    }
    
    return '';
  }

  /**
   * Clear error for field when value changes
   */
  clearError(field: string): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }
}

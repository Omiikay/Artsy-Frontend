import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting: boolean = false;
  errors: { [key: string]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  /**
   * Login user
   */
  onSubmit(): void {
    // Reset errors
    this.errors = {};
    
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificationService.showNotification('Login successful', 'success');
        this.router.navigate(['/search']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.log('Login error:', error); // 添加这行来调试实际错误对象

        if (error.error && error.error.errors) {
          // Map backend validation errors to form fields
          // error.error.errors.forEach((err: any) => {
          //   this.errors[err.param] = err.msg;
          // });

          error.error.errors.forEach((err: any) => {
            // this.errors[err.param] = err.msg;
            if (err.path && err.path === 'email') {
              this.errors['email'] = err.msg;
            } else if (err.param) {
              this.errors['password'] = err.msg;
            } else {
              this.errors[err.param] = err.msg;
            }
          });

        } else {
          //  return error.error.message;
          // Generic error
          this.notificationService.showNotification('Unknown error when login', 'danger');
        }
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(field: string): boolean {
    return (
      (this.loginForm.get(field)?.invalid && 
       this.loginForm.get(field)?.touched) ||
      !!this.errors[field]
    );
  }

  /**
   * Get error message for field
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (this.errors[field]) {
      return this.errors[field];
    }
    
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
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

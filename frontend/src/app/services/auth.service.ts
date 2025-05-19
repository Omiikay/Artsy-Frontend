import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../models/user.model';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  public isLoggedIn$ = this.user$.pipe(map(user => !!user));
  // 在AuthService中添加:
  private authCheckInProgress = new BehaviorSubject<boolean>(true);
  public authCheckInProgress$ = this.authCheckInProgress.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Check authentication status on initialization
    this.checkAuthStatus();
  }

  /**
   * Check if user is already authenticated
   */
  // 修改checkAuthStatus方法
  checkAuthStatus(): void {
    this.authCheckInProgress.next(true); // 标记认证检查正在进行

    this.http.get<AuthResponse>(`${this.apiUrl}/me`)
      .pipe(
        catchError(error => {
          this.userSubject.next(null);
          this.authCheckInProgress.next(false); // 标记认证检查完成
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        this.userSubject.next(response.user);
        this.authCheckInProgress.next(false); // 标记认证检查完成
      });
  }
  // checkAuthStatus(): void {
  //   this.http.get<AuthResponse>(`${this.apiUrl}/me`)
  //     .pipe(
  //       catchError(error => {
  //         // User is not authenticated
  //         this.userSubject.next(null);
  //         return throwError(() => error);
  //       })
  //     )
  //     .subscribe(response => {
  //       this.userSubject.next(response.user);
  //     });
  // }

  /**
   * Register a new user
   */
  register(credentials: RegisterCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap(response => {
          this.userSubject.next(response.user);
          this.router.navigate(['/search']);
        }),
        map(response => response.user)
      );
  }

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    })
      .pipe(
        tap(response => {
          this.userSubject.next(response.user);
          this.router.navigate(['/search']);
        }),
        map(response => response.user)
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.userSubject.next(null);
          this.notificationService.showNotification('Logged out', 'success');
          this.router.navigate(['/search']);
        })
      );
  }

  /**
   * Delete user account
   */
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`)
      .pipe(
        tap(() => {
          this.userSubject.next(null);
          this.notificationService.showNotification('Account deleted', 'danger');
          this.router.navigate(['/search']);
        })
      );
  }

  /**
   * Get current user
   */
  // getCurrentUser(): User | null {
  //   return this.userSubject.value;
  // }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.http.get<any>('/api/auth/me', { withCredentials: true }).pipe(
      catchError(error => {
        // 对于401或403错误，认为用户未登录
        if (error.status === 401 || error.status === 403) {
          console.log('User not authenticated');
          return of(null); // 返回null表示未认证
        }
        // 其他错误重新抛出
        return throwError(() => error);
      })
    );
  }
}
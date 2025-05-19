import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return this.authService.isLoggedIn$.pipe(
  //     take(1),
  //     map(isLoggedIn => {
  //       if (isLoggedIn) {
  //         return true;
  //       }
        
  //       // Redirect to login page
  //       return this.router.createUrlTree(['/login']);
  //     })
  //   );
  // }

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.authCheckInProgress$.pipe(
      // 等待认证检查完成
      filter(inProgress => !inProgress),
      // 然后切换到isLoggedIn$流
      switchMap(() => this.authService.isLoggedIn$.pipe(
        take(1),
        map(isLoggedIn => {
          if (isLoggedIn) {
            return true;
          }
          return this.router.createUrlTree(['/login']);
        })
      ))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Favorite } from '../models/favorite.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = '/api/favorites';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private isLoaded = false; // 添加标志，表示数据是否已加载

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  /**
   * Handle errors
   */
  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    let errorMessage = `${operation} failed`;
    console.error(`${operation} failed: ${error.message}`);

    switch (error.status) {
      case 400:
        errorMessage = 'Bad Request';
        break;
      case 401:
        errorMessage = 'Unauthorized';
        break;
      case 403:
        errorMessage = 'Forbidden';
        break;
      case 404:
        errorMessage = 'Not Found';
        break;
      default:
        errorMessage = error.error.message || "An unknown error occurred";
    }

    // Throw error to the caller
    return throwError(() => new Error(errorMessage));
  }

  /**
   * 对收藏列表按照添加时间排序（最新的在前面）
   */
  private sortByNewest(favorites: Favorite[]): Favorite[] {
    return [...favorites].sort((a, b) =>
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }

  /**
   * Load user's favorites
   */
  // loadFavorites2(): Observable<Favorite[]> {
  //   return this.http.get<{ favorites: Favorite[] }>(`${this.apiUrl}`)
  //     .pipe(
  //       tap(response => {
  //         this.favoritesSubject.next(response.favorites);
  //       }),
  //       map(response => response.favorites)
  //     );
  // }

  /**
   * Load user's favorites
   */
  loadFavorites(forceReload = false): Observable<Favorite[]> {
    // 如果已加载并且不需要强制刷新，直接返回缓存数据
    if (this.isLoaded && !forceReload) {
      return of(this.favoritesSubject.value);
    }

    // 否则从服务器加载
    return this.http.get<{ favorites: Favorite[] }>(`${this.apiUrl}`)
      .pipe(
        tap(response => {
          // this.favoritesSubject.next(response.favorites);
          const sortedFavorites = this.sortByNewest(response.favorites);
          this.favoritesSubject.next(sortedFavorites);
          this.isLoaded = true; // 标记为已加载
        }),
        map(response => response.favorites),
        catchError(error => this.handleError(error, 'Load favorites'))
      );
  }

  /**
   * Add artist to favorites
   */
  addFavorite(artistId: string): Observable<Favorite> {
    return this.http.post<{ favorite: Favorite }>(`${this.apiUrl}`, { artistId })
      .pipe(
        tap(response => {
          const currentFavorites = this.favoritesSubject.value;
          // this.favoritesSubject.next([...currentFavorites, response.favorite]);
          // Sort the favorites list after adding a new one
          const updatedFavorites = this.sortByNewest([response.favorite, ...currentFavorites]);
          this.favoritesSubject.next(updatedFavorites);
          this.notificationService.showNotification('Added to favorites', 'success');
        }),
        map(response => response.favorite),
        catchError(error => this.handleError(error, 'Add favorite'))
      );
  }

  /**
   * Remove artist from favorites
   */
  removeFavorite(artistId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${artistId}`)
      .pipe(
        tap(() => {
          const currentFavorites = this.favoritesSubject.value;
          this.favoritesSubject.next(
            currentFavorites.filter(favorite => favorite.artistId !== artistId)
          );
          this.notificationService.showNotification('Removed from favorites', 'danger');
        }),
        catchError(error => this.handleError(error, 'Remove favorite'))
      );
  }

  /**
   * Check if artist is in favorites
   */
  checkFavorite(artistId: string): Observable<boolean> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/check/${artistId}`)
      .pipe(
        map(response => response.isFavorite),
        catchError(error => this.handleError(error, 'Check favorite'))
      );
  }

  /**
   * Get all favorites
   */
  getFavorites(): Favorite[] {
    return this.favoritesSubject.value;
  }

  /**
   * Check if artist is in favorites (local check)
   */
  isInFavorites(artistId: string): boolean {
    return this.favoritesSubject.value.some(favorite => favorite.artistId === artistId);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(artistId: string): Observable<any> {
    if (this.isInFavorites(artistId)) {
      return this.removeFavorite(artistId);
    } else {
      return this.addFavorite(artistId);
    }
  }


  /**
   * Clear the favorites cache
   */
  clearCache(): void {
    this.isLoaded = false;
    this.favoritesSubject.next([]);
  }

}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { Favorite } from '../../models/favorite.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  standalone: false
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  isLoading: boolean = true;
  
  // 添加订阅对象用于管理和清理
  private favoritesSub: Subscription | null = null;
  
  // For automatic refresh of relative times
  private timerInterval: any;

  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 首先检查服务中是否已有收藏数据
    const cachedFavorites = this.favoritesService.getFavorites();
    
    if (cachedFavorites.length > 0) {
      // 如果本地已有数据，直接使用不显示加载状态
      this.favorites = cachedFavorites;
      this.isLoading = false;
    } else {
      // 只有在没有缓存数据时才显示加载状态
      this.isLoading = true;
      this.loadFavorites();
    }
    
    // 订阅收藏列表变化
    this.favoritesSub = this.favoritesService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
    
    // Set up timer to refresh relative times every second
    this.timerInterval = setInterval(() => {
      // This will trigger change detection which refreshes the relative time pipe
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clear the timer when component is destroyed
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // 取消订阅
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
  }

  /**
   * Load user's favorites
   */
  loadFavorites(): void {
    this.favoritesService.loadFavorites().subscribe({
      next: () => {
        // 数据已经通过订阅更新到组件
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Remove artist from favorites
   */
  removeFavorite(artistId: string, event: Event): void {
    event.stopPropagation(); // Prevent card click
    
    this.favoritesService.removeFavorite(artistId).subscribe();
    // 不需要调用ngOnInit，因为已经通过订阅自动更新
  }

  /**
   * Navigate to artist details
   */
  goToArtistDetails(artistId: string): void {
    this.router.navigate(['/search'], { queryParams: { artistId } });
  }
}
